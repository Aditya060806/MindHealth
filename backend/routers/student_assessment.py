"""Student Assessment Router - 8-Dimension College Wellbeing Engine."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from database import get_db
from models import StudentAssessmentResult, StudentProfile, User
from jwt_handler import get_current_user_id
import ai_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/student-assessment", tags=["student-assessment"])

class StudentAssessmentInput(BaseModel):
    profile: Optional[Dict[str, Any]] = None
    answers: Dict[str, int]  # question_id -> rating (0 to 4)

def calculate_dimension_scores(answers: Dict[str, int]) -> Dict[str, int]:
    """Calculate 0-100 normalized scores for the 8 student dimensions."""
    # Question mapping by category
    categories = {
        "academic_stress": ["acad_1", "acad_2", "acad_3"],
        "anxiety_score": ["anx_1", "anx_2", "anx_3"],
        "burnout_score": ["burn_1", "burn_2", "burn_3"],
        "sleep_score": ["sleep_1", "sleep_2"],           # inverted: high rating in answers means poor sleep
        "social_score": ["soc_1", "soc_2"],             # inverted: high rating means lonely
        "career_stress": ["car_1", "car_2", "car_3"],
        "emotional_score": ["emot_1", "emot_2"],        # inverted: high rating means low mood
        "lifestyle_score": ["life_1", "life_2"]         # inverted: high rating means screen overload
    }
    
    scores = {}
    for cat, q_ids in categories.items():
        vals = [answers.get(qid, 2) for qid in q_ids]
        avg_val = sum(vals) / len(vals) if vals else 2.0  # 0 to 4 scale
        
        if cat in ["sleep_score", "social_score", "emotional_score", "lifestyle_score"]:
            # Invert so higher = healthier buffer (e.g. 4 becomes 0%, 0 becomes 100%)
            pct = round(((4.0 - avg_val) / 4.0) * 100)
        else:
            # Direct stress scale (0 becomes 0%, 4 becomes 100% stress)
            pct = round((avg_val / 4.0) * 100)
            
        scores[cat] = max(0, min(100, pct))
    
    # Calculate composite overall wellbeing
    distress = (scores["academic_stress"] + scores["anxiety_score"] + scores["burnout_score"] + scores["career_stress"]) / 4.0
    wellness = (scores["sleep_score"] + scores["social_score"] + scores["emotional_score"] + scores["lifestyle_score"]) / 4.0
    
    overall = round((wellness * 0.5) + ((100.0 - distress) * 0.5))
    scores["overall_score"] = max(5, min(98, overall))
    
    # Severity categorization
    if scores["overall_score"] >= 75 and distress < 35:
        severity = "Doing Well"
    elif scores["overall_score"] >= 60:
        severity = "Mild Concern"
    elif scores["overall_score"] >= 45:
        severity = "Moderate Concern"
    elif scores["overall_score"] >= 30:
        severity = "High Concern"
    else:
        severity = "Needs Immediate Support"
        
    scores["severity_category"] = severity
    
    # Risk Level
    # Check if high distress or specific crisis indicators
    crisis_flag = answers.get("crisis_flag", 0) > 0 or (answers.get("emot_1", 0) == 4 and answers.get("burn_1", 0) == 4)
    if crisis_flag or scores["overall_score"] < 25:
        risk = "Crisis"
    elif scores["severity_category"] in ["High Concern", "Needs Immediate Support"] or distress >= 75:
        risk = "High"
    elif scores["severity_category"] == "Moderate Concern" or distress >= 50:
        risk = "Moderate"
    else:
        risk = "Low"
        
    scores["risk_level"] = risk
    scores["distress_index"] = round(distress)
    scores["wellness_index"] = round(wellness)
    return scores

@router.post("/submit")
async def submit_student_assessment(
    payload: StudentAssessmentInput,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Process 8-dimension conversational assessment and generate AI insights."""
    logger.info(f"Received student assessment for user {user_id}")
    
    # Upsert student profile if provided
    profile_data = payload.profile or {}
    if profile_data:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if not profile:
            profile = StudentProfile(
                user_id=user_id,
                age=profile_data.get("age", 20),
                student_year=profile_data.get("student_year", "2nd Year Undergrad"),
                field_of_study=profile_data.get("field_of_study", "Engineering & Tech"),
                living_situation=profile_data.get("living_situation", "Hostel / Campus Dorm"),
                academic_stage=profile_data.get("academic_stage", "Regular Semester"),
                primary_stressors=profile_data.get("primary_stressors", [])
            )
            db.add(profile)
        else:
            for k in ["age", "student_year", "field_of_study", "living_situation", "academic_stage", "primary_stressors"]:
                if k in profile_data:
                    setattr(profile, k, profile_data[k])
        db.commit()
    else:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if profile:
            profile_data = {
                "age": profile.age,
                "student_year": profile.student_year,
                "field_of_study": profile.field_of_study,
                "living_situation": profile.living_situation,
                "academic_stage": profile.academic_stage,
                "primary_stressors": profile.primary_stressors or []
            }
        else:
            profile_data = {
                "age": 20,
                "student_year": "Undergraduate Student",
                "field_of_study": "College Degree",
                "living_situation": "Hostel / PG",
                "academic_stage": "Regular Term"
            }

    # Calculate dimensional scores
    scores = calculate_dimension_scores(payload.answers)
    
    # Generate student AI insights
    ai_insights = await ai_service.generate_student_assessment_insights(scores, profile_data)
    
    # Persist to database
    result = StudentAssessmentResult(
        user_id=user_id,
        academic_stress=scores["academic_stress"],
        anxiety_score=scores["anxiety_score"],
        burnout_score=scores["burnout_score"],
        sleep_score=scores["sleep_score"],
        social_score=scores["social_score"],
        career_stress=scores["career_stress"],
        emotional_score=scores["emotional_score"],
        lifestyle_score=scores["lifestyle_score"],
        overall_score=scores["overall_score"],
        severity_category=scores["severity_category"],
        risk_level=scores["risk_level"],
        responses=payload.answers,
        ai_insights=ai_insights
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    
    return {
        "id": result.id,
        "scores": scores,
        "ai_insights": ai_insights,
        "created_at": result.created_at.isoformat() if result.created_at else None,
        "profile": profile_data
    }

@router.get("/latest")
def get_latest_student_assessment(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve the latest assessment result for the student."""
    res = db.query(StudentAssessmentResult).filter(
        StudentAssessmentResult.user_id == user_id
    ).order_by(StudentAssessmentResult.id.desc()).first()
    
    if not res:
        # Return sensible default onboarding snapshot
        return {
            "has_assessment": False,
            "scores": {
                "academic_stress": 50,
                "anxiety_score": 50,
                "burnout_score": 50,
                "sleep_score": 50,
                "social_score": 50,
                "career_stress": 50,
                "emotional_score": 50,
                "lifestyle_score": 50,
                "overall_score": 50,
                "severity_category": "Needs Assessment",
                "risk_level": "Low"
            },
            "ai_insights": {
                "overview": "Take your initial 4-minute wellbeing assessment to generate your personalized college insights.",
                "this_week": ["Complete your first student assessment"],
                "watch_for": [],
                "positive_areas": [],
                "suggested_tools": ["8-Dimension Student Assessment"]
            }
        }
        
    return {
        "has_assessment": True,
        "id": res.id,
        "scores": {
            "academic_stress": res.academic_stress,
            "anxiety_score": res.anxiety_score,
            "burnout_score": res.burnout_score,
            "sleep_score": res.sleep_score,
            "social_score": res.social_score,
            "career_stress": res.career_stress,
            "emotional_score": res.emotional_score,
            "lifestyle_score": res.lifestyle_score,
            "overall_score": res.overall_score,
            "severity_category": res.severity_category,
            "risk_level": res.risk_level
        },
        "ai_insights": res.ai_insights or {},
        "created_at": res.created_at.isoformat() if res.created_at else None
    }

@router.get("/history")
def get_student_assessment_history(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve assessment history with comparative deltas."""
    records = db.query(StudentAssessmentResult).filter(
        StudentAssessmentResult.user_id == user_id
    ).order_by(StudentAssessmentResult.id.desc()).limit(10).all()
    
    history = []
    for r in records:
        history.append({
            "id": r.id,
            "date": r.created_at.strftime("%b %d, %Y") if r.created_at else "Recent",
            "overall_score": r.overall_score,
            "academic_stress": r.academic_stress,
            "anxiety_score": r.anxiety_score,
            "burnout_score": r.burnout_score,
            "sleep_score": r.sleep_score,
            "social_score": r.social_score,
            "career_stress": r.career_stress,
            "severity_category": r.severity_category,
            "risk_level": r.risk_level
        })
        
    return {"history": history, "total": len(history)}

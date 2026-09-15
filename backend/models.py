from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "register_database"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    occupation = Column(String(50), nullable=False)
    phone = Column(String(15), nullable=True)
    location = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=True)
    google_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BehaviourResult(Base):
    __tablename__ = "behaviour_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    snapshot_name = Column(String(100), nullable=True)
    snapshot_age = Column(Integer, nullable=True)
    snapshot_gender = Column(String(20), nullable=True)
    snapshot_occupation = Column(String(50), nullable=True)
    bmi_category = Column(String(20))
    sleep_hours = Column(Float)
    sleep_quality = Column(Integer)
    physical_activity = Column(Integer)
    stress_level = Column(Integer)
    heart_rate = Column(Integer)
    daily_steps = Column(Integer)
    systolic_bp = Column(Integer)
    diastolic_bp = Column(Integer)
    behaviour_risk = Column(String(20))
    confidence = Column(Float)
    severity_score = Column(Integer)
    recommendations = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    sender = Column(String(10))  # 'user' or 'bot'
    message = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class ChatAnalysis(Base):
    __tablename__ = "chat_analysis"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    problem = Column(String(200))
    duration = Column(String(100))
    sentiment = Column(String(20))
    severity = Column(Integer)
    risk_flag = Column(String(20), default="Low")
    stage = Column(String(20), default="problem")  # problem, duration, severity, completed
    triggers = Column(JSON)
    intensity_score = Column(Float)
    impact_on_daily_life = Column(Boolean)
    emotions = Column(JSON)
    physical_symptoms = Column(JSON)
    coping_strategy = Column(Text)
    support_available = Column(Boolean)
    overall_assessment = Column(String(200))
    additional_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FaceResult(Base):
    __tablename__ = "face_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    video_path = Column(String(300))
    facial_emotion = Column(String(30))
    confidence = Column(Float)
    severity_score = Column(Integer)
    emotion_distribution = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class VoiceResult(Base):
    __tablename__ = "voice_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    audio_path = Column(String(300))
    voice_emotion = Column(String(30))
    confidence = Column(Float)
    voice_stress = Column(String(20))
    voice_mood = Column(String(30))
    severity_score = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FinalSeverityResult(Base):
    __tablename__ = "final_severity_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    chat_score = Column(Integer)
    face_score = Column(Integer)
    voice_score = Column(Integer)
    behaviour_score = Column(Integer)
    final_severity = Column(Integer)
    risk_level = Column(String(20))
    summary_note = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EmergencyEvent(Base):
    __tablename__ = "emergency_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    severity_score = Column(Integer)
    risk_flag = Column(Boolean)
    triggered_reason = Column(String(50))
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Suggestion(Base):
    __tablename__ = "suggestions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    severity_level = Column(String(20))
    suggestion_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DailyTask(Base):
    __tablename__ = "daily_tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    task = Column(String(200))
    completed = Column(Boolean, default=False)
    date = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DoctorChatMessage(Base):
    __tablename__ = "doctor_chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"))
    sender = Column(String(10))  # 'user' or 'doctor'
    message = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), index=True, nullable=False)
    otp = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"), unique=True)
    age = Column(Integer, default=20)
    student_year = Column(String(50), default="2nd Year Undergrad")  # 1st Year, 2nd Year, 3rd Year, Final Year, Postgrad
    field_of_study = Column(String(100), default="Engineering & Tech")  # Engineering/Tech, Medical, Commerce, Humanities, Science, Law
    living_situation = Column(String(50), default="Hostel / Campus Dorm")  # Hostel, Shared PG, Commuter / Living with Family
    academic_stage = Column(String(50), default="Regular Semester")  # Regular, Mid-terms, Final Exams, Placements/Internships, Vacation
    primary_stressors = Column(JSON, default=list)  # ["Exams", "Placements", "Sleep", "Loneliness"]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class StudentAssessmentResult(Base):
    __tablename__ = "student_assessment_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"), index=True)
    
    # 8 Core Student Dimensions (0-100 normalized score)
    academic_stress = Column(Integer, default=50)       # 0 (calm) to 100 (severe overload)
    anxiety_score = Column(Integer, default=50)         # 0 to 100
    burnout_score = Column(Integer, default=50)         # 0 to 100
    sleep_score = Column(Integer, default=50)           # 0 (poor recovery) to 100 (optimal)
    social_score = Column(Integer, default=50)          # 0 (isolated) to 100 (connected)
    career_stress = Column(Integer, default=50)         # 0 to 100
    emotional_score = Column(Integer, default=50)       # 0 (distressed) to 100 (thriving)
    lifestyle_score = Column(Integer, default=50)       # 0 (unbalanced) to 100 (healthy)
    
    overall_score = Column(Integer, default=50)         # 0-100 overall wellbeing index
    severity_category = Column(String(50), default="Moderate Concern")  # Doing Well, Mild Concern, Moderate Concern, High Concern, Needs Immediate Support
    risk_level = Column(String(20), default="Low")       # Low, Moderate, High, Crisis
    
    responses = Column(JSON, default=dict)              # Raw answers map
    ai_insights = Column(JSON, default=dict)            # {overview, this_week, watch_for, positive_areas, suggested_tools}
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DailyCheckIn(Base):
    __tablename__ = "daily_checkins"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"), index=True)
    date = Column(String(20), index=True)               # YYYY-MM-DD
    mood = Column(Integer, default=3)                   # 1 (Low) to 5 (Great)
    energy = Column(Integer, default=3)                 # 1 to 5
    stress = Column(Integer, default=3)                 # 1 to 5
    sleep_hours = Column(Float, default=7.0)
    sleep_quality = Column(Integer, default=3)          # 1 to 5
    motivation = Column(Integer, default=3)             # 1 to 5
    academic_pressure = Column(Integer, default=3)      # 1 to 5
    tags = Column(JSON, default=list)                   # ["exams", "hostel", "placements", "deadlines"]
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudentJournalEntry(Base):
    __tablename__ = "student_journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"), index=True)
    title = Column(String(200), default="College Reflection")
    content = Column(Text, nullable=False)
    prompt = Column(String(300), nullable=True)
    category = Column(String(50), default="General")     # Academic, Personal, Career, Hostel, Social
    mood_tag = Column(String(30), default="Neutral")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("register_database.id"), index=True)
    subject_or_task = Column(String(200), default="General Study")
    duration_minutes = Column(Integer, default=25)
    stress_rating = Column(Integer, default=3)          # 1 to 5
    burnout_flag = Column(Boolean, default=False)
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


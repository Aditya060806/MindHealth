"""FastAPI Main Entry Point for MindHealth Backend."""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from database import Base, engine
from models import * # noqa - ensures all models are registered
import ml_loader

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 MindHealth Backend Starting...")
    # Create DB tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created")
        
        # Ensure default guest user exists for open unauthenticated access
        from database import SessionLocal
        from models import User
        with SessionLocal() as db:
            guest = db.query(User).filter(User.id == 1).first()
            if not guest:
                guest = User(
                    id=1,
                    full_name="MindHealth Guest",
                    age=25,
                    gender="Other",
                    occupation="Guest User",
                    email="guest@mindhealth.local",
                    phone="0000000000",
                    location="Global"
                )
                db.add(guest)
                db.commit()
                logger.info("✅ Default guest user initialized for open access")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    
    # Load ML models
    try:
        ml_loader.load_all_models()
    except Exception as e:
        logger.warning(f"⚠️ Model loading encountered issues, operating with heuristic fallbacks: {e}")
        
    yield
    logger.info("👋 MindHealth Backend Shutting Down...")

app = FastAPI(
    title="MindHealth Backend",
    description="Smart Mental Health Counselling System - REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration — explicitly allows Vercel frontend and local development
cors_origins_env = os.getenv("CORS_ORIGINS", "")
origins = [
    "https://mindhealth-three.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if cors_origins_env:
    for o in cors_origins_env.split(","):
        cleaned = o.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
from routers import auth, behaviour, chat, face, voice, severity, dashboard, student_assessment, student_features

app.include_router(auth.router)
app.include_router(behaviour.router)
app.include_router(chat.router)
app.include_router(face.router)
app.include_router(voice.router)
app.include_router(severity.router)
app.include_router(dashboard.router)
app.include_router(student_assessment.router)
app.include_router(student_features.router)

@app.get("/")
def root():
    return {"message": "MindHealth Backend Running", "version": "1.0.0", "status": "healthy"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models": {
            "behaviour": ml_loader.behaviour_model is not None,
            "face": ml_loader.face_model is not None,
            "voice": ml_loader.voice_cnn_model is not None
        }
    }

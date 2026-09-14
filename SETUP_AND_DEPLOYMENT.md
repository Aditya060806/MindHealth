# 🏥 MindHealth — Setup, Execution & Production Deployment Guide

A multimodal AI-powered mental health assessment and counselling platform integrating **Behavioural Profiling**, **AI Clinical Counselling**, **Facial Emotion Recognition**, and **Vocal Acoustic Biomarker Telemetry**.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
3. [Pre-Trained Machine Learning Models](#-pre-trained-machine-learning-models)
4. [Environment Configuration (.env)](#-environment-configuration-env)
5. [Local Development Setup](#-local-development-setup)
6. [Production Deployment Guide](#-production-deployment-guide)
   - [Database: Zero-Config SQLite / PostgreSQL](#1-database-zero-config-sqlite-or-cloud-postgresql)
   - [Backend: Render / Railway / Docker](#2-backend-deployment-render--railway--docker)
   - [Frontend: Vercel / Netlify](#3-frontend-deployment-vercel--netlify)
7. [Troubleshooting & Common Issues](#-troubleshooting--common-issues)

---

## 🏛 Architecture Overview

```
                        ┌───────────────────────────────┐
                        │   MindHealth Frontend (Vite)  │
                        │   React 19 + Tailwind v4      │
                        │   Clinical Light Theme UI     │
                        └──────────────┬────────────────┘
                                       │ HTTP / REST
                                       ▼
                        ┌───────────────────────────────┐
                        │   MindHealth Backend (FastAPI)│
                        │   Python 3.10+ ASGI Engine    │
                        └───────┬──────────────┬────────┘
                                │              │
        ┌───────────────────────┼──────────────┼────────────────────────┐
        ▼                       ▼              ▼                        ▼
┌───────────────┐       ┌───────────────┐ ┌────────────────┐    ┌───────────────┐
│ Step 1: ML    │       │ Step 2: NLP   │ │ Step 3: Vision │    │ Step 4: Audio │
│ Random Forest │       │ Google Gemini │ │ ResNet-50 Keras│    │ Librosa + CNN │
│ Behaviour     │       │ Counselling   │ │ Facial Emotion │    │ Vocal Stress  │
└───────────────┘       └───────────────┘ └────────────────┘    └───────────────┘
                                │
                                ▼
                        ┌───────────────────────────────┐
                        │   SQLite (Local Zero-Config)  │
                        │     or Managed PostgreSQL     │
                        └───────────────────────────────┘
```

---

## 📋 Prerequisites & System Requirements

### Minimum Hardware
- **CPU**: 4-core processor (Intel i5/AMD Ryzen 5 or higher recommended)
- **RAM**: Minimum 8 GB RAM (16 GB recommended for TensorFlow inference and audio processing)
- **Disk Space**: At least 3 GB free disk space (for Python packages and pre-trained weights)

### Software
- **Node.js**: `v18.0.0` or higher (tested on Node 20 / 22)
- **Python**: `3.10` or `3.11` (Python 3.12+ may encounter TensorFlow/Librosa wheel compatibility issues)
- **Git**: For version control
- **System Audio/Media Libraries**:
  - **Linux/macOS**: `ffmpeg` and `libsndfile1` (essential for Librosa audio decoding):
    ```bash
    # Ubuntu / Debian
    sudo apt-get update && sudo apt-get install -y ffmpeg libsndfile1 libgl1
    # macOS (Homebrew)
    brew install ffmpeg libsndfile
    ```

---

## 🧠 Pre-Trained Machine Learning Models

Because machine learning model weights exceed GitHub's standard file size limits, large weights are kept outside Git tracking (`.gitignore`).

### Directory Placement
Ensure the `backend/Pre-trained_Models/` folder has the following exact directory structure:

```
backend/
└── Pre-trained_Models/
    ├── Step1_Behaviour/
    │   ├── random_forest_model.pkl    # (RandomForestClassifier, ~10 MB)
    │   ├── label_encoder_*.pkl        # (Encoders for occupation, gender, etc.)
    │   └── scaler.pkl                 # (StandardScaler for numerical features)
    ├── Step3_Face/
    │   └── Resnet_model_version_2.keras # (ResNet-50 FER classifier, ~90 MB)
    └── Step4_Voice/
        ├── voice_stress_model.keras    # (Deep CNN for spectrogram classification)
        └── scaler_voice.pkl            # (Audio feature standardizer)
```

> **Note**: If you are downloading weights from your project Google Drive backup, download the `Pre-trained_Models.zip`, unpack it, and drop it directly inside `backend/`.

---

## 🔐 Environment Configuration (.env)

### 1. Backend Environment (`backend/.env`)
Create a file named `.env` inside the `backend/` directory:

```env
# Database (Zero-config local SQLite - no external database needed)
DATABASE_URL=sqlite:///./mindcare.db

# JWT Authentication Secret (Random 32+ character key)
JWT_SECRET=your_super_secret_jwt_random_key_min_32_characters

# Google Gemini API Key for Counselling Chat & AI Insights (Step 2)
# Obtain from: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest

# Allowed CORS Origins (Comma-separated or * for development)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 2. Frontend Environment (`frontend/.env`)
Create a file named `.env` inside the `frontend/` directory:

```env
# URL where your FastAPI backend is running
VITE_API_URL=http://localhost:8000
```
*(In production, change `VITE_API_URL` to your live deployed backend URL, e.g. `https://api.mindhealth.app`)*

---

## 💻 Local Development Setup

### Quick Start (Windows 1-Click Batch Files)
- Double-click `run_backend.bat` in the project root to install Python requirements and launch FastAPI.
- Double-click `run_frontend.bat` in the project root to install Node packages and launch Vite.

---

### Step-by-Step Manual Setup

#### 1. Setup & Launch Backend
Open a terminal in the project root:

```bash
# 1. Navigate into backend directory
cd backend

# 2. Create a virtual environment (recommended)
python -m venv venv

# 3. Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows CMD:
.\venv\Scripts\activate.bat
# On Linux / macOS:
source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Start the FastAPI server
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

Verify backend is running:
- Open your browser to: `http://localhost:8000/docs` (Swagger UI interactive API documentation).

---

#### 2. Setup & Launch Frontend
Open a second terminal:

```bash
# 1. Navigate into frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Verify frontend is running:
- Open your browser to: `http://localhost:5173`
- Experience the clinical light-themed interface, sign up for a new account, and explore the 4-step assessment pipeline!

---

## 🚀 Production Deployment Guide

### 1. Database: Zero-Config SQLite or Cloud PostgreSQL
MindHealth uses SQLAlchemy and is designed to run with **zero external database dependencies**:
- **Default (SQLite)**: By default, MindHealth creates and manages a local `mindcare.db` database automatically on startup. No installation, accounts, or Docker containers needed!
- **Optional (Cloud PostgreSQL)**: If deploying to a multi-instance cloud environment (e.g. Supabase, Render PostgreSQL, AWS RDS), simply set `DATABASE_URL` in your environment:
  ```env
  DATABASE_URL=postgresql://user:password@ep-host.region.aws.neon.tech/mindhealth?sslmode=require
  ```

---

### 2. Backend Deployment (Render / Railway / Docker)

#### Option A: Dockerfile (Universal & Recommended)
Because Librosa and OpenCV require system C libraries (`ffmpeg`, `libsndfile1`, `libgl1`), a Docker container is the cleanest way to avoid missing OS dependencies.

`backend/Dockerfile`:
```dockerfile
FROM python:3.10-slim

# Install system audio and vision dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code & models
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Option B: Deploying on Render.com
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository: `https://github.com/Aditya060806/MindHealth`.
3. Set **Root Directory**: `backend`
4. Set **Environment**: `Docker` (or `Python 3` with Build Command `pip install -r requirements.txt`).
5. Add Environment Variables:
   - `JWT_SECRET`: `your_super_secret_jwt_random_key_min_32_characters`
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
   - `GEMINI_MODEL`: `gemini-flash-latest`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
   - `DATABASE_URL`: *(Optional — defaults to internal SQLite `sqlite:///./mindcare.db`)*
6. Select **Instance Type**: 1 GB+ RAM instance (TensorFlow needs adequate memory for model initialization).

---

### 3. Frontend Deployment (Vercel / Netlify)

#### Deploying on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import `Aditya060806/MindHealth`.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com` (Your live FastAPI backend URL)
5. To support Single-Page Application (SPA) client-side routing on Vercel, ensure `frontend/vercel.json` exists:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Click **Deploy**. Your app will be live on a secure HTTPS domain with instant global CDN caching!

---

## 🛠 Troubleshooting & Common Issues

| Issue / Error | Cause | Resolution |
| :--- | :--- | :--- |
| **`libsndfile not found`** | Librosa cannot find the audio decoding shared library on Linux/Mac. | Install system package: `sudo apt-get install libsndfile1 ffmpeg` or `brew install libsndfile`. |
| **`CORS Request Blocked`** | Frontend origin is not allowed in backend CORS configuration. | In `backend/server.py` and `backend/.env`, set `CORS_ORIGINS=*` or add your exact frontend deployment URL. |
| **`500 Internal Server Error on /chat`** | Invalid or expired Google Gemini API Key. | Verify `GEMINI_API_KEY` in `backend/.env` at [Google AI Studio](https://aistudio.google.com/). |
| **Camera / Mic Permission Denied** | Browser blocks media capture on unsecure HTTP connections. | In production, ensure both frontend and backend are served over **HTTPS**. Browsers strictly restrict `getUserMedia()` on non-localhost HTTP. |
| **`Out of Memory (OOM)` during ML inference** | TensorFlow loading multiple models concurrently on a low-RAM instance (< 512MB). | Upgrade cloud server instance to at least 1 GB RAM, or enable Swap memory on Linux VPS. |
| **Vite 404 on page refresh** | Static server tries to serve `/behaviour` as a static file instead of routing to `index.html`. | Add `vercel.json` rewrite or `_redirects` file (`/* /index.html 200`) for Netlify. |

---

## 🛡 Security & Compliance Note
MindHealth is an educational and supportive AI-assisted mental wellness tool. It is **not** a diagnostic medical replacement for professional psychiatric care. Critical hotlines (e.g., Tele-MANAS `14416`, KIRAN `1800-599-0019`, Vandrevala Foundation `+91 9999 666 555`) are built into emergency banners across every assessment module for instantaneous crisis diversion.

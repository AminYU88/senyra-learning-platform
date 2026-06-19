# Senyra Deployment Guide

This guide prepares Senyra for a production-style deployment with a separate FastAPI backend and Vite React frontend.

## 1. Backend Environment

Create `.env` in the project root from `.env.example`.

Required production values:

```env
ENVIRONMENT=production
DATABASE_URL=sqlite:///./senyra.db
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=https://your-frontend-domain.example
```

Use a long random `JWT_SECRET_KEY`. Do not deploy with the development fallback.

## 2. Frontend Environment

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_BASE_URL=https://your-backend-domain.example
```

If the frontend and backend are served from the same origin behind a reverse proxy, `VITE_API_BASE_URL` can be left empty and API calls will use relative paths.

## 3. Install Dependencies

Backend:

```powershell
python -m venv venv
venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Frontend:

```powershell
cd frontend
npm install
```

## 4. Database Setup

Tables are created when the FastAPI app imports `backend.main`.

Seed demo data when preparing a demo deployment:

```powershell
python backend\seed_demo_data.py
```

Demo accounts:

- Admin: `admin@senyra.com` / `Admin123!`
- Teacher: `teacher@senyra.com` / `Teacher123!`
- Student: `student@senyra.com` / `Student123!`

## 5. Start Backend in Production Mode

Do not use `--reload` in production.

```powershell
$env:ENVIRONMENT="production"
venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

On Linux:

```bash
ENVIRONMENT=production python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## 6. Build Frontend

```powershell
cd frontend
npm run build
```

Deploy `frontend/build` to a static host such as Netlify, Vercel, Render Static Site, Nginx, or similar.

## 7. CORS

Set `CORS_ORIGINS` to the exact frontend origin, for example:

```env
CORS_ORIGINS=https://senyra.example.com
```

For multiple origins:

```env
CORS_ORIGINS=https://senyra.example.com,https://www.senyra.example.com
```

## 8. ML Models

Model files are loaded from package-relative paths under `backend/ml` and `backend/ml/saved_models`, so they do not depend on the process working directory.

Before deploying ML demo features, confirm these files exist:

- `backend/ml/risk_model.pkl`
- `backend/ml/saved_models/student_risk_model.joblib`
- `backend/ml/saved_models/engagement_model.joblib`
- `backend/ml/saved_models/recommendation_model.joblib`
- `backend/ml/saved_models/cognitive_risk_model.joblib`

If model files are absent, model-backed routes will return clear errors or fallback explanations where implemented.

## 9. Smoke Test

Backend:

```powershell
Invoke-WebRequest http://localhost:8000/health -UseBasicParsing
```

Frontend:

```powershell
cd frontend
npm run build
```

Login checks:

- Student dashboard: `/dashboard`
- Teacher dashboard: `/teacher`
- Admin dashboard: `/admin`
- Explainable AI: `/explainable-ai`
- Weak topics: `/weak-topics`
- Adaptive learning path: `/learning-path`

## 10. Deployment Notes

- Keep `.env` files out of source control.
- Use HTTPS in production.
- Use a managed PostgreSQL database for a durable production deployment. SQLite is acceptable for local demos but not ideal for concurrent production traffic.
- Run `backend/seed_demo_data.py` only for demo environments, not real learner data.

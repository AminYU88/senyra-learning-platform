# Live Deployment Guide

This guide prepares Senyra Learning Platform for a live assessor demo using:

- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL when available, SQLite only for a short demo fallback
- Repository: GitHub

Do not commit `.env` files or real secrets.

## Deployment Files

The repository includes:

- `render.yaml` - Render Blueprint for the FastAPI backend.
- `runtime.txt` - Python version hint for Render.
- `frontend/vercel.json` - Vercel rewrite config for React Router routes.
- `.env.example` - Backend environment variable template.
- `frontend/.env.example` - Frontend environment variable template.

## Backend: Render

### Option A: Deploy with `render.yaml`

1. Push the repository to GitHub.
2. Open Render.
3. Choose **New +**.
4. Choose **Blueprint**.
5. Connect the GitHub repository.
6. Select the branch to deploy.
7. Render will read `render.yaml`.
8. Set the required environment variables before first deploy.

Render service settings from `render.yaml`:

```text
Service type: Web Service
Runtime: Python
Build command: pip install -r backend/requirements.txt
Start command: python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
Health check path: /health
```

### Option B: Manual Render Web Service

Use these settings if you do not use the Blueprint:

```text
Name: senyra-backend
Runtime: Python
Build Command: pip install -r backend/requirements.txt
Start Command: python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

### Backend Environment Variables

Set these in Render:

```env
ENVIRONMENT=production
DATABASE_URL=
JWT_SECRET_KEY=
CORS_ORIGINS=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Use a long random value for `JWT_SECRET_KEY`. Do not use the local development fallback.

After Vercel deployment, set:

```env
CORS_ORIGINS=https://your-vercel-frontend-url.vercel.app
```

For multiple frontend domains:

```env
CORS_ORIGINS=https://your-vercel-frontend-url.vercel.app,https://your-custom-domain.example
```

### Database Choice

Recommended final production setup:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Render Postgres may provide an internal or external connection string. Use the internal connection string when the database and backend are both on Render.

SQLite demo fallback:

```env
DATABASE_URL=sqlite:///./senyra.db
```

SQLite is acceptable only for a short live demo. It is not ideal for durable production data or concurrent assessor usage. If a Render disk is not attached, SQLite data may not persist reliably across redeploys or restarts.

### Demo Data

If the deployed database is empty, seed demo data from a Render shell or local environment pointed at the same database:

```bash
python backend/seed_demo_data.py
```

Only run seed scripts in demo environments.

### Backend Smoke Tests

After Render deploys, open:

```text
https://your-render-backend-url.onrender.com/health
https://your-render-backend-url.onrender.com/docs
```

Expected `/health` response:

```json
{"status":"healthy","service":"Senyra Learning Platform API"}
```

## Frontend: Vercel

1. Push the repository to GitHub.
2. Open Vercel.
3. Choose **Add New Project**.
4. Import the GitHub repository.
5. Set the project root directory to:

```text
frontend
```

6. Use these build settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

7. Add this environment variable:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

8. Deploy the project.
9. Copy the Vercel frontend URL.
10. Go back to Render and set `CORS_ORIGINS` to the Vercel URL.
11. Redeploy the Render backend after updating CORS.

## Local Verification Before Deployment

Run these commands from the project root:

```powershell
python -m compileall backend
```

Start backend locally:

```powershell
$env:ENVIRONMENT="production"
$env:JWT_SECRET_KEY="temporary-local-check-only"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

In another terminal:

```powershell
Invoke-WebRequest http://127.0.0.1:8000/health -UseBasicParsing
```

Build frontend:

```powershell
cd frontend
npm.cmd run build
```

## Deployment Checklist

- Backend `/health` works.
- Backend `/docs` works.
- Frontend loads on Vercel.
- `VITE_API_BASE_URL` points to the Render backend URL.
- `CORS_ORIGINS` contains the exact Vercel frontend URL.
- Login works for demo accounts.
- Student dashboard works.
- Teacher dashboard works.
- Admin dashboard works.
- Weak Topic Detection loads.
- Adaptive Learning Path loads.
- Explainable AI dashboard loads.
- ML endpoints work or show clear model-missing messages.
- No `.env` files are committed.
- `JWT_SECRET_KEY` is set in Render and is not hardcoded.
- PostgreSQL is used for production, or SQLite is explicitly accepted as demo-only.

## Troubleshooting

### CORS error in browser

Check that Render has:

```env
CORS_ORIGINS=https://your-vercel-frontend-url.vercel.app
```

The value must match the browser origin exactly.

### Frontend cannot reach backend

Check Vercel has:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

Redeploy Vercel after changing frontend environment variables.

### Backend fails on startup

Check:

- `JWT_SECRET_KEY` is set.
- `DATABASE_URL` is valid.
- Render build installed `backend/requirements.txt`.
- The start command uses `$PORT`.

### PostgreSQL connection fails

Use a SQLAlchemy-compatible URL:

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

The app also normalizes `postgres://` to `postgresql://` for compatibility.

# Senyra Demo Readiness

Senyra is an AI-powered education platform with student, teacher and admin workspaces. The strongest demo story is: students learn and generate activity, teachers review risk and intervene, admins verify datasets, model status and platform health.

## Run Commands

Backend:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Optional production check:

```powershell
cd frontend
npm run build
```

## ML And Dataset Checks

Prepare datasets:

```powershell
.\venv\Scripts\python.exe backend\ml\dataset_loader.py
```

Train saved models:

```powershell
.\venv\Scripts\python.exe -m backend.ml.train_student_risk_model
.\venv\Scripts\python.exe -m backend.ml.train_engagement_model
.\venv\Scripts\python.exe -m backend.ml.train_recommendation_model
.\venv\Scripts\python.exe -m backend.ml.train_cognitive_risk_model
```

Verify in the app:

- `/datasets` shows pandas-loadable dataset summaries.
- `/ml/analytics` shows saved model status, model comparison and feature importance.
- Missing models should show empty states, not fake results.

## Student Demo Checklist

- Log in as a student.
- Open Dashboard and confirm Continue Learning, Today focus signals, streak, weak topics, recommendations, risk, Flow, Creativity, Learning DNA and Cognitive Risk widgets.
- Complete a quiz or lesson and verify dashboard values update after refresh.
- Open AI Tutor, Recommendations, Flow State, Learning DNA and Creativity Lab.
- Check notifications, profile and settings.

## Teacher Demo Checklist

- Log in as a teacher.
- Open Teacher Dashboard and confirm sidebar, top search, metrics, quick actions, Teacher Insights, analytics panels and student progress table.
- Add a support note.
- Create and complete an intervention plan.
- Send feedback to a student.
- Open Analytics, Study Planner, Quiz Generator, AI Assistant and Settings from dashboard navigation.

## Admin Demo Checklist

- Log in as an admin.
- Open Admin Overview and confirm user overview, risk distribution, engagement chart, ML model inventory and system health.
- Open Users, Classes, Courses, Quiz History, Reports, Audit Logs, Datasets and ML Analytics.
- Confirm dataset rows and saved model status are visible.
- Confirm no unauthenticated protected route is accessible.

## Presentation Notes

- Explain predictions as decision-support signals, not automatic grades.
- Highlight RBAC: students, teachers and admins have different dashboards and permissions.
- Show the data pipeline: datasets -> pandas verification -> scikit-learn training -> joblib saved models -> API endpoints -> Recharts dashboards.
- Show teacher intervention workflow as the human-in-the-loop response to AI risk signals.

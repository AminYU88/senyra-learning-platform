# Running Senyra Locally

Senyra uses FastAPI, SQLAlchemy, SQLite, JWT authentication, React, Vite, and React Router.

For a role-by-role final-year presentation flow, see `docs/DEMO_READINESS.md`.

## Backend

From the project root:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

Useful backend URLs:

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

The SQLite database is `senyra.db` in the project root. Tables are created automatically when `backend.main` starts because it calls `Base.metadata.create_all(bind=engine)`.

## Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The React app runs at:

```text
http://localhost:5173
```

To create a production build:

```powershell
npm run build
```

The production output is written to `frontend/build`.

The frontend uses `VITE_API_BASE_URL` when it is set. If it is not set, it calls:

```text
http://127.0.0.1:8000
```

## Authentication Flow

Register creates a student by calling `POST /students`.

Login calls `POST /login` using OAuth form data. The backend returns a JWT access token and the user's role. Protected React routes read the stored token and role, while protected FastAPI routes validate the JWT from the `Authorization: Bearer <token>` header.

## AI Learning Assistant

The chatbot is available in the frontend at:

```text
http://localhost:5173/chatbot
```

Authenticated chat endpoints:

```text
POST /chat
POST /chat/stream
GET /chat/sessions
POST /chat/sessions
GET /chat/sessions/{session_id}/messages
PUT /chat/sessions/{session_id}/favourite
```

Conversations are stored in `chat_sessions` and `chat_messages`. The assistant uses the logged-in user's role to switch between student and teacher mode. It also reads quiz attempts, learning events, and lesson progress to generate personalised study plans, weak-topic advice, and adaptive recommendations.

## Educational Machine Learning

The ML dataset is:

```text
datasets/student_learning_analytics.csv
```

It contains education-sector features only: attendance, engagement, quiz scores, assignment score, lesson completion, study hours, late submissions, forum posts, practice activity, course level, topic, pass/fail outcome, risk level, engagement level and weak topic.

Train the ML pipeline:

```powershell
.\venv\Scripts\python.exe backend\ml\train_model.py
```

The training script:

- loads the CSV from `datasets/`
- cleans duplicate and typed values
- handles missing numerical and categorical values
- scales numerical features
- one-hot encodes categorical features
- performs a train/test split
- trains Logistic Regression, Random Forest, Gradient Boosting and Decision Tree
- compares accuracy, precision, recall and macro F1
- saves the best pipeline to `backend/ml/education_ml_model.joblib`
- saves report metrics to `backend/ml/model_metrics.json`

ML endpoints:

```text
POST /ml/predict-risk
GET /ml/model-info
GET /ml/feature-importance
GET /ml/risk-prediction
```

Frontend ML pages:

```text
http://localhost:5173/ml/student-risk
http://localhost:5173/ml/analytics
```

The ML predictions are designed for academic support. They should be used as decision-support signals, not automatic punishment or grading.

### Dataset Management

Required dataset folders:

```text
datasets/student_performance
datasets/xapi_edu
datasets/maths
datasets/english
datasets/internal
```

Prepare and verify datasets:

```powershell
.\venv\Scripts\python.exe backend\ml\dataset_loader.py
```

This downloads the UCI Student Performance dataset when possible, extracts it into `datasets/student_performance`, creates local curriculum teaching datasets for Maths and English, creates an xAPI-style teaching sample when Kaggle credentials are unavailable, copies Senyra internal learning data, verifies pandas loading, and writes:

```text
datasets/DATASET_SUMMARY.json
datasets/DATASET_DOCUMENTATION.md
```

Train modular ML models:

```powershell
.\venv\Scripts\python.exe -m backend.ml.train_student_risk_model
.\venv\Scripts\python.exe -m backend.ml.train_engagement_model
.\venv\Scripts\python.exe -m backend.ml.train_recommendation_model
```

Saved models are written to:

```text
backend/ml/saved_models
```

Dataset endpoints:

```text
GET /datasets
POST /datasets/prepare
GET /datasets/summary
GET /datasets/{dataset_name}/preview
```

Additional ML endpoints:

```text
POST /ml/predict-engagement
GET /recommendations/student/{student_id}
```

Frontend pages:

```text
http://localhost:5173/datasets
http://localhost:5173/ml/engagement
http://localhost:5173/recommendations
```

## UK Mathematics and English Education

Curriculum dataset:

```text
datasets/uk_math_english_curriculum.csv
```

It supports Mathematics, English Language and English Literature for ages 12-25 across KS3, GCSE, A-Level, Further Mathematics, adult learning and university preparation.

Education endpoints:

```text
POST /education/seed
GET /education/subjects
GET /education/topics
POST /education/quiz-results
GET /education/analytics
GET /education/recommendations
POST /education/study-plan
POST /education/quiz-generator
POST /education/flashcards
POST /education/practice
```

Frontend pages:

```text
http://localhost:5173/ai-tutor
http://localhost:5173/learn/mathematics
http://localhost:5173/learn/english-language
http://localhost:5173/learn/english-literature
http://localhost:5173/education/analytics
http://localhost:5173/study-planner
http://localhost:5173/quiz-generator
```

The new tables are `subjects`, `topics`, `subject_quiz_results` and `weak_topics`.

## CORS

FastAPI is configured to accept the Vite development origins:

```text
http://localhost:5173
http://127.0.0.1:5173
```

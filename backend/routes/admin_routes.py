from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pathlib import Path

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.learning_event import LearningEvent
from backend.models.quiz import QuizAttempt
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress

from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/admin",
    tags=["Admin ML Monitoring"]
)


MODEL_PATH = Path(__file__).resolve().parents[1] / "ml" / "risk_model.pkl"

model = None
model_load_error = None


def load_legacy_risk_model():
    global model, model_load_error

    if model is not None or model_load_error is not None:
        return model

    if not MODEL_PATH.exists():
        model_load_error = "Legacy risk model file is not available."
        return None

    try:
        import joblib

        model = joblib.load(MODEL_PATH)
    except Exception as error:
        model_load_error = str(error)
        model = None

    return model


def fallback_risk_level(
    engagement_score: float,
    average_quiz_score: float,
    lesson_progress: float
) -> str:
    support_score = (
        average_quiz_score * 0.45
        + lesson_progress * 0.30
        + engagement_score * 0.25
    )

    if support_score < 50:
        return "High"
    if support_score < 70:
        return "Medium"
    return "Low"


def analyse_student(student: Student, db: Session):
    events = db.query(LearningEvent).filter(
        LearningEvent.student_id == student.id
    ).all()

    video_count = len([
        event for event in events
        if event.event_type == "video_watch"
    ])

    quiz_count = len([
        event for event in events
        if event.event_type == "quiz_attempt"
    ])

    practice_count = len([
        event for event in events
        if event.event_type == "coding_practice"
    ])

    total_events = len(events)

    engagement_score = min(
        total_events * 10,
        100
    )

    quiz_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == student.id
    ).all()

    average_quiz_score = 0

    if len(quiz_attempts) > 0:
        average_quiz_score = round(
            sum(attempt.score for attempt in quiz_attempts) / len(quiz_attempts),
            2
        )

    total_lessons = db.query(Lesson).count()

    completed_lessons = db.query(LessonProgress).filter(
        LessonProgress.student_id == student.id
    ).count()

    lesson_progress = 0

    if total_lessons > 0:
        lesson_progress = round(
            (completed_lessons / total_lessons) * 100,
            2
        )

    loaded_model = load_legacy_risk_model()
    confidence_score = 0
    prediction_source = "Rule-based fallback"

    if loaded_model is not None:
        import numpy as np

        features = np.array([[
            video_count,
            quiz_count,
            practice_count,
            average_quiz_score,
            lesson_progress
        ]])

        prediction = loaded_model.predict(features)[0]
        prediction_source = "Legacy ML model"

        if hasattr(loaded_model, "predict_proba"):
            probabilities = loaded_model.predict_proba(features)[0]
            confidence_score = round(
                max(probabilities) * 100,
                2
            )

        if prediction == 0:
            risk_level = "High"
        elif prediction == 1:
            risk_level = "Medium"
        else:
            risk_level = "Low"
    else:
        risk_level = fallback_risk_level(
            engagement_score,
            average_quiz_score,
            lesson_progress
        )

    return {
        "id": student.id,
        "student": student.full_name,
        "email": student.email,
        "role": student.role,
        "total_events": total_events,
        "engagement_score": engagement_score,
        "risk_level": risk_level,
        "confidence_score": confidence_score,
        "prediction_source": prediction_source,
        "model_status": "available" if loaded_model is not None else "fallback",
        "model_error": model_load_error,
        "videos": video_count,
        "quizzes": quiz_count,
        "practice": practice_count,
        "quiz_attempts": len(quiz_attempts),
        "average_quiz_score": average_quiz_score,
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "lesson_progress": lesson_progress,
        "event_breakdown": {
            "videos": video_count,
            "quizzes": quiz_count,
            "practice": practice_count
        }
    }


@router.get("/student-risk-analysis")
def student_risk_analysis(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    students = db.query(Student).filter(Student.role == "student").all()

    return [
        analyse_student(student, db)
        for student in students
    ]


@router.get("/ml-overview")
def ml_overview(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    students = db.query(Student).filter(Student.role == "student").all()

    analysis = [
        analyse_student(student, db)
        for student in students
    ]

    high_risk = len([
        item for item in analysis
        if item["risk_level"] == "High"
    ])

    medium_risk = len([
        item for item in analysis
        if item["risk_level"] == "Medium"
    ])

    low_risk = len([
        item for item in analysis
        if item["risk_level"] == "Low"
    ])

    average_engagement = 0
    average_quiz_score = 0
    average_lesson_progress = 0

    if len(analysis) > 0:
        average_engagement = round(
            sum(item["engagement_score"] for item in analysis) / len(analysis),
            2
        )

        average_quiz_score = round(
            sum(item["average_quiz_score"] for item in analysis) / len(analysis),
            2
        )

        average_lesson_progress = round(
            sum(item["lesson_progress"] for item in analysis) / len(analysis),
            2
        )

    return {
        "total_students": len(students),
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "average_engagement": average_engagement,
        "average_quiz_score": average_quiz_score,
        "average_lesson_progress": average_lesson_progress,
        "prediction_source": "Machine Learning Model" if model is not None else "Rule-based fallback"
    }

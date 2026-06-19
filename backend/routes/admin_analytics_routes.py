from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.student import Student
from backend.models.learning_event import LearningEvent
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import QuizAttempt
from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/admin/advanced-analytics",
    tags=["Admin Advanced Analytics"]
)


@router.get("/")
def get_advanced_admin_analytics(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    students = db.query(Student).filter(Student.role == "student").all()

    total_lessons = db.query(Lesson).count()

    analytics = []

    for student in students:

        total_events = (
            db.query(LearningEvent)
            .filter(LearningEvent.student_id == student.id)
            .count()
        )

        completed_lessons = (
            db.query(LessonProgress)
            .filter(LessonProgress.student_id == student.id)
            .count()
        )

        lesson_progress = 0

        if total_lessons > 0:
            lesson_progress = round(
                (completed_lessons / total_lessons) * 100,
                2
            )

        quiz_attempts = (
            db.query(QuizAttempt)
            .filter(QuizAttempt.student_id == student.id)
            .all()
        )

        average_quiz_score = 0

        if len(quiz_attempts) > 0:
            average_quiz_score = round(
                sum(attempt.score for attempt in quiz_attempts) / len(quiz_attempts),
                2
            )

        engagement_score = min(total_events * 10, 100)

        if engagement_score < 40 or lesson_progress < 40:
            risk_level = "High"
        elif engagement_score < 70 or average_quiz_score < 60:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        certificate_ready = (
            lesson_progress >= 100 and
            average_quiz_score >= 70
        )

        analytics.append({
            "student": student.full_name,
            "email": student.email,
            "engagement_score": engagement_score,
            "lesson_progress": lesson_progress,
            "average_quiz_score": average_quiz_score,
            "quiz_attempts": len(quiz_attempts),
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "risk_level": risk_level,
            "certificate_ready": certificate_ready
        })

    total_students = len(analytics)

    high_risk = len([item for item in analytics if item["risk_level"] == "High"])
    medium_risk = len([item for item in analytics if item["risk_level"] == "Medium"])
    low_risk = len([item for item in analytics if item["risk_level"] == "Low"])

    certificate_ready_count = len([
        item for item in analytics
        if item["certificate_ready"]
    ])

    average_quiz_score = 0
    average_lesson_progress = 0
    average_engagement = 0

    if total_students > 0:
        average_quiz_score = round(
            sum(item["average_quiz_score"] for item in analytics) / total_students,
            2
        )

        average_lesson_progress = round(
            sum(item["lesson_progress"] for item in analytics) / total_students,
            2
        )

        average_engagement = round(
            sum(item["engagement_score"] for item in analytics) / total_students,
            2
        )

    return {
        "overview": {
            "total_students": total_students,
            "high_risk": high_risk,
            "medium_risk": medium_risk,
            "low_risk": low_risk,
            "certificate_ready": certificate_ready_count,
            "average_quiz_score": average_quiz_score,
            "average_lesson_progress": average_lesson_progress,
            "average_engagement": average_engagement
        },
        "students": analytics
    }
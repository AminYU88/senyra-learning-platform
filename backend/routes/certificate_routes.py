from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.quiz import QuizAttempt
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress

from backend.auth.auth_handler import get_current_user


router = APIRouter(
    prefix="/certificates",
    tags=["Certificates"]
)


def calculate_certificate_status(
    db: Session,
    student: Student
):

    total_lessons = db.query(Lesson).count()

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

    eligible = (
        lesson_progress >= 100 and
        average_quiz_score >= 70
    )

    return {
        "student": student.full_name,
        "email": student.email,
        "eligible": eligible,
        "lesson_progress": lesson_progress,
        "average_quiz_score": average_quiz_score,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "message": (
            "Congratulations. You are eligible for a Senyra course completion certificate."
            if eligible
            else "Complete all lessons and achieve at least 70% average quiz score to unlock your certificate."
        )
    }


@router.get("/eligibility")
def certificate_eligibility(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    return calculate_certificate_status(
        db,
        current_user
    )


@router.get("/admin")
def admin_certificate_overview(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    students = db.query(Student).all()

    results = []

    for student in students:

        status = calculate_certificate_status(
            db,
            student
        )

        results.append({
            "id": student.id,
            **status
        })

    return results
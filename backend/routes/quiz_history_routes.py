from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.quiz import Quiz, QuizAttempt

from backend.auth.auth_handler import get_current_user


router = APIRouter(
    prefix="/quiz-history",
    tags=["Quiz History"]
)


@router.get("/me")
def get_my_quiz_history(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == current_user.id)
        .all()
    )

    history = []

    for attempt in attempts:

        quiz = (
            db.query(Quiz)
            .filter(Quiz.id == attempt.quiz_id)
            .first()
        )

        history.append({
            "id": attempt.id,
            "quiz_id": attempt.quiz_id,
            "quiz_title": quiz.title if quiz else "Unknown Quiz",
            "score": attempt.score
        })

    return history


@router.get("/admin")
def get_all_quiz_history(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    attempts = db.query(QuizAttempt).all()

    history = []

    for attempt in attempts:

        student = (
            db.query(Student)
            .filter(Student.id == attempt.student_id)
            .first()
        )

        quiz = (
            db.query(Quiz)
            .filter(Quiz.id == attempt.quiz_id)
            .first()
        )

        history.append({
            "id": attempt.id,
            "student": student.full_name if student else "Unknown Student",
            "email": student.email if student else "Unknown Email",
            "quiz_title": quiz.title if quiz else "Unknown Quiz",
            "score": attempt.score
        })

    return history
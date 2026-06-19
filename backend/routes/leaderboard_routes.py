from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.learning_event import LearningEvent
from backend.models.quiz import QuizAttempt
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress

from backend.auth.auth_handler import get_current_user


router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"]
)


@router.get("/")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    students = db.query(Student).all()

    total_lessons = db.query(Lesson).count()

    leaderboard = []

    for student in students:

        total_events = (
            db.query(LearningEvent)
            .filter(LearningEvent.student_id == student.id)
            .count()
        )

        xp = total_events * 10

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

        leaderboard_score = round(
            (xp * 0.3) +
            (average_quiz_score * 0.4) +
            (lesson_progress * 0.3),
            2
        )

        leaderboard.append({
            "student": student.full_name,
            "email": student.email,
            "xp": xp,
            "average_quiz_score": average_quiz_score,
            "lesson_progress": lesson_progress,
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "leaderboard_score": leaderboard_score
        })

    leaderboard.sort(
        key=lambda item: item["leaderboard_score"],
        reverse=True
    )

    ranked = []

    for index, item in enumerate(leaderboard):
        item["rank"] = index + 1
        ranked.append(item)

    return ranked
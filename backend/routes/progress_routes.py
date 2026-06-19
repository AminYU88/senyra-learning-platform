from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress

from backend.auth.auth_handler import get_current_user


router = APIRouter(
    prefix="/progress",
    tags=["Progress"]
)


@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    existing = db.query(LessonProgress).filter(
        LessonProgress.student_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if existing:
        return {
            "message": "Lesson already completed"
        }

    progress = LessonProgress(
        student_id=current_user.id,
        lesson_id=lesson_id
    )

    db.add(progress)
    db.commit()

    return {
        "message": "Lesson completed successfully"
    }


@router.get("/summary")
def progress_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    total_lessons = db.query(Lesson).count()

    completed_lessons = db.query(LessonProgress).filter(
        LessonProgress.student_id == current_user.id
    ).count()

    progress_percentage = 0

    if total_lessons > 0:
        progress_percentage = round(
            (completed_lessons / total_lessons) * 100,
            2
        )

    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "progress_percentage": progress_percentage
    }
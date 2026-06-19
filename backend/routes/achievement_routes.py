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
    prefix="/achievements",
    tags=["Achievements"]
)


@router.get("/me")
def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    total_events = (
        db.query(LearningEvent)
        .filter(LearningEvent.student_id == current_user.id)
        .count()
    )

    xp = total_events * 10

    total_lessons = db.query(Lesson).count()

    completed_lessons = (
        db.query(LessonProgress)
        .filter(LessonProgress.student_id == current_user.id)
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
        .filter(QuizAttempt.student_id == current_user.id)
        .all()
    )

    average_quiz_score = 0

    if len(quiz_attempts) > 0:
        average_quiz_score = round(
            sum(attempt.score for attempt in quiz_attempts) / len(quiz_attempts),
            2
        )

    achievements = []

    achievements.append({
        "title": "First Activity",
        "description": "Complete your first learning activity.",
        "icon": "🏆",
        "unlocked": total_events >= 1
    })

    achievements.append({
        "title": "First Lesson Completed",
        "description": "Complete at least one lesson.",
        "icon": "📘",
        "unlocked": completed_lessons >= 1
    })

    achievements.append({
        "title": "Quiz Starter",
        "description": "Attempt your first quiz.",
        "icon": "🧠",
        "unlocked": len(quiz_attempts) >= 1
    })

    achievements.append({
        "title": "Quiz Master",
        "description": "Achieve an average quiz score of 80% or higher.",
        "icon": "🎯",
        "unlocked": average_quiz_score >= 80
    })

    achievements.append({
        "title": "Course Finisher",
        "description": "Complete all available lessons.",
        "icon": "🎓",
        "unlocked": lesson_progress >= 100
    })

    achievements.append({
        "title": "100 XP Learner",
        "description": "Reach at least 100 XP.",
        "icon": "🔥",
        "unlocked": xp >= 100
    })

    achievements.append({
        "title": "Advanced Learner",
        "description": "Reach high progress and strong quiz performance.",
        "icon": "🚀",
        "unlocked": lesson_progress >= 80 and average_quiz_score >= 80
    })

    unlocked_count = len([
        item for item in achievements
        if item["unlocked"]
    ])

    return {
        "student": current_user.full_name,
        "xp": xp,
        "total_events": total_events,
        "lesson_progress": lesson_progress,
        "average_quiz_score": average_quiz_score,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "unlocked_count": unlocked_count,
        "total_achievements": len(achievements),
        "achievements": achievements
    }
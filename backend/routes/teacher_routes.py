from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.auth.role_checker import require_roles

from backend.models.student import Student
from backend.models.learning_event import LearningEvent
from backend.models.quiz import QuizAttempt
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.class_group import ClassGroup, ClassEnrollment


router = APIRouter(
    prefix="/teacher",
    tags=["Teacher"],
)


def get_teacher_students(db: Session, teacher_id: int) -> list[Student]:
    classes = (
        db.query(ClassGroup)
        .filter(ClassGroup.teacher_id == teacher_id)
        .all()
    )

    class_ids = [class_group.id for class_group in classes]

    if not class_ids:
        return []

    enrollments = (
        db.query(ClassEnrollment)
        .filter(ClassEnrollment.class_id.in_(class_ids))
        .all()
    )

    student_ids = [enrollment.student_id for enrollment in enrollments]

    if not student_ids:
        return []

    return (
        db.query(Student)
        .filter(Student.id.in_(student_ids))
        .filter(Student.role == "student")
        .all()
    )


def build_student_progress(
    db: Session,
    student: Student,
    total_lessons: int,
) -> dict:
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
            2,
        )

    quiz_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student.id)
        .all()
    )

    average_quiz_score = 0

    if quiz_attempts:
        average_quiz_score = round(
            sum(float(attempt.score or 0) for attempt in quiz_attempts)
            / len(quiz_attempts),
            2,
        )

    engagement_score = min(total_events * 10, 100)

    if engagement_score < 40 or lesson_progress < 40:
        risk_level = "High"
    elif engagement_score < 70 or average_quiz_score < 60:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "id": student.id,
        "student": student.full_name,
        "email": student.email,
        "engagement_score": engagement_score,
        "risk_level": risk_level,
        "quiz_attempts": len(quiz_attempts),
        "average_quiz_score": average_quiz_score,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "lesson_progress": lesson_progress,
    }


@router.get("/student-progress")
def teacher_student_progress(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles("teacher", "admin")),
):
    total_lessons = db.query(Lesson).count()

    if current_user.role == "admin":
        students = (
            db.query(Student)
            .filter(Student.role == "student")
            .all()
        )
    else:
        students = get_teacher_students(
            db=db,
            teacher_id=current_user.id,
        )

    return [
        build_student_progress(
            db=db,
            student=student,
            total_lessons=total_lessons,
        )
        for student in students
    ]


@router.get("/class-summary")
def teacher_class_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles("teacher", "admin")),
):
    progress = teacher_student_progress(
        db=db,
        current_user=current_user,
    )

    total_students = len(progress)

    high_risk_students = len(
        [
            student
            for student in progress
            if student["risk_level"] == "High"
        ]
    )

    average_progress = 0
    average_quiz_score = 0

    if total_students > 0:
        average_progress = round(
            sum(student["lesson_progress"] for student in progress)
            / total_students,
            2,
        )

        average_quiz_score = round(
            sum(student["average_quiz_score"] for student in progress)
            / total_students,
            2,
        )

    return {
        "total_students": total_students,
        "high_risk_students": high_risk_students,
        "average_progress": average_progress,
        "average_quiz_score": average_quiz_score,
    }
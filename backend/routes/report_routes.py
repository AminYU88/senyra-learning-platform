from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.learning_event import LearningEvent
from backend.models.quiz import QuizAttempt
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress

from backend.auth.auth_handler import get_current_user

from backend.utils.audit_logger import create_audit_log


router = APIRouter(
    prefix="/admin/reports",
    tags=["Admin Reports"]
)


def build_student_stats(db, student, total_lessons):

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

    certificate_eligible = (
        lesson_progress >= 100 and
        average_quiz_score >= 70
    )

    achievements = 0

    if total_events >= 1:
        achievements += 1

    if completed_lessons >= 1:
        achievements += 1

    if len(quiz_attempts) >= 1:
        achievements += 1

    if average_quiz_score >= 80:
        achievements += 1

    if lesson_progress >= 100:
        achievements += 1

    if xp >= 100:
        achievements += 1

    if lesson_progress >= 80 and average_quiz_score >= 80:
        achievements += 1

    return {
        "total_events": total_events,
        "xp": xp,
        "quiz_attempts": len(quiz_attempts),
        "average_quiz_score": average_quiz_score,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "lesson_progress": lesson_progress,
        "certificate_eligible": certificate_eligible,
        "achievements": achievements
    }


def create_csv_response(filename, headers, rows):

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow(headers)

    for row in rows:
        writer.writerow(row)

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/student-analytics")
def export_student_analytics(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    students = db.query(Student).all()

    total_lessons = db.query(Lesson).count()

    rows = []

    for student in students:

        stats = build_student_stats(
            db=db,
            student=student,
            total_lessons=total_lessons
        )

        rows.append([
            student.full_name,
            student.email,
            stats["xp"],
            stats["total_events"],
            stats["quiz_attempts"],
            stats["average_quiz_score"],
            stats["completed_lessons"],
            stats["total_lessons"],
            stats["lesson_progress"],
            "Yes" if stats["certificate_eligible"] else "No"
        ])

    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action="EXPORT_REPORT",
        description="Admin exported student analytics CSV report"
    )

    return create_csv_response(
        "senyra_student_analytics_report.csv",
        [
            "Student",
            "Email",
            "XP",
            "Total Events",
            "Quiz Attempts",
            "Average Quiz Score",
            "Completed Lessons",
            "Total Lessons",
            "Lesson Progress",
            "Certificate Eligible"
        ],
        rows
    )


@router.get("/certificates")
def export_certificate_report(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    students = db.query(Student).all()

    total_lessons = db.query(Lesson).count()

    rows = []

    for student in students:

        stats = build_student_stats(
            db=db,
            student=student,
            total_lessons=total_lessons
        )

        rows.append([
            student.full_name,
            student.email,
            stats["lesson_progress"],
            stats["average_quiz_score"],
            f'{stats["completed_lessons"]}/{stats["total_lessons"]}',
            "Unlocked" if stats["certificate_eligible"] else "Locked"
        ])

    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action="EXPORT_REPORT",
        description="Admin exported certificate CSV report"
    )

    return create_csv_response(
        "senyra_certificate_report.csv",
        [
            "Student",
            "Email",
            "Lesson Progress",
            "Average Quiz Score",
            "Lessons Completed",
            "Certificate Status"
        ],
        rows
    )


@router.get("/achievements")
def export_achievement_report(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    students = db.query(Student).all()

    total_lessons = db.query(Lesson).count()

    rows = []

    for student in students:

        stats = build_student_stats(
            db=db,
            student=student,
            total_lessons=total_lessons
        )

        rows.append([
            student.full_name,
            student.email,
            stats["xp"],
            stats["lesson_progress"],
            stats["average_quiz_score"],
            stats["quiz_attempts"],
            f'{stats["achievements"]}/7'
        ])

    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action="EXPORT_REPORT",
        description="Admin exported achievement CSV report"
    )

    return create_csv_response(
        "senyra_achievement_report.csv",
        [
            "Student",
            "Email",
            "XP",
            "Lesson Progress",
            "Average Quiz Score",
            "Quiz Attempts",
            "Achievements Unlocked"
        ],
        rows
    )
  
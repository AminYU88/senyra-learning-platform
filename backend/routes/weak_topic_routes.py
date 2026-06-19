from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.database.connection import get_db
from backend.models.student import Student
from backend.routes.teacher_routes import get_teacher_students
from backend.schemas.weak_topic_schema import (
    WeakTopicOut,
    WeakTopicSummaryResponse
)
from backend.services.weak_topic_service import (
    all_student_users,
    build_group_weak_topic_summary,
    detect_student_weak_topics
)


router = APIRouter(
    prefix="/weak-topics",
    tags=["Weak Topic Detection"]
)


def teacher_can_access_student(
    db: Session,
    teacher: Student,
    student_id: int
) -> bool:
    return any(
        student.id == student_id
        for student in get_teacher_students(db, teacher.id)
    )


@router.get(
    "/student",
    response_model=list[WeakTopicOut]
)
def current_student_weak_topics(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Use /weak-topics/class-summary or /weak-topics/admin-summary for staff views."
        )

    return detect_student_weak_topics(db, current_user)


@router.get(
    "/student/{student_id}",
    response_model=list[WeakTopicOut]
)
def student_weak_topics_by_id(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role == "student" and current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students can only view their own weak topics."
        )

    if current_user.role == "teacher" and not teacher_can_access_student(db, current_user, student_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher is not assigned to this student."
        )

    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .filter(Student.role == "student")
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )

    return detect_student_weak_topics(db, student)


@router.get(
    "/class-summary",
    response_model=WeakTopicSummaryResponse
)
def class_weak_topic_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):
    students = (
        all_student_users(db)
        if current_user.role == "admin"
        else get_teacher_students(db, current_user.id)
    )

    return build_group_weak_topic_summary(db, students)


@router.get(
    "/admin-summary",
    response_model=WeakTopicSummaryResponse
)
def admin_weak_topic_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):
    return build_group_weak_topic_summary(
        db,
        all_student_users(db)
    )

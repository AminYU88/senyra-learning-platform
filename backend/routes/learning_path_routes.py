from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.database.connection import get_db
from backend.models.student import Student
from backend.routes.teacher_routes import get_teacher_students
from backend.schemas.learning_path_schema import (
    LearningPathAdminSummary,
    LearningPathGenerateRequest,
    LearningPathResponse
)
from backend.services.learning_path_service import (
    build_adaptive_learning_path,
    build_admin_learning_path_summary,
    build_learning_path_summary_for_students
)


router = APIRouter(
    prefix="/learning-path",
    tags=["Adaptive Learning Path"]
)


def get_student_or_404(db: Session, student_id: int) -> Student:
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

    return student


def teacher_can_access_student(db: Session, teacher: Student, student_id: int) -> bool:
    return any(
        student.id == student_id
        for student in get_teacher_students(db, teacher.id)
    )


def ensure_student_access(db: Session, current_user: Student, student_id: int):
    if current_user.role == "admin":
        return

    if current_user.role == "teacher" and teacher_can_access_student(db, current_user, student_id):
        return

    if current_user.role == "student" and current_user.id == student_id:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to this student's learning path."
    )


@router.get(
    "/student",
    response_model=LearningPathResponse
)
def current_student_learning_path(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Use /learning-path/student/{student_id} for staff views."
        )

    return build_adaptive_learning_path(db, current_user)


@router.get(
    "/me",
    response_model=LearningPathResponse
)
def get_learning_path_legacy(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return current_student_learning_path(db, current_user)


@router.post(
    "/generate",
    response_model=LearningPathResponse
)
def generate_learning_path(
    request: LearningPathGenerateRequest | None = None,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    request = request or LearningPathGenerateRequest()
    student_id = request.student_id or current_user.id
    ensure_student_access(db, current_user, student_id)
    student = get_student_or_404(db, student_id)

    return build_adaptive_learning_path(
        db,
        student,
        request.preferred_subject
    )


@router.get(
    "/student/{student_id}",
    response_model=LearningPathResponse
)
def student_learning_path_by_id(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    ensure_student_access(db, current_user, student_id)
    student = get_student_or_404(db, student_id)

    return build_adaptive_learning_path(db, student)


@router.get(
    "/admin-summary",
    response_model=LearningPathAdminSummary
)
def learning_path_admin_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin", "teacher"]))
):
    if current_user.role == "teacher":
        students = get_teacher_students(db, current_user.id)
        return build_learning_path_summary_for_students(db, students)

    return build_admin_learning_path_summary(db)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.database.connection import get_db
from backend.models.student import Student
from backend.routes.teacher_routes import get_teacher_students
from backend.schemas.explainable_ai_schema import (
    ExplainabilityAdminSummary,
    ExplanationResponse,
    StudentExplainabilityResponse
)
from backend.services.explainable_ai_service import (
    build_admin_explainability_summary,
    build_student_explainability,
    learning_path_explanation,
    recommendation_explanation,
    risk_explanation
)


router = APIRouter(
    prefix="/explainable-ai",
    tags=["Explainable AI"]
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


def ensure_access(db: Session, current_user: Student, student_id: int):
    if current_user.role == "admin":
        return

    if current_user.role == "student" and current_user.id == student_id:
        return

    if current_user.role == "teacher":
        teacher_students = get_teacher_students(db, current_user.id)
        if any(student.id == student_id for student in teacher_students):
            return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to this student's AI explanations."
    )


@router.get(
    "/student",
    response_model=StudentExplainabilityResponse
)
def current_student_explainability(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Use /explainable-ai/student/{student_id} for staff views."
        )

    return build_student_explainability(db, current_user)


@router.get(
    "/student/{student_id}",
    response_model=StudentExplainabilityResponse
)
def student_explainability_by_id(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    ensure_access(db, current_user, student_id)
    student = get_student_or_404(db, student_id)
    return build_student_explainability(db, student)


@router.get(
    "/risk-explanation",
    response_model=ExplanationResponse
)
def current_risk_explanation(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Risk explanation without a student id is only available to students."
        )

    return risk_explanation(db, current_user)


@router.get(
    "/recommendation-explanation",
    response_model=ExplanationResponse
)
def current_recommendation_explanation(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recommendation explanation without a student id is only available to students."
        )

    return recommendation_explanation(db, current_user)


@router.get(
    "/learning-path-explanation",
    response_model=ExplanationResponse
)
def current_learning_path_explanation(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Learning path explanation without a student id is only available to students."
        )

    return learning_path_explanation(db, current_user)


@router.get(
    "/admin-summary",
    response_model=ExplainabilityAdminSummary
)
def explainability_admin_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin", "teacher"]))
):
    if current_user.role == "teacher":
        teacher_students = get_teacher_students(db, current_user.id)
        summaries = [
            build_student_explainability(db, student)
            for student in teacher_students
        ]
        admin_summary = build_admin_explainability_summary(db)
        student_ids = {student.id for student in teacher_students}
        admin_summary["student_summaries"] = summaries
        admin_summary["total_students"] = len(summaries)
        admin_summary["explanations_generated"] = sum(len(item["explanations"]) for item in summaries)
        admin_summary["risk_level_summary"] = [
            item for item in admin_summary["risk_level_summary"]
            if any(summary["student_id"] in student_ids for summary in summaries)
        ]
        return admin_summary

    return build_admin_explainability_summary(db)

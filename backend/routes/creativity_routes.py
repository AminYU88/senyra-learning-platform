from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.database.connection import get_db
from backend.models.student import Student
from backend.schemas.creativity_schema import (
    CreativityAdminOverviewResponse,
    CreativityAssessmentOut,
    CreativityPrompt,
    CreativitySubmitRequest,
    CreativitySubmitResponse,
    CreativitySummaryResponse
)
from backend.services.creativity_service import (
    build_admin_creativity_overview,
    build_student_creativity_summary,
    get_creativity_prompts,
    get_student_creativity_history,
    submit_creativity_assessment
)


router = APIRouter(
    prefix="/creativity",
    tags=["Creativity Intelligence Engine"]
)


@router.get(
    "/prompts",
    response_model=list[CreativityPrompt]
)
def list_creativity_prompts(
    current_user: Student = Depends(get_current_user)
):
    return get_creativity_prompts()


@router.post(
    "/submit",
    response_model=CreativitySubmitResponse
)
def submit_creativity_task(
    request: CreativitySubmitRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit creativity assessments."
        )

    if not request.responses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one creativity response is required."
        )

    return submit_creativity_assessment(
        db=db,
        current_user=current_user,
        assessment_type=request.assessment_type,
        responses=request.responses
    )


@router.get(
    "/history",
    response_model=list[CreativityAssessmentOut]
)
def creativity_history(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return get_student_creativity_history(
        db,
        current_user
    )


@router.get(
    "/summary",
    response_model=CreativitySummaryResponse
)
def creativity_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return build_student_creativity_summary(
        db,
        current_user
    )


@router.get(
    "/admin/overview",
    response_model=CreativityAdminOverviewResponse
)
def creativity_admin_overview(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):
    return build_admin_creativity_overview(db)

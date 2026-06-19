from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.database.connection import get_db
from backend.models.student import Student
from backend.schemas.learning_dna_schema import (
    LearningDNAAdminOverviewResponse,
    LearningDNAQuestion,
    LearningDNARecommendationResponse,
    LearningDNAProfileResponse,
    LearningDNASubmitRequest,
    LearningDNASubmitResponse
)
from backend.services.learning_dna_service import (
    build_learning_dna_admin_overview,
    build_learning_dna_recommendations,
    get_learning_dna_profile,
    get_learning_dna_questions,
    save_learning_dna_profile
)


router = APIRouter(
    prefix="/learning-dna",
    tags=["Learning DNA Profile"]
)


@router.get(
    "/questions",
    response_model=list[LearningDNAQuestion]
)
def list_learning_dna_questions(
    current_user: Student = Depends(get_current_user)
):
    return get_learning_dna_questions()


@router.post(
    "/submit",
    response_model=LearningDNASubmitResponse
)
def submit_learning_dna_questionnaire(
    request: LearningDNASubmitRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create or update Learning DNA profiles."
        )

    if not request.responses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one Learning DNA response is required."
        )

    return save_learning_dna_profile(
        db,
        current_user,
        request.responses
    )


@router.get(
    "/profile",
    response_model=LearningDNAProfileResponse | None
)
def learning_dna_profile(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return get_learning_dna_profile(
        db,
        current_user
    )


@router.get(
    "/recommendations",
    response_model=LearningDNARecommendationResponse
)
def learning_dna_recommendations(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return build_learning_dna_recommendations(
        db,
        current_user
    )


@router.get(
    "/admin/overview",
    response_model=LearningDNAAdminOverviewResponse
)
def learning_dna_admin_overview(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):
    return build_learning_dna_admin_overview(db)

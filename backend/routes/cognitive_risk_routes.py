from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.database.connection import get_db
from backend.models.student import Student
from backend.schemas.cognitive_risk_schema import (
    CognitiveRiskAdminOverviewResponse,
    CognitiveRiskFactorsResponse,
    CognitiveRiskModelInfoResponse,
    CognitiveRiskPredictionRequest,
    CognitiveRiskPredictionResponse,
    CognitiveRiskSummaryResponse
)
from backend.services.cognitive_risk_service import (
    build_admin_overview,
    get_cognitive_risk_factors,
    get_cognitive_risk_model_info,
    predict_cognitive_risk_from_metrics,
    predict_current_student_cognitive_risk
)


router = APIRouter(
    prefix="/cognitive-risk",
    tags=["Cognitive Risk Prediction"]
)


def handle_cognitive_risk_error(error: Exception):
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=str(error)
    )


@router.post(
    "/predict",
    response_model=CognitiveRiskPredictionResponse
)
def predict_cognitive_risk(
    request: CognitiveRiskPredictionRequest,
    current_user: Student = Depends(get_current_user)
):
    try:
        return predict_cognitive_risk_from_metrics(request.model_dump())
    except Exception as error:
        handle_cognitive_risk_error(error)


@router.get(
    "/summary",
    response_model=CognitiveRiskSummaryResponse
)
def cognitive_risk_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    try:
        return predict_current_student_cognitive_risk(
            db,
            current_user
        )
    except Exception as error:
        handle_cognitive_risk_error(error)


@router.get(
    "/factors",
    response_model=CognitiveRiskFactorsResponse
)
def cognitive_risk_factors(
    current_user: Student = Depends(get_current_user)
):
    return get_cognitive_risk_factors()


@router.get(
    "/model-info",
    response_model=CognitiveRiskModelInfoResponse
)
def cognitive_risk_model_info(
    current_user: Student = Depends(get_current_user)
):
    return get_cognitive_risk_model_info()


@router.get(
    "/admin/overview",
    response_model=CognitiveRiskAdminOverviewResponse
)
def cognitive_risk_admin_overview(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):
    try:
        return build_admin_overview(db)
    except Exception as error:
        handle_cognitive_risk_error(error)

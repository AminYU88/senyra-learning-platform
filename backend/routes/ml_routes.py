from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.database.connection import get_db
from backend.models.student import Student
from backend.schemas.ml_schema import (
    EngagementPredictionRequest,
    EngagementPredictionResponse,
    FeatureImportanceResponse,
    ModelInfoResponse,
    PredictionResponse,
    StudentMetricsRequest
)
from backend.services.ml_service import (
    get_feature_importance,
    get_model_info,
    predict_engagement_from_metrics,
    predict_current_student_risk,
    predict_from_metrics
)


router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"]
)


def handle_model_error(error: Exception):
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=str(error)
    )


@router.post(
    "/predict-risk",
    response_model=PredictionResponse
)
def predict_risk_from_metrics(
    request: StudentMetricsRequest,
    current_user: Student = Depends(get_current_user)
):
    try:
        return predict_from_metrics(request.model_dump())
    except Exception as error:
        handle_model_error(error)


@router.get(
    "/model-info",
    response_model=ModelInfoResponse
)
def model_info(
    current_user: Student = Depends(get_current_user)
):
    try:
        return get_model_info()
    except Exception as error:
        handle_model_error(error)


@router.get(
    "/feature-importance",
    response_model=FeatureImportanceResponse
)
def feature_importance(
    current_user: Student = Depends(get_current_user)
):
    try:
        return get_feature_importance()
    except Exception as error:
        handle_model_error(error)


@router.get("/risk-prediction")
def predict_current_user_risk(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    try:
        return predict_current_student_risk(
            db,
            current_user
        )
    except Exception as error:
        handle_model_error(error)


@router.post(
    "/predict-engagement",
    response_model=EngagementPredictionResponse
)
def predict_engagement(
    request: EngagementPredictionRequest,
    current_user: Student = Depends(get_current_user)
):
    try:
        return predict_engagement_from_metrics(request.model_dump())
    except Exception as error:
        handle_model_error(error)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.recommendation_history import RecommendationHistory

from backend.auth.auth_handler import get_current_user


router = APIRouter(
    prefix="/recommendation-history",
    tags=["Recommendation History"]
)


@router.post("/save")
def save_recommendation(
    recommendation: str,
    reason: str = "AI learning analytics recommendation",
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    history = RecommendationHistory(
        student_id=current_user.id,
        recommendation=recommendation,
        reason=reason
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return {
        "message": "Recommendation saved successfully",
        "id": history.id
    }


@router.get("/me")
def get_my_recommendation_history(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    recommendations = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.student_id == current_user.id)
        .order_by(RecommendationHistory.created_at.desc())
        .all()
    )

    return [
        {
            "id": item.id,
            "recommendation": item.recommendation,
            "reason": item.reason,
            "is_helpful": item.is_helpful,
            "created_at": item.created_at
        }
        for item in recommendations
    ]


@router.put("/{recommendation_id}/feedback")
def update_recommendation_feedback(
    recommendation_id: int,
    is_helpful: bool,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    recommendation = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.id == recommendation_id)
        .filter(RecommendationHistory.student_id == current_user.id)
        .first()
    )

    if not recommendation:
        return {
            "message": "Recommendation not found"
        }

    recommendation.is_helpful = is_helpful

    db.commit()
    db.refresh(recommendation)

    return {
        "message": "Feedback saved successfully"
    }
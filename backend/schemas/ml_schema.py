from typing import Any, Optional

from pydantic import BaseModel, Field


class StudentMetricsRequest(BaseModel):
    attendance_rate: float = Field(ge=0, le=100)
    engagement_score: float = Field(ge=0, le=100)
    average_quiz_score: float = Field(ge=0, le=100)
    assignment_score: float = Field(ge=0, le=100)
    lesson_completion_rate: float = Field(ge=0, le=100)
    study_hours_per_week: float = Field(ge=0, le=80)
    late_submissions: int = Field(ge=0, le=50)
    forum_posts: int = Field(ge=0, le=500)
    practice_exercises_completed: int = Field(ge=0, le=500)
    previous_failures: int = Field(ge=0, le=20)
    course_level: str = "beginner"
    primary_topic: str = "python"


class PredictionResponse(BaseModel):
    risk_level: str
    confidence_score: float
    pass_fail_prediction: str
    pass_probability: float
    engagement_prediction: str
    weak_topic: str
    recommendations: list[str]
    model_name: str
    prediction_source: str
    input_features: dict


class EngagementPredictionRequest(BaseModel):
    raised_hands: int = Field(ge=0, le=100)
    visited_resources: int = Field(ge=0, le=100)
    announcements_view: int = Field(ge=0, le=100)
    discussion: int = Field(ge=0, le=100)
    parent_satisfaction: int = Field(ge=0, le=5)
    gender: str = "F"
    nationality: str = "UK"
    topic: str = "Maths"
    stage: str = "GCSE"
    grade_band: str = "B"
    parent_answering_survey: str = "Good"
    student_absence_days: str = "Under-7"


class EngagementPredictionResponse(BaseModel):
    engagement_level: str
    confidence_score: float
    explanation: str
    personalised_recommendation: str
    model_name: str
    input_features: dict


class ModelInfoResponse(BaseModel):
    best_model_name: Optional[str] = None
    model_results: dict = {}
    engagement_model: Optional[dict[str, Any]] = None
    dataset_rows: int = 0
    datasets: list[dict[str, Any]] = []
    saved_models: list[dict[str, Any]] = []
    model_status: dict[str, Any] = {}
    features: list[str] = []
    dataset_justification: str
    ethical_considerations: list[str]


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float


class FeatureImportanceResponse(BaseModel):
    model_name: str
    feature_importance: list[FeatureImportanceItem]
    model_status: dict[str, Any] = {}

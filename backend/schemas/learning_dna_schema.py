from datetime import datetime

from pydantic import BaseModel, Field


class LearningDNAQuestion(BaseModel):
    id: str
    question: str
    options: list[str]
    score_categories: dict[str, str]


class LearningDNAAnswer(BaseModel):
    question: str
    answer: str = Field(..., min_length=1)
    score_category: str


class LearningDNASubmitRequest(BaseModel):
    responses: list[LearningDNAAnswer]


class LearningDNAProfileResponse(BaseModel):
    id: int
    student_id: int
    learner_type: str
    confidence_score: float
    analytical_score: float
    creative_score: float
    visual_score: float
    problem_solver_score: float
    exploratory_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LearningDNASubmitResponse(BaseModel):
    profile: LearningDNAProfileResponse
    recommendations: list[str]
    explanation: str


class LearningDNARecommendationResponse(BaseModel):
    learner_type: str
    recommendations: list[str]
    study_strategy: str


class LearningDNAAdminOverviewResponse(BaseModel):
    total_profiles: int
    learner_type_distribution: list[dict]
    average_confidence_score: float
    average_analytical_score: float
    average_creative_score: float
    average_visual_score: float
    average_problem_solver_score: float
    average_exploratory_score: float

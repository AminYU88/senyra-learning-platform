from pydantic import BaseModel, Field


class CognitiveRiskPredictionRequest(BaseModel):
    attendance_rate: float = Field(default=75, ge=0, le=100)
    average_quiz_score: float = Field(default=60, ge=0, le=100)
    engagement_score: float = Field(default=50, ge=0, le=100)
    creativity_score: float = Field(default=0, ge=0, le=100)
    flow_score: float = Field(default=0, ge=0, le=100)
    learning_dna_confidence: float = Field(default=0, ge=0, le=100)
    study_consistency: float = Field(default=0, ge=0, le=100)
    task_completion_rate: float = Field(default=0, ge=0, le=100)
    weak_topic_count: int = Field(default=0, ge=0, le=100)
    problem_solving_score: float = Field(default=0, ge=0, le=100)
    course_level: str = "beginner"
    learner_type: str = "Unknown"


class CognitiveRiskPredictionResponse(BaseModel):
    cognitive_risk_level: str
    confidence_score: float
    key_risk_factors: list[str]
    protective_factors: list[str]
    recommendation: str
    model_name: str
    prediction_source: str
    input_features: dict


class CognitiveRiskSummaryResponse(CognitiveRiskPredictionResponse):
    student: str
    data_completeness: dict


class CognitiveRiskFactorsResponse(BaseModel):
    risk_factors: list[str]
    protective_factors: list[str]
    feature_explanations: dict


class CognitiveRiskModelInfoResponse(BaseModel):
    model_name: str
    model_results: dict
    features: list[str]
    target: str
    dataset_name: str
    dataset_justification: str
    ethical_considerations: list[str]
    model_available: bool


class CognitiveRiskAdminOverviewResponse(BaseModel):
    total_students: int
    average_cognitive_risk_score: float
    high_risk_students: int
    medium_risk_students: int
    low_risk_students: int
    class_cognitive_risk_trends: list[dict] = []
    common_risk_factors: list[dict]
    protective_factor_summary: list[dict]
    students_needing_support: list[dict]
    recommendation: str

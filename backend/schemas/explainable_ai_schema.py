from pydantic import BaseModel


class FactorImpact(BaseModel):
    factor: str
    impact: str
    value: str


class ExplanationResponse(BaseModel):
    prediction_type: str
    result: str
    confidence: float | None = None
    confidence_label: str | None = None
    evidence_source: str | None = None
    top_factors: list[FactorImpact]
    positive_factors: list[FactorImpact]
    negative_factors: list[FactorImpact]
    explanation: str
    suggested_action: str


class StudentExplainabilityResponse(BaseModel):
    student_id: int
    student: str
    explanations: list[ExplanationResponse]


class ExplainabilityAdminSummary(BaseModel):
    total_students: int
    explanations_generated: int
    common_positive_factors: list[dict]
    common_negative_factors: list[dict]
    risk_level_summary: list[dict]
    student_summaries: list[StudentExplainabilityResponse]

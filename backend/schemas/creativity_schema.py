from datetime import datetime

from pydantic import BaseModel, Field


class CreativityPrompt(BaseModel):
    id: str
    assessment_type: str
    prompt: str
    category: str


class CreativityResponseCreate(BaseModel):
    prompt: str
    response_text: str = Field(..., min_length=1)
    category: str | None = None


class CreativitySubmitRequest(BaseModel):
    assessment_type: str = "general_creativity"
    responses: list[CreativityResponseCreate]


class CreativityResponseOut(BaseModel):
    id: int
    prompt: str
    response_text: str
    score: float
    feedback: str

    class Config:
        from_attributes = True


class CreativityAssessmentOut(BaseModel):
    id: int
    student_id: int
    assessment_type: str
    creativity_score: float
    fluency_score: float
    flexibility_score: float
    originality_score: float
    elaboration_score: float
    creative_confidence: str
    problem_solving_style: str
    created_at: datetime
    responses: list[CreativityResponseOut] = []

    class Config:
        from_attributes = True


class CreativitySubmitResponse(BaseModel):
    assessment: CreativityAssessmentOut
    feedback: list[str]


class CreativitySummaryResponse(BaseModel):
    total_assessments: int
    average_creativity_score: float
    average_fluency_score: float
    average_flexibility_score: float
    average_originality_score: float
    average_elaboration_score: float
    latest_confidence: str
    latest_problem_solving_style: str
    recommendation: str


class CreativityAdminOverviewResponse(BaseModel):
    total_assessments: int
    assessed_students: int
    average_creativity_score: float
    average_fluency_score: float
    average_flexibility_score: float
    average_originality_score: float
    average_elaboration_score: float
    high_creativity_count: int
    developing_creativity_count: int
    creativity_trends: list[dict] = []
    common_strengths: list[dict] = []
    common_improvement_areas: list[dict] = []

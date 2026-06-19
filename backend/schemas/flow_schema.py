from datetime import datetime

from pydantic import BaseModel, Field


class FlowStartSessionRequest(BaseModel):
    activity_type: str = "study"
    subject: str | None = None
    topic: str | None = None


class FlowEndSessionRequest(BaseModel):
    session_id: int
    completed_task: bool = False
    quiz_score: float | None = Field(default=None, ge=0, le=100)
    resource_views: int = Field(default=0, ge=0)
    engagement_events: int = Field(default=0, ge=0)


class FlowLogEventRequest(BaseModel):
    session_id: int
    event_type: str = "engagement"
    count: int = Field(default=1, ge=1)


class FlowSessionResponse(BaseModel):
    id: int
    student_id: int
    started_at: datetime
    ended_at: datetime | None
    duration_minutes: float
    activity_type: str
    subject: str | None
    topic: str | None
    completed_task: bool
    quiz_score: float | None
    resource_views: int
    engagement_events: int
    flow_score: float

    class Config:
        from_attributes = True


class FlowSummaryResponse(BaseModel):
    id: int | None = None
    student_id: int
    average_flow_score: float
    best_time_start: str | None
    best_time_end: str | None
    strongest_subject: str | None
    weakest_subject: str | None
    updated_at: datetime | None = None
    message: str
    best_time: str | None
    recommendation: str

    class Config:
        from_attributes = True


class FlowTodayResponse(BaseModel):
    date: str
    sessions: list[FlowSessionResponse]
    average_flow_score: float
    total_duration_minutes: float
    message: str
    best_time: str | None
    recommendation: str


class FlowAdminOverviewResponse(BaseModel):
    total_sessions: int
    active_sessions: int
    average_flow_score: float
    average_duration_minutes: float
    strongest_subjects: list[dict]
    best_time_distribution: list[dict]
    engagement_trends: list[dict] = []
    low_flow_students: list[dict] = []
    recommendation: str

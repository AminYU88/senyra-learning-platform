from datetime import datetime

from pydantic import BaseModel


class WeakTopicOut(BaseModel):
    subject: str
    topic: str
    average_score: float
    attempts: int
    severity: str
    recommendation: str
    student_id: int | None = None
    student: str | None = None
    last_detected_at: datetime | None = None


class WeakTopicStudentSummary(BaseModel):
    student_id: int
    student: str
    weak_topics: list[WeakTopicOut]


class WeakTopicClassItem(BaseModel):
    subject: str
    topic: str
    average_score: float
    attempts: int
    severity: str
    recommendation: str
    struggling_students: list[WeakTopicStudentSummary]


class WeakTopicSummaryResponse(BaseModel):
    total_topics: int
    high_severity_topics: int
    topics: list[WeakTopicClassItem]

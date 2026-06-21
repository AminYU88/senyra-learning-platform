from datetime import datetime

from pydantic import BaseModel


class WeakTopicOut(BaseModel):
    subject: str
    topic: str
    average_score: float
    attempts: int
    status: str
    severity: str
    recommendation: str
    engagement_score: float | None = None
    lesson_completion: float | None = None
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
    status: str
    severity: str
    recommendation: str
    weak_students: int = 0
    medium_students: int = 0
    strong_students: int = 0
    struggling_students: list[WeakTopicStudentSummary]


class WeakTopicSummaryResponse(BaseModel):
    total_topics: int
    high_severity_topics: int
    weak_topics: int = 0
    medium_topics: int = 0
    strong_topics: int = 0
    topics: list[WeakTopicClassItem]

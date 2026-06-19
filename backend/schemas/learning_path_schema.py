from pydantic import BaseModel


class LearningPathGenerateRequest(BaseModel):
    student_id: int | None = None
    preferred_subject: str | None = None


class LearningPathStep(BaseModel):
    step: int
    title: str
    description: str
    subject: str
    topic: str
    task_type: str
    estimated_minutes: int


class LearningPathResponse(BaseModel):
    student_id: int
    student: str
    level: str
    subject: str
    recommended_subjects: list[str]
    next_topics: list[str]
    difficulty: str
    reason: str
    daily_tasks: list[str]
    weekly_plan: list[str]
    estimated_completion_time: str
    progress_percent: float
    signals: dict
    learning_path: list[LearningPathStep]


class LearningPathAdminSummary(BaseModel):
    total_students: int
    level_distribution: list[dict]
    students_needing_easier_path: list[dict]
    students_ready_for_harder_path: list[dict]
    paths: list[LearningPathResponse]

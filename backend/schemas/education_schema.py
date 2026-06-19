from pydantic import BaseModel, Field


class TopicResponse(BaseModel):
    id: int | None = None
    subject: str
    name: str
    difficulty_level: str
    curriculum_level: str
    age_range: str
    description: str | None = None


class QuizResultCreate(BaseModel):
    subject: str
    topic: str
    score: float = Field(ge=0, le=100)


class StudyPlanRequest(BaseModel):
    subject: str
    topic: str
    age_range: str = "14-16"
    days: int = Field(default=7, ge=1, le=60)


class QuizGeneratorRequest(BaseModel):
    subject: str
    topic: str
    curriculum_level: str = "GCSE"
    number_of_questions: int = Field(default=10, ge=1, le=30)
    question_type: str = "mixed"


class PracticeRequest(BaseModel):
    subject: str
    topic: str
    curriculum_level: str = "GCSE"
    age_range: str = "14-16"

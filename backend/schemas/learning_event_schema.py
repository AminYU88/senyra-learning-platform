from pydantic import BaseModel


class LearningEventCreate(BaseModel):

    event_type: str

    event_value: str | None = None


class LearningEventResponse(BaseModel):

    id: int

    student_id: int

    event_type: str

    event_value: str | None

    class Config:
        from_attributes = True
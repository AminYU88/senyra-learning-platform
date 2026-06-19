from pydantic import BaseModel

from typing import Optional


class LessonCreate(BaseModel):

    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    course_id: int


class LessonResponse(BaseModel):

    id: int
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    course_id: int

    class Config:
        from_attributes = True
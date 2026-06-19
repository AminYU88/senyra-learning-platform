from pydantic import BaseModel

from typing import Optional, List


class LessonResponse(BaseModel):

    id: int
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):

    title: str
    description: Optional[str] = None
    level: Optional[str] = "Beginner"


class CourseResponse(BaseModel):

    id: int
    title: str
    description: Optional[str] = None
    level: str
    lessons: List[LessonResponse] = []

    class Config:
        from_attributes = True
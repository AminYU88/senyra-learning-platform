from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class Lesson(Base):

    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    content = Column(Text, nullable=True)

    video_url = Column(String, nullable=True)

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    course = relationship(
        "Course",
        back_populates="lessons"
    )
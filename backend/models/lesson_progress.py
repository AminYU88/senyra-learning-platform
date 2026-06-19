from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from datetime import datetime

from backend.database.connection import Base


class LessonProgress(Base):

    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id"),
        nullable=False
    )

    completed_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    lesson = relationship("Lesson")

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "lesson_id",
            name="unique_student_lesson_progress"
        ),
    )
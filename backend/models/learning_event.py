from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from datetime import datetime

from backend.database.connection import Base


class LearningEvent(Base):

    __tablename__ = "learning_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id")
    )

    event_type = Column(
        String,
        nullable=False
    )

    event_value = Column(
        String,
        nullable=True
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )

    student = relationship(
        "Student",
        back_populates="learning_events"
    )
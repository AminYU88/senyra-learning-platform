from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from datetime import datetime

from backend.database.connection import Base


class FeedbackMessage(Base):
    __tablename__ = "feedback_messages"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    teacher_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    subject = Column(String, nullable=False)

    message = Column(String, nullable=False)

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from backend.database.connection import Base


class StudentNote(Base):
    __tablename__ = "student_notes"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    teacher_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    note = Column(String, nullable=False)

    action_taken = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from backend.database.connection import Base


class ClassGroup(Base):
    __tablename__ = "class_groups"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    teacher_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"

    id = Column(Integer, primary_key=True, index=True)

    class_id = Column(Integer, ForeignKey("class_groups.id"), nullable=False)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
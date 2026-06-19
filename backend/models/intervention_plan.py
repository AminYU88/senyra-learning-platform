from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from datetime import datetime

from backend.database.connection import Base


class InterventionPlan(Base):
    __tablename__ = "intervention_plans"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    teacher_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    title = Column(String, nullable=False)

    target_area = Column(String, nullable=False)

    action_plan = Column(String, nullable=False)

    status = Column(String, default="Open")

    is_completed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
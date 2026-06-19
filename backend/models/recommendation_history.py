from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime

from backend.database.connection import Base


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    recommendation = Column(String, nullable=False)

    reason = Column(String, nullable=True)

    is_helpful = Column(Boolean, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
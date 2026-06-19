from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class CreativityAssessment(Base):

    __tablename__ = "creativity_assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    assessment_type = Column(String, nullable=False)
    creativity_score = Column(Float, nullable=False)
    fluency_score = Column(Float, nullable=False)
    flexibility_score = Column(Float, nullable=False)
    originality_score = Column(Float, nullable=False)
    elaboration_score = Column(Float, nullable=False)
    creative_confidence = Column(String, nullable=False)
    problem_solving_style = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    responses = relationship(
        "CreativityResponse",
        back_populates="assessment",
        cascade="all, delete-orphan"
    )


class CreativityResponse(Base):

    __tablename__ = "creativity_responses"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(
        Integer,
        ForeignKey("creativity_assessments.id"),
        nullable=False
    )
    prompt = Column(String, nullable=False)
    response_text = Column(Text, nullable=False)
    score = Column(Float, nullable=False)
    feedback = Column(Text, nullable=False)

    assessment = relationship(
        "CreativityAssessment",
        back_populates="responses"
    )

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text

from backend.database.connection import Base


class LearningDNAProfile(Base):

    __tablename__ = "learning_dna_profiles"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    learner_type = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    analytical_score = Column(Float, nullable=False)
    creative_score = Column(Float, nullable=False)
    visual_score = Column(Float, nullable=False)
    problem_solver_score = Column(Float, nullable=False)
    exploratory_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LearningDNAQuestionnaireResponse(Base):

    __tablename__ = "learning_dna_questionnaire_responses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    score_category = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

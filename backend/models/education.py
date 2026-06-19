from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class Subject(Base):

    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    topics = relationship("Topic", back_populates="subject")


class Topic(Base):

    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    difficulty_level = Column(String, nullable=False)
    curriculum_level = Column(String, nullable=False)
    age_range = Column(String, nullable=False)
    description = Column(String, nullable=True)

    subject = relationship("Subject", back_populates="topics")


class SubjectQuizResult(Base):

    __tablename__ = "subject_quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    taken_at = Column(DateTime, default=datetime.utcnow)


class WeakTopic(Base):

    __tablename__ = "weak_topics"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    confidence_level = Column(Float, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow)

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String

from backend.database.connection import Base


class FlowSession(Base):

    __tablename__ = "flow_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Float, default=0)
    activity_type = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    topic = Column(String, nullable=True)
    completed_task = Column(Boolean, default=False)
    quiz_score = Column(Float, nullable=True)
    resource_views = Column(Integer, default=0)
    engagement_events = Column(Integer, default=0)
    flow_score = Column(Float, default=0)


class FlowSummary(Base):

    __tablename__ = "flow_summaries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    average_flow_score = Column(Float, default=0)
    best_time_start = Column(String, nullable=True)
    best_time_end = Column(String, nullable=True)
    strongest_subject = Column(String, nullable=True)
    weakest_subject = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

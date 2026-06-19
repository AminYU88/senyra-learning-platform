from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from backend.database.connection import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("students.id"), nullable=True)

    user_role = Column(String, nullable=True)

    action = Column(String, nullable=False)

    description = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
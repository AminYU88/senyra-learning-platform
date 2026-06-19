from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime

from backend.database.connection import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    notification_type = Column(String, default="info")

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
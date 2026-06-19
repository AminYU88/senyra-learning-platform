from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class ChatSession(Base):

    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False,
        index=True
    )

    title = Column(String, default="New chat")

    is_favourite = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan"
    )


class ChatMessage(Base):

    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id"),
        nullable=False,
        index=True
    )

    role = Column(String, nullable=False)

    content = Column(Text, nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship(
        "ChatSession",
        back_populates="messages"
    )

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=4000)
    session_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    session_id: int


class ChatSessionCreate(BaseModel):
    title: Optional[str] = None


class ChatSessionResponse(BaseModel):
    id: int
    title: str
    is_favourite: bool
    created_at: datetime
    last_message: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

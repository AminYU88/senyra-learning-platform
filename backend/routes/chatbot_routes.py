import time

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.database.connection import get_db
from backend.models.chat import ChatMessage, ChatSession
from backend.models.student import Student
from backend.schemas.chatbot_schema import (
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
    ChatSessionCreate,
    ChatSessionResponse
)
from backend.services.ai_service import generate_response


router = APIRouter(
    prefix="/chat",
    tags=["AI Learning Assistant"]
)


def get_owned_session(
    session_id: int,
    db: Session,
    current_user: Student
) -> ChatSession:
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id)
        .filter(ChatSession.user_id == current_user.id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )

    return session


def make_title(message: str) -> str:
    title = message.strip().replace("\n", " ")
    if len(title) > 45:
        return title[:42] + "..."
    return title or "New chat"


@router.post(
    "",
    response_model=ChatResponse
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if request.session_id:
        session = get_owned_session(
            request.session_id,
            db,
            current_user
        )
    else:
        session = ChatSession(
            user_id=current_user.id,
            title=make_title(request.message)
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.timestamp.asc())
        .limit(12)
        .all()
    )

    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=request.message
    )
    db.add(user_message)
    db.commit()

    answer = generate_response(
        db,
        current_user,
        request.message,
        history
    )

    assistant_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=answer
    )
    db.add(assistant_message)
    db.commit()

    return {
        "response": answer,
        "session_id": session.id
    }


@router.post("/stream")
def stream_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    result = chat(
        request=request,
        db=db,
        current_user=current_user
    )

    def token_stream():
        for word in result["response"].split(" "):
            yield word + " "
            time.sleep(0.01)

    return StreamingResponse(
        token_stream(),
        media_type="text/plain"
    )


@router.post(
    "/sessions",
    response_model=ChatSessionResponse
)
def create_session(
    request: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    session = ChatSession(
        user_id=current_user.id,
        title=request.title or "New chat"
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "title": session.title,
        "is_favourite": session.is_favourite,
        "created_at": session.created_at,
        "last_message": None
    }


@router.get(
    "/sessions",
    response_model=list[ChatSessionResponse]
)
def get_sessions(
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .all()
    )

    results = []

    for session in sessions:
        last_message = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.timestamp.desc())
            .first()
        )

        searchable = f"{session.title} {last_message.content if last_message else ''}".lower()

        if search and search.lower() not in searchable:
            continue

        results.append({
            "id": session.id,
            "title": session.title,
            "is_favourite": session.is_favourite,
            "created_at": session.created_at,
            "last_message": last_message.content[:120] if last_message else None
        })

    return results


@router.get(
    "/sessions/{session_id}/messages",
    response_model=list[ChatMessageResponse]
)
def get_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    get_owned_session(
        session_id,
        db,
        current_user
    )

    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )


@router.put("/sessions/{session_id}/favourite")
def toggle_favourite(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    session = get_owned_session(
        session_id,
        db,
        current_user
    )

    session.is_favourite = not session.is_favourite
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "is_favourite": session.is_favourite
    }

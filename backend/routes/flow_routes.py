from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.database.connection import get_db
from backend.models.student import Student
from backend.schemas.flow_schema import (
    FlowAdminOverviewResponse,
    FlowEndSessionRequest,
    FlowLogEventRequest,
    FlowSessionResponse,
    FlowStartSessionRequest,
    FlowSummaryResponse,
    FlowTodayResponse
)
from backend.services.flow_service import (
    build_flow_admin_overview,
    build_flow_summary_response,
    build_today_flow,
    create_flow_session,
    end_flow_session,
    get_flow_history,
    log_flow_event
)


router = APIRouter(
    prefix="/flow",
    tags=["Flow State Detection"]
)


def require_student_user(current_user: Student):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can track flow sessions."
        )


@router.post(
    "/start-session",
    response_model=FlowSessionResponse
)
def start_flow_session(
    request: FlowStartSessionRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    require_student_user(current_user)

    return create_flow_session(
        db=db,
        student=current_user,
        activity_type=request.activity_type,
        subject=request.subject,
        topic=request.topic
    )


@router.post(
    "/end-session",
    response_model=FlowSessionResponse
)
def finish_flow_session(
    request: FlowEndSessionRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    require_student_user(current_user)

    session = end_flow_session(
        db=db,
        student=current_user,
        session_id=request.session_id,
        completed_task=request.completed_task,
        quiz_score=request.quiz_score,
        resource_views=request.resource_views,
        engagement_events=request.engagement_events
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow session not found."
        )

    return session


@router.post(
    "/log-event",
    response_model=FlowSessionResponse
)
def log_flow_session_event(
    request: FlowLogEventRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    require_student_user(current_user)

    session = log_flow_event(
        db=db,
        student=current_user,
        session_id=request.session_id,
        event_type=request.event_type,
        count=request.count
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow session not found."
        )

    return session


@router.get(
    "/today",
    response_model=FlowTodayResponse
)
def flow_today(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return build_today_flow(
        db,
        current_user
    )


@router.get(
    "/summary",
    response_model=FlowSummaryResponse
)
def flow_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return build_flow_summary_response(
        db,
        current_user
    )


@router.get(
    "/history",
    response_model=list[FlowSessionResponse]
)
def flow_history(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return get_flow_history(
        db,
        current_user
    )


@router.get(
    "/admin/overview",
    response_model=FlowAdminOverviewResponse
)
def flow_admin_overview(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):
    return build_flow_admin_overview(db)

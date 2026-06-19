from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from backend.database.connection import SessionLocal

from backend.models.learning_event import LearningEvent

from backend.models.student import Student

from backend.routes.student_routes import (
    get_current_student
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


@router.get("/events")
def get_event_analytics(
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_student
    )
):

    events = db.query(LearningEvent).filter(
        LearningEvent.student_id == current_student.id
    ).all()

    return {
        "total_events": len(events),
        "events": events
    }
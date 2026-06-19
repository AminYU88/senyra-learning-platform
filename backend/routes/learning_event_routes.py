from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from backend.database.connection import SessionLocal

from backend.models.learning_event import LearningEvent

from backend.models.student import Student

from backend.schemas.learning_event_schema import (
    LearningEventCreate
)

from backend.routes.student_routes import (
    get_current_student
)

router = APIRouter(
    prefix="/events",
    tags=["Learning Events"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


@router.post("/")
def create_learning_event(
    event: LearningEventCreate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_student
    )
):

    new_event = LearningEvent(
        student_id=current_student.id,
        event_type=event.event_type,
        event_value=event.event_value
    )

    db.add(new_event)

    db.commit()

    db.refresh(new_event)

    return new_event
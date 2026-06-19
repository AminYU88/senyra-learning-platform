import pandas as pd

from sqlalchemy.orm import Session

from backend.models.student import Student
from backend.models.learning_event import LearningEvent


def generate_dashboard_summary(db: Session):

    students = db.query(Student).all()

    events = db.query(LearningEvent).all()

    total_students = len(students)

    total_events = len(events)

    if not events:

        return {
            "total_students": total_students,
            "total_events": total_events,
            "most_common_event": None
        }

    event_data = []

    for event in events:

        event_data.append({
            "event_type": event.event_type
        })

    df = pd.DataFrame(event_data)

    most_common_event = (
        df["event_type"]
        .value_counts()
        .idxmax()
    )

    return {
        "total_students": total_students,
        "total_events": total_events,
        "most_common_event": most_common_event
    }


def generate_student_engagement(db: Session):

    events = db.query(LearningEvent).all()

    if not events:

        return {
            "message": "No engagement data found"
        }

    engagement_data = []

    for event in events:

        engagement_data.append({
            "student_id": event.student_id,
            "event_type": event.event_type
        })

    df = pd.DataFrame(engagement_data)

    engagement_counts = (
        df.groupby("student_id")
        .size()
        .to_dict()
    )

    return {
        "student_engagement": engagement_counts
    }
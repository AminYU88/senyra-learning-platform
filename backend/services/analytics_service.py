import pandas as pd

from sqlalchemy.orm import Session

from backend.models.learning_event import LearningEvent


def generate_event_analytics(db: Session):

    events = db.query(LearningEvent).all()

    if not events:
        return {
            "message": "No learning events found"
        }

    event_data = []

    for event in events:

        event_data.append({
            "student_id": event.student_id,
            "event_type": event.event_type,
            "event_value": event.event_value,
            "timestamp": event.timestamp
        })

    df = pd.DataFrame(event_data)

    total_events = len(df)

    event_breakdown = (
        df["event_type"]
        .value_counts()
        .to_dict()
    )

    return {
        "total_events": total_events,
        "event_breakdown": event_breakdown
    }
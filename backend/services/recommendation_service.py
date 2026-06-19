from sqlalchemy.orm import Session

from backend.models.learning_event import LearningEvent
from backend.models.student import Student


def generate_recommendations(
    current_student: Student,
    db: Session
):

    events = db.query(LearningEvent).filter(
        LearningEvent.student_id == current_student.id
    ).all()

    if not events:

        return {
            "student": current_student.full_name,
            "recommendations": [
                "Start with beginner Python lessons",
                "Complete your first quiz",
                "Watch introduction videos"
            ]
        }

    event_types = [event.event_type for event in events]

    recommendations = []

    quiz_count = event_types.count("quiz_completed")

    video_count = event_types.count("video_watched")

    login_count = event_types.count("login")

    if quiz_count >= 3:

        recommendations.append(
            "Try advanced programming exercises"
        )

    if video_count >= 3:

        recommendations.append(
            "Complete reinforcement quizzes"
        )

    if login_count <= 1:

        recommendations.append(
            "Increase weekly learning activity"
        )

    if quiz_count == 0:

        recommendations.append(
            "Attempt beginner assessment quizzes"
        )

    if not recommendations:

        recommendations.append(
            "Continue current learning pathway"
        )

    return {
        "student": current_student.full_name,
        "recommendations": recommendations
    }
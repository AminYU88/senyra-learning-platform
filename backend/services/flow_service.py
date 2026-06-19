from collections import Counter, defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from backend.models.flow_model import FlowSession, FlowSummary
from backend.models.student import Student


def clamp_score(value: float) -> float:
    return round(max(0, min(100, value)), 2)


def calculate_flow_score(session: FlowSession) -> float:
    duration_score = min(session.duration_minutes, 90) * 0.35
    completion_score = 18 if session.completed_task else 0
    quiz_score = (session.quiz_score or 0) * 0.20 if session.quiz_score is not None else 0
    resource_score = min(session.resource_views * 4, 16)
    engagement_score = min(session.engagement_events * 3, 18)

    inactivity_penalty = 0
    if session.duration_minutes > 20 and session.engagement_events == 0 and session.resource_views == 0:
        inactivity_penalty = 20

    if session.duration_minutes > 120 and session.completed_task is False:
        inactivity_penalty += 10

    return clamp_score(
        duration_score
        + completion_score
        + quiz_score
        + resource_score
        + engagement_score
        - inactivity_penalty
    )


def flow_message(score: float) -> str:
    if score >= 80:
        return "Great focus today."
    if score >= 60:
        return "Good focus. Keep building consistency."
    if score >= 40:
        return "Some focus detected. Try shorter, clearer sessions."
    return "Flow is low. Reduce distractions and set one small goal."


def time_window_from_hour(hour: int) -> tuple[str, str]:
    start = f"{hour:02d}:00"
    end = f"{(hour + 2) % 24:02d}:00"
    return start, end


def best_time_label(start: str | None, end: str | None) -> str | None:
    if not start or not end:
        return None
    return f"{start} - {end}"


def recommendation_for_summary(summary: FlowSummary | None) -> str:
    if not summary:
        return "Start a flow session to identify your strongest focus window."

    if summary.best_time_start and summary.best_time_end:
        return "Schedule difficult topics during your strongest focus window."

    return "Complete more sessions so Senyra can detect your best learning time."


def create_flow_session(
    db: Session,
    student: Student,
    activity_type: str,
    subject: str | None,
    topic: str | None
) -> FlowSession:
    session = FlowSession(
        student_id=student.id,
        activity_type=activity_type,
        subject=subject,
        topic=topic,
        started_at=datetime.utcnow()
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


def get_student_session(
    db: Session,
    student: Student,
    session_id: int
) -> FlowSession | None:
    return (
        db.query(FlowSession)
        .filter(FlowSession.id == session_id)
        .filter(FlowSession.student_id == student.id)
        .first()
    )


def log_flow_event(
    db: Session,
    student: Student,
    session_id: int,
    event_type: str,
    count: int
) -> FlowSession | None:
    session = get_student_session(db, student, session_id)

    if not session:
        return None

    if event_type == "resource_view":
        session.resource_views += count
    else:
        session.engagement_events += count

    if session.started_at:
        session.duration_minutes = round(
            (datetime.utcnow() - session.started_at).total_seconds() / 60,
            2
        )

    session.flow_score = calculate_flow_score(session)

    db.commit()
    db.refresh(session)

    return session


def end_flow_session(
    db: Session,
    student: Student,
    session_id: int,
    completed_task: bool,
    quiz_score: float | None,
    resource_views: int,
    engagement_events: int
) -> FlowSession | None:
    session = get_student_session(db, student, session_id)

    if not session:
        return None

    now = datetime.utcnow()
    session.ended_at = now
    session.duration_minutes = round(
        (now - session.started_at).total_seconds() / 60,
        2
    )
    session.completed_task = completed_task
    session.quiz_score = quiz_score
    session.resource_views += resource_views
    session.engagement_events += engagement_events
    session.flow_score = calculate_flow_score(session)

    db.commit()
    db.refresh(session)

    update_flow_summary(db, student)

    return session


def update_flow_summary(
    db: Session,
    student: Student
) -> FlowSummary:
    sessions = (
        db.query(FlowSession)
        .filter(FlowSession.student_id == student.id)
        .filter(FlowSession.ended_at.isnot(None))
        .all()
    )

    summary = (
        db.query(FlowSummary)
        .filter(FlowSummary.student_id == student.id)
        .first()
    )

    if not summary:
        summary = FlowSummary(student_id=student.id)
        db.add(summary)

    if not sessions:
        summary.average_flow_score = 0
        summary.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(summary)
        return summary

    summary.average_flow_score = round(
        sum(session.flow_score for session in sessions) / len(sessions),
        2
    )

    hour_scores = defaultdict(list)
    subject_scores = defaultdict(list)

    for session in sessions:
        hour_scores[session.started_at.hour].append(session.flow_score)
        if session.subject:
            subject_scores[session.subject].append(session.flow_score)

    best_hour = max(
        hour_scores,
        key=lambda hour: sum(hour_scores[hour]) / len(hour_scores[hour])
    )
    summary.best_time_start, summary.best_time_end = time_window_from_hour(best_hour)

    if subject_scores:
        subject_averages = {
            subject: sum(scores) / len(scores)
            for subject, scores in subject_scores.items()
        }
        summary.strongest_subject = max(subject_averages, key=subject_averages.get)
        summary.weakest_subject = min(subject_averages, key=subject_averages.get)

    summary.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(summary)

    return summary


def build_flow_summary_response(
    db: Session,
    student: Student
) -> dict:
    summary = (
        db.query(FlowSummary)
        .filter(FlowSummary.student_id == student.id)
        .first()
    )

    if not summary:
        return {
            "id": None,
            "student_id": student.id,
            "average_flow_score": 0,
            "best_time_start": None,
            "best_time_end": None,
            "strongest_subject": None,
            "weakest_subject": None,
            "updated_at": None,
            "message": "No flow sessions recorded yet.",
            "best_time": None,
            "recommendation": recommendation_for_summary(None)
        }

    return {
        "id": summary.id,
        "student_id": summary.student_id,
        "average_flow_score": summary.average_flow_score,
        "best_time_start": summary.best_time_start,
        "best_time_end": summary.best_time_end,
        "strongest_subject": summary.strongest_subject,
        "weakest_subject": summary.weakest_subject,
        "updated_at": summary.updated_at,
        "message": flow_message(summary.average_flow_score),
        "best_time": best_time_label(summary.best_time_start, summary.best_time_end),
        "recommendation": recommendation_for_summary(summary)
    }


def get_flow_history(
    db: Session,
    student: Student
) -> list[FlowSession]:
    return (
        db.query(FlowSession)
        .filter(FlowSession.student_id == student.id)
        .order_by(FlowSession.started_at.desc())
        .limit(50)
        .all()
    )


def build_today_flow(
    db: Session,
    student: Student
) -> dict:
    today = datetime.utcnow().date()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)

    sessions = (
        db.query(FlowSession)
        .filter(FlowSession.student_id == student.id)
        .filter(FlowSession.started_at >= start)
        .filter(FlowSession.started_at < end)
        .order_by(FlowSession.started_at.asc())
        .all()
    )

    completed_sessions = [
        session
        for session in sessions
        if session.ended_at is not None
    ]

    average_score = 0
    if completed_sessions:
        average_score = round(
            sum(session.flow_score for session in completed_sessions) / len(completed_sessions),
            2
        )

    total_duration = round(
        sum(session.duration_minutes for session in sessions),
        2
    )

    summary = build_flow_summary_response(db, student)

    return {
        "date": today.isoformat(),
        "sessions": sessions,
        "average_flow_score": average_score,
        "total_duration_minutes": total_duration,
        "message": flow_message(average_score),
        "best_time": summary["best_time"],
        "recommendation": summary["recommendation"]
    }


def build_flow_admin_overview(db: Session) -> dict:
    sessions = db.query(FlowSession).all()
    completed_sessions = [
        session
        for session in sessions
        if session.ended_at is not None
    ]
    active_sessions = len(sessions) - len(completed_sessions)

    if not completed_sessions:
        return {
            "total_sessions": len(sessions),
            "active_sessions": active_sessions,
            "average_flow_score": 0,
            "average_duration_minutes": 0,
            "strongest_subjects": [],
            "best_time_distribution": [],
            "engagement_trends": [],
            "low_flow_students": [],
            "recommendation": "No completed flow sessions yet."
        }

    subject_scores = defaultdict(list)
    hour_counts = Counter()
    date_scores = defaultdict(list)
    student_scores = defaultdict(list)

    for session in completed_sessions:
        if session.subject:
            subject_scores[session.subject].append(session.flow_score)
        hour_counts[session.started_at.hour] += 1
        date_scores[session.started_at.date().isoformat()].append(session.flow_score)
        student_scores[session.student_id].append(session.flow_score)

    student_lookup = {
        student.id: student
        for student in db.query(Student).filter(Student.id.in_(student_scores.keys())).all()
    }

    low_flow_students = []
    for student_id, scores in student_scores.items():
        average_score = sum(scores) / len(scores)
        if average_score < 45:
            student = student_lookup.get(student_id)
            low_flow_students.append({
                "student_id": student_id,
                "student": student.full_name if student else f"Student {student_id}",
                "email": student.email if student else "",
                "average_flow_score": round(average_score, 2)
            })

    return {
        "total_sessions": len(sessions),
        "active_sessions": active_sessions,
        "average_flow_score": round(
            sum(session.flow_score for session in completed_sessions) / len(completed_sessions),
            2
        ),
        "average_duration_minutes": round(
            sum(session.duration_minutes for session in completed_sessions) / len(completed_sessions),
            2
        ),
        "strongest_subjects": [
            {
                "subject": subject,
                "average_flow_score": round(sum(scores) / len(scores), 2)
            }
            for subject, scores in subject_scores.items()
        ],
        "best_time_distribution": [
            {
                "hour": f"{hour:02d}:00",
                "sessions": count
            }
            for hour, count in hour_counts.most_common()
        ],
        "engagement_trends": [
            {
                "date": date,
                "average_flow_score": round(sum(scores) / len(scores), 2)
            }
            for date, scores in sorted(date_scores.items())
        ],
        "low_flow_students": sorted(
            low_flow_students,
            key=lambda item: item["average_flow_score"]
        )[:10],
        "recommendation": "Use high-flow time windows for difficult topics and intervention planning."
    }

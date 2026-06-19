from collections import Counter, defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from backend.database.connection import SessionLocal

from backend.models.learning_event import LearningEvent

from backend.models.student import Student
from backend.models.education import SubjectQuizResult, WeakTopic
from backend.models.creativity_model import CreativityAssessment
from backend.models.flow_model import FlowSession, FlowSummary
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import QuizAttempt
from backend.models.recommendation_history import RecommendationHistory
from backend.models.intervention_plan import InterventionPlan
from backend.models.feedback_message import FeedbackMessage
from backend.models.learning_dna_model import LearningDNAProfile
from backend.services.ml_service import predict_current_student_risk
from backend.services.cognitive_risk_service import predict_current_student_cognitive_risk

from backend.routes.student_routes import (
    get_current_student
)
from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.routes.teacher_routes import teacher_class_summary, teacher_student_progress

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


def score_average(values):
    clean_values = [
        float(value)
        for value in values
        if value is not None
    ]

    if not clean_values:
        return 0

    return round(sum(clean_values) / len(clean_values), 2)


def event_breakdown(db: Session, student_id: int | None = None):
    query = db.query(LearningEvent)

    if student_id is not None:
        query = query.filter(LearningEvent.student_id == student_id)

    counts = Counter(event.event_type for event in query.all())

    return [
        {
            "event_type": event_type,
            "count": count
        }
        for event_type, count in counts.most_common()
    ]


def daily_event_trend(db: Session, student_id: int | None = None, days: int = 14):
    start_date = datetime.utcnow().date() - timedelta(days=days - 1)
    query = db.query(LearningEvent)

    if student_id is not None:
        query = query.filter(LearningEvent.student_id == student_id)

    events = query.filter(LearningEvent.timestamp >= datetime.combine(start_date, datetime.min.time())).all()
    counts = Counter(event.timestamp.date().isoformat() for event in events if event.timestamp)

    return [
        {
            "date": (start_date + timedelta(days=index)).isoformat(),
            "events": counts.get((start_date + timedelta(days=index)).isoformat(), 0)
        }
        for index in range(days)
    ]


def quiz_performance_for_student(db: Session, student_id: int):
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student_id)
        .order_by(QuizAttempt.attempted_at.asc())
        .all()
    )

    subject_results = (
        db.query(SubjectQuizResult)
        .filter(SubjectQuizResult.student_id == student_id)
        .order_by(SubjectQuizResult.taken_at.asc())
        .all()
    )

    scores = [attempt.score for attempt in attempts] + [result.score for result in subject_results]

    return {
        "attempts": len(scores),
        "average_score": score_average(scores),
        "latest_score": scores[-1] if scores else 0,
        "trend": [
            {
                "label": f"Quiz {index + 1}",
                "score": score
            }
            for index, score in enumerate(scores[-10:])
        ],
        "by_topic": [
            {
                "subject": result.subject,
                "topic": result.topic,
                "score": result.score,
                "taken_at": result.taken_at
            }
            for result in subject_results[-10:]
        ]
    }


def quiz_performance_for_students(db: Session, students: list[Student]):
    student_ids = [student.id for student in students]

    if not student_ids:
        return {
            "attempts": 0,
            "average_score": 0,
            "latest_score": 0,
            "trend": [],
            "by_topic": []
        }

    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id.in_(student_ids))
        .order_by(QuizAttempt.attempted_at.asc())
        .all()
    )
    subject_results = (
        db.query(SubjectQuizResult)
        .filter(SubjectQuizResult.student_id.in_(student_ids))
        .order_by(SubjectQuizResult.taken_at.asc())
        .all()
    )
    scores = [attempt.score for attempt in attempts] + [result.score for result in subject_results]
    topic_scores = defaultdict(list)

    for result in subject_results:
        topic_scores[f"{result.subject}: {result.topic}"].append(result.score)

    return {
        "attempts": len(scores),
        "average_score": score_average(scores),
        "latest_score": scores[-1] if scores else 0,
        "trend": [
            {
                "label": f"Quiz {index + 1}",
                "score": score
            }
            for index, score in enumerate(scores[-12:])
        ],
        "by_topic": [
            {
                "topic": topic,
                "average_score": score_average(scores)
            }
            for topic, scores in topic_scores.items()
        ][:10]
    }


def build_weak_topic_list(db: Session, student_id: int | None = None, limit: int = 8):
    query = db.query(WeakTopic)

    if student_id is not None:
        query = query.filter(WeakTopic.student_id == student_id)

    weak_topic_rows = (
        query
        .order_by(WeakTopic.detected_at.desc())
        .limit(limit)
        .all()
    )

    weak_topics = []
    seen = set()

    for item in weak_topic_rows:
        key = (item.subject, item.topic)
        seen.add(key)
        weak_topics.append({
            "topic": item.topic,
            "subject": item.subject,
            "score": None,
            "confidence_level": item.confidence_level,
            "source": "weak_topic_detection"
        })

    low_score_query = db.query(SubjectQuizResult).filter(SubjectQuizResult.score < 60)

    if student_id is not None:
        low_score_query = low_score_query.filter(SubjectQuizResult.student_id == student_id)

    low_scores = (
        low_score_query
        .order_by(SubjectQuizResult.taken_at.desc())
        .limit(limit * 2)
        .all()
    )

    for result in low_scores:
        key = (result.subject, result.topic)
        if key in seen:
            continue

        weak_topics.append({
            "topic": result.topic,
            "subject": result.subject,
            "score": result.score,
            "confidence_level": round((100 - result.score) / 100, 2),
            "source": "low_quiz_score"
        })
        seen.add(key)

        if len(weak_topics) >= limit:
            break

    return weak_topics


def engagement_summary(db: Session, student_id: int | None = None):
    query = db.query(LearningEvent)

    if student_id is not None:
        query = query.filter(LearningEvent.student_id == student_id)

    total_events = query.count()
    last_event = query.order_by(LearningEvent.timestamp.desc()).first()
    active_days = {
        event.timestamp.date()
        for event in query.all()
        if event.timestamp
    }

    return {
        "total_events": total_events,
        "engagement_score": min(total_events * 10, 100) if student_id else min(total_events * 3, 100),
        "active_days": len(active_days),
        "last_activity_at": last_event.timestamp if last_event else None,
        "event_breakdown": event_breakdown(db, student_id),
        "trend": daily_event_trend(db, student_id)
    }


def student_summary_payload(db: Session, student: Student):
    total_lessons = db.query(Lesson).count()
    completed_lessons = (
        db.query(LessonProgress)
        .filter(LessonProgress.student_id == student.id)
        .count()
    )
    lesson_progress = round((completed_lessons / total_lessons) * 100, 2) if total_lessons else 0
    quiz_performance = quiz_performance_for_student(db, student.id)
    engagement = engagement_summary(db, student.id)
    weak_topics = build_weak_topic_list(db, student.id, limit=5)
    creativity = (
        db.query(CreativityAssessment)
        .filter(CreativityAssessment.student_id == student.id)
        .order_by(CreativityAssessment.created_at.desc())
        .first()
    )
    flow = (
        db.query(FlowSummary)
        .filter(FlowSummary.student_id == student.id)
        .first()
    )
    learning_dna = (
        db.query(LearningDNAProfile)
        .filter(LearningDNAProfile.student_id == student.id)
        .first()
    )

    try:
        risk = predict_current_student_risk(db, student)
    except Exception:
        risk = {
            "risk_level": "Unavailable",
            "confidence_score": None,
            "engagement_score": engagement["engagement_score"],
            "recommendations": []
        }

    try:
        cognitive_risk = predict_current_student_cognitive_risk(db, student)
    except Exception:
        cognitive_risk = None

    ai_recommendations = build_ai_recommendations(db, student, risk, weak_topics, quiz_performance, flow)

    return {
        "student": {
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "role": student.role
        },
        "total_events": engagement["total_events"],
        "xp_points": engagement["total_events"] * 10,
        "progress": {
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "progress_percentage": lesson_progress
        },
        "engagement": engagement,
        "quiz_performance": quiz_performance,
        "weak_topics": weak_topics,
        "risk_summary": {
            "risk_level": risk.get("risk_level", "Unknown"),
            "confidence": risk.get("confidence_score"),
            "engagement_score": risk.get("engagement_score", engagement["engagement_score"])
        },
        "creativity_score": creativity.creativity_score if creativity else 0,
        "flow_score": flow.average_flow_score if flow else 0,
        "learning_dna": {
            "learner_type": learning_dna.learner_type if learning_dna else "Not assessed",
            "confidence_score": learning_dna.confidence_score if learning_dna else 0
        },
        "cognitive_risk": cognitive_risk,
        "ai_recommendations": ai_recommendations
    }


def build_ai_recommendations(
    db: Session,
    student: Student,
    risk: dict,
    weak_topics: list[dict],
    quiz_performance: dict,
    flow: FlowSummary | None
):
    stored = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.student_id == student.id)
        .order_by(RecommendationHistory.created_at.desc())
        .limit(3)
        .all()
    )
    recommendations = [
        item.recommendation
        for item in stored
    ]

    if weak_topics:
        topic = weak_topics[0]
        recommendations.append(
            f"Revise {topic['subject']}: {topic['topic']} with a short quiz and worked examples."
        )

    if quiz_performance["attempts"] == 0:
        recommendations.append("Complete one diagnostic quiz to unlock stronger performance insights.")
    elif quiz_performance["average_score"] < 65:
        recommendations.append("Review incorrect quiz answers before attempting a new topic.")

    if risk.get("risk_level") in ["High", "Medium"]:
        recommendations.append("Book a focused support session and reduce your next task to one clear goal.")

    if flow and flow.average_flow_score >= 70 and flow.best_time_start:
        recommendations.append(f"Schedule your hardest topic between {flow.best_time_start} and {flow.best_time_end}.")

    if not recommendations:
        recommendations.append("Keep your current rhythm and add one challenge question after each lesson.")

    return list(dict.fromkeys(recommendations))[:5]


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_student
    )
):

    return student_summary_payload(db, current_student)


@router.get("/student-summary")
def get_student_dashboard_summary(
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student)
):
    return student_summary_payload(db, current_student)


@router.get("/teacher-summary")
def get_teacher_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):
    progress = teacher_student_progress(db=db, current_user=current_user)
    summary = teacher_class_summary(db=db, current_user=current_user)
    student_ids = [item["id"] for item in progress]
    students = (
        db.query(Student)
        .filter(Student.id.in_(student_ids))
        .all()
        if student_ids
        else []
    )
    risk_counts = Counter(item["risk_level"] for item in progress)
    weak_topics = []

    if student_ids:
        weak_topics = build_weak_topic_list(db, None, limit=10)
        weak_topics = [
            item
            for item in weak_topics
            if (
                db.query(WeakTopic)
                .filter(WeakTopic.subject == item["subject"])
                .filter(WeakTopic.topic == item["topic"])
                .filter(WeakTopic.student_id.in_(student_ids))
                .first()
            )
            or (
                db.query(SubjectQuizResult)
                .filter(SubjectQuizResult.subject == item["subject"])
                .filter(SubjectQuizResult.topic == item["topic"])
                .filter(SubjectQuizResult.student_id.in_(student_ids))
                .filter(SubjectQuizResult.score < 60)
                .first()
            )
        ]

    interventions = (
        db.query(InterventionPlan)
        .filter(InterventionPlan.is_completed.is_(False))
        .count()
        if current_user.role == "admin"
        else db.query(InterventionPlan)
        .filter(InterventionPlan.teacher_id == current_user.id)
        .filter(InterventionPlan.is_completed.is_(False))
        .count()
    )
    pending_feedback = (
        db.query(FeedbackMessage)
        .filter(FeedbackMessage.is_read.is_(False))
        .count()
        if current_user.role == "admin"
        else db.query(FeedbackMessage)
        .filter(FeedbackMessage.teacher_id == current_user.id)
        .filter(FeedbackMessage.is_read.is_(False))
        .count()
    )

    ai_insights = []
    high_risk = [item for item in progress if item["risk_level"] == "High"]
    low_quiz = [item for item in progress if item["average_quiz_score"] and item["average_quiz_score"] < 65]

    if high_risk:
        ai_insights.append(f"{len(high_risk)} student(s) need high-priority support.")
    if low_quiz:
        ai_insights.append("Generate a short reteach quiz for learners below 65% average.")
    if weak_topics:
        ai_insights.append(f"Most recent weak topic: {weak_topics[0]['subject']} - {weak_topics[0]['topic']}.")
    if not ai_insights:
        ai_insights.append("Class signals are stable. Use challenge tasks to stretch confident learners.")

    return {
        **summary,
        "students": progress,
        "risk_distribution": [
            {"name": "High", "value": risk_counts.get("High", 0)},
            {"name": "Medium", "value": risk_counts.get("Medium", 0)},
            {"name": "Low", "value": risk_counts.get("Low", 0)}
        ],
        "quiz_performance": quiz_performance_for_students(db, students),
        "weak_topics": weak_topics[:6],
        "engagement": {
            "average_engagement": score_average([item["engagement_score"] for item in progress]),
            "trend": daily_event_trend(db, None),
            "event_breakdown": event_breakdown(db, None)
        },
        "pending_feedback": pending_feedback,
        "active_intervention_plans": interventions,
        "ai_insights": ai_insights
    }


@router.get("/admin-summary")
def get_admin_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):
    students = db.query(Student).filter(Student.role == "student").all()
    users = db.query(Student).all()
    student_payloads = [
        student_summary_payload(db, student)
        for student in students
    ]
    risk_counts = Counter(payload["risk_summary"]["risk_level"] for payload in student_payloads)
    quiz_performance = quiz_performance_for_students(db, students)
    engagement = engagement_summary(db, None)
    creativity_scores = [payload["creativity_score"] for payload in student_payloads]
    flow_scores = [payload["flow_score"] for payload in student_payloads]
    cognitive_high = [
        payload
        for payload in student_payloads
        if payload.get("cognitive_risk")
        and payload["cognitive_risk"].get("cognitive_risk_level") == "High"
    ]
    active_today = (
        db.query(LearningEvent.student_id)
        .filter(LearningEvent.timestamp >= datetime.utcnow() - timedelta(days=1))
        .distinct()
        .count()
    )

    ai_insights = [
        f"{risk_counts.get('High', 0)} high-risk learner(s) in current ML signals.",
        f"Average quiz performance is {quiz_performance['average_score']}%.",
        f"{len(cognitive_high)} learner(s) show high cognitive-risk signals."
    ]

    return {
        "total_students": len(students),
        "total_teachers": len([user for user in users if user.role == "teacher"]),
        "total_admins": len([user for user in users if user.role == "admin"]),
        "active_users_today": active_today,
        "new_registrations_this_week": 0,
        "high_risk": risk_counts.get("High", 0),
        "medium_risk": risk_counts.get("Medium", 0),
        "low_risk": risk_counts.get("Low", 0),
        "risk_distribution": [
            {"name": "High Risk", "value": risk_counts.get("High", 0)},
            {"name": "Medium Risk", "value": risk_counts.get("Medium", 0)},
            {"name": "Low Risk", "value": risk_counts.get("Low", 0)}
        ],
        "average_engagement": score_average([payload["engagement"]["engagement_score"] for payload in student_payloads]),
        "average_quiz_score": quiz_performance["average_score"],
        "average_lesson_progress": score_average([payload["progress"]["progress_percentage"] for payload in student_payloads]),
        "average_creativity_score": score_average(creativity_scores),
        "average_flow_score": score_average(flow_scores),
        "quiz_performance": quiz_performance,
        "engagement": engagement,
        "weak_topics": build_weak_topic_list(db, None, limit=8),
        "cognitive_high_risk_students": len(cognitive_high),
        "ai_insights": ai_insights,
        "prediction_source": "Live dashboard summary endpoints"
    }


@router.get("/quiz-performance")
def get_quiz_performance(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role == "student":
        return quiz_performance_for_student(db, current_user.id)

    students = db.query(Student).filter(Student.role == "student").all()
    return quiz_performance_for_students(db, students)


@router.get("/engagement-summary")
def get_engagement_summary(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    student_id = current_user.id if current_user.role == "student" else None
    return engagement_summary(db, student_id)


@router.get("/ai-recommendations")
def get_dashboard_ai_recommendations(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role == "student":
        payload = student_summary_payload(db, current_user)
        return {
            "recommendations": payload["ai_recommendations"]
        }

    if current_user.role == "teacher":
        summary = get_teacher_dashboard_summary(db, current_user)
        return {
            "recommendations": summary["ai_insights"]
        }

    summary = get_admin_dashboard_summary(db, current_user)
    return {
        "recommendations": summary["ai_insights"]
    }


@router.get("/streak")
def get_learning_streak(
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_student
    )
):
    events = db.query(LearningEvent).filter(
        LearningEvent.student_id == current_student.id
    ).all()

    event_dates = {
        event.timestamp.date()
        for event in events
        if event.timestamp
    }

    today = datetime.utcnow().date()
    studied_today = today in event_dates
    cursor = today if studied_today else today - timedelta(days=1)
    streak_days = 0

    while cursor in event_dates:
        streak_days += 1
        cursor -= timedelta(days=1)

    if streak_days == 0:
        message = "Start a short study session today to begin your streak."
    elif studied_today:
        message = "You studied today. Keep going!"
    else:
        message = "You have a recent streak. Study today to protect it."

    return {
        "streak_days": streak_days,
        "studied_today": studied_today,
        "message": message,
        "progress_percent": min(100, round((streak_days / 14) * 100, 2))
    }


@router.get("/weak-topics")
def get_dashboard_weak_topics(
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_student
    )
):
    return {
        "weak_topics": build_weak_topic_list(db, current_student.id, limit=5)
    }


@router.get("/risk-summary")
def get_dashboard_risk_summary(
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_student
    )
):
    try:
        prediction = predict_current_student_risk(
            db,
            current_student
        )
    except Exception:
        return {
            "available": False,
            "risk_level": "Unavailable",
            "confidence": None,
            "factors": [],
            "recommendation": "Risk prediction unavailable until the model is trained."
        }

    features = prediction.get("model_features", {})
    factors = []

    if features.get("average_quiz_score", 0) >= 70:
        factors.append("Strong quiz score")
    elif features.get("average_quiz_score", 0) > 0:
        factors.append("Low quiz score")

    if prediction.get("engagement_score", 0) >= 60:
        factors.append("Good engagement")
    else:
        factors.append("Low engagement")

    if features.get("lesson_progress", 0) >= 60:
        factors.append("High completion rate")
    else:
        factors.append("Low completion rate")

    recommendations = prediction.get("recommendations", [])

    return {
        "available": True,
        "risk_level": prediction.get("risk_level", "Unknown"),
        "confidence": prediction.get("confidence_score"),
        "factors": factors,
        "recommendation": recommendations[0] if recommendations else "Continue building consistent study habits.",
        "engagement_score": prediction.get("engagement_score", 0)
    }


@router.get("/student-engagement")
def get_student_engagement(
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_student
    )
):

    return engagement_summary(db, current_student.id)

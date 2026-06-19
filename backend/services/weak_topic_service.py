from collections import defaultdict

from sqlalchemy.orm import Session

from backend.models.education import SubjectQuizResult, WeakTopic
from backend.models.learning_event import LearningEvent
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.student import Student


LOW_SCORE_THRESHOLD = 60


def average(values: list[float]) -> float:
    if not values:
        return 0

    return round(sum(values) / len(values), 2)


def student_engagement_score(db: Session, student_id: int) -> float:
    total_events = (
        db.query(LearningEvent)
        .filter(LearningEvent.student_id == student_id)
        .count()
    )

    return min(total_events * 10, 100)


def student_lesson_completion(db: Session, student_id: int) -> float:
    total_lessons = db.query(Lesson).count()

    if total_lessons == 0:
        return 0

    completed_lessons = (
        db.query(LessonProgress)
        .filter(LessonProgress.student_id == student_id)
        .count()
    )

    return round((completed_lessons / total_lessons) * 100, 2)


def severity_from_signals(
    average_score: float,
    attempts: int,
    engagement_score: float,
    lesson_completion: float,
    weak_topic_confidence: float
) -> str:
    priority_score = 0

    if average_score < 45:
        priority_score += 3
    elif average_score < LOW_SCORE_THRESHOLD:
        priority_score += 2

    if attempts >= 3:
        priority_score += 2
    elif attempts >= 2:
        priority_score += 1

    if engagement_score < 40:
        priority_score += 2
    elif engagement_score < 65:
        priority_score += 1

    if lesson_completion < 40:
        priority_score += 2
    elif lesson_completion < 65:
        priority_score += 1

    if weak_topic_confidence >= 0.7:
        priority_score += 1

    if priority_score >= 6:
        return "High"
    if priority_score >= 3:
        return "Medium"
    return "Low"


def recommendation_for_topic(subject: str, topic: str, severity: str) -> str:
    if severity == "High":
        return f"Complete {topic} revision in {subject}, review mistakes, and take a practice quiz."
    if severity == "Medium":
        return f"Revise {topic} in {subject} with worked examples, then retry a short quiz."
    return f"Do a quick recap of {topic} in {subject} to strengthen confidence."


def detect_student_weak_topics(
    db: Session,
    student: Student
) -> list[dict]:
    low_results = (
        db.query(SubjectQuizResult)
        .filter(SubjectQuizResult.student_id == student.id)
        .filter(SubjectQuizResult.score < LOW_SCORE_THRESHOLD)
        .all()
    )
    stored_topics = (
        db.query(WeakTopic)
        .filter(WeakTopic.student_id == student.id)
        .all()
    )

    grouped_scores = defaultdict(list)
    latest_dates = {}

    for result in low_results:
        key = (result.subject, result.topic)
        grouped_scores[key].append(result.score)
        latest_dates[key] = max(
            latest_dates.get(key, result.taken_at),
            result.taken_at
        )

    confidence_by_topic = defaultdict(float)
    for weak_topic in stored_topics:
        key = (weak_topic.subject, weak_topic.topic)
        confidence_by_topic[key] = max(
            confidence_by_topic[key],
            weak_topic.confidence_level
        )
        latest_dates[key] = max(
            latest_dates.get(key, weak_topic.detected_at),
            weak_topic.detected_at
        )
        if key not in grouped_scores:
            grouped_scores[key] = []

    engagement_score = student_engagement_score(db, student.id)
    lesson_completion = student_lesson_completion(db, student.id)
    detected_topics = []

    for (subject, topic), scores in grouped_scores.items():
        avg_score = average(scores) if scores else round((1 - confidence_by_topic[(subject, topic)]) * 100, 2)
        attempts = len(scores)
        severity = severity_from_signals(
            avg_score,
            attempts,
            engagement_score,
            lesson_completion,
            confidence_by_topic[(subject, topic)]
        )

        detected_topics.append({
            "student_id": student.id,
            "student": student.full_name,
            "subject": subject,
            "topic": topic,
            "average_score": avg_score,
            "attempts": attempts,
            "severity": severity,
            "recommendation": recommendation_for_topic(subject, topic, severity),
            "last_detected_at": latest_dates.get((subject, topic))
        })

    severity_rank = {
        "High": 0,
        "Medium": 1,
        "Low": 2
    }

    return sorted(
        detected_topics,
        key=lambda item: (
            severity_rank.get(item["severity"], 3),
            item["average_score"],
            -item["attempts"]
        )
    )


def detect_topics_for_students(
    db: Session,
    students: list[Student]
) -> list[dict]:
    all_topics = []

    for student in students:
        all_topics.extend(detect_student_weak_topics(db, student))

    return all_topics


def build_group_weak_topic_summary(
    db: Session,
    students: list[Student]
) -> dict:
    detected = detect_topics_for_students(db, students)
    grouped = defaultdict(list)

    for item in detected:
        grouped[(item["subject"], item["topic"])].append(item)

    severity_rank = {
        "High": 0,
        "Medium": 1,
        "Low": 2
    }
    topics = []

    for (subject, topic), items in grouped.items():
        scores = [item["average_score"] for item in items]
        attempts = sum(item["attempts"] for item in items)
        highest_severity = sorted(
            [item["severity"] for item in items],
            key=lambda value: severity_rank.get(value, 3)
        )[0]

        student_summaries = [
            {
                "student_id": item["student_id"],
                "student": item["student"],
                "weak_topics": [item]
            }
            for item in sorted(
                items,
                key=lambda value: (
                    severity_rank.get(value["severity"], 3),
                    value["average_score"]
                )
            )
        ]

        topics.append({
            "subject": subject,
            "topic": topic,
            "average_score": average(scores),
            "attempts": attempts,
            "severity": highest_severity,
            "recommendation": recommendation_for_topic(subject, topic, highest_severity),
            "struggling_students": student_summaries
        })

    topics = sorted(
        topics,
        key=lambda item: (
            severity_rank.get(item["severity"], 3),
            item["average_score"],
            -len(item["struggling_students"])
        )
    )

    return {
        "total_topics": len(topics),
        "high_severity_topics": len([
            item for item in topics
            if item["severity"] == "High"
        ]),
        "topics": topics
    }


def all_student_users(db: Session) -> list[Student]:
    return (
        db.query(Student)
        .filter(Student.role == "student")
        .all()
    )

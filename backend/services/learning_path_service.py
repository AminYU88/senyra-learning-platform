from collections import Counter

from sqlalchemy.orm import Session

from backend.models.creativity_model import CreativityAssessment
from backend.models.flow_model import FlowSummary
from backend.models.learning_dna_model import LearningDNAProfile
from backend.models.learning_event import LearningEvent
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import QuizAttempt
from backend.models.student import Student
from backend.services.cognitive_risk_service import predict_current_student_cognitive_risk
from backend.services.ml_service import predict_current_student_risk
from backend.services.weak_topic_service import detect_student_weak_topics


LEVELS = [
    "KS3",
    "GCSE Foundation",
    "GCSE Higher",
    "A-Level",
    "Advanced / Adult Learner"
]

SUBJECTS = [
    "Mathematics",
    "English Language",
    "English Literature",
    "Computer Science",
    "Cyber Security"
]

DEFAULT_TOPICS = {
    "Mathematics": ["Algebra", "Probability", "Trigonometry", "Graphs", "Problem Solving"],
    "English Language": ["Inference", "Creative Writing", "Language Analysis", "Transactional Writing"],
    "English Literature": ["Poetry Comparison", "Shakespeare", "Modern Texts", "Essay Structure"],
    "Computer Science": ["Python Functions", "Algorithms", "SQL Queries", "Data Representation"],
    "Cyber Security": ["Network Security", "Encryption", "Threats", "Secure Systems"]
}


def average(values: list[float]) -> float:
    values = [float(value) for value in values if value is not None]

    if not values:
        return 0

    return round(sum(values) / len(values), 2)


def student_signals(db: Session, student: Student) -> dict:
    events = (
        db.query(LearningEvent)
        .filter(LearningEvent.student_id == student.id)
        .all()
    )
    quiz_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student.id)
        .all()
    )
    total_lessons = db.query(Lesson).count()
    completed_lessons = (
        db.query(LessonProgress)
        .filter(LessonProgress.student_id == student.id)
        .count()
    )
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

    lesson_progress = round((completed_lessons / total_lessons) * 100, 2) if total_lessons else 0
    average_quiz_score = average([attempt.score for attempt in quiz_attempts])
    engagement_score = min(100, len(events) * 8 + len(quiz_attempts) * 5)
    topic_strengths = detect_student_weak_topics(db, student)
    support_topics = [
        topic for topic in topic_strengths
        if topic.get("status") in ["Weak", "Medium"]
    ]

    try:
        risk = predict_current_student_risk(db, student)
        risk_level = risk.get("risk_level", "Unknown")
    except Exception:
        risk_level = "Unknown"

    try:
        cognitive_risk = predict_current_student_cognitive_risk(db, student)
        cognitive_risk_level = cognitive_risk.get("cognitive_risk_level", "Unknown")
    except Exception:
        cognitive_risk_level = "Unknown"

    return {
        "average_quiz_score": average_quiz_score,
        "quiz_attempts": len(quiz_attempts),
        "engagement_score": engagement_score,
        "lesson_progress": lesson_progress,
        "weak_topics": support_topics,
        "topic_strength_count": len(topic_strengths),
        "risk_level": risk_level,
        "cognitive_risk_level": cognitive_risk_level,
        "flow_score": flow.average_flow_score if flow else 0,
        "creativity_score": creativity.creativity_score if creativity else 0,
        "learner_type": learning_dna.learner_type if learning_dna else "Not assessed",
        "learning_dna_confidence": learning_dna.confidence_score if learning_dna else 0,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons
    }


def choose_level(signals: dict) -> str:
    score = (
        signals["average_quiz_score"] * 0.35
        + signals["lesson_progress"] * 0.2
        + signals["engagement_score"] * 0.15
        + signals["flow_score"] * 0.1
        + signals["creativity_score"] * 0.1
        + signals["learning_dna_confidence"] * 0.1
    )

    if signals["risk_level"] == "High" or signals["cognitive_risk_level"] == "High":
        score -= 15
    elif signals["risk_level"] == "Medium" or signals["cognitive_risk_level"] == "Medium":
        score -= 7

    if len(signals["weak_topics"]) >= 3:
        score -= 8

    if score < 40:
        return "KS3"
    if score < 58:
        return "GCSE Foundation"
    if score < 74:
        return "GCSE Higher"
    if score < 88:
        return "A-Level"
    return "Advanced / Adult Learner"


def current_level_from_signals(signals: dict) -> str:
    score = (
        signals["average_quiz_score"] * 0.45
        + signals["lesson_progress"] * 0.25
        + signals["engagement_score"] * 0.2
        + signals["flow_score"] * 0.1
    )

    if score < 38:
        return "Beginner"
    if score < 70:
        return "Intermediate"
    return "Advanced"


def progress_status(progress_percent: float, signals: dict) -> str:
    if signals["risk_level"] == "High" or signals["cognitive_risk_level"] == "High":
        return "Needs Support"
    if progress_percent >= 75 and signals["average_quiz_score"] >= 75:
        return "On Track"
    if progress_percent >= 40:
        return "Building Momentum"
    return "Getting Started"


def difficulty_for_level(level: str, signals: dict) -> str:
    if level in ["KS3", "GCSE Foundation"] or signals["risk_level"] == "High":
        return "Easy"
    if level in ["GCSE Higher", "A-Level"]:
        return "Medium"
    return "Hard"


def topic_status(topic: str, subject: str, signals: dict) -> str:
    for weak_topic in signals["weak_topics"]:
        if weak_topic["subject"] == subject and weak_topic["topic"] == topic:
            return weak_topic.get("status", "Weak")

    if signals["average_quiz_score"] >= 80:
        return "Stretch"
    if signals["average_quiz_score"] >= 60:
        return "Practice"
    return "Revision"


def choose_subjects(signals: dict, preferred_subject: str | None = None) -> list[str]:
    if preferred_subject in SUBJECTS:
        primary = preferred_subject
    elif signals["weak_topics"]:
        primary = signals["weak_topics"][0]["subject"]
    elif signals["learner_type"] == "Analytical Learner":
        primary = "Mathematics"
    elif signals["learner_type"] == "Creative Learner":
        primary = "English Literature"
    elif signals["learner_type"] == "Problem Solver":
        primary = "Computer Science"
    else:
        primary = "Mathematics"

    subjects = [primary]

    if "Computer Science" not in subjects and signals["flow_score"] >= 70:
        subjects.append("Computer Science")

    if "English Language" not in subjects and signals["average_quiz_score"] < 65:
        subjects.append("English Language")

    for subject in SUBJECTS:
        if len(subjects) >= 3:
            break
        if subject not in subjects:
            subjects.append(subject)

    return subjects[:3]


def topic_sequence(subject: str, signals: dict) -> list[str]:
    weak_topic_names = [
        item["topic"]
        for item in signals["weak_topics"]
        if item["subject"] == subject
    ]
    defaults = DEFAULT_TOPICS.get(subject, DEFAULT_TOPICS["Mathematics"])
    sequence = []

    for topic in weak_topic_names + defaults:
        if topic not in sequence:
            sequence.append(topic)

    return sequence[:5]


def reason_for_path(level: str, subject: str, signals: dict) -> str:
    if signals["weak_topics"]:
        weak = signals["weak_topics"][0]
        return (
            f"{level} is recommended because your strongest next improvement area is "
            f"{weak['subject']} - {weak['topic']} with an average score of {round(weak['average_score'])}%."
        )

    if signals["risk_level"] in ["High", "Medium"]:
        return f"{level} is recommended to rebuild confidence while risk signals are {signals['risk_level'].lower()}."

    if signals["flow_score"] >= 75:
        return f"{level} is recommended because your flow score suggests readiness for focused {subject} study."

    return f"{level} is recommended from your quiz performance, engagement and lesson progress."


def topic_reason(topic: str, subject: str, signals: dict) -> str:
    for weak_topic in signals["weak_topics"]:
        if weak_topic["subject"] == subject and weak_topic["topic"] == topic:
            return (
                f"Prioritised because {topic} is currently {weak_topic.get('status', 'Weak').lower()} "
                f"with an average score of {round(weak_topic['average_score'])}%."
            )

    if signals["learner_type"] != "Not assessed":
        return f"Selected to match the {signals['learner_type'].lower()} profile and current performance."

    return "Selected as the next logical topic from quiz, engagement and progress signals."


def topic_activity(status: str, topic: str) -> str:
    if status == "Weak":
        return f"Revise {topic}, review mistakes, then complete a short quiz."
    if status == "Medium":
        return f"Practise {topic} with mixed questions to reach strong."
    if status == "Strong":
        return f"Use {topic} as a confidence-builder and try a stretch task."
    if status == "Stretch":
        return f"Attempt a harder {topic} challenge."
    return f"Complete guided practice for {topic}."


def build_next_topic_cards(subject: str, topics: list[str], difficulty: str, signals: dict) -> list[dict]:
    cards = []

    for topic in topics:
        status = topic_status(topic, subject, signals)
        cards.append({
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "status": status,
            "reason": topic_reason(topic, subject, signals),
            "recommended_activity": topic_activity(status, topic)
        })

    return cards


def build_tasks(subject: str, topics: list[str], difficulty: str, signals: dict) -> tuple[list[str], list[str]]:
    next_topic = topics[0] if topics else subject
    daily_tasks = [
        f"Revise {next_topic} for 20 minutes.",
        f"Complete five {difficulty.lower()} practice questions.",
        "Write a short mistake log and one confidence note."
    ]

    if signals["learner_type"] == "Visual Learner":
        daily_tasks[0] = f"Create a visual summary for {next_topic}."
    elif signals["learner_type"] == "Analytical Learner":
        daily_tasks[1] = f"Solve a structured worked-example set for {next_topic}."
    elif signals["learner_type"] == "Creative Learner":
        daily_tasks[2] = f"Explain {next_topic} using an analogy or mini-story."

    weekly_plan = [
        f"Day 1: Revise {topics[0] if len(topics) > 0 else subject}.",
        f"Day 2: Take a short {subject} quiz.",
        f"Day 3: Review mistakes and redo weak questions.",
        f"Day 4: Study {topics[1] if len(topics) > 1 else next_topic}.",
        f"Day 5: Complete mixed practice and update your progress."
    ]

    return daily_tasks, weekly_plan


def build_learning_steps(subject: str, topics: list[str], weekly_plan: list[str]) -> list[dict]:
    return [
        {
            "step": index + 1,
            "title": task,
            "description": f"Focus area: {topics[index % len(topics)] if topics else subject}.",
            "subject": subject,
            "topic": topics[index % len(topics)] if topics else subject,
            "task_type": "revision" if index in [0, 2] else "practice",
            "estimated_minutes": 30 if index < 3 else 45
        }
        for index, task in enumerate(weekly_plan)
    ]


def build_adaptive_learning_path(
    db: Session,
    student: Student,
    preferred_subject: str | None = None
) -> dict:
    signals = student_signals(db, student)
    current_level = current_level_from_signals(signals)
    level = choose_level(signals)
    subjects = choose_subjects(signals, preferred_subject)
    subject = subjects[0]
    topics = topic_sequence(subject, signals)
    difficulty = difficulty_for_level(level, signals)
    daily_tasks, weekly_plan = build_tasks(subject, topics, difficulty, signals)
    learning_path = build_learning_steps(subject, topics, weekly_plan)
    progress_percent = min(100, round((signals["lesson_progress"] + min(signals["quiz_attempts"] * 12, 60)) / 2, 2))
    next_topic_cards = build_next_topic_cards(subject, topics, difficulty, signals)

    return {
        "student_id": student.id,
        "student": student.full_name,
        "level": level,
        "current_level": current_level,
        "recommended_level": level,
        "subject": subject,
        "recommended_subjects": subjects,
        "next_topics": topics,
        "next_topic_cards": next_topic_cards,
        "difficulty": difficulty,
        "reason": reason_for_path(level, subject, signals),
        "daily_tasks": daily_tasks,
        "weekly_plan": weekly_plan,
        "estimated_completion_time": "1-2 weeks" if difficulty != "Hard" else "2-3 weeks",
        "progress_percent": progress_percent,
        "progress_status": progress_status(progress_percent, signals),
        "signals": {
            key: value
            for key, value in signals.items()
            if key != "weak_topics"
        } | {
            "weak_topic_count": len(signals["weak_topics"])
        },
        "learning_path": learning_path
    }


def build_learning_path_summary_for_students(db: Session, students: list[Student]) -> dict:
    paths = [
        build_adaptive_learning_path(db, student)
        for student in students
    ]
    level_counts = Counter(path["level"] for path in paths)

    easier = [
        path
        for path in paths
        if path["signals"]["risk_level"] == "High"
        or path["signals"]["cognitive_risk_level"] == "High"
    ]
    harder = [
        path
        for path in paths
        if path["signals"]["average_quiz_score"] >= 80
        and path["signals"]["flow_score"] >= 70
        and path["signals"]["risk_level"] == "Low"
    ]

    return {
        "total_students": len(students),
        "level_distribution": [
            {
                "level": level,
                "count": level_counts.get(level, 0)
            }
            for level in LEVELS
        ],
        "students_needing_easier_path": [
            {
                "student_id": path["student_id"],
                "student": path["student"],
                "level": path["level"],
                "reason": path["reason"]
            }
            for path in easier
        ],
        "students_ready_for_harder_path": [
            {
                "student_id": path["student_id"],
                "student": path["student"],
                "level": path["level"],
                "reason": path["reason"]
            }
            for path in harder
        ],
        "paths": paths
    }


def build_admin_learning_path_summary(db: Session) -> dict:
    students = db.query(Student).filter(Student.role == "student").all()
    return build_learning_path_summary_for_students(db, students)

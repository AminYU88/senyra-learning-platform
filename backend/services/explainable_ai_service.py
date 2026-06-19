from collections import Counter

from sqlalchemy.orm import Session

from backend.models.recommendation_history import RecommendationHistory
from backend.models.student import Student
from backend.services.cognitive_risk_service import predict_current_student_cognitive_risk
from backend.services.learning_path_service import build_adaptive_learning_path, student_signals
from backend.services.ml_service import predict_current_student_risk
from backend.services.weak_topic_service import detect_student_weak_topics


def percent(value: float | int | None) -> str:
    if value is None:
        return "Not available"

    return f"{round(float(value), 2)}%"


def factor(
    name: str,
    impact: str,
    value: str
) -> dict:
    return {
        "factor": name,
        "impact": impact,
        "value": value
    }


def split_factors(factors: list[dict]) -> tuple[list[dict], list[dict]]:
    positive = [item for item in factors if item["impact"] == "positive"]
    negative = [item for item in factors if item["impact"] == "negative"]
    return positive, negative


def confidence_ratio(value: float | None) -> float | None:
    if value is None:
        return None

    value = float(value)
    return round(value / 100, 2) if value > 1 else round(value, 2)


def risk_explanation(db: Session, student: Student) -> dict:
    signals = student_signals(db, student)

    try:
        prediction = predict_current_student_risk(db, student)
        result = f"{prediction.get('risk_level', 'Unknown')} Risk"
        confidence = confidence_ratio(prediction.get("confidence_score"))
    except Exception:
        prediction = {}
        result = "Unavailable"
        confidence = None

    factors = [
        factor(
            "Quiz average",
            "positive" if signals["average_quiz_score"] >= 70 else "negative",
            percent(signals["average_quiz_score"])
        ),
        factor(
            "Engagement",
            "positive" if signals["engagement_score"] >= 60 else "negative",
            percent(signals["engagement_score"])
        ),
        factor(
            "Lesson completion",
            "positive" if signals["lesson_progress"] >= 60 else "negative",
            percent(signals["lesson_progress"])
        ),
        factor(
            "Weak topic count",
            "negative" if len(signals["weak_topics"]) >= 2 else "positive",
            str(len(signals["weak_topics"]))
        )
    ]
    positive, negative = split_factors(factors)

    if negative:
        main_reason = ", ".join(item["factor"].lower() for item in negative[:2])
        explanation = f"The student is {result.lower()} mainly because of {main_reason}."
    else:
        explanation = "The risk signal is low because quiz, engagement and progress signals are stable."

    if positive:
        explanation += f" Positive support signals include {', '.join(item['factor'].lower() for item in positive[:2])}."

    action = "Focus on weak topics and complete two revision quizzes."
    if result.startswith("High"):
        action = "Create a teacher-supported intervention plan and review progress weekly."
    elif result.startswith("Low"):
        action = "Maintain current habits and add a stretch task."

    return {
        "prediction_type": "Student Risk",
        "result": result,
        "confidence": confidence,
        "top_factors": factors,
        "positive_factors": positive,
        "negative_factors": negative,
        "explanation": explanation,
        "suggested_action": action
    }


def cognitive_risk_explanation(db: Session, student: Student) -> dict:
    try:
        prediction = predict_current_student_cognitive_risk(db, student)
    except Exception:
        prediction = {
            "cognitive_risk_level": "Unavailable",
            "confidence_score": None,
            "key_risk_factors": [],
            "protective_factors": [],
            "recommendation": "Collect more learning evidence before using cognitive risk."
        }

    negative = [
        factor(item.split(":")[0], "negative", item.split(":")[-1].strip() if ":" in item else "Detected")
        for item in prediction.get("key_risk_factors", [])
    ]
    positive = [
        factor(item.split(":")[0], "positive", item.split(":")[-1].strip() if ":" in item else "Detected")
        for item in prediction.get("protective_factors", [])
    ]
    factors = negative[:3] + positive[:3]
    result = f"{prediction.get('cognitive_risk_level', 'Unknown')} Cognitive Risk"

    explanation = (
        f"The cognitive risk result is {result.lower()}."
        if not negative
        else f"The cognitive risk result is {result.lower()} because {negative[0]['factor'].lower()} is a concern."
    )
    if positive:
        explanation += f" A protective signal is {positive[0]['factor'].lower()}."

    return {
        "prediction_type": "Cognitive Risk",
        "result": result,
        "confidence": confidence_ratio(prediction.get("confidence_score")),
        "top_factors": factors,
        "positive_factors": positive,
        "negative_factors": negative,
        "explanation": explanation,
        "suggested_action": prediction.get("recommendation", "Review cognitive risk alongside teacher judgement.")
    }


def engagement_explanation(db: Session, student: Student) -> dict:
    signals = student_signals(db, student)
    engagement = signals["engagement_score"]
    result = "High Engagement" if engagement >= 75 else "Medium Engagement" if engagement >= 50 else "Low Engagement"
    factors = [
        factor("Learning events", "positive" if engagement >= 50 else "negative", percent(engagement)),
        factor("Quiz attempts", "positive" if signals["quiz_attempts"] >= 3 else "negative", str(signals["quiz_attempts"])),
        factor("Lesson progress", "positive" if signals["lesson_progress"] >= 60 else "negative", percent(signals["lesson_progress"]))
    ]
    positive, negative = split_factors(factors)

    return {
        "prediction_type": "Engagement",
        "result": result,
        "confidence": confidence_ratio(engagement),
        "top_factors": factors,
        "positive_factors": positive,
        "negative_factors": negative,
        "explanation": f"Engagement is {result.lower()} based on activity volume, quiz attempts and lesson progress.",
        "suggested_action": "Use short daily tasks to keep engagement consistent." if engagement < 75 else "Maintain the current learning routine."
    }


def weak_topic_explanation(db: Session, student: Student) -> dict:
    weak_topics = detect_student_weak_topics(db, student)

    if not weak_topics:
        return {
            "prediction_type": "Weak Topic Detection",
            "result": "No weak topics detected",
            "confidence": None,
            "top_factors": [],
            "positive_factors": [],
            "negative_factors": [],
            "explanation": "No weak topics were detected because there are no repeated low topic scores or stored weak-topic signals.",
            "suggested_action": "Complete topic quizzes so Senyra can detect support areas."
        }

    strongest_signal = weak_topics[0]
    factors = [
        factor("Average topic score", "negative", percent(strongest_signal["average_score"])),
        factor("Low-score attempts", "negative" if strongest_signal["attempts"] >= 2 else "positive", str(strongest_signal["attempts"])),
        factor("Severity", "negative" if strongest_signal["severity"] == "High" else "positive", strongest_signal["severity"])
    ]
    positive, negative = split_factors(factors)

    return {
        "prediction_type": "Weak Topic Detection",
        "result": f"{strongest_signal['subject']} - {strongest_signal['topic']}",
        "confidence": None,
        "top_factors": factors,
        "positive_factors": positive,
        "negative_factors": negative,
        "explanation": (
            f"{strongest_signal['topic']} was detected because the average score is "
            f"{round(strongest_signal['average_score'])}% across {strongest_signal['attempts']} low-score attempt(s)."
        ),
        "suggested_action": strongest_signal["recommendation"]
    }


def learning_path_explanation(db: Session, student: Student) -> dict:
    path = build_adaptive_learning_path(db, student)
    signals = path["signals"]
    factors = [
        factor("Recommended level", "positive", path["level"]),
        factor("Quiz average", "positive" if signals["average_quiz_score"] >= 70 else "negative", percent(signals["average_quiz_score"])),
        factor("Flow score", "positive" if signals["flow_score"] >= 60 else "negative", percent(signals["flow_score"])),
        factor("Learning DNA", "positive" if signals["learner_type"] != "Not assessed" else "negative", signals["learner_type"])
    ]
    positive, negative = split_factors(factors)

    return {
        "prediction_type": "Adaptive Learning Path",
        "result": f"{path['level']} - {path['subject']}",
        "confidence": None,
        "top_factors": factors,
        "positive_factors": positive,
        "negative_factors": negative,
        "explanation": path["reason"],
        "suggested_action": path["weekly_plan"][0] if path["weekly_plan"] else "Follow the recommended weekly plan."
    }


def recommendation_explanation(db: Session, student: Student) -> dict:
    latest = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.student_id == student.id)
        .order_by(RecommendationHistory.created_at.desc())
        .first()
    )
    weak_topics = detect_student_weak_topics(db, student)
    signals = student_signals(db, student)
    recommendation = latest.recommendation if latest else "Complete a topic quiz and follow your adaptive learning path."
    factors = [
        factor("Weak topics", "negative" if weak_topics else "positive", str(len(weak_topics))),
        factor("Risk level", "negative" if signals["risk_level"] in ["High", "Medium"] else "positive", signals["risk_level"]),
        factor("Engagement", "positive" if signals["engagement_score"] >= 60 else "negative", percent(signals["engagement_score"]))
    ]
    positive, negative = split_factors(factors)

    return {
        "prediction_type": "AI Recommendation",
        "result": recommendation,
        "confidence": None,
        "top_factors": factors,
        "positive_factors": positive,
        "negative_factors": negative,
        "explanation": "This recommendation was selected from current weak-topic, risk and engagement signals.",
        "suggested_action": recommendation
    }


def build_student_explainability(db: Session, student: Student) -> dict:
    explanations = [
        risk_explanation(db, student),
        cognitive_risk_explanation(db, student),
        engagement_explanation(db, student),
        weak_topic_explanation(db, student),
        learning_path_explanation(db, student),
        recommendation_explanation(db, student)
    ]

    return {
        "student_id": student.id,
        "student": student.full_name,
        "explanations": explanations
    }


def build_admin_explainability_summary(db: Session) -> dict:
    students = db.query(Student).filter(Student.role == "student").all()
    summaries = [build_student_explainability(db, student) for student in students]
    positive_counter = Counter()
    negative_counter = Counter()
    risk_counter = Counter()

    for summary in summaries:
        for explanation in summary["explanations"]:
            if explanation["prediction_type"] == "Student Risk":
                risk_counter[explanation["result"]] += 1
            positive_counter.update(item["factor"] for item in explanation["positive_factors"])
            negative_counter.update(item["factor"] for item in explanation["negative_factors"])

    return {
        "total_students": len(students),
        "explanations_generated": sum(len(item["explanations"]) for item in summaries),
        "common_positive_factors": [
            {"factor": factor_name, "count": count}
            for factor_name, count in positive_counter.most_common(8)
        ],
        "common_negative_factors": [
            {"factor": factor_name, "count": count}
            for factor_name, count in negative_counter.most_common(8)
        ],
        "risk_level_summary": [
            {"risk_level": risk_level, "count": count}
            for risk_level, count in risk_counter.items()
        ],
        "student_summaries": summaries
    }

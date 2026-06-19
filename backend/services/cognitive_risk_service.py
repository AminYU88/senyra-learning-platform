from collections import Counter

from sqlalchemy.orm import Session

from backend.ml.predict_cognitive_risk import (
    feature_importance,
    model_info,
    predict_with_model
)
from backend.models.creativity_model import CreativityAssessment
from backend.models.education import WeakTopic
from backend.models.flow_model import FlowSession, FlowSummary
from backend.models.learning_dna_model import LearningDNAProfile
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import QuizAttempt
from backend.models.student import Student
from backend.services.ml_service import build_current_student_metrics


def clamp(value: float) -> float:
    return round(max(0, min(100, value)), 2)


def latest_creativity_assessment(
    db: Session,
    student_id: int
) -> CreativityAssessment | None:
    return (
        db.query(CreativityAssessment)
        .filter(CreativityAssessment.student_id == student_id)
        .order_by(CreativityAssessment.created_at.desc())
        .first()
    )


def build_cognitive_features(
    db: Session,
    student: Student
) -> tuple[dict, dict]:
    baseline = build_current_student_metrics(db, student)

    creativity = latest_creativity_assessment(db, student.id)
    dna = (
        db.query(LearningDNAProfile)
        .filter(LearningDNAProfile.student_id == student.id)
        .first()
    )
    flow_summary = (
        db.query(FlowSummary)
        .filter(FlowSummary.student_id == student.id)
        .first()
    )
    flow_sessions = (
        db.query(FlowSession)
        .filter(FlowSession.student_id == student.id)
        .all()
    )
    weak_topics = (
        db.query(WeakTopic)
        .filter(WeakTopic.student_id == student.id)
        .all()
    )

    completed_flow_sessions = [
        session
        for session in flow_sessions
        if session.ended_at is not None
    ]

    task_completion_rate = 0
    if completed_flow_sessions:
        task_completion_rate = round(
            (
                len([session for session in completed_flow_sessions if session.completed_task])
                / len(completed_flow_sessions)
            )
            * 100,
            2
        )
    else:
        total_lessons = db.query(Lesson).count()
        completed_lessons = (
            db.query(LessonProgress)
            .filter(LessonProgress.student_id == student.id)
            .count()
        )
        if total_lessons:
            task_completion_rate = round((completed_lessons / total_lessons) * 100, 2)

    study_consistency = baseline["attendance_rate"] * 0.35 + baseline["lesson_completion_rate"] * 0.35
    if completed_flow_sessions:
        study_consistency += min(len(completed_flow_sessions) * 8, 30)
    else:
        study_consistency += min(baseline["study_hours_per_week"] * 3, 30)

    problem_solving_score = 0
    if creativity:
        problem_solving_score = creativity.flexibility_score * 0.35 + creativity.originality_score * 0.25
    if dna:
        problem_solving_score += dna.problem_solver_score * 0.40
    if problem_solving_score == 0:
        problem_solving_score = baseline["average_quiz_score"] * 0.65 + baseline["practice_exercises_completed"] * 5

    metrics = {
        "attendance_rate": baseline["attendance_rate"],
        "average_quiz_score": baseline["average_quiz_score"],
        "engagement_score": baseline["engagement_score"],
        "creativity_score": creativity.creativity_score if creativity else 0,
        "flow_score": flow_summary.average_flow_score if flow_summary else 0,
        "learning_dna_confidence": dna.confidence_score if dna else 0,
        "study_consistency": clamp(study_consistency),
        "task_completion_rate": clamp(task_completion_rate),
        "weak_topic_count": len(weak_topics),
        "problem_solving_score": clamp(problem_solving_score),
        "course_level": baseline.get("course_level", "beginner"),
        "learner_type": dna.learner_type if dna else "Unknown"
    }

    completeness = {
        "has_creativity_assessment": creativity is not None,
        "has_learning_dna_profile": dna is not None,
        "has_flow_sessions": len(completed_flow_sessions) > 0,
        "has_weak_topics": len(weak_topics) > 0,
        "quiz_attempts": db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).count()
    }

    return metrics, completeness


def rule_based_prediction(metrics: dict) -> dict:
    risk_score = 0
    risk_score += max(0, 70 - metrics["attendance_rate"]) * 0.18
    risk_score += max(0, 65 - metrics["average_quiz_score"]) * 0.22
    risk_score += max(0, 60 - metrics["engagement_score"]) * 0.16
    risk_score += max(0, 55 - metrics["flow_score"]) * 0.14
    risk_score += max(0, 55 - metrics["study_consistency"]) * 0.12
    risk_score += max(0, 55 - metrics["task_completion_rate"]) * 0.10
    risk_score += min(metrics["weak_topic_count"] * 8, 24)
    risk_score += max(0, 50 - metrics["problem_solving_score"]) * 0.08
    risk_score -= max(0, metrics["creativity_score"] - 70) * 0.05
    risk_score -= max(0, metrics["learning_dna_confidence"] - 70) * 0.04
    risk_score = clamp(risk_score)

    if risk_score >= 55:
        level = "High"
    elif risk_score >= 30:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_level": level,
        "confidence_score": clamp(60 + abs(risk_score - 40) * 0.6),
        "model_name": "Rule-based cognitive risk fallback",
        "prediction_source": "Cognitive Risk Rule Engine"
    }


def cognitive_factors(metrics: dict) -> tuple[list[str], list[str]]:
    risk_factors = []
    protective_factors = []

    checks = [
        ("Low attendance", metrics["attendance_rate"], 70),
        ("Low quiz performance", metrics["average_quiz_score"], 60),
        ("Low engagement", metrics["engagement_score"], 55),
        ("Low Flow State score", metrics["flow_score"], 55),
        ("Inconsistent study behaviour", metrics["study_consistency"], 55),
        ("Low task completion", metrics["task_completion_rate"], 55),
        ("Weak problem-solving pattern", metrics["problem_solving_score"], 50),
        ("Limited creativity evidence", metrics["creativity_score"], 45)
    ]

    for label, value, threshold in checks:
        if value < threshold:
            risk_factors.append(f"{label}: {round(value, 2)}%")
        else:
            protective_factors.append(f"{label.replace('Low ', 'Strong ').replace('Weak ', 'Strong ')}: {round(value, 2)}%")

    if metrics["weak_topic_count"] > 0:
        risk_factors.append(f"{metrics['weak_topic_count']} weak topic signal(s) detected")
    else:
        protective_factors.append("No weak topics currently recorded")

    if metrics["learning_dna_confidence"] >= 70:
        protective_factors.append(f"Clear Learning DNA profile: {metrics['learner_type']}")
    elif metrics["learning_dna_confidence"] == 0:
        risk_factors.append("Learning DNA profile has not been completed")

    return risk_factors[:6], protective_factors[:6]


def recommendation_for_prediction(
    risk_level: str,
    metrics: dict
) -> str:
    if risk_level == "High":
        return "Create a teacher-supported intervention plan combining weak-topic revision, shorter flow sessions and weekly progress checks."
    if risk_level == "Medium":
        if metrics["flow_score"] < 55:
            return "Use shorter focus sessions with breaks and schedule difficult topics during the best Flow State window."
        return "Use targeted quizzes, review weak topics and monitor cognitive risk after the next assessment."
    return "Maintain current learning habits and add advanced challenge tasks during high-focus sessions."


def predict_cognitive_risk_from_metrics(metrics: dict) -> dict:
    try:
        prediction = predict_with_model(metrics)
    except Exception:
        prediction = rule_based_prediction(metrics)

    risk_factors, protective_factors = cognitive_factors(metrics)

    return {
        "cognitive_risk_level": prediction["risk_level"],
        "confidence_score": prediction["confidence_score"],
        "key_risk_factors": risk_factors,
        "protective_factors": protective_factors,
        "recommendation": recommendation_for_prediction(prediction["risk_level"], metrics),
        "model_name": prediction["model_name"],
        "prediction_source": prediction["prediction_source"],
        "input_features": metrics
    }


def predict_current_student_cognitive_risk(
    db: Session,
    student: Student
) -> dict:
    metrics, completeness = build_cognitive_features(db, student)
    prediction = predict_cognitive_risk_from_metrics(metrics)
    prediction["student"] = student.full_name
    prediction["data_completeness"] = completeness
    return prediction


def get_cognitive_risk_factors() -> dict:
    return {
        "risk_factors": [
            "Low quiz performance",
            "Low engagement",
            "Low Flow State score",
            "Inconsistent study behaviour",
            "Low task completion",
            "Multiple weak topics",
            "Incomplete Learning DNA or creativity evidence"
        ],
        "protective_factors": [
            "Strong Flow State score",
            "Consistent study sessions",
            "High task completion",
            "Strong creativity assessment",
            "Clear Learning DNA profile",
            "Few or no weak topics"
        ],
        "feature_explanations": {
            "creativity_score": "Creative reasoning, originality and elaboration from Creativity Lab tasks.",
            "flow_score": "Focused study behaviour from Flow State sessions.",
            "learning_dna_confidence": "Confidence in the student's learner type profile.",
            "study_consistency": "Attendance, lesson progress and repeated study sessions.",
            "problem_solving_score": "Problem solving pattern from quizzes, creativity and Learning DNA.",
            "weak_topic_count": "Number of detected weak topic records."
        }
    }


def get_cognitive_risk_model_info() -> dict:
    info = model_info()
    info["dataset_justification"] = (
        "The cognitive risk model uses education-sector learning analytics, including quiz performance, "
        "attendance-style engagement signals, creativity assessments, Learning DNA profiles, Flow State sessions, "
        "task completion and weak-topic records."
    )
    info["ethical_considerations"] = [
        "Cognitive risk predictions are support signals, not labels of ability.",
        "Teachers should review context before intervention decisions.",
        "Missing data can increase uncertainty and should not be treated as student failure.",
        "The model should be monitored for bias across learner groups and study patterns."
    ]
    return info


def get_cognitive_feature_importance() -> list[dict]:
    return feature_importance()


def build_admin_overview(db: Session) -> dict:
    students = db.query(Student).filter(Student.role == "student").all()
    predictions = []
    risk_factor_counter = Counter()
    protective_counter = Counter()

    for student in students:
        prediction = predict_current_student_cognitive_risk(db, student)
        predictions.append(prediction)
        risk_factor_counter.update([
            factor.split(":")[0]
            for factor in prediction["key_risk_factors"]
        ])
        protective_counter.update([
            factor.split(":")[0]
            for factor in prediction["protective_factors"]
        ])

    if not predictions:
        return {
            "total_students": 0,
            "average_cognitive_risk_score": 0,
            "high_risk_students": 0,
            "medium_risk_students": 0,
            "low_risk_students": 0,
            "class_cognitive_risk_trends": [],
            "common_risk_factors": [],
            "protective_factor_summary": [],
            "students_needing_support": [],
            "recommendation": "No student data is available for cognitive risk analysis."
        }

    high = [item for item in predictions if item["cognitive_risk_level"] == "High"]
    medium = [item for item in predictions if item["cognitive_risk_level"] == "Medium"]
    low = [item for item in predictions if item["cognitive_risk_level"] == "Low"]

    risk_score_lookup = {"Low": 20, "Medium": 55, "High": 85}

    return {
        "total_students": len(predictions),
        "average_cognitive_risk_score": round(
            sum(risk_score_lookup[item["cognitive_risk_level"]] for item in predictions) / len(predictions),
            2
        ),
        "high_risk_students": len(high),
        "medium_risk_students": len(medium),
        "low_risk_students": len(low),
        "class_cognitive_risk_trends": [
            {
                "label": "Current",
                "average_cognitive_risk_score": round(
                    sum(risk_score_lookup[item["cognitive_risk_level"]] for item in predictions) / len(predictions),
                    2
                ),
                "high": len(high),
                "medium": len(medium),
                "low": len(low)
            }
        ],
        "common_risk_factors": [
            {"factor": factor, "count": count}
            for factor, count in risk_factor_counter.most_common(6)
        ],
        "protective_factor_summary": [
            {"factor": factor, "count": count}
            for factor, count in protective_counter.most_common(6)
        ],
        "students_needing_support": [
            {
                "student": item["student"],
                "risk_level": item["cognitive_risk_level"],
                "confidence_score": item["confidence_score"],
                "key_risk_factors": item["key_risk_factors"][:3],
                "recommendation": item["recommendation"]
            }
            for item in high + medium
        ][:10],
        "recommendation": "Use cognitive risk as an advanced support signal alongside teacher judgement and existing ML risk prediction."
    }

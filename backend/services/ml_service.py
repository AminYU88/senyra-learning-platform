from pathlib import Path
import json

import joblib
import pandas as pd
from sqlalchemy.orm import Session

from backend.models.learning_event import LearningEvent
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import Quiz, QuizAttempt
from backend.models.student import Student


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "backend" / "ml" / "saved_models" / "student_risk_model.joblib"
ENGAGEMENT_MODEL_PATH = BASE_DIR / "backend" / "ml" / "saved_models" / "engagement_model.joblib"
RECOMMENDATION_MODEL_PATH = BASE_DIR / "backend" / "ml" / "saved_models" / "recommendation_model.joblib"
COGNITIVE_RISK_MODEL_PATH = BASE_DIR / "backend" / "ml" / "saved_models" / "cognitive_risk_model.joblib"
DATASET_SUMMARY_PATH = BASE_DIR / "datasets" / "DATASET_SUMMARY.json"

MODEL_BUNDLE = None
ENGAGEMENT_MODEL_BUNDLE = None


def load_model_bundle() -> dict:
    global MODEL_BUNDLE

    if MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                "Educational ML model not found. Run backend/ml/train_model.py first."
            )

        MODEL_BUNDLE = joblib.load(MODEL_PATH)

    return MODEL_BUNDLE


def load_engagement_model_bundle() -> dict:
    global ENGAGEMENT_MODEL_BUNDLE

    if ENGAGEMENT_MODEL_BUNDLE is None:
        if not ENGAGEMENT_MODEL_PATH.exists():
            raise FileNotFoundError(
                "Engagement model not found. Run backend/ml/train_engagement_model.py first."
            )

        ENGAGEMENT_MODEL_BUNDLE = joblib.load(ENGAGEMENT_MODEL_PATH)

    return ENGAGEMENT_MODEL_BUNDLE


def read_dataset_summary() -> list[dict]:
    if not DATASET_SUMMARY_PATH.exists():
        return []

    with DATASET_SUMMARY_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_saved_model_status() -> list[dict]:
    model_paths = [
        ("Student Risk", MODEL_PATH),
        ("Engagement", ENGAGEMENT_MODEL_PATH),
        ("Recommendation", RECOMMENDATION_MODEL_PATH),
        ("Cognitive Risk", COGNITIVE_RISK_MODEL_PATH)
    ]

    statuses = []

    for name, path in model_paths:
        statuses.append({
            "name": name,
            "trained": path.exists(),
            "path": str(path.relative_to(BASE_DIR)),
            "size_kb": round(path.stat().st_size / 1024, 2) if path.exists() else 0
        })

    return statuses


def calculate_pass_probability(metrics: dict) -> float:
    weighted_score = (
        metrics["average_quiz_score"] * 0.35
        + metrics["assignment_score"] * 0.30
        + metrics["attendance_rate"] * 0.15
        + metrics["lesson_completion_rate"] * 0.15
        + metrics["engagement_score"] * 0.05
        - metrics["late_submissions"] * 1.5
        - metrics["previous_failures"] * 5
    )

    return round(max(0, min(100, weighted_score)), 2)


def predict_engagement(metrics: dict) -> str:
    score = (
        metrics["engagement_score"] * 0.45
        + metrics["attendance_rate"] * 0.20
        + metrics["lesson_completion_rate"] * 0.20
        + min(metrics["forum_posts"] * 4, 20) * 0.05
        + min(metrics["practice_exercises_completed"] * 2, 40) * 0.10
    )

    if score >= 75:
        return "High"
    if score >= 55:
        return "Medium"
    return "Low"


def detect_weak_topic(metrics: dict, bundle: dict) -> str:
    topic = metrics["primary_topic"].lower()
    lookup = bundle.get("weak_topic_lookup", {})

    if metrics["average_quiz_score"] < 60:
        return lookup.get(topic, topic)

    if metrics["assignment_score"] < 60:
        return lookup.get(topic, topic)

    if metrics["lesson_completion_rate"] < 50:
        return f"{topic} fundamentals"

    if metrics["practice_exercises_completed"] < 8:
        return f"{topic} practice"

    return "none"


def build_recommendations(
    metrics: dict,
    risk_level: str,
    weak_topic: str,
    engagement_prediction: str,
    pass_probability: float
) -> list[str]:
    recommendations = []

    if risk_level == "High":
        recommendations.append("Schedule an intervention session and review the student's learning plan this week.")
    elif risk_level == "Medium":
        recommendations.append("Use a targeted revision plan and monitor the next quiz attempt.")
    else:
        recommendations.append("Maintain current study habits and add stretch activities.")

    if pass_probability < 60:
        recommendations.append("Prioritise assessment recovery: redo low-scoring quizzes and improve assignment evidence.")

    if weak_topic != "none":
        recommendations.append(f"Revise weak topic: {weak_topic}. Create flashcards and complete practice questions.")

    if metrics["attendance_rate"] < 70:
        recommendations.append("Improve attendance because missed sessions strongly affect risk prediction.")

    if metrics["late_submissions"] >= 3:
        recommendations.append("Reduce late submissions with smaller weekly milestones.")

    if engagement_prediction == "Low":
        recommendations.append("Increase engagement with short daily practice tasks and forum participation.")

    if metrics["study_hours_per_week"] < 5:
        recommendations.append("Increase independent study to at least 5-7 focused hours per week.")

    return recommendations


def predict_from_metrics(metrics: dict) -> dict:
    bundle = load_model_bundle()
    model = bundle["model"]

    frame = pd.DataFrame([metrics])
    risk_level = model.predict(frame)[0].title()

    probabilities = model.predict_proba(frame)[0]
    class_labels = model.classes_
    confidence_score = round(float(max(probabilities)) * 100, 2)

    pass_probability = calculate_pass_probability(metrics)
    pass_fail_prediction = "Pass" if pass_probability >= 60 else "Fail"
    engagement_prediction = predict_engagement(metrics)
    weak_topic = detect_weak_topic(metrics, bundle)

    return {
        "risk_level": risk_level,
        "confidence_score": confidence_score,
        "class_probabilities": {
            str(label).title(): round(float(probability) * 100, 2)
            for label, probability in zip(class_labels, probabilities)
        },
        "pass_fail_prediction": pass_fail_prediction,
        "pass_probability": pass_probability,
        "engagement_prediction": engagement_prediction,
        "weak_topic": weak_topic,
        "recommendations": build_recommendations(
            metrics,
            risk_level,
            weak_topic,
            engagement_prediction,
            pass_probability
        ),
        "model_name": bundle["best_model_name"],
        "prediction_source": "Educational ML Pipeline",
        "input_features": metrics
    }


def get_model_info() -> dict:
    dataset_summary = read_dataset_summary()
    saved_models = get_saved_model_status()
    dataset_rows = sum(
        item.get("rows", 0)
        for item in dataset_summary
        if item.get("loadable_with_pandas", False)
    )

    model_status = {
        "student_risk_model_trained": MODEL_PATH.exists(),
        "engagement_model_trained": ENGAGEMENT_MODEL_PATH.exists(),
        "recommendation_model_trained": RECOMMENDATION_MODEL_PATH.exists(),
        "cognitive_risk_model_trained": COGNITIVE_RISK_MODEL_PATH.exists(),
        "dataset_summary_available": DATASET_SUMMARY_PATH.exists()
    }

    if not MODEL_PATH.exists():
        return {
            "best_model_name": None,
            "model_results": {},
            "engagement_model": None,
            "dataset_rows": dataset_rows,
            "datasets": dataset_summary,
            "saved_models": saved_models,
            "model_status": model_status,
            "features": [],
            "dataset_justification": (
                "Datasets are available, but the student risk model file is missing. "
                "Run python -m backend.ml.train_student_risk_model before presenting risk model metrics."
            ),
            "ethical_considerations": [
                "Do not present missing model outputs as predictions.",
                "Train and validate models before using them for decision support.",
                "Predictions should support teachers, not replace human judgement."
            ]
        }

    bundle = load_model_bundle()

    engagement_model = None
    if ENGAGEMENT_MODEL_PATH.exists():
        engagement_bundle = load_engagement_model_bundle()
        engagement_model = {
            "best_model_name": engagement_bundle["best_model_name"],
            "model_results": engagement_bundle["model_results"]
        }

    return {
        "best_model_name": bundle["best_model_name"],
        "model_results": bundle["model_results"],
        "engagement_model": engagement_model,
        "dataset_rows": dataset_rows,
        "datasets": dataset_summary,
        "saved_models": saved_models,
        "model_status": model_status,
        "features": bundle["features"],
        "dataset_justification": (
            "Combined education datasets: UCI Student Performance, xAPI-style engagement data, "
            "Senyra internal learning analytics, Maths questions and English content."
        ),
        "ethical_considerations": [
            "Predictions are decision-support signals, not automatic grades.",
            "Models should be reviewed by teachers before interventions.",
            "Behavioural data can be incomplete or biased.",
            "Students should be supported with transparent recommendations."
        ]
    }


def get_feature_importance() -> dict:
    if not MODEL_PATH.exists():
        return {
            "model_name": "Not trained",
            "feature_importance": [],
            "model_status": {
                "student_risk_model_trained": False,
                "message": "Run python -m backend.ml.train_student_risk_model to generate feature importance."
            }
        }

    bundle = load_model_bundle()

    return {
        "model_name": bundle["best_model_name"],
        "feature_importance": bundle["feature_importance"],
        "model_status": {
            "student_risk_model_trained": True
        }
    }


def predict_engagement_from_metrics(metrics: dict) -> dict:
    bundle = load_engagement_model_bundle()
    model = bundle["model"]

    frame = pd.DataFrame([metrics])
    engagement_level = str(model.predict(frame)[0]).title()
    probabilities = model.predict_proba(frame)[0]
    confidence_score = round(float(max(probabilities)) * 100, 2)

    if engagement_level == "Low":
        recommendation = "Increase participation with short daily tasks, resource visits and discussion activity."
        explanation = "Low participation signals were detected across activity and resource-use features."
    elif engagement_level == "Medium":
        recommendation = "Maintain participation and add one extra weekly practice or discussion task."
        explanation = "Engagement is developing but could improve with more consistent learning activity."
    else:
        recommendation = "Maintain strong habits and attempt extension tasks or peer-support activities."
        explanation = "High participation signals were detected across learning activity features."

    return {
        "engagement_level": engagement_level,
        "confidence_score": confidence_score,
        "explanation": explanation,
        "personalised_recommendation": recommendation,
        "model_name": bundle["best_model_name"],
        "input_features": metrics
    }


def build_current_student_metrics(
    db: Session,
    current_user: Student
) -> dict:
    events = (
        db.query(LearningEvent)
        .filter(LearningEvent.student_id == current_user.id)
        .all()
    )

    quiz_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == current_user.id)
        .all()
    )

    average_quiz_score = 0
    primary_topic = "python"

    if quiz_attempts:
        average_quiz_score = round(
            sum(attempt.score for attempt in quiz_attempts) / len(quiz_attempts),
            2
        )

        latest_quiz = (
            db.query(Quiz)
            .filter(Quiz.id == quiz_attempts[-1].quiz_id)
            .first()
        )
        if latest_quiz:
            primary_topic = latest_quiz.title.lower().split()[0]

    total_lessons = db.query(Lesson).count()

    completed_lessons = (
        db.query(LessonProgress)
        .filter(LessonProgress.student_id == current_user.id)
        .count()
    )

    lesson_completion_rate = 0
    if total_lessons > 0:
        lesson_completion_rate = round(
            (completed_lessons / total_lessons) * 100,
            2
        )

    video_count = len([event for event in events if event.event_type == "video_watch"])
    practice_count = len([event for event in events if event.event_type == "coding_practice"])
    quiz_count = len(quiz_attempts)
    total_events = len(events)

    engagement_score = min(
        100,
        total_events * 8 + quiz_count * 5 + practice_count * 5 + video_count * 3
    )

    assignment_score = average_quiz_score if average_quiz_score else engagement_score

    return {
        "attendance_rate": 85 if total_events else 50,
        "engagement_score": engagement_score,
        "average_quiz_score": average_quiz_score,
        "assignment_score": assignment_score,
        "lesson_completion_rate": lesson_completion_rate,
        "study_hours_per_week": min(20, max(2, total_events)),
        "late_submissions": 0 if engagement_score >= 60 else 3,
        "forum_posts": len([event for event in events if event.event_type == "forum_post"]),
        "practice_exercises_completed": practice_count,
        "previous_failures": 0 if average_quiz_score >= 50 else 1,
        "course_level": "beginner",
        "primary_topic": primary_topic
    }


def predict_current_student_risk(
    db: Session,
    current_user: Student
) -> dict:
    metrics = build_current_student_metrics(
        db,
        current_user
    )

    prediction = predict_from_metrics(metrics)

    prediction["student"] = current_user.full_name
    prediction["engagement_score"] = metrics["engagement_score"]
    prediction["model_features"] = {
        "videos": len([
            event
            for event in db.query(LearningEvent)
            .filter(LearningEvent.student_id == current_user.id)
            .all()
            if event.event_type == "video_watch"
        ]),
        "quizzes": db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == current_user.id)
        .count(),
        "practice": metrics["practice_exercises_completed"],
        "average_quiz_score": metrics["average_quiz_score"],
        "lesson_progress": metrics["lesson_completion_rate"]
    }
    prediction["event_breakdown"] = {
        "videos": prediction["model_features"]["videos"],
        "quizzes": prediction["model_features"]["quizzes"],
        "practice": prediction["model_features"]["practice"]
    }
    prediction["quiz_analytics"] = {
        "attempts": prediction["model_features"]["quizzes"],
        "average_score": metrics["average_quiz_score"]
    }
    prediction["progress_analytics"] = {
        "total_lessons": db.query(Lesson).count(),
        "completed_lessons": db.query(LessonProgress)
        .filter(LessonProgress.student_id == current_user.id)
        .count(),
        "lesson_progress": metrics["lesson_completion_rate"]
    }
    prediction["ai_insights"] = prediction["recommendations"]

    return prediction

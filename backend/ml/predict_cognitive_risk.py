from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "backend" / "ml" / "saved_models" / "cognitive_risk_model.joblib"

MODEL_BUNDLE = None


def model_exists() -> bool:
    return MODEL_PATH.exists()


def load_cognitive_risk_bundle() -> dict:
    global MODEL_BUNDLE

    if MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                "Cognitive risk model not found. Run backend/ml/train_cognitive_risk_model.py first."
            )
        MODEL_BUNDLE = joblib.load(MODEL_PATH)

    return MODEL_BUNDLE


def predict_with_model(metrics: dict) -> dict:
    bundle = load_cognitive_risk_bundle()
    model = bundle["model"]
    frame = pd.DataFrame([metrics])

    risk_level = str(model.predict(frame)[0]).title()
    probabilities = model.predict_proba(frame)[0]
    confidence_score = round(float(max(probabilities)) * 100, 2)

    return {
        "risk_level": risk_level,
        "confidence_score": confidence_score,
        "class_probabilities": {
            str(label).title(): round(float(probability) * 100, 2)
            for label, probability in zip(model.classes_, probabilities)
        },
        "model_name": bundle["best_model_name"],
        "prediction_source": "Cognitive Risk ML Model"
    }


def model_info() -> dict:
    if not MODEL_PATH.exists():
        return {
            "model_name": "Rule-based cognitive risk fallback",
            "model_results": {},
            "features": [
                "attendance_rate",
                "average_quiz_score",
                "engagement_score",
                "creativity_score",
                "flow_score",
                "learning_dna_confidence",
                "study_consistency",
                "task_completion_rate",
                "weak_topic_count",
                "problem_solving_score",
                "course_level",
                "learner_type"
            ],
            "target": "risk_level",
            "dataset_name": "Senyra cognitive and behavioural learning analytics",
            "model_available": False
        }

    bundle = load_cognitive_risk_bundle()
    return {
        "model_name": bundle["best_model_name"],
        "model_results": bundle["model_results"],
        "features": bundle["features"],
        "target": bundle["target"],
        "dataset_name": bundle["dataset_name"],
        "model_available": True
    }


def feature_importance() -> list[dict]:
    if not MODEL_PATH.exists():
        return []

    return load_cognitive_risk_bundle().get("feature_importance", [])

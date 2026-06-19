import pandas as pd
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.ml.dataset_loader import DATASET_DIRECTORIES, prepare_all_datasets
from backend.ml.model_utils import train_and_save_classifier


COGNITIVE_NUMERIC_FEATURES = [
    "attendance_rate",
    "average_quiz_score",
    "engagement_score",
    "creativity_score",
    "flow_score",
    "learning_dna_confidence",
    "study_consistency",
    "task_completion_rate",
    "weak_topic_count",
    "problem_solving_score"
]

COGNITIVE_CATEGORICAL_FEATURES = [
    "course_level",
    "learner_type"
]


def clamp(series):
    return series.clip(lower=0, upper=100)


def build_training_frame() -> pd.DataFrame:
    prepare_all_datasets(download_external=True)
    internal_path = DATASET_DIRECTORIES["internal"] / "senyra_internal_learning_data.csv"
    df = pd.read_csv(internal_path)

    for column in [
        "attendance_rate",
        "average_quiz_score",
        "engagement_score",
        "lesson_completion_rate",
        "practice_exercises_completed",
        "study_hours_per_week",
        "late_submissions",
        "previous_failures"
    ]:
        df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0)

    # Educational cognitive proxy features are derived from internal learning
    # analytics so the model can be trained locally before enough live data exists.
    df["creativity_score"] = clamp(
        df["average_quiz_score"] * 0.35
        + df["practice_exercises_completed"] * 4
        + df["engagement_score"] * 0.25
    )
    df["flow_score"] = clamp(
        df["engagement_score"] * 0.45
        + df["lesson_completion_rate"] * 0.35
        + df["study_hours_per_week"] * 2
        - df["late_submissions"] * 4
    )
    df["learning_dna_confidence"] = clamp(
        45 + df["practice_exercises_completed"] * 3 + df["average_quiz_score"] * 0.20
    )
    df["study_consistency"] = clamp(
        df["attendance_rate"] * 0.45
        + df["study_hours_per_week"] * 3
        + df["lesson_completion_rate"] * 0.25
    )
    df["task_completion_rate"] = df["lesson_completion_rate"]
    df["weak_topic_count"] = (
        (df["average_quiz_score"] < 55).astype(int)
        + (df["lesson_completion_rate"] < 50).astype(int)
        + (df["engagement_score"] < 45).astype(int)
    )
    df["problem_solving_score"] = clamp(
        df["average_quiz_score"] * 0.50
        + df["practice_exercises_completed"] * 5
        - df["previous_failures"] * 8
    )
    df["learner_type"] = "Analytical Learner"
    df.loc[df["creativity_score"] >= 70, "learner_type"] = "Creative Learner"
    df.loc[df["problem_solving_score"] >= 75, "learner_type"] = "Problem Solver"
    df.loc[df["engagement_score"] >= 75, "learner_type"] = "Exploratory Learner"

    return df.dropna(subset=["risk_level"])


def train_cognitive_risk_model() -> dict:
    df = build_training_frame()

    return train_and_save_classifier(
        df=df,
        features=COGNITIVE_NUMERIC_FEATURES + COGNITIVE_CATEGORICAL_FEATURES,
        target="risk_level",
        numeric_features=COGNITIVE_NUMERIC_FEATURES,
        categorical_features=COGNITIVE_CATEGORICAL_FEATURES,
        model_name="cognitive_risk_model",
        dataset_name="Senyra cognitive and behavioural learning analytics"
    )


if __name__ == "__main__":
    print(train_cognitive_risk_model())

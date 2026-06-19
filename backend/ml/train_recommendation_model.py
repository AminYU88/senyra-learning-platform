import pandas as pd

from backend.ml.dataset_loader import DATASET_DIRECTORIES, prepare_all_datasets
from backend.ml.model_utils import train_and_save_classifier


def build_training_frame() -> pd.DataFrame:
    prepare_all_datasets(download_external=False)
    internal_path = DATASET_DIRECTORIES["internal"] / "senyra_internal_learning_data.csv"
    df = pd.read_csv(internal_path)

    numeric_features = [
        "attendance_rate",
        "engagement_score",
        "average_quiz_score",
        "assignment_score",
        "lesson_completion_rate",
        "study_hours_per_week",
        "late_submissions",
        "forum_posts",
        "practice_exercises_completed",
        "previous_failures"
    ]

    for column in numeric_features:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    return df.dropna(subset=["weak_topic"])


def train_recommendation_model() -> dict:
    df = build_training_frame()
    numeric_features = [
        "attendance_rate",
        "engagement_score",
        "average_quiz_score",
        "assignment_score",
        "lesson_completion_rate",
        "study_hours_per_week",
        "late_submissions",
        "forum_posts",
        "practice_exercises_completed",
        "previous_failures"
    ]
    categorical_features = ["course_level", "primary_topic", "risk_level", "engagement_level"]

    return train_and_save_classifier(
        df=df,
        features=numeric_features + categorical_features,
        target="weak_topic",
        numeric_features=numeric_features,
        categorical_features=categorical_features,
        model_name="recommendation_model",
        dataset_name="Senyra internal learning data"
    )


if __name__ == "__main__":
    print(train_recommendation_model())

import pandas as pd

from backend.ml.dataset_loader import DATASET_DIRECTORIES, prepare_all_datasets
from backend.ml.model_utils import train_and_save_classifier


def build_training_frame() -> pd.DataFrame:
    prepare_all_datasets(download_external=True)
    internal_path = DATASET_DIRECTORIES["internal"] / "senyra_internal_learning_data.csv"
    df = pd.read_csv(internal_path)

    for column in [
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
    ]:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    return df.dropna(subset=["risk_level"])


def train_student_risk_model() -> dict:
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
    categorical_features = ["course_level", "primary_topic"]

    return train_and_save_classifier(
        df=df,
        features=numeric_features + categorical_features,
        target="risk_level",
        numeric_features=numeric_features,
        categorical_features=categorical_features,
        model_name="student_risk_model",
        dataset_name="Senyra internal learning data"
    )


if __name__ == "__main__":
    print(train_student_risk_model())

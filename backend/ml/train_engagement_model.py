import pandas as pd

from backend.ml.dataset_loader import DATASET_DIRECTORIES, prepare_all_datasets
from backend.ml.model_utils import train_and_save_classifier


def build_training_frame() -> pd.DataFrame:
    prepare_all_datasets(download_external=False)
    xapi_path = DATASET_DIRECTORIES["xapi_edu"] / "xapi_edu_sample.csv"
    df = pd.read_csv(xapi_path)

    numeric_features = [
        "raised_hands",
        "visited_resources",
        "announcements_view",
        "discussion",
        "parent_satisfaction"
    ]

    for column in numeric_features:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    return df.dropna(subset=["engagement_level"])


def train_engagement_model() -> dict:
    df = build_training_frame()
    numeric_features = [
        "raised_hands",
        "visited_resources",
        "announcements_view",
        "discussion",
        "parent_satisfaction"
    ]
    categorical_features = [
        "gender",
        "nationality",
        "topic",
        "stage",
        "grade_band",
        "parent_answering_survey",
        "student_absence_days"
    ]

    return train_and_save_classifier(
        df=df,
        features=numeric_features + categorical_features,
        target="engagement_level",
        numeric_features=numeric_features,
        categorical_features=categorical_features,
        model_name="engagement_model",
        dataset_name="xAPI-Edu-Data teaching sample"
    )


if __name__ == "__main__":
    print(train_engagement_model())

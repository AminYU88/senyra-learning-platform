import json
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier


BASE_DIR = Path(__file__).resolve().parents[2]
DATASET_PATH = BASE_DIR / "datasets" / "student_learning_analytics.csv"
MODEL_PATH = BASE_DIR / "backend" / "ml" / "education_ml_model.joblib"
METRICS_PATH = BASE_DIR / "backend" / "ml" / "model_metrics.json"

TARGET = "risk_level"

NUMERIC_FEATURES = [
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

CATEGORICAL_FEATURES = [
    "course_level",
    "primary_topic"
]

FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def load_dataset() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATASET_PATH}. Add an education-sector CSV to datasets/."
        )

    return pd.read_csv(DATASET_PATH)


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [column.strip() for column in df.columns]
    df = df.drop_duplicates()

    for column in NUMERIC_FEATURES:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    for column in CATEGORICAL_FEATURES + [TARGET, "pass_fail", "engagement_level", "weak_topic"]:
        df[column] = df[column].astype(str).str.strip().str.lower()

    return df


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore"))
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, NUMERIC_FEATURES),
            ("categorical", categorical_pipeline, CATEGORICAL_FEATURES)
        ]
    )


def get_models() -> dict:
    return {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            class_weight="balanced"
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            random_state=42
        ),
        "Decision Tree": DecisionTreeClassifier(
            random_state=42,
            class_weight="balanced",
            max_depth=5
        )
    }


def evaluate_model(y_test, predictions) -> dict:
    return {
        "accuracy": round(accuracy_score(y_test, predictions), 4),
        "precision_macro": round(precision_score(y_test, predictions, average="macro", zero_division=0), 4),
        "recall_macro": round(recall_score(y_test, predictions, average="macro", zero_division=0), 4),
        "f1_macro": round(f1_score(y_test, predictions, average="macro", zero_division=0), 4)
    }


def get_feature_names(preprocessor: ColumnTransformer) -> list[str]:
    numeric_names = NUMERIC_FEATURES

    encoder = preprocessor.named_transformers_["categorical"].named_steps["encoder"]
    categorical_names = encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()

    return numeric_names + categorical_names


def get_feature_importance(model, feature_names: list[str]) -> list[dict]:
    estimator = model.named_steps["classifier"]

    if hasattr(estimator, "feature_importances_"):
        importances = estimator.feature_importances_
    elif hasattr(estimator, "coef_"):
        importances = abs(estimator.coef_).mean(axis=0)
    else:
        importances = [0 for _ in feature_names]

    rows = [
        {
            "feature": feature,
            "importance": round(float(importance), 5)
        }
        for feature, importance in zip(feature_names, importances)
    ]

    return sorted(
        rows,
        key=lambda item: item["importance"],
        reverse=True
    )


def train_pipeline() -> dict:
    df = clean_dataset(load_dataset())

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y
    )

    results = {}
    trained_models = {}

    for name, estimator in get_models().items():
        pipeline = Pipeline(
            steps=[
                ("preprocessor", build_preprocessor()),
                ("classifier", estimator)
            ]
        )

        pipeline.fit(X_train, y_train)
        predictions = pipeline.predict(X_test)
        results[name] = evaluate_model(y_test, predictions)
        trained_models[name] = pipeline

    best_model_name = sorted(
        results,
        key=lambda model_name: (
            results[model_name]["f1_macro"],
            results[model_name]["accuracy"]
        ),
        reverse=True
    )[0]

    best_pipeline = trained_models[best_model_name]
    feature_names = get_feature_names(best_pipeline.named_steps["preprocessor"])
    feature_importance = get_feature_importance(best_pipeline, feature_names)

    weak_topic_lookup = (
        df.groupby("primary_topic")["weak_topic"]
        .agg(lambda values: values.value_counts().index[0])
        .to_dict()
    )

    bundle = {
        "model": best_pipeline,
        "best_model_name": best_model_name,
        "model_results": results,
        "feature_importance": feature_importance,
        "features": FEATURES,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "target": TARGET,
        "dataset_path": str(DATASET_PATH),
        "dataset_rows": int(len(df)),
        "dataset_justification": (
            "Education-sector student learning analytics dataset containing attendance, "
            "engagement, quiz results, assessment outcomes, learning activity, and weak topics."
        ),
        "ethical_considerations": [
            "Predictions should support students, not punish them.",
            "Risk labels are decision-support signals and should be reviewed by teachers.",
            "The model avoids protected personal characteristics.",
            "Recommendations should be explainable and linked to learning behaviour."
        ],
        "weak_topic_lookup": weak_topic_lookup
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, MODEL_PATH)

    metrics_payload = {
        "best_model_name": best_model_name,
        "model_results": results,
        "dataset_rows": int(len(df)),
        "features": FEATURES,
        "feature_importance": feature_importance[:15],
        "dataset_justification": bundle["dataset_justification"],
        "ethical_considerations": bundle["ethical_considerations"]
    }

    METRICS_PATH.write_text(
        json.dumps(metrics_payload, indent=2),
        encoding="utf-8"
    )

    return metrics_payload


if __name__ == "__main__":
    metrics = train_pipeline()
    print("Educational ML pipeline trained successfully.")
    print(f"Best model: {metrics['best_model_name']}")
    print(json.dumps(metrics["model_results"], indent=2))

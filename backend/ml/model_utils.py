import json
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier


BASE_DIR = Path(__file__).resolve().parents[2]
SAVED_MODELS_DIR = BASE_DIR / "backend" / "ml" / "saved_models"
SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)


def build_preprocessor(
    numeric_features: list[str],
    categorical_features: list[str]
) -> ColumnTransformer:
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
            ("numeric", numeric_pipeline, numeric_features),
            ("categorical", categorical_pipeline, categorical_features)
        ]
    )


def candidate_models() -> dict:
    return {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced"),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42, class_weight="balanced", max_depth=5)
    }


def evaluate(y_true, y_pred) -> dict:
    matrix = confusion_matrix(y_true, y_pred)

    return {
        "accuracy": round(accuracy_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred, average="macro", zero_division=0), 4),
        "recall": round(recall_score(y_true, y_pred, average="macro", zero_division=0), 4),
        "f1_score": round(f1_score(y_true, y_pred, average="macro", zero_division=0), 4),
        "confusion_matrix": matrix.tolist()
    }


def get_feature_names(preprocessor, numeric_features, categorical_features) -> list[str]:
    encoder = preprocessor.named_transformers_["categorical"].named_steps["encoder"]
    encoded = encoder.get_feature_names_out(categorical_features).tolist()
    return numeric_features + encoded


def feature_importance(pipeline, feature_names: list[str]) -> list[dict]:
    estimator = pipeline.named_steps["classifier"]

    if hasattr(estimator, "feature_importances_"):
        values = estimator.feature_importances_
    elif hasattr(estimator, "coef_"):
        values = abs(estimator.coef_).mean(axis=0)
    else:
        values = [0 for _ in feature_names]

    rows = [
        {
            "feature": feature,
            "importance": round(float(value), 5)
        }
        for feature, value in zip(feature_names, values)
    ]

    return sorted(rows, key=lambda item: item["importance"], reverse=True)


def train_and_save_classifier(
    df: pd.DataFrame,
    features: list[str],
    target: str,
    numeric_features: list[str],
    categorical_features: list[str],
    model_name: str,
    dataset_name: str
) -> dict:
    X = df[features]
    y = df[target]

    stratify = y if y.value_counts().min() >= 2 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=stratify
    )

    results = {}
    trained = {}

    for name, estimator in candidate_models().items():
        pipeline = Pipeline(
            steps=[
                ("preprocessor", build_preprocessor(numeric_features, categorical_features)),
                ("classifier", estimator)
            ]
        )
        pipeline.fit(X_train, y_train)
        predictions = pipeline.predict(X_test)
        results[name] = evaluate(y_test, predictions)
        trained[name] = pipeline

    best_name = sorted(
        results,
        key=lambda name: (results[name]["f1_score"], results[name]["accuracy"]),
        reverse=True
    )[0]
    best_pipeline = trained[best_name]
    names = get_feature_names(
        best_pipeline.named_steps["preprocessor"],
        numeric_features,
        categorical_features
    )

    bundle = {
        "model": best_pipeline,
        "best_model_name": best_name,
        "model_results": results,
        "feature_importance": feature_importance(best_pipeline, names),
        "features": features,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "target": target,
        "dataset_name": dataset_name
    }

    model_path = SAVED_MODELS_DIR / f"{model_name}.joblib"
    metrics_path = SAVED_MODELS_DIR / f"{model_name}_metrics.json"

    joblib.dump(bundle, model_path)
    metrics_path.write_text(
        json.dumps(
            {
                "best_model_name": best_name,
                "model_results": results,
                "feature_importance": bundle["feature_importance"][:20],
                "features": features,
                "target": target,
                "dataset_name": dataset_name
            },
            indent=2
        ),
        encoding="utf-8"
    )

    return {
        "model_path": str(model_path.relative_to(BASE_DIR)),
        "metrics_path": str(metrics_path.relative_to(BASE_DIR)),
        "best_model_name": best_name,
        "model_results": results
    }


def load_model_bundle(model_name: str) -> dict:
    return joblib.load(SAVED_MODELS_DIR / f"{model_name}.joblib")

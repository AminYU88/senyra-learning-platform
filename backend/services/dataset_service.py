from pathlib import Path

from backend.ml.dataset_loader import (
    BASE_DIR,
    DATASETS_DIR,
    build_dataset_summary,
    list_dataset_files,
    load_dataset_file,
    prepare_all_datasets,
    write_summary_report
)


DATASET_DOCUMENTATION = [
    {
        "dataset_name": "UCI Student Performance",
        "source": "UCI Machine Learning Repository",
        "purpose": "Pass/fail prediction, grade prediction and student academic risk prediction.",
        "features_used": ["studytime", "failures", "absences", "G1", "G2", "support indicators"],
        "target_variable": "G3 final grade",
        "ethical_limitations": "Demographic/social features can encode bias. Use only for supportive intervention."
    },
    {
        "dataset_name": "xAPI-Edu-Data",
        "source": "Kaggle Students Academic Performance / xAPI-Edu-Data; local teaching sample included.",
        "purpose": "Engagement prediction, participation analysis and dropout risk.",
        "features_used": ["raised_hands", "visited_resources", "announcements_view", "discussion", "absence_days"],
        "target_variable": "engagement_level",
        "ethical_limitations": "Engagement behaviour is incomplete and should not be used as a disciplinary score."
    },
    {
        "dataset_name": "Mathematics Questions",
        "source": "Senyra locally curated UK curriculum dataset.",
        "purpose": "Maths quiz generation, weak topic detection and revision recommendations.",
        "features_used": ["curriculum_level", "topic", "question", "answer", "worked_solution"],
        "target_variable": "topic",
        "ethical_limitations": "Teacher review is recommended before using generated/local questions for assessment."
    },
    {
        "dataset_name": "English Language/Literature Content",
        "source": "Senyra locally curated UK curriculum dataset.",
        "purpose": "Reading comprehension, essay practice, literature questions and revision support.",
        "features_used": ["subject", "topic", "task", "skills"],
        "target_variable": "topic",
        "ethical_limitations": "Supports practice and revision; should not replace human marking."
    },
    {
        "dataset_name": "Senyra Internal Learning Data",
        "source": "Senyra app analytics and starter CSV.",
        "purpose": "Quiz scores, learning events, completed activities, login/engagement proxy and weak topics.",
        "features_used": ["attendance", "engagement", "quiz_score", "assignment_score", "lesson_completion"],
        "target_variable": "risk_level, pass_fail, engagement_level, weak_topic",
        "ethical_limitations": "Internal logs can be incomplete. Use predictions as decision support."
    }
]


def prepare_datasets() -> dict:
    preparation = prepare_all_datasets(download_external=True)
    report_path = write_summary_report()

    return {
        "preparation": preparation,
        "summary_report": str(report_path.relative_to(BASE_DIR))
    }


def get_dataset_summaries() -> list[dict]:
    return build_dataset_summary()


def get_dataset_documentation() -> list[dict]:
    return DATASET_DOCUMENTATION


def get_dataset_preview(dataset_name: str, limit: int = 10) -> dict:
    normalised_name = dataset_name.lower()

    for path in list_dataset_files():
        if path.stem.lower() == normalised_name:
            df = load_dataset_file(path)
            return {
                "dataset_name": path.stem,
                "path": str(path.relative_to(BASE_DIR)),
                "columns": df.columns.tolist(),
                "rows": df.head(limit).fillna("").to_dict(orient="records")
            }

    raise FileNotFoundError(f"Dataset not found: {dataset_name}")

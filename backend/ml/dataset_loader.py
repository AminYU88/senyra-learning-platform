import json
import zipfile
from pathlib import Path
from urllib.request import urlretrieve

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BASE_DIR / "datasets"

DATASET_DIRECTORIES = {
    "student_performance": DATASETS_DIR / "student_performance",
    "xapi_edu": DATASETS_DIR / "xapi_edu",
    "maths": DATASETS_DIR / "maths",
    "english": DATASETS_DIR / "english",
    "internal": DATASETS_DIR / "internal"
}

UCI_STUDENT_PERFORMANCE_URL = "https://archive.ics.uci.edu/static/public/320/student+performance.zip"


def ensure_dataset_directories() -> None:
    for directory in DATASET_DIRECTORIES.values():
        directory.mkdir(parents=True, exist_ok=True)


def download_uci_student_performance() -> dict:
    ensure_dataset_directories()
    target_dir = DATASET_DIRECTORIES["student_performance"]
    zip_path = target_dir / "student.zip"
    backup_zip_path = target_dir / ".student.zip_old"

    if zip_path.exists() and zip_path.stat().st_size == 0:
        zip_path.unlink()

    if not zip_path.exists() and backup_zip_path.exists() and zipfile.is_zipfile(backup_zip_path):
        zip_path.write_bytes(backup_zip_path.read_bytes())

    if not zip_path.exists():
        urlretrieve(UCI_STUDENT_PERFORMANCE_URL, zip_path)

    if not zipfile.is_zipfile(zip_path):
        raise ValueError("Downloaded UCI Student Performance file is not a valid zip archive.")

    with zipfile.ZipFile(zip_path, "r") as archive:
        archive.extractall(target_dir)

    return {
        "dataset": "UCI Student Performance",
        "downloaded": True,
        "files": [path.name for path in target_dir.iterdir() if path.is_file()]
    }


def create_xapi_fallback_dataset() -> dict:
    ensure_dataset_directories()
    path = DATASET_DIRECTORIES["xapi_edu"] / "xapi_edu_sample.csv"

    if not path.exists():
        rows = [
            ["M", "UK", "Maths", "GCSE", "A", 92, 84, 42, 18, 5, "Good", "Under-7", "High"],
            ["F", "UK", "English", "GCSE", "B", 75, 62, 28, 10, 4, "Good", "Under-7", "Medium"],
            ["M", "UK", "Maths", "KS3", "C", 34, 25, 9, 2, 1, "Bad", "Above-7", "Low"],
            ["F", "UK", "Literature", "A-Level", "A", 88, 90, 37, 15, 5, "Good", "Under-7", "High"],
            ["M", "UK", "English", "KS3", "C", 41, 36, 12, 3, 2, "Bad", "Above-7", "Low"],
            ["F", "UK", "Maths", "A-Level", "B", 69, 72, 24, 8, 4, "Good", "Under-7", "Medium"],
            ["M", "UK", "Literature", "GCSE", "B", 64, 58, 21, 7, 3, "Good", "Under-7", "Medium"],
            ["F", "UK", "Maths", "Further Maths", "A", 95, 93, 45, 21, 5, "Good", "Under-7", "High"],
            ["M", "UK", "English", "GCSE", "D", 22, 19, 4, 1, 1, "Bad", "Above-7", "Low"],
            ["F", "UK", "Maths", "Adult", "B", 73, 68, 27, 11, 4, "Good", "Under-7", "Medium"]
        ]

        df = pd.DataFrame(
            rows,
            columns=[
                "gender",
                "nationality",
                "topic",
                "stage",
                "grade_band",
                "raised_hands",
                "visited_resources",
                "announcements_view",
                "discussion",
                "parent_satisfaction",
                "parent_answering_survey",
                "student_absence_days",
                "engagement_level"
            ]
        )
        df.to_csv(path, index=False)

    return {
        "dataset": "xAPI-Edu-Data teaching sample",
        "downloaded": False,
        "reason": "The commonly used xAPI-Edu-Data source is hosted on Kaggle and requires user credentials for official download.",
        "files": [path.name]
    }


def create_maths_dataset() -> dict:
    ensure_dataset_directories()
    path = DATASET_DIRECTORIES["maths"] / "maths_questions.csv"

    if not path.exists():
        rows = [
            ["KS3", "Number", "Simplify 18/24.", "3/4", "Divide numerator and denominator by 6."],
            ["KS3", "Algebra", "Solve x + 7 = 12.", "x = 5", "Subtract 7 from both sides."],
            ["GCSE Foundation", "Ratio", "Share 30 in the ratio 2:3.", "12 and 18", "There are 5 parts, each part is 6."],
            ["GCSE Higher", "Trigonometry", "Find sin(30 degrees).", "0.5", "Use exact trig values."],
            ["A-Level", "Calculus", "Differentiate x^3.", "3x^2", "Use the power rule."],
            ["Further Mathematics", "Matrices", "What is the determinant of [[1,2],[3,4]]?", "-2", "ad - bc = 4 - 6."],
            ["A-Level", "Vectors", "What does a scalar product of 0 imply?", "Vectors are perpendicular", "Zero dot product means orthogonal vectors."],
            ["A-Level", "Mechanics", "State Newton's second law.", "F = ma", "Resultant force equals mass times acceleration."]
        ]

        pd.DataFrame(
            rows,
            columns=["curriculum_level", "topic", "question", "answer", "worked_solution"]
        ).to_csv(path, index=False)

    return {
        "dataset": "Mathematics question/topic dataset",
        "downloaded": False,
        "reason": "Locally curated from the UK curriculum topics already used by Senyra.",
        "files": [path.name]
    }


def create_english_dataset() -> dict:
    ensure_dataset_directories()
    path = DATASET_DIRECTORIES["english"] / "english_content.csv"

    if not path.exists():
        rows = [
            ["English Language", "Reading comprehension", "Read the extract and infer the speaker's attitude.", "Inference, evidence, explanation"],
            ["English Language", "Creative writing", "Describe a stormy street using sensory detail.", "Imagery, structure, vocabulary"],
            ["English Language", "Persuasive writing", "Write a speech arguing for more library funding.", "Rhetoric, audience, purpose"],
            ["English Literature", "Poetry", "Compare how two poems present conflict.", "Comparison, methods, context"],
            ["English Literature", "Shakespeare", "Analyse how ambition is presented in Macbeth.", "Character, theme, quotation"],
            ["English Literature", "19th Century texts", "Explain how context shapes a character's choices.", "Context, evidence, interpretation"],
            ["English Literature", "Essay writing", "Write a thesis statement for a theme essay.", "Argument, structure, evidence"]
        ]

        pd.DataFrame(
            rows,
            columns=["subject", "topic", "task", "skills"]
        ).to_csv(path, index=False)

    return {
        "dataset": "English Language/Literature content dataset",
        "downloaded": False,
        "reason": "Locally curated from UK English Language and Literature curriculum support requirements.",
        "files": [path.name]
    }


def copy_internal_dataset() -> dict:
    ensure_dataset_directories()
    source = DATASETS_DIR / "student_learning_analytics.csv"
    target = DATASET_DIRECTORIES["internal"] / "senyra_internal_learning_data.csv"

    if source.exists() and not target.exists():
        target.write_text(source.read_text(encoding="utf-8"), encoding="utf-8")

    return {
        "dataset": "Senyra internal learning data",
        "downloaded": False,
        "files": [target.name] if target.exists() else []
    }


def prepare_all_datasets(download_external: bool = True) -> list[dict]:
    ensure_dataset_directories()
    results = []

    if download_external:
        try:
            results.append(download_uci_student_performance())
        except Exception as error:
            results.append({
                "dataset": "UCI Student Performance",
                "downloaded": False,
                "error": str(error)
            })

    results.append(create_xapi_fallback_dataset())
    results.append(create_maths_dataset())
    results.append(create_english_dataset())
    results.append(copy_internal_dataset())

    return results


def load_dataset_file(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        separator = ";" if "student-" in path.name else ","
        return pd.read_csv(path, sep=separator)

    if path.suffix.lower() == ".json":
        return pd.read_json(path)

    raise ValueError(f"Unsupported dataset format: {path}")


def list_dataset_files() -> list[Path]:
    ensure_dataset_directories()
    files = []

    for directory in DATASET_DIRECTORIES.values():
        files.extend([
            path
            for path in directory.rglob("*")
            if path.suffix.lower() in [".csv", ".json"]
        ])

    return files


def build_dataset_summary() -> list[dict]:
    summaries = []

    for path in list_dataset_files():
        df = load_dataset_file(path)

        summaries.append({
            "dataset_name": path.stem,
            "path": str(path.relative_to(BASE_DIR)),
            "rows": int(len(df)),
            "columns": int(len(df.columns)),
            "column_names": df.columns.tolist(),
            "missing_values": int(df.isna().sum().sum()),
            "loadable_with_pandas": True
        })

    return summaries


def write_summary_report() -> Path:
    report_path = DATASETS_DIR / "DATASET_SUMMARY.json"
    summary = build_dataset_summary()
    report_path.write_text(
        json.dumps(summary, indent=2),
        encoding="utf-8"
    )
    return report_path


if __name__ == "__main__":
    print(json.dumps(prepare_all_datasets(download_external=True), indent=2))
    print(f"Summary written to {write_summary_report()}")

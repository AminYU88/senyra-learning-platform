from pydantic import BaseModel


class DatasetSummary(BaseModel):
    dataset_name: str
    path: str
    rows: int
    columns: int
    column_names: list[str]
    missing_values: int
    loadable_with_pandas: bool


class DatasetDocumentation(BaseModel):
    dataset_name: str
    source: str
    purpose: str
    features_used: list[str]
    target_variable: str
    ethical_limitations: str

from fastapi import APIRouter, Depends, HTTPException, status

from backend.auth.auth_handler import get_current_user
from backend.models.student import Student
from backend.services.dataset_service import (
    get_dataset_documentation,
    get_dataset_preview,
    get_dataset_summaries,
    prepare_datasets
)


router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"]
)


@router.get("")
def list_datasets(
    current_user: Student = Depends(get_current_user)
):
    return get_dataset_documentation()


@router.post("/prepare")
def prepare_dataset_files(
    current_user: Student = Depends(get_current_user)
):
    return prepare_datasets()


@router.get("/summary")
def dataset_summary(
    current_user: Student = Depends(get_current_user)
):
    return get_dataset_summaries()


@router.get("/{dataset_name}/preview")
def dataset_preview(
    dataset_name: str,
    current_user: Student = Depends(get_current_user)
):
    try:
        return get_dataset_preview(dataset_name)
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

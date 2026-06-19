from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.models.student import Student
from backend.auth.auth_handler import get_current_user
from backend.utils.security import hash_password, verify_password


router = APIRouter(
    prefix="/account",
    tags=["Account Settings"]
)


class UpdateProfileRequest(BaseModel):
    full_name: str
    email: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.get("/me")
def get_account(
    current_user: Student = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }


@router.put("/profile")
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    existing_email = (
        db.query(Student)
        .filter(Student.email == request.email)
        .filter(Student.id != current_user.id)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already in use"
        )

    current_user.full_name = request.full_name
    current_user.email = request.email

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }


@router.put("/password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    if not verify_password(
        request.current_password,
        current_user.password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters"
        )

    current_user.password = hash_password(request.new_password)

    db.commit()

    return {
        "message": "Password changed successfully"
    }

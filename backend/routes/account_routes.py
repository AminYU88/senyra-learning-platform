from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.student import Student
from backend.auth.auth_handler import (
    get_current_user,
    create_access_token,
    hash_password,
    verify_password,
)
from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/account",
    tags=["Account Settings"],
)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Literal["admin", "teacher", "student"]


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


def get_user_password_hash(user: Student) -> str | None:
    return (
        getattr(user, "password", None)
        or getattr(user, "password_hash", None)
        or getattr(user, "hashed_password", None)
    )


def set_user_password(user: Student, password: str) -> None:
    hashed = hash_password(password)

    if hasattr(user, "password"):
        user.password = hashed
    elif hasattr(user, "password_hash"):
        user.password_hash = hashed
    elif hasattr(user, "hashed_password"):
        user.hashed_password = hashed
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Student model has no password field",
        )


def user_to_dict(user: Student) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    }


def authenticate_user(db: Session, email: str, password: str) -> Student:
    user = db.query(Student).filter(Student.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    password_hash = get_user_password_hash(user)

    if not password_hash or not verify_password(password, password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return user


def build_login_response(user: Student) -> dict:
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_to_dict(user),
    }


@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db=db,
        email=request.email,
        password=request.password,
    )

    return build_login_response(user)


@router.post("/token")
def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db=db,
        email=form_data.username,
        password=form_data.password,
    )

    return build_login_response(user)


@router.get("/me")
def get_account(
    current_user: Student = Depends(get_current_user),
):
    return user_to_dict(current_user)


@router.post("/users")
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles("admin")),
):
    existing_user = db.query(Student).filter(Student.email == request.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already in use",
        )

    new_user = Student(
        full_name=request.full_name,
        email=request.email,
        role=request.role,
    )

    set_user_password(new_user, request.password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user": user_to_dict(new_user),
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles("admin")),
):
    user = db.query(Student).filter(Student.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin users cannot be deleted",
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
    }


@router.put("/profile")
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user),
):
    if request.email is not None:
        existing_email = (
            db.query(Student)
            .filter(Student.email == request.email)
            .filter(Student.id != current_user.id)
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use",
            )

        current_user.email = request.email

    if request.full_name is not None:
        current_user.full_name = request.full_name

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "user": user_to_dict(current_user),
    }


@router.put("/password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user),
):
    password_hash = get_user_password_hash(current_user)

    if not password_hash or not verify_password(request.current_password, password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters",
        )

    set_user_password(current_user, request.new_password)

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Password changed successfully",
    }


@router.post("/logout")
def logout():
    return {
        "message": "Logged out successfully. Please remove token on frontend.",
    }
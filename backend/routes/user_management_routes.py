from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.models.student import Student
from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/admin/users",
    tags=["Admin User Management"]
)


class UpdateUserRoleRequest(BaseModel):
    role: str


@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    users = db.query(Student).all()

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]


@router.put("/{user_id}/role")
def update_user_role(
    user_id: int,
    request: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    allowed_roles = [
        "student",
        "teacher",
        "admin"
    ]

    if request.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    user = (
        db.query(Student)
        .filter(Student.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.role = request.role

    db.commit()
    db.refresh(user)

    return {
        "message": "User role updated successfully",
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }
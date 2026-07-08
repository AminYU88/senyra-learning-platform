from fastapi import APIRouter, Depends
from backend.auth.role_checker import require_admin
from backend.models.student import Student

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_user: Student = Depends(require_admin)
):
    return {
        "message": "Admin dashboard access granted",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        }
    }


@router.get("/users")
def admin_users(
    current_user: Student = Depends(require_admin)
):
    return {
        "message": "Only admin can access user management"
    }
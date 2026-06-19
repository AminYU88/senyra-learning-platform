from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.audit_log import AuditLog
from backend.models.student import Student

from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/admin/audit-logs",
    tags=["Admin Audit Logs"]
)


@router.get("/")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(100)
        .all()
    )

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_role": log.user_role,
            "action": log.action,
            "description": log.description,
            "created_at": log.created_at
        }
        for log in logs
    ]
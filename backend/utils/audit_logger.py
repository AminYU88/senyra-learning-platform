from sqlalchemy.orm import Session

from backend.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user_id: int | None,
    user_role: str | None,
    action: str,
    description: str
):

    log = AuditLog(
        user_id=user_id,
        user_role=user_role,
        action=action,
        description=description
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log
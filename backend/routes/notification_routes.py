from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.notification import Notification

from backend.auth.auth_handler import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/me")
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": item.id,
            "title": item.title,
            "message": item.message,
            "notification_type": item.notification_type,
            "is_read": item.is_read,
            "created_at": item.created_at
        }
        for item in notifications
    ]


@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .filter(Notification.user_id == current_user.id)
        .first()
    )

    if not notification:
        return {
            "message": "Notification not found"
        }

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read"
    }


@router.put("/mark-all/read")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .filter(Notification.is_read == False)
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read"
    }
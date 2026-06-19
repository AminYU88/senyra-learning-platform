from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.models.student import Student
from backend.models.feedback_message import FeedbackMessage
from backend.models.class_group import ClassGroup, ClassEnrollment
from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/feedback",
    tags=["Teacher Student Feedback"]
)


class CreateFeedbackRequest(BaseModel):
    student_id: int
    subject: str
    message: str


def teacher_can_access_student(
    db: Session,
    teacher_id: int,
    student_id: int
):
    class_ids = [
        class_group.id
        for class_group in db.query(ClassGroup)
        .filter(ClassGroup.teacher_id == teacher_id)
        .all()
    ]

    enrolment = (
        db.query(ClassEnrollment)
        .filter(ClassEnrollment.class_id.in_(class_ids))
        .filter(ClassEnrollment.student_id == student_id)
        .first()
    )

    return enrolment is not None


@router.post("/")
def create_feedback(
    request: CreateFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):

    student = (
        db.query(Student)
        .filter(Student.id == request.student_id)
        .filter(Student.role == "student")
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    if current_user.role == "teacher":
        if not teacher_can_access_student(
            db=db,
            teacher_id=current_user.id,
            student_id=request.student_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only send feedback to students in your assigned class"
            )

    feedback = FeedbackMessage(
        student_id=request.student_id,
        teacher_id=current_user.id,
        subject=request.subject,
        message=request.message
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "message": "Feedback sent successfully",
        "id": feedback.id
    }


@router.get("/student/me")
def get_my_feedback(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    feedback_items = (
        db.query(FeedbackMessage)
        .filter(FeedbackMessage.student_id == current_user.id)
        .order_by(FeedbackMessage.created_at.desc())
        .all()
    )

    results = []

    for item in feedback_items:

        teacher = (
            db.query(Student)
            .filter(Student.id == item.teacher_id)
            .first()
        )

        results.append({
            "id": item.id,
            "subject": item.subject,
            "message": item.message,
            "teacher_name": teacher.full_name if teacher else "Unknown",
            "is_read": item.is_read,
            "created_at": item.created_at
        })

    return results


@router.get("/teacher/all")
def get_all_feedback(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):

    feedback_items = (
        db.query(FeedbackMessage)
        .order_by(FeedbackMessage.created_at.desc())
        .all()
    )

    results = []

    for item in feedback_items:

        student = (
            db.query(Student)
            .filter(Student.id == item.student_id)
            .first()
        )

        teacher = (
            db.query(Student)
            .filter(Student.id == item.teacher_id)
            .first()
        )

        results.append({
            "id": item.id,
            "student_name": student.full_name if student else "Unknown",
            "student_email": student.email if student else "Unknown",
            "teacher_name": teacher.full_name if teacher else "Unknown",
            "subject": item.subject,
            "message": item.message,
            "is_read": item.is_read,
            "created_at": item.created_at
        })

    return results


@router.put("/{feedback_id}/read")
def mark_feedback_as_read(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    feedback = (
        db.query(FeedbackMessage)
        .filter(FeedbackMessage.id == feedback_id)
        .filter(FeedbackMessage.student_id == current_user.id)
        .first()
    )

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )

    feedback.is_read = True

    db.commit()
    db.refresh(feedback)

    return {
        "message": "Feedback marked as read"
    }

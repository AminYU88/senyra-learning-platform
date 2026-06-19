from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.models.student import Student
from backend.models.class_group import ClassGroup, ClassEnrollment
from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/admin/classes",
    tags=["Admin Class Management"]
)


class CreateClassRequest(BaseModel):
    name: str
    teacher_id: int


class EnrolStudentRequest(BaseModel):
    class_id: int
    student_id: int


@router.post("/")
def create_class(
    request: CreateClassRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    teacher = (
        db.query(Student)
        .filter(Student.id == request.teacher_id)
        .filter(Student.role == "teacher")
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )

    class_group = ClassGroup(
        name=request.name,
        teacher_id=request.teacher_id
    )

    db.add(class_group)
    db.commit()
    db.refresh(class_group)

    return {
        "message": "Class created successfully",
        "id": class_group.id,
        "name": class_group.name
    }


@router.get("/")
def get_classes(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    classes = db.query(ClassGroup).all()

    results = []

    for class_group in classes:

        teacher = (
            db.query(Student)
            .filter(Student.id == class_group.teacher_id)
            .first()
        )

        student_count = (
            db.query(ClassEnrollment)
            .filter(ClassEnrollment.class_id == class_group.id)
            .count()
        )

        results.append({
            "id": class_group.id,
            "name": class_group.name,
            "teacher_id": class_group.teacher_id,
            "teacher_name": teacher.full_name if teacher else "Unknown",
            "student_count": student_count
        })

    return results


@router.post("/enrol")
def enrol_student(
    request: EnrolStudentRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["admin"]))
):

    class_group = (
        db.query(ClassGroup)
        .filter(ClassGroup.id == request.class_id)
        .first()
    )

    if not class_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )

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

    existing = (
        db.query(ClassEnrollment)
        .filter(ClassEnrollment.class_id == request.class_id)
        .filter(ClassEnrollment.student_id == request.student_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already enrolled in this class"
        )

    enrolment = ClassEnrollment(
        class_id=request.class_id,
        student_id=request.student_id
    )

    db.add(enrolment)
    db.commit()
    db.refresh(enrolment)

    return {
        "message": "Student enrolled successfully"
    }


@router.get("/users")
def get_class_users(
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
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.models.student import Student
from backend.models.student_note import StudentNote
from backend.models.class_group import ClassGroup, ClassEnrollment
from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/teacher/notes",
    tags=["Teacher Notes"]
)


class CreateStudentNoteRequest(BaseModel):
    student_id: int
    note: str
    action_taken: str | None = None


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
def create_student_note(
    request: CreateStudentNoteRequest,
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
                detail="You can only create notes for students in your assigned class"
            )

    note = StudentNote(
        student_id=request.student_id,
        teacher_id=current_user.id,
        note=request.note,
        action_taken=request.action_taken
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return {
        "message": "Student support note created successfully",
        "id": note.id
    }


@router.get("/")
def get_all_student_notes(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):

    notes = (
        db.query(StudentNote)
        .order_by(StudentNote.created_at.desc())
        .all()
    )

    results = []

    for note in notes:

        student = (
            db.query(Student)
            .filter(Student.id == note.student_id)
            .first()
        )

        teacher = (
            db.query(Student)
            .filter(Student.id == note.teacher_id)
            .first()
        )

        results.append({
            "id": note.id,
            "student_id": note.student_id,
            "student_name": student.full_name if student else "Unknown",
            "student_email": student.email if student else "Unknown",
            "teacher_id": note.teacher_id,
            "teacher_name": teacher.full_name if teacher else "Unknown",
            "note": note.note,
            "action_taken": note.action_taken,
            "created_at": note.created_at
        })

    return results


@router.get("/student/{student_id}")
def get_notes_for_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):

    notes = (
        db.query(StudentNote)
        .filter(StudentNote.student_id == student_id)
        .order_by(StudentNote.created_at.desc())
        .all()
    )

    return [
        {
            "id": note.id,
            "student_id": note.student_id,
            "teacher_id": note.teacher_id,
            "note": note.note,
            "action_taken": note.action_taken,
            "created_at": note.created_at
        }
        for note in notes
    ]

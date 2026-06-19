from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.models.student import Student
from backend.models.intervention_plan import InterventionPlan
from backend.models.class_group import ClassGroup, ClassEnrollment
from backend.auth.role_checker import require_roles


router = APIRouter(
    prefix="/teacher/interventions",
    tags=["Teacher Intervention Plans"]
)


class CreateInterventionRequest(BaseModel):
    student_id: int
    title: str
    target_area: str
    action_plan: str


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
def create_intervention_plan(
    request: CreateInterventionRequest,
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
                detail="You can only create intervention plans for your assigned students"
            )

    plan = InterventionPlan(
        student_id=request.student_id,
        teacher_id=current_user.id,
        title=request.title,
        target_area=request.target_area,
        action_plan=request.action_plan
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {
        "message": "Intervention plan created successfully",
        "id": plan.id
    }


@router.get("/")
def get_intervention_plans(
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):

    plans = (
        db.query(InterventionPlan)
        .order_by(InterventionPlan.created_at.desc())
        .all()
    )

    results = []

    for plan in plans:

        student = (
            db.query(Student)
            .filter(Student.id == plan.student_id)
            .first()
        )

        teacher = (
            db.query(Student)
            .filter(Student.id == plan.teacher_id)
            .first()
        )

        results.append({
            "id": plan.id,
            "student_id": plan.student_id,
            "student_name": student.full_name if student else "Unknown",
            "student_email": student.email if student else "Unknown",
            "teacher_name": teacher.full_name if teacher else "Unknown",
            "title": plan.title,
            "target_area": plan.target_area,
            "action_plan": plan.action_plan,
            "status": plan.status,
            "is_completed": plan.is_completed,
            "created_at": plan.created_at
        })

    return results


@router.put("/{plan_id}/complete")
def complete_intervention_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(require_roles(["teacher", "admin"]))
):

    plan = (
        db.query(InterventionPlan)
        .filter(InterventionPlan.id == plan_id)
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intervention plan not found"
        )

    plan.status = "Completed"
    plan.is_completed = True

    db.commit()
    db.refresh(plan)

    return {
        "message": "Intervention plan marked as completed"
    }

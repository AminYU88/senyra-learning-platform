from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.database.connection import get_db
from backend.models.student import Student
from backend.schemas.education_schema import (
    PracticeRequest,
    QuizGeneratorRequest,
    QuizResultCreate,
    StudyPlanRequest
)
from backend.services.education_service import (
    generate_flashcards,
    generate_practice,
    generate_quiz,
    generate_study_plan,
    get_education_analytics,
    get_recommendations,
    get_subjects,
    get_topics,
    record_quiz_result,
    seed_curriculum
)
from backend.services.learning_dna_service import get_profile_for_student


router = APIRouter(
    prefix="/education",
    tags=["UK Mathematics and English Education"]
)


@router.post("/seed")
def seed_education_curriculum(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return seed_curriculum(db)


@router.get("/subjects")
def list_subjects(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return get_subjects(db)


@router.get("/topics")
def list_topics(
    subject: str | None = None,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return get_topics(
        db,
        subject
    )


@router.post("/quiz-results")
def save_quiz_result(
    request: QuizResultCreate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return record_quiz_result(
        db,
        current_user,
        request.subject,
        request.topic,
        request.score
    )


@router.get("/analytics")
def education_analytics(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return get_education_analytics(
        db,
        current_user
    )


@router.get("/recommendations")
def education_recommendations(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return {
        "recommendations": get_recommendations(
            db,
            current_user
        )
    }


@router.post("/study-plan")
def create_study_plan(
    request: StudyPlanRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    profile = get_profile_for_student(db, current_user)

    return generate_study_plan(
        request.subject,
        request.topic,
        request.age_range,
        request.days,
        profile.learner_type if profile else None
    )


@router.post("/quiz-generator")
def create_quiz(
    request: QuizGeneratorRequest,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    profile = get_profile_for_student(db, current_user)

    return generate_quiz(
        request.subject,
        request.topic,
        request.curriculum_level,
        request.number_of_questions,
        request.question_type,
        profile.learner_type if profile else None
    )


@router.post("/flashcards")
def create_flashcards(
    request: PracticeRequest,
    current_user: Student = Depends(get_current_user)
):
    return generate_flashcards(
        request.subject,
        request.topic
    )


@router.post("/practice")
def create_practice(
    request: PracticeRequest,
    current_user: Student = Depends(get_current_user)
):
    return generate_practice(
        request.subject,
        request.topic,
        request.curriculum_level,
        request.age_range
    )

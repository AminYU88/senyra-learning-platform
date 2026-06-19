from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.course import Course
from backend.models.lesson import Lesson
from backend.models.student import Student

from backend.schemas.course_schema import (
    CourseCreate,
    CourseResponse
)

from backend.schemas.lesson_schema import (
    LessonCreate,
    LessonResponse
)

from backend.auth.auth_handler import get_current_user


router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


@router.post("/", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    new_course = Course(
        title=course.title,
        description=course.description,
        level=course.level
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


@router.get("/", response_model=list[CourseResponse])
def get_courses(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    courses = db.query(Course).all()

    return courses


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


@router.post("/lessons", response_model=LessonResponse)
def create_lesson(
    lesson: LessonCreate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    course = db.query(Course).filter(
        Course.id == lesson.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    new_lesson = Lesson(
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        course_id=lesson.course_id
    )

    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)

    return new_lesson


@router.get("/{course_id}/lessons", response_model=list[LessonResponse])
def get_course_lessons(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).all()

    return lessons
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.quiz import Quiz, Question, QuizAttempt
from backend.models.learning_event import LearningEvent

from backend.schemas.quiz_schema import (
    QuizCreate,
    QuestionCreate,
    QuizSubmit
)

from backend.auth.auth_handler import get_current_user


router = APIRouter(
    prefix="/quizzes",
    tags=["Quizzes"]
)


@router.post("/")
def create_quiz(
    quiz: QuizCreate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    new_quiz = Quiz(
        title=quiz.title,
        course_id=quiz.course_id
    )

    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    return new_quiz


@router.post("/questions")
def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    new_question = Question(
        quiz_id=question.quiz_id,
        question_text=question.question_text,
        option_a=question.option_a,
        option_b=question.option_b,
        option_c=question.option_c,
        option_d=question.option_d,
        correct_answer=question.correct_answer.upper()
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return new_question


@router.get("/course/{course_id}")
def get_course_quizzes(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    quizzes = db.query(Quiz).filter(
        Quiz.course_id == course_id
    ).all()

    return quizzes


@router.get("/{quiz_id}/questions")
def get_quiz_questions(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    questions = db.query(Question).filter(
        Question.quiz_id == quiz_id
    ).all()

    return questions


@router.post("/submit")
def submit_quiz(
    submission: QuizSubmit,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    questions = db.query(Question).filter(
        Question.quiz_id == submission.quiz_id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Quiz questions not found"
        )

    correct = 0

    for submitted_answer in submission.answers:

        question = db.query(Question).filter(
            Question.id == submitted_answer.question_id
        ).first()

        if question and submitted_answer.answer.upper() == question.correct_answer.upper():
            correct += 1

    score = round(
        (correct / len(questions)) * 100
    )

    attempt = QuizAttempt(
        student_id=current_user.id,
        quiz_id=submission.quiz_id,
        score=score
    )

    event = LearningEvent(
        student_id=current_user.id,
        event_type="quiz_attempt",
        event_value=f"Quiz score: {score}%"
    )

    db.add(attempt)
    db.add(event)
    db.commit()

    return {
        "message": "Quiz submitted successfully",
        "score": score,
        "correct_answers": correct,
        "total_questions": len(questions)
    }
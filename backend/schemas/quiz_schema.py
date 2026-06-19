from pydantic import BaseModel

from typing import List


class QuizCreate(BaseModel):

    title: str
    course_id: int


class QuestionCreate(BaseModel):

    quiz_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str


class AnswerSubmit(BaseModel):

    question_id: int
    answer: str


class QuizSubmit(BaseModel):

    quiz_id: int
    answers: List[AnswerSubmit]
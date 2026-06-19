from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime

from backend.database.connection import Base


class Quiz(Base):

    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )


class Question(Base):

    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    quiz_id = Column(
        Integer,
        ForeignKey("quizzes.id"),
        nullable=False
    )

    question_text = Column(String, nullable=False)

    option_a = Column(String, nullable=False)

    option_b = Column(String, nullable=False)

    option_c = Column(String, nullable=False)

    option_d = Column(String, nullable=False)

    correct_answer = Column(String, nullable=False)


class QuizAttempt(Base):

    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    quiz_id = Column(
        Integer,
        ForeignKey("quizzes.id"),
        nullable=False
    )

    score = Column(Integer, nullable=False)

    attempted_at = Column(
        DateTime,
        default=datetime.utcnow
    )
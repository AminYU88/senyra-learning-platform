from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class Course(Base):

    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    description = Column(Text, nullable=True)

    level = Column(String, default="Beginner")

    lessons = relationship(
        "Lesson",
        back_populates="course",
        cascade="all, delete"
    )
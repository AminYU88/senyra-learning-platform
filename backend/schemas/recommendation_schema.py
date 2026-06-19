from pydantic import BaseModel


class StudentRecommendationResponse(BaseModel):
    student_id: int
    weak_topics: list[str]
    suggested_revision: list[str]
    recommended_quizzes: list[str]
    recommended_study_plan: list[str]

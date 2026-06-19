from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db

from backend.models.student import Student
from backend.models.learning_event import LearningEvent
from backend.models.quiz import QuizAttempt
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.education import WeakTopic, SubjectQuizResult
from backend.models.learning_dna_model import LearningDNAProfile

from backend.auth.auth_handler import get_current_user
from backend.auth.role_checker import require_roles
from backend.services.learning_dna_service import build_learning_dna_recommendations


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)


@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):

    events = db.query(LearningEvent).filter(
        LearningEvent.student_id == current_user.id
    ).all()

    video_count = len([
        event for event in events
        if event.event_type == "video_watch"
    ])

    quiz_count = len([
        event for event in events
        if event.event_type == "quiz_attempt"
    ])

    practice_count = len([
        event for event in events
        if event.event_type == "coding_practice"
    ])

    total_events = len(events)

    engagement_score = min(
        total_events * 10,
        100
    )

    quiz_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == current_user.id
    ).all()

    average_quiz_score = 0

    if len(quiz_attempts) > 0:
        average_quiz_score = round(
            sum(attempt.score for attempt in quiz_attempts) / len(quiz_attempts),
            2
        )

    total_lessons = db.query(Lesson).count()

    completed_lessons = db.query(LessonProgress).filter(
        LessonProgress.student_id == current_user.id
    ).count()

    lesson_progress = 0

    if total_lessons > 0:
        lesson_progress = round(
            (completed_lessons / total_lessons) * 100,
            2
        )

    recommendations = []
    learning_dna = build_learning_dna_recommendations(
        db,
        current_user
    )

    if engagement_score < 40:
        recommendations.append(
            "Increase weekly learning activity to improve engagement."
        )

    if lesson_progress < 50:
        recommendations.append(
            "Your lesson progress is low. Complete more course lessons."
        )

    if average_quiz_score == 0:
        recommendations.append(
            "Attempt quizzes to measure your understanding."
        )

    elif average_quiz_score < 50:
        recommendations.append(
            "Your quiz score is low. Revise the lesson content and retry the quiz."
        )

    elif average_quiz_score >= 80:
        recommendations.append(
            "Your quiz performance is excellent. Continue with advanced lessons."
        )

    if practice_count < 2:
        recommendations.append(
            "Complete more coding practice tasks to improve practical skills."
        )

    if video_count < 3:
        recommendations.append(
            "Watch more learning videos to strengthen your understanding."
        )

    if engagement_score >= 80 and average_quiz_score >= 80 and lesson_progress >= 80:
        recommendations.append(
            "Excellent progress. You are ready for more challenging learning content."
        )

    if learning_dna["learner_type"] != "Not assessed":
        recommendations.extend(learning_dna["recommendations"])

    return {
        "student": current_user.full_name,
        "total_events": total_events,
        "engagement_score": engagement_score,
        "average_quiz_score": average_quiz_score,
        "lesson_progress": lesson_progress,
        "recommendations": recommendations,
        "learning_dna": learning_dna
    }


@router.get("/student/{student_id}")
def get_student_recommendations(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    if current_user.role not in ["admin", "teacher"] and current_user.id != student_id:
        return {
            "student_id": student_id,
            "weak_topics": [],
            "suggested_revision": ["You do not have permission to view this student's recommendations."],
            "recommended_quizzes": [],
            "recommended_study_plan": []
        }

    weak_topics = (
        db.query(WeakTopic)
        .filter(WeakTopic.student_id == student_id)
        .order_by(WeakTopic.detected_at.desc())
        .limit(5)
        .all()
    )

    quiz_results = (
        db.query(SubjectQuizResult)
        .filter(SubjectQuizResult.student_id == student_id)
        .all()
    )

    weak_topic_names = [
        f"{item.subject}: {item.topic}"
        for item in weak_topics
    ]

    for result in quiz_results:
        if result.score < 60:
            label = f"{result.subject}: {result.topic}"
            if label not in weak_topic_names:
                weak_topic_names.append(label)

    if not weak_topic_names:
        weak_topic_names = ["No weak topics recorded yet"]

    profile = (
        db.query(LearningDNAProfile)
        .filter(LearningDNAProfile.student_id == student_id)
        .first()
    )

    learner_type = profile.learner_type if profile else "Not assessed"

    suggested_revision = [
        f"Revise {topic} with active recall, worked examples and correction tasks."
        for topic in weak_topic_names
    ]

    recommended_quizzes = [
        f"Generate a 10-question quiz for {topic}."
        for topic in weak_topic_names
    ]

    recommended_study_plan = [
        "Day 1: Review notes and identify mistakes.",
        "Day 2: Complete guided practice.",
        "Day 3: Complete timed exam-style questions.",
        "Day 4: Mark answers and create flashcards.",
        "Day 5: Redo weak questions without notes."
    ]

    learning_dna_recommendations = []

    if learner_type != "Not assessed":
        learning_dna_recommendations = build_learning_dna_recommendations(
            db,
            db.query(Student).filter(Student.id == student_id).first()
        )["recommendations"]

        suggested_revision.extend(learning_dna_recommendations)

        if learner_type == "Analytical Learner":
            recommended_quizzes.append("Use medium-to-hard structured quizzes with worked examples.")
            recommended_study_plan.append("Add structured notes and step-by-step review after each session.")
        elif learner_type == "Creative Learner":
            recommended_quizzes.append("Use mixed MCQ and open-ended scenario questions.")
            recommended_study_plan.append("Add brainstorming and open-ended challenge tasks.")
        elif learner_type == "Visual Learner":
            recommended_quizzes.append("Use diagram-based prompts and visual explanation questions.")
            recommended_study_plan.append("Add mind maps, videos and visual summaries.")
        elif learner_type == "Problem Solver":
            recommended_quizzes.append("Use challenge questions and timed problem-solving tasks.")
            recommended_study_plan.append("Add timed practice problems and correction cycles.")
        elif learner_type == "Exploratory Learner":
            recommended_quizzes.append("Use project-based and scenario-led questions.")
            recommended_study_plan.append("Add discovery tasks and varied learning resources.")

    return {
        "student_id": student_id,
        "learner_type": learner_type,
        "weak_topics": weak_topic_names,
        "suggested_revision": suggested_revision,
        "recommended_quizzes": recommended_quizzes,
        "recommended_study_plan": recommended_study_plan,
        "learning_dna_recommendations": learning_dna_recommendations
    }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import engine, Base
from backend.config.settings import CORS_ORIGINS


# ==========================
# MODELS
# ==========================

from backend.models.student import Student
from backend.models.learning_event import LearningEvent
from backend.models.course import Course
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import Quiz, Question, QuizAttempt
from backend.models.audit_log import AuditLog
from backend.models.notification import Notification
from backend.models.recommendation_history import RecommendationHistory
from backend.models.student_note import StudentNote
from backend.models.intervention_plan import InterventionPlan
from backend.models.feedback_message import FeedbackMessage
from backend.models.class_group import ClassGroup, ClassEnrollment
from backend.models.chat import ChatSession, ChatMessage
from backend.models.education import Subject, Topic, SubjectQuizResult, WeakTopic
from backend.models.creativity_model import CreativityAssessment, CreativityResponse
from backend.models.learning_dna_model import (
    LearningDNAProfile,
    LearningDNAQuestionnaireResponse,
)
from backend.models.flow_model import FlowSession, FlowSummary


# ==========================
# ROUTES
# ==========================

from backend.routes.account_routes import router as account_router
from backend.routes.student_routes import router as student_router
from backend.routes.learning_event_routes import router as event_router
from backend.routes.analytics_routes import router as analytics_router
from backend.routes.recommendation_routes import router as recommendation_router
from backend.routes.dashboard_routes import router as dashboard_router
from backend.routes.ml_routes import router as ml_router
from backend.routes.admin_routes import router as admin_router
from backend.routes.teacher_routes import router as teacher_router
from backend.routes.course_routes import router as course_router
from backend.routes.progress_routes import router as progress_router
from backend.routes.quiz_routes import router as quiz_router
from backend.routes.quiz_history_routes import router as quiz_history_router
from backend.routes.certificate_routes import router as certificate_router
from backend.routes.leaderboard_routes import router as leaderboard_router
from backend.routes.learning_path_routes import router as learning_path_router
from backend.routes.achievement_routes import router as achievement_router
from backend.routes.admin_achievement_routes import router as admin_achievement_router
from backend.routes.report_routes import router as report_router
from backend.routes.audit_routes import router as audit_router
from backend.routes.notification_routes import router as notification_router
from backend.routes.recommendation_history_routes import (
    router as recommendation_history_router,
)
from backend.routes.user_management_routes import router as user_management_router
from backend.routes.teacher_note_routes import router as teacher_note_router
from backend.routes.intervention_routes import router as intervention_router
from backend.routes.feedback_routes import router as feedback_router
from backend.routes.class_routes import router as class_router
from backend.routes.admin_analytics_routes import router as admin_analytics_router
from backend.routes.chatbot_routes import router as chatbot_router
from backend.routes.education_routes import router as education_router
from backend.routes.dataset_routes import router as dataset_router
from backend.routes.creativity_routes import router as creativity_router
from backend.routes.learning_dna_routes import router as learning_dna_router
from backend.routes.flow_routes import router as flow_router
from backend.routes.cognitive_risk_routes import router as cognitive_risk_router
from backend.routes.weak_topic_routes import router as weak_topic_router
from backend.routes.explainable_ai_routes import router as explainable_ai_router


# ==========================
# APP CONFIG
# ==========================

APP_NAME = "Senyra Learning Platform API"
APP_VERSION = "3.1.0"


def create_app() -> FastAPI:
    app = FastAPI(
        title=APP_NAME,
        description="AI Powered Learning Analytics and Course Management Platform",
        version=APP_VERSION,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    routers = [
        account_router,
        student_router,
        event_router,
        analytics_router,
        recommendation_router,
        dashboard_router,
        ml_router,
        admin_router,
        teacher_router,
        course_router,
        progress_router,
        quiz_router,
        quiz_history_router,
        certificate_router,
        leaderboard_router,
        learning_path_router,
        achievement_router,
        admin_achievement_router,
        report_router,
        audit_router,
        notification_router,
        recommendation_history_router,
        user_management_router,
        teacher_note_router,
        intervention_router,
        feedback_router,
        class_router,
        admin_analytics_router,
        chatbot_router,
        education_router,
        dataset_router,
        creativity_router,
        learning_dna_router,
        flow_router,
        cognitive_risk_router,
        weak_topic_router,
        explainable_ai_router,
    ]

    for router in routers:
        app.include_router(router)

    @app.get("/")
    def home():
        return {
            "message": "Senyra Backend Running Successfully",
            "status": "online",
            "version": APP_VERSION,
            "docs": "/docs",
            "health": "/health",
        }

    @app.get("/health")
    def health():
        return {
            "status": "healthy",
            "service": APP_NAME,
            "version": APP_VERSION,
        }

    return app


# ==========================
# DATABASE TABLE CREATION
# ==========================

Base.metadata.create_all(bind=engine)


app = create_app()
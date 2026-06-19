from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import (
    engine,
    Base
)
from backend.config.settings import CORS_ORIGINS

# ==========================
# MODELS
# ==========================

from backend.models.student import Student

from backend.models.learning_event import LearningEvent

from backend.models.course import Course

from backend.models.lesson import Lesson

from backend.models.lesson_progress import LessonProgress

from backend.models.quiz import (
    Quiz,
    Question,
    QuizAttempt
)

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

from backend.models.learning_dna_model import LearningDNAProfile, LearningDNAQuestionnaireResponse

from backend.models.flow_model import FlowSession, FlowSummary

# ==========================
# ROUTES
# ==========================

from backend.routes.student_routes import (
    router as student_router
)

from backend.routes.learning_event_routes import (
    router as event_router
)

from backend.routes.analytics_routes import (
    router as analytics_router
)

from backend.routes.recommendation_routes import (
    router as recommendation_router
)

from backend.routes.dashboard_routes import (
    router as dashboard_router
)

from backend.routes.ml_routes import (
    router as ml_router
)

from backend.routes.admin_routes import (
    router as admin_router
)

from backend.routes.course_routes import (
    router as course_router
)

from backend.routes.progress_routes import (
    router as progress_router
)

from backend.routes.quiz_routes import (
    router as quiz_router
)

from backend.routes.quiz_history_routes import (
    router as quiz_history_router
)

from backend.routes.certificate_routes import (
    router as certificate_router
)

from backend.routes.leaderboard_routes import (
    router as leaderboard_router
)

from backend.routes.learning_path_routes import (
    router as learning_path_router
)

from backend.routes.achievement_routes import (
    router as achievement_router
)

from backend.routes.admin_achievement_routes import (
    router as admin_achievement_router
)

from backend.routes.report_routes import (
    router as report_router
)

from backend.routes.teacher_routes import (
    router as teacher_router
)

from backend.routes.audit_routes import (
    router as audit_router
)

from backend.routes.notification_routes import (
    router as notification_router
)

from backend.routes.recommendation_history_routes import (
    router as recommendation_history_router
)

from backend.routes.account_routes import (
    router as account_router
)

from backend.routes.user_management_routes import (
    router as user_management_router
)

from backend.routes.teacher_note_routes import (
    router as teacher_note_router
)

from backend.routes.intervention_routes import (
    router as intervention_router
)

from backend.routes.feedback_routes import (
    router as feedback_router
)

from backend.routes.class_routes import (
    router as class_router
)

from backend.routes.admin_analytics_routes import (
    router as admin_analytics_router
)

from backend.routes.chatbot_routes import (
    router as chatbot_router
)

from backend.routes.education_routes import (
    router as education_router
)

from backend.routes.dataset_routes import (
    router as dataset_router
)

from backend.routes.creativity_routes import (
    router as creativity_router
)

from backend.routes.learning_dna_routes import (
    router as learning_dna_router
)

from backend.routes.flow_routes import (
    router as flow_router
)

from backend.routes.cognitive_risk_routes import (
    router as cognitive_risk_router
)

from backend.routes.weak_topic_routes import (
    router as weak_topic_router
)

from backend.routes.explainable_ai_routes import (
    router as explainable_ai_router
)

# ==========================
# DATABASE TABLE CREATION
# ==========================

Base.metadata.create_all(bind=engine)

# ==========================
# FASTAPI APP
# ==========================

app = FastAPI(
    title="Senyra Learning Platform API",
    description="AI Powered Learning Analytics and Course Management Platform",
    version="3.1.0"
)

# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# ROUTERS
# ==========================

app.include_router(student_router)

app.include_router(event_router)

app.include_router(analytics_router)

app.include_router(recommendation_router)

app.include_router(dashboard_router)

app.include_router(ml_router)

app.include_router(admin_router)

app.include_router(course_router)

app.include_router(progress_router)

app.include_router(quiz_router)

app.include_router(quiz_history_router)

app.include_router(certificate_router)

app.include_router(leaderboard_router)

app.include_router(learning_path_router)

app.include_router(achievement_router)

app.include_router(admin_achievement_router)

app.include_router(report_router)

app.include_router(teacher_router)

app.include_router(audit_router)

app.include_router(notification_router)

app.include_router(recommendation_history_router)

app.include_router(account_router)

app.include_router(user_management_router)

app.include_router(teacher_note_router)

app.include_router(intervention_router)

app.include_router(feedback_router)

app.include_router(class_router)

app.include_router(admin_analytics_router)

app.include_router(chatbot_router)

app.include_router(education_router)

app.include_router(dataset_router)

app.include_router(creativity_router)

app.include_router(learning_dna_router)

app.include_router(flow_router)

app.include_router(cognitive_risk_router)

app.include_router(weak_topic_router)

app.include_router(explainable_ai_router)

# ==========================
# ROOT ENDPOINT
# ==========================

@app.get("/")
def home():

    return {
        "message": "Senyra Backend Running Successfully",
        "status": "online",
        "version": "3.1.0",
        "features": [
            "Student authentication",
            "Learning event tracking",
            "AI recommendations",
            "ML risk prediction",
            "Admin monitoring",
            "Course management",
            "Lesson completion tracking",
            "Real progress percentage",
            "Quiz system",
            "Quiz history",
            "Quiz analytics",
            "Lesson analytics",
            "Certificate eligibility",
            "Course completion certificate",
            "Student leaderboard",
            "Gamified learning ranking",
            "AI learning path generator",
            "Achievement system",
            "Admin achievement monitoring",
            "Admin CSV report export",
            "Teacher progress monitoring",
            "Admin audit logging",
            "Notification system",
            "AI recommendation history and feedback",
            "Account settings and password management",
            "Admin user and role management",
            "Teacher student support notes",
            "Teacher intervention plans",
            "Teacher student feedback messages",
            "Class groups and teacher assigned students",
            "Teacher class-restricted access control",
            "Advanced admin analytics dashboard"
        ],
        "docs": "/docs"
    }

# ==========================
# HEALTH CHECK
# ==========================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "Senyra Learning Platform API"
    }

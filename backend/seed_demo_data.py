import sys
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.database.connection import Base, SessionLocal, engine
from backend.models.class_group import ClassEnrollment, ClassGroup
from backend.models.course import Course
from backend.models.creativity_model import CreativityAssessment, CreativityResponse
from backend.models.education import SubjectQuizResult, WeakTopic
from backend.models.feedback_message import FeedbackMessage
from backend.models.flow_model import FlowSession, FlowSummary
from backend.models.intervention_plan import InterventionPlan
from backend.models.learning_dna_model import LearningDNAProfile, LearningDNAQuestionnaireResponse
from backend.models.learning_event import LearningEvent
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import Question, Quiz, QuizAttempt
from backend.models.recommendation_history import RecommendationHistory
from backend.models.student import Student
from backend.utils.security import hash_password


DEMO_USERS = [
    ("Admin User", "admin@senyra.com", "Admin123!", "admin"),
    ("Teacher User", "teacher@senyra.com", "Teacher123!", "teacher"),
    ("Amina Rahman", "student@senyra.com", "Student123!", "student"),
    ("Leo Carter", "leo.student@senyra.com", "Student123!", "student"),
    ("Maya Patel", "maya.student@senyra.com", "Student123!", "student"),
    ("Noah Williams", "noah.student@senyra.com", "Student123!", "student")
]

COURSES = [
    ("Mathematics", "Algebra, ratio, graphs and exam problem solving.", "GCSE"),
    ("English Language", "Reading, writing, vocabulary and inference.", "GCSE"),
    ("Computer Science", "Programming, algorithms, SQL and cyber security.", "GCSE")
]

LESSONS = {
    "Mathematics": ["Linear equations", "Ratio and proportion", "Quadratic graphs", "Probability"],
    "English Language": ["Inference skills", "Creative writing", "Language analysis", "Transactional writing"],
    "Computer Science": ["Python functions", "SQL queries", "Network security", "Algorithms"]
}

QUIZ_TOPICS = [
    ("Mathematics", "Linear equations"),
    ("Mathematics", "Probability"),
    ("English Language", "Inference skills"),
    ("Computer Science", "Python functions")
]


def upsert_user(db, full_name, email, password, role):
    user = db.query(Student).filter(Student.email == email).first()

    if user:
        user.full_name = full_name
        user.password = hash_password(password)
        user.role = role
        return user

    user = Student(
        full_name=full_name,
        email=email,
        password=hash_password(password),
        role=role
    )
    db.add(user)
    db.flush()
    return user


def delete_demo_student_data(db, student_ids, teacher_id):
    if not student_ids:
        return

    assessment_ids = [
        item.id
        for item in db.query(CreativityAssessment.id)
        .filter(CreativityAssessment.student_id.in_(student_ids))
        .all()
    ]

    if assessment_ids:
        db.query(CreativityResponse).filter(CreativityResponse.assessment_id.in_(assessment_ids)).delete(synchronize_session=False)

    db.query(CreativityAssessment).filter(CreativityAssessment.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(FlowSummary).filter(FlowSummary.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(FlowSession).filter(FlowSession.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(LearningDNAQuestionnaireResponse).filter(LearningDNAQuestionnaireResponse.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(LearningDNAProfile).filter(LearningDNAProfile.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(WeakTopic).filter(WeakTopic.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(SubjectQuizResult).filter(SubjectQuizResult.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(QuizAttempt).filter(QuizAttempt.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(LessonProgress).filter(LessonProgress.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(LearningEvent).filter(LearningEvent.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(RecommendationHistory).filter(RecommendationHistory.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(FeedbackMessage).filter(FeedbackMessage.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(InterventionPlan).filter(InterventionPlan.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(ClassEnrollment).filter(ClassEnrollment.student_id.in_(student_ids)).delete(synchronize_session=False)
    db.query(ClassGroup).filter(ClassGroup.name == "Senyra Demo Class").filter(ClassGroup.teacher_id == teacher_id).delete(synchronize_session=False)


def ensure_courses_lessons_quizzes(db):
    course_lookup = {}
    lesson_lookup = {}
    quiz_lookup = {}

    for title, description, level in COURSES:
        course = db.query(Course).filter(Course.title == title).first()
        if not course:
            course = Course(title=title, description=description, level=level)
            db.add(course)
            db.flush()
        course_lookup[title] = course

        for lesson_title in LESSONS[title]:
            lesson = (
                db.query(Lesson)
                .filter(Lesson.course_id == course.id)
                .filter(Lesson.title == lesson_title)
                .first()
            )
            if not lesson:
                lesson = Lesson(
                    title=lesson_title,
                    content=f"Demo lesson content for {lesson_title}.",
                    video_url="https://example.com/senyra-demo",
                    course_id=course.id
                )
                db.add(lesson)
                db.flush()
            lesson_lookup[(title, lesson_title)] = lesson

        quiz = db.query(Quiz).filter(Quiz.course_id == course.id).filter(Quiz.title == f"{title} Checkpoint").first()
        if not quiz:
            quiz = Quiz(title=f"{title} Checkpoint", course_id=course.id)
            db.add(quiz)
            db.flush()
            db.add(Question(
                quiz_id=quiz.id,
                question_text=f"What is one key idea from {title}?",
                option_a="A relevant concept",
                option_b="An unrelated fact",
                option_c="A random answer",
                option_d="None of the above",
                correct_answer="A"
            ))
        quiz_lookup[title] = quiz

    return course_lookup, lesson_lookup, quiz_lookup


def seed_student_learning(db, student, index, lesson_lookup, quiz_lookup):
    now = datetime.utcnow()
    profiles = [
        ("Visual Learner", 86, 70, 74, 92, 66, 62),
        ("Analytical Learner", 78, 88, 61, 57, 84, 58),
        ("Creative Learner", 82, 62, 91, 68, 70, 80),
        ("Problem Solver", 74, 76, 64, 58, 90, 63)
    ]
    score_sets = [
        [82, 88, 76, 91],
        [62, 68, 58, 71],
        [93, 86, 89, 84],
        [49, 55, 61, 57]
    ]
    flow_scores = [
        [78, 84, 81],
        [48, 55, 61],
        [86, 90, 88],
        [39, 46, 52]
    ]
    event_types = ["video_watch", "quiz_attempt", "coding_practice", "lesson_complete", "resource_view"]
    event_count = [18, 10, 22, 7][index]
    scores = score_sets[index]

    for day_offset in range(event_count):
        db.add(LearningEvent(
            student_id=student.id,
            event_type=event_types[day_offset % len(event_types)],
            event_value=f"demo-event-{day_offset + 1}",
            timestamp=now - timedelta(days=day_offset % 12, hours=day_offset % 5)
        ))

    all_lessons = list(lesson_lookup.values())
    completed_count = [9, 5, 11, 3][index]
    for lesson in all_lessons[:completed_count]:
        db.add(LessonProgress(
            student_id=student.id,
            lesson_id=lesson.id,
            completed_at=now - timedelta(days=index + lesson.id % 9)
        ))

    for attempt_index, (subject, topic) in enumerate(QUIZ_TOPICS):
        score = scores[attempt_index]
        db.add(QuizAttempt(
            student_id=student.id,
            quiz_id=quiz_lookup[subject].id,
            score=score,
            attempted_at=now - timedelta(days=8 - attempt_index)
        ))
        db.add(SubjectQuizResult(
            student_id=student.id,
            subject=subject,
            topic=topic,
            score=score,
            taken_at=now - timedelta(days=8 - attempt_index)
        ))

    weak_topic_templates = [
        [("Mathematics", "Probability", 0.42)],
        [("English Language", "Inference skills", 0.72), ("Mathematics", "Linear equations", 0.61)],
        [("Computer Science", "SQL queries", 0.36)],
        [("Mathematics", "Linear equations", 0.81), ("Computer Science", "Python functions", 0.69)]
    ]
    for subject, topic, confidence in weak_topic_templates[index]:
        db.add(WeakTopic(
            student_id=student.id,
            subject=subject,
            topic=topic,
            confidence_level=confidence,
            detected_at=now - timedelta(days=index + 1)
        ))

    learner_type, confidence, analytical, creative, visual, problem_solver, exploratory = profiles[index]
    db.add(LearningDNAProfile(
        student_id=student.id,
        learner_type=learner_type,
        confidence_score=confidence,
        analytical_score=analytical,
        creative_score=creative,
        visual_score=visual,
        problem_solver_score=problem_solver,
        exploratory_score=exploratory,
        created_at=now - timedelta(days=20),
        updated_at=now - timedelta(days=2)
    ))

    creativity_score = [76, 54, 88, 43][index]
    assessment = CreativityAssessment(
        student_id=student.id,
        assessment_type="demo_creativity",
        creativity_score=creativity_score,
        fluency_score=max(35, creativity_score - 4),
        flexibility_score=max(35, creativity_score + 2),
        originality_score=max(35, creativity_score - 1),
        elaboration_score=max(35, creativity_score + 4),
        creative_confidence="High" if creativity_score >= 75 else "Developing" if creativity_score >= 50 else "Emerging",
        problem_solving_style=["Divergent Explorer", "Structured Starter", "Detailed Developer", "Structured Starter"][index],
        created_at=now - timedelta(days=6)
    )
    db.add(assessment)
    db.flush()
    db.add(CreativityResponse(
        assessment_id=assessment.id,
        prompt="Design a better revision routine.",
        response_text="Use timed practice, mistake logs and short reflective reviews.",
        score=creativity_score,
        feedback="Demo feedback generated from realistic learner response quality."
    ))

    for session_index, score in enumerate(flow_scores[index]):
        started = now - timedelta(days=10 - session_index, hours=2 + index)
        db.add(FlowSession(
            student_id=student.id,
            started_at=started,
            ended_at=started + timedelta(minutes=35 + session_index * 10),
            duration_minutes=35 + session_index * 10,
            activity_type="focused_study",
            subject=QUIZ_TOPICS[session_index][0],
            topic=QUIZ_TOPICS[session_index][1],
            completed_task=score >= 55,
            quiz_score=scores[min(session_index, len(scores) - 1)],
            resource_views=3 + session_index,
            engagement_events=4 + session_index,
            flow_score=score
        ))

    db.add(FlowSummary(
        student_id=student.id,
        average_flow_score=round(sum(flow_scores[index]) / len(flow_scores[index]), 2),
        best_time_start=["09:00", "16:00", "10:00", "18:00"][index],
        best_time_end=["11:00", "18:00", "12:00", "20:00"][index],
        strongest_subject=["Mathematics", "Computer Science", "English Language", "Mathematics"][index],
        weakest_subject=["English Language", "Mathematics", "Computer Science", "Computer Science"][index],
        updated_at=now - timedelta(days=1)
    ))

    recommendations = [
        "Use active recall for your weakest topic before the next quiz.",
        "Schedule difficult topics during your strongest flow window.",
        "Review incorrect answers and retry a short checkpoint quiz."
    ]
    for recommendation in recommendations:
        db.add(RecommendationHistory(
            student_id=student.id,
            recommendation=recommendation,
            reason="Demo AI learning analytics",
            is_helpful=None,
            created_at=now - timedelta(days=index)
        ))


def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        users = {
            email: upsert_user(db, full_name, email, password, role)
            for full_name, email, password, role in DEMO_USERS
        }
        db.flush()

        teacher = users["teacher@senyra.com"]
        demo_students = [
            users["student@senyra.com"],
            users["leo.student@senyra.com"],
            users["maya.student@senyra.com"],
            users["noah.student@senyra.com"]
        ]

        delete_demo_student_data(db, [student.id for student in demo_students], teacher.id)
        _, lesson_lookup, quiz_lookup = ensure_courses_lessons_quizzes(db)

        class_group = ClassGroup(name="Senyra Demo Class", teacher_id=teacher.id)
        db.add(class_group)
        db.flush()

        for student in demo_students:
            db.add(ClassEnrollment(class_id=class_group.id, student_id=student.id))

        for index, student in enumerate(demo_students):
            seed_student_learning(db, student, index, lesson_lookup, quiz_lookup)

        db.add(InterventionPlan(
            student_id=demo_students[1].id,
            teacher_id=teacher.id,
            title="Inference and quiz-confidence support",
            target_area="English inference and quiz correction",
            action_plan="Run two short inference drills, review mistakes, and retest with a five-question quiz.",
            status="Open",
            is_completed=False,
            created_at=datetime.utcnow() - timedelta(days=2)
        ))
        db.add(FeedbackMessage(
            student_id=demo_students[1].id,
            teacher_id=teacher.id,
            subject="Quiz improvement",
            message="Focus on correcting two missed concepts before attempting the next checkpoint.",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(days=1)
        ))

        db.commit()
        print("Senyra demo data seeded successfully.")
        print("Admin:   admin@senyra.com / Admin123!")
        print("Teacher: teacher@senyra.com / Teacher123!")
        print("Student: student@senyra.com / Student123!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()

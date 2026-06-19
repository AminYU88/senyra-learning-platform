from collections import defaultdict
from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from backend.models.education import Subject, SubjectQuizResult, Topic, WeakTopic
from backend.models.learning_event import LearningEvent
from backend.models.quiz import QuizAttempt
from backend.models.student import Student
from backend.services.learning_dna_service import (
    QUIZ_DIFFICULTY_GUIDANCE,
    PLANNER_GUIDANCE
)


BASE_DIR = Path(__file__).resolve().parents[2]
CURRICULUM_PATH = BASE_DIR / "datasets" / "uk_math_english_curriculum.csv"


def load_curriculum_rows() -> list[dict]:
    df = pd.read_csv(CURRICULUM_PATH)
    return df.fillna("").to_dict(orient="records")


def seed_curriculum(db: Session) -> dict:
    rows = load_curriculum_rows()
    created_subjects = 0
    created_topics = 0

    for row in rows:
        subject = (
            db.query(Subject)
            .filter(Subject.name == row["subject"])
            .first()
        )

        if not subject:
            subject = Subject(
                name=row["subject"],
                description=f"UK curriculum support for {row['subject']} learners aged 12-25."
            )
            db.add(subject)
            db.commit()
            db.refresh(subject)
            created_subjects += 1

        existing_topic = (
            db.query(Topic)
            .filter(Topic.subject_id == subject.id)
            .filter(Topic.name == row["topic"])
            .filter(Topic.curriculum_level == row["curriculum_level"])
            .first()
        )

        if not existing_topic:
            db.add(
                Topic(
                    name=row["topic"],
                    subject_id=subject.id,
                    difficulty_level=row["difficulty_level"],
                    curriculum_level=row["curriculum_level"],
                    age_range=row["age_range"],
                    description=row["description"]
                )
            )
            created_topics += 1

    db.commit()

    return {
        "created_subjects": created_subjects,
        "created_topics": created_topics,
        "total_rows": len(rows)
    }


def get_subjects(db: Session) -> list[dict]:
    if db.query(Subject).count() == 0:
        seed_curriculum(db)

    subjects = db.query(Subject).order_by(Subject.name.asc()).all()

    return [
        {
            "id": subject.id,
            "name": subject.name,
            "description": subject.description
        }
        for subject in subjects
    ]


def get_topics(
    db: Session,
    subject_name: str | None = None
) -> list[dict]:
    if db.query(Topic).count() == 0:
        seed_curriculum(db)

    query = db.query(Topic).join(Subject)

    if subject_name:
        query = query.filter(Subject.name == subject_name)

    topics = query.order_by(Subject.name.asc(), Topic.curriculum_level.asc(), Topic.name.asc()).all()

    return [
        {
            "id": topic.id,
            "subject": topic.subject.name,
            "name": topic.name,
            "difficulty_level": topic.difficulty_level,
            "curriculum_level": topic.curriculum_level,
            "age_range": topic.age_range,
            "description": topic.description
        }
        for topic in topics
    ]


def record_quiz_result(
    db: Session,
    student: Student,
    subject: str,
    topic: str,
    score: float
) -> dict:
    result = SubjectQuizResult(
        student_id=student.id,
        subject=subject,
        topic=topic,
        score=score
    )
    db.add(result)

    if score < 60:
        confidence = max(0, min(100, score))
        db.add(
            WeakTopic(
                student_id=student.id,
                subject=subject,
                topic=topic,
                confidence_level=confidence
            )
        )

    db.commit()

    return {
        "message": "Quiz result saved",
        "subject": subject,
        "topic": topic,
        "score": score
    }


def get_education_analytics(
    db: Session,
    student: Student
) -> dict:
    results = (
        db.query(SubjectQuizResult)
        .filter(SubjectQuizResult.student_id == student.id)
        .order_by(SubjectQuizResult.taken_at.asc())
        .all()
    )

    subject_scores = defaultdict(list)
    topic_scores = defaultdict(list)

    for result in results:
        subject_scores[result.subject].append(result.score)
        topic_scores[f"{result.subject}: {result.topic}"].append(result.score)

    subject_performance = [
        {
            "subject": subject,
            "average_score": round(sum(scores) / len(scores), 2),
            "attempts": len(scores)
        }
        for subject, scores in subject_scores.items()
    ]

    topic_performance = [
        {
            "topic": topic,
            "average_score": round(sum(scores) / len(scores), 2),
            "attempts": len(scores)
        }
        for topic, scores in topic_scores.items()
    ]

    weak_topics = (
        db.query(WeakTopic)
        .filter(WeakTopic.student_id == student.id)
        .order_by(WeakTopic.detected_at.desc())
        .limit(10)
        .all()
    )

    events = (
        db.query(LearningEvent)
        .filter(LearningEvent.student_id == student.id)
        .all()
    )

    engagement_score = min(100, len(events) * 8 + len(results) * 5)

    average_score = 0
    if results:
        average_score = round(sum(result.score for result in results) / len(results), 2)

    risk_level = "Low"
    if average_score and average_score < 50:
        risk_level = "High"
    elif average_score and average_score < 70:
        risk_level = "Medium"
    elif engagement_score < 40:
        risk_level = "Medium"

    return {
        "subject_performance": subject_performance,
        "topic_performance": topic_performance,
        "weak_topics": [
            {
                "subject": item.subject,
                "topic": item.topic,
                "confidence_level": item.confidence_level,
                "detected_at": item.detected_at
            }
            for item in weak_topics
        ],
        "progress_over_time": [
            {
                "date": result.taken_at,
                "subject": result.subject,
                "topic": result.topic,
                "score": result.score
            }
            for result in results
        ],
        "engagement_score": engagement_score,
        "predicted_risk_level": risk_level
    }


def get_recommendations(
    db: Session,
    student: Student
) -> list[str]:
    analytics = get_education_analytics(db, student)
    recommendations = []

    for item in analytics["weak_topics"][:5]:
        subject = item["subject"]
        topic = item["topic"]

        recommendations.append(f"Revise {topic} in {subject} using flashcards and a short quiz.")

        if subject == "Mathematics":
            recommendations.append(f"Complete worked examples and exam-style practice for {topic}.")
        elif subject == "English Language":
            recommendations.append(f"Practise planning and writing a timed response for {topic}.")
        elif subject == "English Literature":
            recommendations.append(f"Create quotation banks and analytical paragraphs for {topic}.")

    if not recommendations:
        recommendations.append("Choose one Mathematics and one English topic this week, then complete a short quiz for each.")

    return recommendations


def generate_study_plan(
    subject: str,
    topic: str,
    age_range: str,
    days: int,
    learner_type: str | None = None
) -> dict:
    activities = []
    planner_strategy = PLANNER_GUIDANCE.get(
        learner_type,
        "Complete the Learning DNA profile to adapt revision plans."
    )

    for day in range(1, days + 1):
        if subject == "Mathematics":
            task = f"Practise {topic}: review one worked example, answer 5 questions, then correct mistakes."
        elif subject == "English Language":
            task = f"Practise {topic}: analyse one short extract, plan a response, then write one paragraph."
        else:
            task = f"Practise {topic}: learn 3 quotations, analyse methods, and write one analytical paragraph."

        if learner_type == "Analytical Learner":
            task += " Finish by writing the rule or method used."
        elif learner_type == "Creative Learner":
            task += " Add one original example or scenario."
        elif learner_type == "Visual Learner":
            task += " Create a diagram, mind map or visual summary."
        elif learner_type == "Problem Solver":
            task += " Add one timed challenge question."
        elif learner_type == "Exploratory Learner":
            task += " Compare two different resources or approaches."

        activities.append({
            "day": day,
            "task": task
        })

    return {
        "subject": subject,
        "topic": topic,
        "age_range": age_range,
        "days": days,
        "plan": activities,
        "learning_dna_guidance": {
            "learner_type": learner_type or "Not assessed",
            "planner_strategy": planner_strategy
        }
    }


def generate_quiz(
    subject: str,
    topic: str,
    curriculum_level: str,
    number_of_questions: int,
    question_type: str,
    learner_type: str | None = None
) -> dict:
    questions = []
    suggested_difficulty = QUIZ_DIFFICULTY_GUIDANCE.get(
        learner_type,
        "balanced mixed questions"
    )

    for index in range(1, number_of_questions + 1):
        if subject == "Mathematics":
            prompt = f"{index}. Solve or explain a {curriculum_level} question involving {topic}."
            answer = "Show method clearly, substitute values accurately, and check the final answer."
        elif subject == "English Language":
            prompt = f"{index}. Analyse how a writer uses language for effect in a {topic} task."
            answer = "Use evidence, identify a method, explain effect, and link to audience or purpose."
        else:
            prompt = f"{index}. Write an exam-style response point about {topic}."
            answer = "Make a clear argument, embed a quotation, analyse methods, and connect to context."

        if learner_type == "Analytical Learner":
            prompt += " Structure your answer into clear steps."
        elif learner_type == "Creative Learner":
            prompt += " Include an original example or interpretation."
        elif learner_type == "Visual Learner":
            prompt += " Use a diagram, visual plan or labelled structure where helpful."
        elif learner_type == "Problem Solver":
            prompt += " Treat this as a challenge question and justify each decision."
        elif learner_type == "Exploratory Learner":
            prompt += " Connect this question to a real-world scenario or project."

        questions.append({
            "question": prompt,
            "answer": answer,
            "type": question_type,
            "suggested_difficulty": suggested_difficulty
        })

    return {
        "subject": subject,
        "topic": topic,
        "curriculum_level": curriculum_level,
        "questions": questions,
        "learning_dna_guidance": {
            "learner_type": learner_type or "Not assessed",
            "suggested_difficulty": suggested_difficulty,
            "quiz_strategy": (
                f"Recommended quiz style: {suggested_difficulty}."
                if learner_type
                else "Complete the Learning DNA profile to personalise quiz difficulty."
            )
        }
    }


def generate_flashcards(
    subject: str,
    topic: str
) -> dict:
    cards = [
        {
            "question": f"What is the key idea in {topic}?",
            "answer": f"Explain the main concept of {topic} in your own words."
        },
        {
            "question": f"What is a common mistake in {topic}?",
            "answer": "Skipping evidence, method, working, or explanation."
        },
        {
            "question": f"How do you revise {topic} effectively?",
            "answer": "Use active recall, timed practice, feedback and correction."
        }
    ]

    if subject == "Mathematics":
        cards.append({
            "question": "What makes a strong maths solution?",
            "answer": "Clear method, correct notation, accurate calculation and final check."
        })
    else:
        cards.append({
            "question": "What makes a strong English answer?",
            "answer": "Clear point, evidence, method analysis, interpretation and context where relevant."
        })

    return {
        "subject": subject,
        "topic": topic,
        "flashcards": cards
    }


def generate_practice(
    subject: str,
    topic: str,
    curriculum_level: str,
    age_range: str
) -> dict:
    if subject == "Mathematics":
        tasks = [
            f"Complete 10 fluency questions on {topic}.",
            f"Complete 5 problem-solving questions on {topic}.",
            f"Write one worked solution explaining every step."
        ]
    elif subject == "English Language":
        tasks = [
            f"Read a short extract and identify 5 language methods linked to {topic}.",
            "Write one timed paragraph using evidence and explanation.",
            "Improve one sentence for clarity, vocabulary and punctuation."
        ]
    else:
        tasks = [
            f"Create a quotation bank for {topic}.",
            "Write one thesis statement and three analytical topic sentences.",
            "Plan a comparative or thematic essay response."
        ]

    return {
        "subject": subject,
        "topic": topic,
        "curriculum_level": curriculum_level,
        "age_range": age_range,
        "practice_tasks": tasks
    }

from collections import Counter
from datetime import datetime

from sqlalchemy.orm import Session

from backend.models.creativity_model import CreativityAssessment
from backend.models.learning_dna_model import (
    LearningDNAProfile,
    LearningDNAQuestionnaireResponse
)
from backend.models.learning_event import LearningEvent
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import QuizAttempt
from backend.models.student import Student


LEARNER_TYPES = {
    "analytical": "Analytical Learner",
    "creative": "Creative Learner",
    "visual": "Visual Learner",
    "problem_solver": "Problem Solver",
    "exploratory": "Exploratory Learner"
}


LEARNING_DNA_QUESTIONS = [
    {
        "id": "approach",
        "question": "When learning something new, what do you usually do first?",
        "options": [
            "Break it into rules and patterns",
            "Imagine a new way to use it",
            "Look for diagrams or examples",
            "Try solving a practical problem",
            "Explore different resources freely"
        ],
        "score_categories": {
            "Break it into rules and patterns": "analytical",
            "Imagine a new way to use it": "creative",
            "Look for diagrams or examples": "visual",
            "Try solving a practical problem": "problem_solver",
            "Explore different resources freely": "exploratory"
        }
    },
    {
        "id": "revision",
        "question": "Which revision method feels most natural to you?",
        "options": [
            "Comparing notes and finding logic",
            "Making original examples or analogies",
            "Using mind maps, colour and visual layouts",
            "Completing practice questions",
            "Trying a mixture of videos, notes and quizzes"
        ],
        "score_categories": {
            "Comparing notes and finding logic": "analytical",
            "Making original examples or analogies": "creative",
            "Using mind maps, colour and visual layouts": "visual",
            "Completing practice questions": "problem_solver",
            "Trying a mixture of videos, notes and quizzes": "exploratory"
        }
    },
    {
        "id": "challenge",
        "question": "What motivates you most during a difficult task?",
        "options": [
            "Understanding why the answer works",
            "Finding a unique solution",
            "Seeing the idea represented clearly",
            "Fixing errors step by step",
            "Testing different approaches"
        ],
        "score_categories": {
            "Understanding why the answer works": "analytical",
            "Finding a unique solution": "creative",
            "Seeing the idea represented clearly": "visual",
            "Fixing errors step by step": "problem_solver",
            "Testing different approaches": "exploratory"
        }
    },
    {
        "id": "resources",
        "question": "Which resource would you choose first?",
        "options": [
            "Detailed explanation notes",
            "Open-ended creative tasks",
            "Video walkthroughs or diagrams",
            "Worked problems",
            "A choice of several different resources"
        ],
        "score_categories": {
            "Detailed explanation notes": "analytical",
            "Open-ended creative tasks": "creative",
            "Video walkthroughs or diagrams": "visual",
            "Worked problems": "problem_solver",
            "A choice of several different resources": "exploratory"
        }
    }
]


RECOMMENDATIONS = {
    "Analytical Learner": [
        "Use structured notes, formula sheets and comparison tables.",
        "Ask the AI Tutor to explain the logic behind each answer.",
        "Review mistakes by writing the rule that was missed."
    ],
    "Creative Learner": [
        "Create analogies, stories or examples for difficult concepts.",
        "Use the Creativity Lab to turn revision topics into original tasks.",
        "Explain ideas in your own words before checking model answers."
    ],
    "Visual Learner": [
        "Use diagrams, flowcharts, timelines and colour-coded notes.",
        "Ask for visual explanations and step-by-step examples.",
        "Convert text-heavy notes into mind maps."
    ],
    "Problem Solver": [
        "Prioritise worked examples and practice questions.",
        "Use quizzes to test understanding after every topic.",
        "Debug mistakes by comparing your steps with the solution."
    ],
    "Exploratory Learner": [
        "Use a varied study playlist: videos, quizzes, notes and projects.",
        "Start broad, then narrow your focus to weak topics.",
        "Try extension tasks once you understand the basics."
    ]
}


STUDY_STRATEGIES = {
    "Analytical Learner": "Use a structured study cycle: concept, rule, example, practice, reflection.",
    "Creative Learner": "Use creative production: explain, redesign, invent examples, then test accuracy.",
    "Visual Learner": "Use visual encoding: diagrams first, short notes second, retrieval practice third.",
    "Problem Solver": "Use practice-led learning: attempt, mark, correct, repeat with harder questions.",
    "Exploratory Learner": "Use guided exploration: sample resources, choose the best, then commit to practice."
}

QUIZ_DIFFICULTY_GUIDANCE = {
    "Analytical Learner": "medium-to-hard structured questions with step-by-step reasoning",
    "Creative Learner": "mixed open-ended and MCQ questions with creative examples",
    "Visual Learner": "diagram-based prompts and visual explanation questions",
    "Problem Solver": "challenge questions with applied problem-solving tasks",
    "Exploratory Learner": "project-based and scenario-led discovery questions"
}

PLANNER_GUIDANCE = {
    "Analytical Learner": "Use structured notes, worked examples, and short reflection after each session.",
    "Creative Learner": "Add brainstorming, scenario tasks, and open-ended explanation activities.",
    "Visual Learner": "Include diagrams, videos, mind maps, and colour-coded summaries.",
    "Problem Solver": "Prioritise practice problems, timed challenges, and correction tasks.",
    "Exploratory Learner": "Use project-based learning, discovery tasks, and varied resources."
}


def get_learning_dna_questions() -> list[dict]:
    return LEARNING_DNA_QUESTIONS


def clamp_score(value: float) -> float:
    return round(max(0, min(100, value)), 2)


def build_base_scores() -> dict:
    return {
        "analytical": 0,
        "creative": 0,
        "visual": 0,
        "problem_solver": 0,
        "exploratory": 0
    }


def add_learning_history_signals(
    db: Session,
    student: Student,
    scores: dict
) -> dict:
    events = (
        db.query(LearningEvent)
        .filter(LearningEvent.student_id == student.id)
        .all()
    )

    event_types = Counter(event.event_type for event in events)

    if event_types.get("video_watch", 0) >= 2:
        scores["visual"] += 8

    if event_types.get("coding_practice", 0) >= 2:
        scores["problem_solver"] += 8

    if len(event_types) >= 3:
        scores["exploratory"] += 8

    quiz_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student.id)
        .all()
    )

    if quiz_attempts:
        average_quiz_score = sum(attempt.score for attempt in quiz_attempts) / len(quiz_attempts)
        if average_quiz_score >= 75:
            scores["analytical"] += 8
        if len(quiz_attempts) >= 3:
            scores["problem_solver"] += 5

    completed_lessons = (
        db.query(LessonProgress)
        .filter(LessonProgress.student_id == student.id)
        .count()
    )

    if completed_lessons >= 3:
        scores["analytical"] += 5

    latest_creativity = (
        db.query(CreativityAssessment)
        .filter(CreativityAssessment.student_id == student.id)
        .order_by(CreativityAssessment.created_at.desc())
        .first()
    )

    if latest_creativity:
        scores["creative"] += latest_creativity.creativity_score * 0.15
        scores["exploratory"] += latest_creativity.flexibility_score * 0.05

    return scores


def classify_learning_dna(
    db: Session,
    student: Student,
    responses: list
) -> dict:
    scores = build_base_scores()

    for response in responses:
        category = response.score_category
        if category in scores:
            scores[category] += 20

    scores = add_learning_history_signals(
        db,
        student,
        scores
    )

    normalized_scores = {
        key: clamp_score(value)
        for key, value in scores.items()
    }

    top_category = max(
        normalized_scores,
        key=normalized_scores.get
    )

    sorted_scores = sorted(
        normalized_scores.values(),
        reverse=True
    )

    confidence_score = clamp_score(
        sorted_scores[0] - (sorted_scores[1] if len(sorted_scores) > 1 else 0) + 65
    )

    return {
        "learner_type": LEARNER_TYPES[top_category],
        "confidence_score": confidence_score,
        "analytical_score": normalized_scores["analytical"],
        "creative_score": normalized_scores["creative"],
        "visual_score": normalized_scores["visual"],
        "problem_solver_score": normalized_scores["problem_solver"],
        "exploratory_score": normalized_scores["exploratory"]
    }


def save_learning_dna_profile(
    db: Session,
    student: Student,
    responses: list
) -> dict:
    scores = classify_learning_dna(
        db,
        student,
        responses
    )

    for response in responses:
        db.add(LearningDNAQuestionnaireResponse(
            student_id=student.id,
            question=response.question,
            answer=response.answer,
            score_category=response.score_category
        ))

    profile = (
        db.query(LearningDNAProfile)
        .filter(LearningDNAProfile.student_id == student.id)
        .first()
    )

    if profile:
        for key, value in scores.items():
            setattr(profile, key, value)
        profile.updated_at = datetime.utcnow()
    else:
        profile = LearningDNAProfile(
            student_id=student.id,
            **scores
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return {
        "profile": profile,
        "recommendations": RECOMMENDATIONS[profile.learner_type],
        "explanation": (
            "Learning DNA is calculated from questionnaire answers, then adjusted with "
            "available quiz, engagement, creativity and learning-history signals."
        )
    }


def get_learning_dna_profile(
    db: Session,
    student: Student
) -> LearningDNAProfile | None:
    return (
        db.query(LearningDNAProfile)
        .filter(LearningDNAProfile.student_id == student.id)
        .first()
    )


def build_learning_dna_recommendations(
    db: Session,
    student: Student
) -> dict:
    profile = get_learning_dna_profile(
        db,
        student
    )

    if not profile:
        return {
            "learner_type": "Not assessed",
            "recommendations": [
                "Complete the Learning DNA questionnaire to unlock personalised study recommendations."
            ],
            "study_strategy": "Start with the questionnaire, then Senyra can adapt your learning plan."
        }

    return {
        "learner_type": profile.learner_type,
        "recommendations": RECOMMENDATIONS[profile.learner_type],
        "study_strategy": STUDY_STRATEGIES[profile.learner_type]
    }


def get_profile_for_student(
    db: Session,
    student: Student
) -> LearningDNAProfile | None:
    return get_learning_dna_profile(
        db,
        student
    )


def get_quiz_guidance_for_profile(profile: LearningDNAProfile | None) -> dict:
    if not profile:
        return {
            "learner_type": "Not assessed",
            "suggested_difficulty": "balanced mixed questions",
            "quiz_strategy": "Complete the Learning DNA profile to personalise quiz difficulty."
        }

    return {
        "learner_type": profile.learner_type,
        "suggested_difficulty": QUIZ_DIFFICULTY_GUIDANCE[profile.learner_type],
        "quiz_strategy": f"Recommended quiz format: {QUIZ_DIFFICULTY_GUIDANCE[profile.learner_type]}."
    }


def get_planner_guidance_for_profile(profile: LearningDNAProfile | None) -> dict:
    if not profile:
        return {
            "learner_type": "Not assessed",
            "planner_strategy": "Complete the Learning DNA profile to adapt revision plans."
        }

    return {
        "learner_type": profile.learner_type,
        "planner_strategy": PLANNER_GUIDANCE[profile.learner_type]
    }


def build_learning_dna_admin_overview(db: Session) -> dict:
    profiles = db.query(LearningDNAProfile).all()

    if not profiles:
        return {
            "total_profiles": 0,
            "learner_type_distribution": [],
            "average_confidence_score": 0,
            "average_analytical_score": 0,
            "average_creative_score": 0,
            "average_visual_score": 0,
            "average_problem_solver_score": 0,
            "average_exploratory_score": 0
        }

    def average(field: str) -> float:
        return round(
            sum(getattr(profile, field) for profile in profiles) / len(profiles),
            2
        )

    distribution = Counter(profile.learner_type for profile in profiles)

    return {
        "total_profiles": len(profiles),
        "learner_type_distribution": [
            {
                "learner_type": learner_type,
                "count": count
            }
            for learner_type, count in distribution.items()
        ],
        "average_confidence_score": average("confidence_score"),
        "average_analytical_score": average("analytical_score"),
        "average_creative_score": average("creative_score"),
        "average_visual_score": average("visual_score"),
        "average_problem_solver_score": average("problem_solver_score"),
        "average_exploratory_score": average("exploratory_score")
    }

from collections import Counter

from sqlalchemy.orm import Session

from backend.models.creativity_model import (
    CreativityAssessment,
    CreativityResponse
)
from backend.models.student import Student


CREATIVITY_PROMPTS = [
    {
        "id": "alternate-uses",
        "assessment_type": "divergent_thinking",
        "prompt": "List creative uses for a paperclip.",
        "category": "ideas"
    },
    {
        "id": "school-improvement",
        "assessment_type": "problem_solving",
        "prompt": "Suggest ways to improve learning in a busy classroom.",
        "category": "education"
    },
    {
        "id": "story-bridge",
        "assessment_type": "creative_writing",
        "prompt": "Write a short idea for a story involving a bridge, a secret and a difficult choice.",
        "category": "writing"
    },
    {
        "id": "technology-ethics",
        "assessment_type": "critical_creativity",
        "prompt": "Invent a helpful AI tool and explain how you would prevent misuse.",
        "category": "technology"
    }
]

COMMON_TERMS = {
    "good",
    "nice",
    "fun",
    "easy",
    "simple",
    "thing",
    "stuff",
    "use",
    "make",
    "help",
    "people",
    "student",
    "school"
}

CATEGORY_KEYWORDS = {
    "technology": ["app", "ai", "robot", "computer", "software", "digital", "data"],
    "social": ["people", "team", "friend", "community", "class", "group"],
    "design": ["draw", "build", "shape", "colour", "model", "prototype"],
    "science": ["test", "experiment", "energy", "material", "environment"],
    "writing": ["story", "character", "poem", "essay", "scene", "dialogue"],
    "business": ["sell", "market", "customer", "product", "money", "budget"],
    "practical": ["fix", "organise", "tool", "holder", "stand", "clip"]
}


def get_creativity_prompts() -> list[dict]:
    return CREATIVITY_PROMPTS


def clamp_score(value: float) -> float:
    return round(max(0, min(100, value)), 2)


def split_ideas(text: str) -> list[str]:
    separators = ["\n", ";", "."]
    ideas = [text]

    for separator in separators:
        next_ideas = []
        for idea in ideas:
            next_ideas.extend(idea.split(separator))
        ideas = next_ideas

    return [
        idea.strip()
        for idea in ideas
        if idea.strip()
    ]


def infer_category(text: str, fallback: str | None = None) -> str:
    lower_text = text.lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in lower_text for keyword in keywords):
            return category

    return fallback or "general"


def calculate_response_score(response_text: str) -> tuple[float, str]:
    word_count = len(response_text.split())
    score = clamp_score(35 + min(word_count * 2, 45))

    if word_count >= 30:
        feedback = "Detailed response with clear elaboration."
    elif word_count >= 12:
        feedback = "Good start. Add more detail to strengthen the idea."
    else:
        feedback = "Brief response. Expand the idea with examples or explanation."

    return score, feedback


def score_creativity_submission(responses: list) -> dict:
    response_texts = [
        item.response_text.strip()
        for item in responses
        if item.response_text.strip()
    ]

    all_ideas = []
    categories = []
    uncommon_word_count = 0
    total_words = 0

    for item in responses:
        text = item.response_text.strip()
        if not text:
            continue

        ideas = split_ideas(text)
        all_ideas.extend(ideas)
        categories.append(infer_category(text, item.category))

        words = [
            word.strip(".,!?;:()[]{}").lower()
            for word in text.split()
        ]
        total_words += len(words)
        uncommon_word_count += len([
            word
            for word in words
            if len(word) > 6 and word not in COMMON_TERMS
        ])

    fluency_score = clamp_score(len(all_ideas) * 12)

    average_words = total_words / max(len(response_texts), 1)
    elaboration_score = clamp_score(average_words * 4)

    category_count = len(set(categories))
    flexibility_score = clamp_score(category_count * 20)

    repeated_ideas = Counter(idea.lower() for idea in all_ideas)
    unique_ratio = len(repeated_ideas) / max(len(all_ideas), 1)
    unusual_ratio = uncommon_word_count / max(total_words, 1)
    originality_score = clamp_score((unique_ratio * 55) + (unusual_ratio * 160))

    creativity_score = clamp_score(
        fluency_score * 0.25
        + flexibility_score * 0.25
        + originality_score * 0.25
        + elaboration_score * 0.25
    )

    if creativity_score >= 75:
        creative_confidence = "High"
    elif creativity_score >= 50:
        creative_confidence = "Developing"
    else:
        creative_confidence = "Emerging"

    if flexibility_score >= 70 and originality_score >= 60:
        problem_solving_style = "Divergent Explorer"
    elif elaboration_score >= 70:
        problem_solving_style = "Detailed Developer"
    elif fluency_score >= 70:
        problem_solving_style = "Rapid Ideator"
    else:
        problem_solving_style = "Structured Starter"

    return {
        "creativity_score": creativity_score,
        "fluency_score": fluency_score,
        "flexibility_score": flexibility_score,
        "originality_score": originality_score,
        "elaboration_score": elaboration_score,
        "creative_confidence": creative_confidence,
        "problem_solving_style": problem_solving_style
    }


def submit_creativity_assessment(
    db: Session,
    current_user: Student,
    assessment_type: str,
    responses: list
) -> dict:
    scores = score_creativity_submission(responses)

    assessment = CreativityAssessment(
        student_id=current_user.id,
        assessment_type=assessment_type,
        **scores
    )

    db.add(assessment)
    db.flush()

    feedback = []

    for item in responses:
        response_score, response_feedback = calculate_response_score(
            item.response_text
        )

        db.add(CreativityResponse(
            assessment_id=assessment.id,
            prompt=item.prompt,
            response_text=item.response_text,
            score=response_score,
            feedback=response_feedback
        ))

        feedback.append(response_feedback)

    db.commit()
    db.refresh(assessment)

    return {
        "assessment": assessment,
        "feedback": feedback
    }


def get_student_creativity_history(
    db: Session,
    current_user: Student
) -> list[CreativityAssessment]:
    return (
        db.query(CreativityAssessment)
        .filter(CreativityAssessment.student_id == current_user.id)
        .order_by(CreativityAssessment.created_at.desc())
        .all()
    )


def build_student_creativity_summary(
    db: Session,
    current_user: Student
) -> dict:
    assessments = get_student_creativity_history(db, current_user)

    if not assessments:
        return {
            "total_assessments": 0,
            "average_creativity_score": 0,
            "average_fluency_score": 0,
            "average_flexibility_score": 0,
            "average_originality_score": 0,
            "average_elaboration_score": 0,
            "latest_confidence": "Not assessed",
            "latest_problem_solving_style": "Not assessed",
            "recommendation": "Complete a creativity task to unlock your Creativity Intelligence profile."
        }

    def average(field: str) -> float:
        return round(
            sum(getattr(item, field) for item in assessments) / len(assessments),
            2
        )

    latest = assessments[0]

    if latest.creativity_score >= 75:
        recommendation = "Try more complex open-ended projects and leadership design challenges."
    elif latest.creativity_score >= 50:
        recommendation = "Improve originality by combining ideas from different subjects."
    else:
        recommendation = "Build confidence by producing more ideas before choosing the best one."

    return {
        "total_assessments": len(assessments),
        "average_creativity_score": average("creativity_score"),
        "average_fluency_score": average("fluency_score"),
        "average_flexibility_score": average("flexibility_score"),
        "average_originality_score": average("originality_score"),
        "average_elaboration_score": average("elaboration_score"),
        "latest_confidence": latest.creative_confidence,
        "latest_problem_solving_style": latest.problem_solving_style,
        "recommendation": recommendation
    }


def build_admin_creativity_overview(db: Session) -> dict:
    assessments = (
        db.query(CreativityAssessment)
        .order_by(CreativityAssessment.created_at.asc())
        .all()
    )

    if not assessments:
        return {
            "total_assessments": 0,
            "assessed_students": 0,
            "average_creativity_score": 0,
            "average_fluency_score": 0,
            "average_flexibility_score": 0,
            "average_originality_score": 0,
            "average_elaboration_score": 0,
            "high_creativity_count": 0,
            "developing_creativity_count": 0,
            "creativity_trends": [],
            "common_strengths": [],
            "common_improvement_areas": []
        }

    def average(field: str) -> float:
        return round(
            sum(getattr(item, field) for item in assessments) / len(assessments),
            2
        )

    dimensions = [
        ("Fluency", "fluency_score"),
        ("Flexibility", "flexibility_score"),
        ("Originality", "originality_score"),
        ("Elaboration", "elaboration_score")
    ]

    strength_counts = Counter()
    improvement_counts = Counter()

    for assessment in assessments:
        for label, field in dimensions:
            score = getattr(assessment, field)
            if score >= 60:
                strength_counts[label] += 1
            else:
                improvement_counts[label] += 1

    return {
        "total_assessments": len(assessments),
        "assessed_students": len({item.student_id for item in assessments}),
        "average_creativity_score": average("creativity_score"),
        "average_fluency_score": average("fluency_score"),
        "average_flexibility_score": average("flexibility_score"),
        "average_originality_score": average("originality_score"),
        "average_elaboration_score": average("elaboration_score"),
        "high_creativity_count": len([
            item for item in assessments
            if item.creativity_score >= 75
        ]),
        "developing_creativity_count": len([
            item for item in assessments
            if item.creativity_score < 75
        ]),
        "creativity_trends": [
            {
                "date": item.created_at.strftime("%Y-%m-%d"),
                "score": item.creativity_score,
                "student_id": item.student_id
            }
            for item in assessments[-12:]
        ],
        "common_strengths": [
            {
                "area": area,
                "count": count
            }
            for area, count in strength_counts.most_common()
        ],
        "common_improvement_areas": [
            {
                "area": area,
                "count": count
            }
            for area, count in improvement_counts.most_common()
        ]
    }

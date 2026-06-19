from collections import Counter
from statistics import mean

from sqlalchemy.orm import Session

from backend.models.learning_event import LearningEvent
from backend.models.lesson import Lesson
from backend.models.lesson_progress import LessonProgress
from backend.models.quiz import Quiz, QuizAttempt
from backend.models.student import Student


INJECTION_PATTERNS = [
    "ignore previous",
    "ignore all previous",
    "system prompt",
    "developer message",
    "reveal prompt",
    "jailbreak",
    "bypass rules"
]


def is_prompt_injection(message: str) -> bool:
    lowered = message.lower()
    return any(pattern in lowered for pattern in INJECTION_PATTERNS)


def build_learning_profile(
    db: Session,
    user: Student
) -> dict:
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == user.id)
        .order_by(QuizAttempt.attempted_at.desc())
        .limit(20)
        .all()
    )

    events = (
        db.query(LearningEvent)
        .filter(LearningEvent.student_id == user.id)
        .order_by(LearningEvent.timestamp.desc())
        .limit(30)
        .all()
    )

    completed_lessons = (
        db.query(LessonProgress)
        .filter(LessonProgress.student_id == user.id)
        .count()
    )

    total_lessons = db.query(Lesson).count()

    average_quiz_score = round(mean([item.score for item in attempts]), 1) if attempts else None
    low_scores = [item for item in attempts if item.score < 60]

    weak_topics = []

    for attempt in low_scores:
        quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
        if quiz:
            weak_topics.append(quiz.title)

    event_topics = [
        item.event_value
        for item in events
        if item.event_value
    ]

    weak_topics.extend([
        topic
        for topic, count in Counter(event_topics).most_common(5)
        if count >= 2
    ])

    progress_percentage = 0
    if total_lessons:
        progress_percentage = round((completed_lessons / total_lessons) * 100, 1)

    return {
        "average_quiz_score": average_quiz_score,
        "weak_topics": list(dict.fromkeys(weak_topics))[:5],
        "recent_activity": event_topics[:5],
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "progress_percentage": progress_percentage
    }


def detect_intent(message: str) -> str:
    lowered = message.lower()

    if any(term in lowered for term in ["gcse", "a-level", "ks3", "shakespeare", "poetry", "algebra", "calculus", "english language", "english literature"]):
        if "quiz" in lowered or "question" in lowered:
            return "uk_education_quiz"
        if "flashcard" in lowered:
            return "uk_education_flashcards"
        if "plan" in lowered or "revision" in lowered:
            return "uk_education_plan"
        return "uk_education_explain"

    if "lesson plan" in lowered:
        return "lesson_plan"
    if "rubric" in lowered or "marking" in lowered:
        return "rubric"
    if "assessment" in lowered or "assignment idea" in lowered:
        return "assessment"
    if "flashcard" in lowered:
        return "flashcards"
    if "quiz" in lowered or "mcq" in lowered:
        return "quiz"
    if "study plan" in lowered or "revision plan" in lowered or "-day" in lowered:
        return "study_plan"
    if "resource" in lowered or "tutorial" in lowered or "video" in lowered:
        return "resources"
    if "code" in lowered or "fastapi" in lowered or "python" in lowered or "sql" in lowered:
        return "code_help"
    if "weak" in lowered or "progress" in lowered or "struggle" in lowered:
        return "analytics"
    if "explain" in lowered or "understand" in lowered or "difference" in lowered:
        return "explain"

    return "general"


def extract_topic(message: str) -> str:
    cleaned = message.strip().strip("?!.")
    prefixes = [
        "help me understand",
        "create a revision plan for",
        "create revision plan for",
        "create a study plan for",
        "create study plan for",
        "generate a lesson plan for",
        "generate lesson plan for",
        "create flashcards on",
        "create flashcards for",
        "generate flashcards on",
        "generate flashcards for",
        "generate quiz questions on",
        "generate a quiz on",
        "generate quiz on",
        "create a quiz on",
        "create quiz on",
        "create a marking rubric for",
        "create marking rubric for",
        "suggest resources for",
        "recommend resources for",
        "explain",
        "summarise",
        "summary of",
        "help with"
    ]

    topic = cleaned
    lowered = topic.lower()

    for prefix in prefixes:
        if lowered.startswith(prefix):
            topic = topic[len(prefix):]
            break

    return topic.strip() or cleaned


def format_profile_advice(profile: dict) -> str:
    lines = []

    if profile["average_quiz_score"] is not None:
        lines.append(f"- Your recent average quiz score is {profile['average_quiz_score']}%.")

    if profile["progress_percentage"]:
        lines.append(f"- You have completed {profile['progress_percentage']}% of available lessons.")

    if profile["weak_topics"]:
        lines.append("- Detected weak topics: " + ", ".join(profile["weak_topics"]) + ".")

    if profile["recent_activity"]:
        lines.append("- Recent activity: " + ", ".join(profile["recent_activity"]) + ".")

    if not lines:
        lines.append("- I do not have much learning history yet, so I will start with a general plan and adapt as you complete quizzes and lessons.")

    return "\n".join(lines)


def generate_quiz(topic: str, role: str) -> str:
    context = "classroom-ready" if role == "teacher" else "revision"

    return f"""## {topic} Quiz

Here is a {context} 10-question MCQ quiz.

1. What is the main purpose of {topic}?
   A. Store passwords
   B. Solve the core problem it was designed for
   C. Replace all networks
   D. Delete old data
   Answer: B

2. Which statement best describes a key concept in {topic}?
   A. It has no rules
   B. It depends on structure and clear logic
   C. It only works offline
   D. It is never tested
   Answer: B

3. What should you check first when troubleshooting {topic}?
   A. Assumptions and inputs
   B. The colour scheme
   C. The file name only
   D. Nothing
   Answer: A

4. Which skill helps most when learning {topic}?
   A. Memorising without practice
   B. Breaking problems into steps
   C. Ignoring feedback
   D. Guessing answers
   Answer: B

5. What is a common beginner mistake?
   A. Testing regularly
   B. Reading documentation
   C. Skipping fundamentals
   D. Asking questions
   Answer: C

6. Which resource is most reliable?
   A. Official documentation
   B. Random copied answers
   C. Outdated screenshots
   D. Unverified comments
   Answer: A

7. What proves understanding?
   A. Repeating definitions only
   B. Explaining it with an example
   C. Avoiding practice
   D. Hiding errors
   Answer: B

8. What is a good revision method?
   A. Active recall
   B. Passive scrolling
   C. Multitasking
   D. Last-minute guessing
   Answer: A

9. When should you ask for help?
   A. After identifying what confuses you
   B. Never
   C. Before reading the question
   D. Only after submission
   Answer: A

10. What should you do after this quiz?
   A. Review wrong answers and practise examples
   B. Delete notes
   C. Stop learning
   D. Ignore feedback
   Answer: A
"""


def generate_flashcards(topic: str) -> str:
    return f"""## Flashcards: {topic}

1. Q: What is {topic}?
   A: It is a concept or skill that should be understood through definition, purpose, and examples.

2. Q: Why does {topic} matter?
   A: It helps solve practical problems and connects to wider course outcomes.

3. Q: What is a simple way to remember it?
   A: Link the definition to one real-world example.

4. Q: What is a common mistake?
   A: Memorising terms without practising how they are used.

5. Q: How can I test myself?
   A: Explain it from memory, then solve one short task or question.
"""


def generate_study_plan(topic: str, profile: dict) -> str:
    weak_topics = profile["weak_topics"] or [topic]

    return f"""## Personalised Study Plan: {topic}

Your current learning profile:
{format_profile_advice(profile)}

### 7-day starter schedule

Day 1: Review the fundamentals of {topic}. Write 5 key definitions.
Day 2: Watch or read one beginner resource and summarise it in 150 words.
Day 3: Practise 5 short questions. Focus on {weak_topics[0]}.
Day 4: Build one worked example or diagram.
Day 5: Complete a mini quiz and record your score.
Day 6: Revisit mistakes and create flashcards.
Day 7: Teach the topic back in your own words and attempt a timed review.

### Adaptive recommendation
If your next quiz score is below 60%, spend two extra sessions on the weakest subtopic before moving on.
"""


def generate_teacher_plan(topic: str) -> str:
    return f"""## Lesson Plan: {topic}

Learning outcomes:
- Define the key ideas behind {topic}.
- Apply the concept to a practical classroom example.
- Identify common mistakes and correct them.

Starter activity: 5-minute diagnostic question to reveal prior knowledge.

Teacher input: Explain the concept using one diagram, one worked example, and one misconception check.

Guided practice: Students complete a scaffolded task in pairs.

Independent task: Students solve a similar problem individually and submit a short reflection.

Assessment: Exit ticket with 3 questions: definition, application, and error correction.

Intervention: Give students below 60% a worked example sheet and a short follow-up quiz.
"""


def generate_rubric(topic: str) -> str:
    return f"""## Marking Rubric: {topic}

| Criteria | Excellent | Good | Needs Improvement |
| --- | --- | --- | --- |
| Understanding | Explains concepts accurately with examples | Mostly accurate with minor gaps | Limited or unclear understanding |
| Application | Applies ideas independently | Applies with some support | Struggles to apply concepts |
| Technical accuracy | Work is correct, tested, and justified | Mostly correct | Frequent errors |
| Evaluation | Reflects on strengths and improvements | Some reflection | Minimal reflection |

Suggested weighting:
- Understanding: 30%
- Application: 40%
- Accuracy: 20%
- Evaluation: 10%
"""


def generate_resource_list(topic: str, role: str) -> str:
    audience = "lesson preparation" if role == "teacher" else "revision"

    return f"""## Recommended Resources for {topic}

Use these for {audience}:

- Official documentation or vendor guide for the topic.
- A beginner tutorial with worked examples.
- A short video that explains the concept visually.
- Practice questions or labs.
- Your Senyra quiz history and lesson progress page.

Study method:
1. Read the official overview.
2. Watch one explanation.
3. Practise one task.
4. Add mistakes to flashcards.
"""


def generate_uk_education_response(topic: str, intent: str) -> str:
    lowered = topic.lower()

    if any(term in lowered for term in ["poetry", "shakespeare", "literature", "modern texts", "19th century", "characters", "themes", "quotations"]):
        subject = "English Literature"
        method = "Use point, evidence, method analysis, interpretation and context."
    elif any(term in lowered for term in ["writing", "grammar", "punctuation", "language", "comprehension", "persuasive", "transactional"]):
        subject = "English Language"
        method = "Focus on audience, purpose, tone, structure, language methods and accurate expression."
    else:
        subject = "Mathematics"
        method = "Show each step, use correct notation, check the answer and practise exam-style questions."

    if intent == "uk_education_quiz":
        return f"""## {subject} Quiz: {topic}

1. Define the key idea in {topic}.
2. Give one common mistake learners make in {topic}.
3. Complete one exam-style task on {topic}.
4. Explain your method or evidence clearly.
5. Review your answer and improve one part.

Marking focus:
{method}
"""

    if intent == "uk_education_flashcards":
        return f"""## Flashcards: {topic}

1. Q: What is the core idea?
   A: Explain {topic} in one clear sentence.

2. Q: What does a strong answer include?
   A: {method}

3. Q: What should I practise next?
   A: One timed question, one correction task and one self-explanation.
"""

    if intent == "uk_education_plan":
        return f"""## Revision Plan: {topic}

Day 1: Learn the core knowledge and write a short summary.
Day 2: Complete guided practice with notes.
Day 3: Complete timed exam-style questions.
Day 4: Mark your answer and identify weak points.
Day 5: Create flashcards for mistakes.
Day 6: Complete a mixed practice task.
Day 7: Redo the hardest question without notes.

Success criteria:
{method}
"""

    return f"""## Explanation: {topic}

Subject area: {subject}

What to know:
- Learn the key vocabulary.
- Understand the method or analysis structure.
- Practise with age-appropriate exam-style questions.
- Correct mistakes and turn them into flashcards.

How to answer well:
{method}
"""


def generate_code_help(topic: str) -> str:
    return f"""## Code Explanation: {topic}

When working with code, use this pattern:

```python
def example(input_value):
    result = input_value * 2
    return result
```

What happens:
1. The function receives an input.
2. It processes the input in a clear step.
3. It returns the result.

For assignments, avoid copying a full solution blindly. Start by writing the inputs, outputs, and steps in plain English, then convert each step into code.
"""


def generate_response(
    db: Session,
    user: Student,
    message: str,
    history: list
) -> str:
    if is_prompt_injection(message):
        return (
            "I can help with learning tasks, but I cannot follow requests to bypass system rules, "
            "reveal hidden prompts, or ignore safety instructions. Please ask your learning question directly."
        )

    role = user.role or "student"
    topic = extract_topic(message)
    intent = detect_intent(message)
    profile = build_learning_profile(db, user)

    memory_note = ""
    if history:
        last_user_messages = [
            item.content
            for item in history
            if item.role == "user"
        ][-3:]
        if last_user_messages:
            memory_note = "\n\nConversation memory: I am also considering your recent questions about " + "; ".join(last_user_messages) + "."

    if intent.startswith("uk_education"):
        body = generate_uk_education_response(topic, intent)
    elif role == "teacher" and intent == "lesson_plan":
        body = generate_teacher_plan(topic)
    elif role == "teacher" and intent in ["rubric", "assessment"]:
        body = generate_rubric(topic)
    elif intent == "quiz":
        body = generate_quiz(topic, role)
    elif intent == "flashcards":
        body = generate_flashcards(topic)
    elif intent == "study_plan":
        body = generate_study_plan(topic, profile)
    elif intent == "resources":
        body = generate_resource_list(topic, role)
    elif intent == "code_help":
        body = generate_code_help(topic)
    elif intent == "analytics":
        body = f"""## Learning Progress Analysis

{format_profile_advice(profile)}

### Recommendation
Focus your next session on the lowest-confidence topic first. Use this cycle: review notes, answer 5 questions, correct mistakes, then create 3 flashcards.
"""
    else:
        body = f"""## Explanation: {topic}

Simple definition:
{topic} is best understood by breaking it into purpose, key rules, and examples.

Step-by-step:
1. Identify what problem it solves.
2. Learn the core vocabulary.
3. Work through one example slowly.
4. Test yourself with a short question.
5. Review mistakes and turn them into flashcards.

Personalised note:
{format_profile_advice(profile)}
"""

    if role == "teacher":
        role_note = "\n\nTeacher mode: I have framed this so it can be used for planning, assessment, or classroom support."
    else:
        role_note = "\n\nStudent mode: I have kept this revision-focused and adapted it to your progress where data is available."

    return body + role_note + memory_note

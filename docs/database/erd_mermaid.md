# Mermaid ERD

Copy the following Mermaid diagram into Markdown that supports Mermaid, or into Mermaid Live Editor.

```mermaid
erDiagram
    STUDENTS {
        INTEGER id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password
        VARCHAR role
    }

    COURSES {
        INTEGER id PK
        VARCHAR title
        TEXT description
        VARCHAR level
    }

    LESSONS {
        INTEGER id PK
        VARCHAR title
        TEXT content
        VARCHAR video_url
        INTEGER course_id FK
    }

    QUIZZES {
        INTEGER id PK
        VARCHAR title
        INTEGER course_id FK
    }

    QUESTIONS {
        INTEGER id PK
        INTEGER quiz_id FK
        VARCHAR question_text
        VARCHAR option_a
        VARCHAR option_b
        VARCHAR option_c
        VARCHAR option_d
        VARCHAR correct_answer
    }

    QUIZ_ATTEMPTS {
        INTEGER id PK
        INTEGER student_id FK
        INTEGER quiz_id FK
        INTEGER score
        DATETIME attempted_at
    }

    LESSON_PROGRESS {
        INTEGER id PK
        INTEGER student_id FK
        INTEGER lesson_id FK
        DATETIME completed_at
    }

    SUBJECTS {
        INTEGER id PK
        VARCHAR name UK
        VARCHAR description
    }

    TOPICS {
        INTEGER id PK
        VARCHAR name
        INTEGER subject_id FK
        VARCHAR difficulty_level
        VARCHAR curriculum_level
        VARCHAR age_range
        VARCHAR description
    }

    SUBJECT_QUIZ_RESULTS {
        INTEGER id PK
        INTEGER student_id FK
        VARCHAR subject
        VARCHAR topic
        FLOAT score
        DATETIME taken_at
    }

    WEAK_TOPICS {
        INTEGER id PK
        INTEGER student_id FK
        VARCHAR subject
        VARCHAR topic
        FLOAT confidence_level
        DATETIME detected_at
    }

    LEARNING_EVENTS {
        INTEGER id PK
        INTEGER student_id FK
        VARCHAR event_type
        VARCHAR event_value
        DATETIME timestamp
    }

    RECOMMENDATION_HISTORY {
        INTEGER id PK
        INTEGER student_id FK
        VARCHAR recommendation
        VARCHAR reason
        BOOLEAN is_helpful
        DATETIME created_at
    }

    LEARNING_DNA_PROFILES {
        INTEGER id PK
        INTEGER student_id FK UK
        VARCHAR learner_type
        FLOAT confidence_score
        FLOAT analytical_score
        FLOAT creative_score
        FLOAT visual_score
        FLOAT problem_solver_score
        FLOAT exploratory_score
        DATETIME created_at
        DATETIME updated_at
    }

    LEARNING_DNA_QUESTIONNAIRE_RESPONSES {
        INTEGER id PK
        INTEGER student_id FK
        TEXT question
        TEXT answer
        VARCHAR score_category
        DATETIME created_at
    }

    CREATIVITY_ASSESSMENTS {
        INTEGER id PK
        INTEGER student_id FK
        VARCHAR assessment_type
        FLOAT creativity_score
        FLOAT fluency_score
        FLOAT flexibility_score
        FLOAT originality_score
        FLOAT elaboration_score
        VARCHAR creative_confidence
        VARCHAR problem_solving_style
        DATETIME created_at
    }

    CREATIVITY_RESPONSES {
        INTEGER id PK
        INTEGER assessment_id FK
        VARCHAR prompt
        TEXT response_text
        FLOAT score
        TEXT feedback
    }

    FLOW_SESSIONS {
        INTEGER id PK
        INTEGER student_id FK
        DATETIME started_at
        DATETIME ended_at
        FLOAT duration_minutes
        VARCHAR activity_type
        VARCHAR subject
        VARCHAR topic
        BOOLEAN completed_task
        FLOAT quiz_score
        INTEGER resource_views
        INTEGER engagement_events
        FLOAT flow_score
    }

    FLOW_SUMMARIES {
        INTEGER id PK
        INTEGER student_id FK UK
        FLOAT average_flow_score
        VARCHAR best_time_start
        VARCHAR best_time_end
        VARCHAR strongest_subject
        VARCHAR weakest_subject
        DATETIME updated_at
    }

    CLASS_GROUPS {
        INTEGER id PK
        VARCHAR name
        INTEGER teacher_id FK
        DATETIME created_at
    }

    CLASS_ENROLLMENTS {
        INTEGER id PK
        INTEGER class_id FK
        INTEGER student_id FK
        DATETIME created_at
    }

    FEEDBACK_MESSAGES {
        INTEGER id PK
        INTEGER student_id FK
        INTEGER teacher_id FK
        VARCHAR subject
        VARCHAR message
        BOOLEAN is_read
        DATETIME created_at
    }

    INTERVENTION_PLANS {
        INTEGER id PK
        INTEGER student_id FK
        INTEGER teacher_id FK
        VARCHAR title
        VARCHAR target_area
        VARCHAR action_plan
        VARCHAR status
        BOOLEAN is_completed
        DATETIME created_at
    }

    STUDENT_NOTES {
        INTEGER id PK
        INTEGER student_id FK
        INTEGER teacher_id FK
        VARCHAR note
        VARCHAR action_taken
        DATETIME created_at
    }

    NOTIFICATIONS {
        INTEGER id PK
        INTEGER user_id FK
        VARCHAR title
        VARCHAR message
        VARCHAR notification_type
        BOOLEAN is_read
        DATETIME created_at
    }

    AUDIT_LOGS {
        INTEGER id PK
        INTEGER user_id FK
        VARCHAR user_role
        VARCHAR action
        VARCHAR description
        DATETIME created_at
    }

    CHAT_SESSIONS {
        INTEGER id PK
        INTEGER user_id FK
        VARCHAR title
        BOOLEAN is_favourite
        DATETIME created_at
    }

    CHAT_MESSAGES {
        INTEGER id PK
        INTEGER session_id FK
        VARCHAR role
        TEXT content
        DATETIME timestamp
    }

    STUDENTS ||--o{ AUDIT_LOGS : creates
    STUDENTS ||--o{ CHAT_SESSIONS : owns
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : contains
    STUDENTS ||--o{ CLASS_GROUPS : teaches
    CLASS_GROUPS ||--o{ CLASS_ENROLLMENTS : has
    STUDENTS ||--o{ CLASS_ENROLLMENTS : joins
    COURSES ||--o{ LESSONS : contains
    COURSES ||--o{ QUIZZES : assesses
    QUIZZES ||--o{ QUESTIONS : contains
    STUDENTS ||--o{ QUIZ_ATTEMPTS : submits
    QUIZZES ||--o{ QUIZ_ATTEMPTS : receives
    STUDENTS ||--o{ LESSON_PROGRESS : completes
    LESSONS ||--o{ LESSON_PROGRESS : tracked_by
    SUBJECTS ||--o{ TOPICS : contains
    STUDENTS ||--o{ SUBJECT_QUIZ_RESULTS : records
    STUDENTS ||--o{ WEAK_TOPICS : has
    STUDENTS ||--o{ LEARNING_EVENTS : generates
    STUDENTS ||--o{ RECOMMENDATION_HISTORY : receives
    STUDENTS ||--|| LEARNING_DNA_PROFILES : has
    STUDENTS ||--o{ LEARNING_DNA_QUESTIONNAIRE_RESPONSES : answers
    STUDENTS ||--o{ CREATIVITY_ASSESSMENTS : completes
    CREATIVITY_ASSESSMENTS ||--o{ CREATIVITY_RESPONSES : includes
    STUDENTS ||--o{ FLOW_SESSIONS : performs
    STUDENTS ||--|| FLOW_SUMMARIES : summarizes
    STUDENTS ||--o{ FEEDBACK_MESSAGES : receives
    STUDENTS ||--o{ INTERVENTION_PLANS : receives
    STUDENTS ||--o{ STUDENT_NOTES : has
    STUDENTS ||--o{ NOTIFICATIONS : receives
```

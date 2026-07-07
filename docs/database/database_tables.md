# Database Tables

This document describes the 28 application tables discovered in `senyra.db`. It is based on the SQLite schema only and does not include row data or secrets.

## audit_logs

- Purpose: Records significant user or system actions for traceability and administration.
- Columns: `id INTEGER NOT NULL`, `user_id INTEGER`, `user_role VARCHAR`, `action VARCHAR NOT NULL`, `description VARCHAR NOT NULL`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `user_id` references `students.id`.
- Important relationships: Many audit log records can belong to one user account.
- Feature use: Audit logging, admin oversight, accountability, dashboard activity review.

## chat_messages

- Purpose: Stores individual messages inside an AI/chatbot support conversation.
- Columns: `id INTEGER NOT NULL`, `session_id INTEGER NOT NULL`, `role VARCHAR NOT NULL`, `content TEXT NOT NULL`, `timestamp DATETIME`.
- Primary key: `id`.
- Foreign keys: `session_id` references `chat_sessions.id`.
- Important relationships: Many messages belong to one chat session.
- Feature use: Chatbot, explainable support conversations, learner assistance history.

## chat_sessions

- Purpose: Stores conversation headers for a learner or platform user.
- Columns: `id INTEGER NOT NULL`, `user_id INTEGER NOT NULL`, `title VARCHAR`, `is_favourite BOOLEAN`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `user_id` references `students.id`.
- Important relationships: One user can have many chat sessions; each session can contain many messages.
- Feature use: Chatbot, AI learning assistant, saved/favourite conversations.

## class_enrollments

- Purpose: Links students to teacher-created class groups.
- Columns: `id INTEGER NOT NULL`, `class_id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `class_id` references `class_groups.id`; `student_id` references `students.id`.
- Important relationships: Implements a many-to-many relationship between class groups and students.
- Feature use: Teacher dashboards, class management, student grouping.

## class_groups

- Purpose: Represents a class or teaching group owned by a teacher.
- Columns: `id INTEGER NOT NULL`, `name VARCHAR NOT NULL`, `teacher_id INTEGER NOT NULL`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `teacher_id` references `students.id`.
- Important relationships: One teacher can manage many class groups; groups have many student enrollments.
- Feature use: Teacher role workflows, class dashboards, group-level reporting.

## courses

- Purpose: Stores top-level learning units.
- Columns: `id INTEGER NOT NULL`, `title VARCHAR NOT NULL`, `description TEXT`, `level VARCHAR`.
- Primary key: `id`.
- Foreign keys: None.
- Important relationships: A course can contain lessons and quizzes.
- Feature use: Course catalogue, lessons, quizzes, learning paths.

## creativity_assessments

- Purpose: Stores summary scores for a student's creativity assessment.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `assessment_type VARCHAR NOT NULL`, `creativity_score FLOAT NOT NULL`, `fluency_score FLOAT NOT NULL`, `flexibility_score FLOAT NOT NULL`, `originality_score FLOAT NOT NULL`, `elaboration_score FLOAT NOT NULL`, `creative_confidence VARCHAR NOT NULL`, `problem_solving_style VARCHAR NOT NULL`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: One student can have many creativity assessments; each assessment can have many response rows.
- Feature use: Creativity engine, learner profiling, dashboards.

## creativity_responses

- Purpose: Stores detailed prompt responses submitted during creativity assessments.
- Columns: `id INTEGER NOT NULL`, `assessment_id INTEGER NOT NULL`, `prompt VARCHAR NOT NULL`, `response_text TEXT NOT NULL`, `score FLOAT NOT NULL`, `feedback TEXT NOT NULL`.
- Primary key: `id`.
- Foreign keys: `assessment_id` references `creativity_assessments.id`.
- Important relationships: Many responses belong to one creativity assessment.
- Feature use: Creativity engine, explainable feedback, assessment review.

## feedback_messages

- Purpose: Stores teacher feedback sent to students.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `teacher_id INTEGER NOT NULL`, `subject VARCHAR NOT NULL`, `message VARCHAR NOT NULL`, `is_read BOOLEAN`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`; `teacher_id` references `students.id`.
- Important relationships: Both sender and recipient are represented through the shared user table.
- Feature use: Teacher feedback, notifications, student support.

## flow_sessions

- Purpose: Records activity sessions used to estimate learner flow state and engagement.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `started_at DATETIME`, `ended_at DATETIME`, `duration_minutes FLOAT`, `activity_type VARCHAR NOT NULL`, `subject VARCHAR`, `topic VARCHAR`, `completed_task BOOLEAN`, `quiz_score FLOAT`, `resource_views INTEGER`, `engagement_events INTEGER`, `flow_score FLOAT`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: One student can have many flow sessions.
- Feature use: Flow state detection, engagement analytics, dashboards, cognitive risk signals.

## flow_summaries

- Purpose: Stores a per-student aggregate summary of flow patterns.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `average_flow_score FLOAT`, `best_time_start VARCHAR`, `best_time_end VARCHAR`, `strongest_subject VARCHAR`, `weakest_subject VARCHAR`, `updated_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: One-to-one relationship with a student through a unique `student_id`.
- Feature use: Flow dashboards, personalization, student analytics.

## intervention_plans

- Purpose: Stores teacher-created interventions for targeted student support.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `teacher_id INTEGER NOT NULL`, `title VARCHAR NOT NULL`, `target_area VARCHAR NOT NULL`, `action_plan VARCHAR NOT NULL`, `status VARCHAR`, `is_completed BOOLEAN`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`; `teacher_id` references `students.id`.
- Important relationships: Teachers can create multiple intervention plans for students.
- Feature use: Interventions, teacher dashboards, cognitive risk response.

## learning_dna_profiles

- Purpose: Stores each student's computed Learning DNA profile.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `learner_type VARCHAR NOT NULL`, `confidence_score FLOAT NOT NULL`, `analytical_score FLOAT NOT NULL`, `creative_score FLOAT NOT NULL`, `visual_score FLOAT NOT NULL`, `problem_solver_score FLOAT NOT NULL`, `exploratory_score FLOAT NOT NULL`, `created_at DATETIME`, `updated_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: One-to-one relationship with a student through a unique `student_id`.
- Feature use: Learning DNA, personalization, recommendations, dashboards.

## learning_dna_questionnaire_responses

- Purpose: Stores raw questionnaire responses used to build Learning DNA profiles.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `question TEXT NOT NULL`, `answer TEXT NOT NULL`, `score_category VARCHAR NOT NULL`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: One student can have many questionnaire response rows.
- Feature use: Learning DNA questionnaire, explainable profiling, personalization.

## learning_events

- Purpose: Stores generic behavioural events from learning activity.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER`, `event_type VARCHAR NOT NULL`, `event_value VARCHAR`, `timestamp DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: Events are optionally associated with students.
- Feature use: Event logging, analytics, dashboards, ML feature generation.

## lesson_progress

- Purpose: Tracks lesson completion by student.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `lesson_id INTEGER NOT NULL`, `completed_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`; `lesson_id` references `lessons.id`.
- Important relationships: Links students and lessons; unique constraint prevents duplicate progress rows for the same student and lesson.
- Feature use: Progress tracking, dashboards, learning paths.

## lessons

- Purpose: Stores lesson content belonging to courses.
- Columns: `id INTEGER NOT NULL`, `title VARCHAR NOT NULL`, `content TEXT`, `video_url VARCHAR`, `course_id INTEGER`.
- Primary key: `id`.
- Foreign keys: `course_id` references `courses.id`.
- Important relationships: Many lessons can belong to one course.
- Feature use: Course delivery, lesson pages, progress tracking.

## notifications

- Purpose: Stores user notifications and read state.
- Columns: `id INTEGER NOT NULL`, `user_id INTEGER NOT NULL`, `title VARCHAR NOT NULL`, `message VARCHAR NOT NULL`, `notification_type VARCHAR`, `is_read BOOLEAN`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `user_id` references `students.id`.
- Important relationships: One user can receive many notifications.
- Feature use: Notifications, teacher/student/admin communication prompts.

## questions

- Purpose: Stores multiple-choice questions for quizzes.
- Columns: `id INTEGER NOT NULL`, `quiz_id INTEGER NOT NULL`, `question_text VARCHAR NOT NULL`, `option_a VARCHAR NOT NULL`, `option_b VARCHAR NOT NULL`, `option_c VARCHAR NOT NULL`, `option_d VARCHAR NOT NULL`, `correct_answer VARCHAR NOT NULL`.
- Primary key: `id`.
- Foreign keys: `quiz_id` references `quizzes.id`.
- Important relationships: Many questions belong to one quiz.
- Feature use: Quiz engine, assessment.

## quiz_attempts

- Purpose: Stores student attempts against course quizzes.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `quiz_id INTEGER NOT NULL`, `score INTEGER NOT NULL`, `attempted_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`; `quiz_id` references `quizzes.id`.
- Important relationships: Links students to quizzes and allows multiple attempts over time.
- Feature use: Quiz history, performance tracking, recommendations.

## quizzes

- Purpose: Stores quizzes associated with courses.
- Columns: `id INTEGER NOT NULL`, `title VARCHAR NOT NULL`, `course_id INTEGER NOT NULL`.
- Primary key: `id`.
- Foreign keys: `course_id` references `courses.id`.
- Important relationships: Many quizzes can belong to one course; each quiz can have many questions and attempts.
- Feature use: Quiz engine, assessment, course evaluation.

## recommendation_history

- Purpose: Stores generated recommendations and learner feedback about usefulness.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `recommendation VARCHAR NOT NULL`, `reason VARCHAR`, `is_helpful BOOLEAN`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: One student can have many recommendation records.
- Feature use: Recommendations, explainable AI, personalization evaluation.

## student_notes

- Purpose: Stores teacher notes and actions for individual students.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `teacher_id INTEGER NOT NULL`, `note VARCHAR NOT NULL`, `action_taken VARCHAR`, `created_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`; `teacher_id` references `students.id`.
- Important relationships: Teacher and student references both point to the shared account table.
- Feature use: Teacher notes, interventions, pastoral/academic tracking.

## students

- Purpose: Stores user accounts for students, teachers, and admins.
- Columns: `id INTEGER NOT NULL`, `full_name VARCHAR NOT NULL`, `email VARCHAR NOT NULL`, `password VARCHAR NOT NULL`, `role VARCHAR`.
- Primary key: `id`.
- Foreign keys: None.
- Important relationships: Central parent table for most learner, teacher, admin, analytics, and communication records.
- Feature use: Authentication, RBAC, user management, dashboards. The schema contains the password field name but this document does not expose any stored values.

## subject_quiz_results

- Purpose: Stores quiz performance by subject and topic.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `subject VARCHAR NOT NULL`, `topic VARCHAR NOT NULL`, `score FLOAT NOT NULL`, `taken_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: One student can have many subject-level quiz result records.
- Feature use: Weak topic detection, analytics, recommendations, ML features.

## subjects

- Purpose: Stores curriculum subjects.
- Columns: `id INTEGER NOT NULL`, `name VARCHAR NOT NULL`, `description VARCHAR`.
- Primary key: `id`.
- Foreign keys: None.
- Important relationships: One subject can have many topics; subject names are unique.
- Feature use: Education catalogue, subject/topic selection, learning paths.

## topics

- Purpose: Stores curriculum topics within subjects.
- Columns: `id INTEGER NOT NULL`, `name VARCHAR NOT NULL`, `subject_id INTEGER NOT NULL`, `difficulty_level VARCHAR NOT NULL`, `curriculum_level VARCHAR NOT NULL`, `age_range VARCHAR NOT NULL`, `description VARCHAR`.
- Primary key: `id`.
- Foreign keys: `subject_id` references `subjects.id`.
- Important relationships: Many topics belong to one subject.
- Feature use: Education catalogue, weak topic detection, recommendations, learning paths.

## weak_topics

- Purpose: Stores detected topics where a student may need support.
- Columns: `id INTEGER NOT NULL`, `student_id INTEGER NOT NULL`, `subject VARCHAR NOT NULL`, `topic VARCHAR NOT NULL`, `confidence_level FLOAT NOT NULL`, `detected_at DATETIME`.
- Primary key: `id`.
- Foreign keys: `student_id` references `students.id`.
- Important relationships: One student can have many weak topic records.
- Feature use: Weak topic detection, recommendations, intervention planning, dashboards.

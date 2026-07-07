# Academic Database Review

## Overview

The Senyra Learning Platform database is implemented locally as SQLite and accessed through FastAPI and SQLAlchemy. The inspected database contains 28 application tables covering accounts and RBAC, courses, lessons, quizzes, learning events, weak topic detection, recommendations, Learning DNA profiling, creativity assessment, flow state tracking, notifications, feedback, interventions, audit logs, and dashboard analytics.

The database is relational in structure. Most tables use integer surrogate primary keys and SQLAlchemy-generated foreign key constraints to model relationships between users, learning content, assessment activity, and analytics records.

## Normalization

The schema is partly normalized. Core content entities such as `courses`, `lessons`, `quizzes`, `questions`, `subjects`, and `topics` are separated into distinct tables. User-related activity is also separated into purpose-specific tables such as `quiz_attempts`, `lesson_progress`, `learning_events`, `recommendation_history`, and `flow_sessions`.

There are also intentional denormalized areas. For example, `weak_topics`, `subject_quiz_results`, and `flow_sessions` store `subject` and `topic` as text values rather than foreign keys to `subjects` and `topics`. This can simplify analytics and event capture, but it can lead to duplicated names, inconsistent spelling, and weaker referential integrity. Overall, the design is suitable for a final-year prototype and analytics-focused platform, while leaving clear scope for normalization improvements in a production version.

## Primary Keys

Every discovered application table has a primary key named `id`. This is a strong and consistent design choice because it simplifies SQLAlchemy relationships, API routing, and future migration to PostgreSQL. The schema also includes useful unique constraints:

- `students.email` is unique, supporting authentication.
- `subjects.name` is unique, preventing duplicate subjects.
- `learning_dna_profiles.student_id` is unique, giving each student one current Learning DNA profile.
- `flow_summaries.student_id` is unique, giving each student one aggregate flow summary.
- `lesson_progress` has a unique constraint on `student_id` and `lesson_id`, preventing duplicate lesson-completion rows.

## Foreign Keys and Relationships

The database defines many important foreign keys. The most central table is `students`, which acts as the account table for students, teachers, and admins through the `role` column. Many child tables reference `students.id`, including quiz attempts, learning events, recommendations, Learning DNA records, creativity assessments, flow sessions, notifications, feedback, interventions, audit logs, and class membership.

Important relationships include:

- One course to many lessons.
- One course to many quizzes.
- One quiz to many questions.
- One quiz to many quiz attempts.
- One student to many quiz attempts.
- One student to many learning events.
- One student to many weak topics.
- One student to one Learning DNA profile.
- One student to one flow summary.
- One teacher to many class groups.
- Many students to many class groups through `class_enrollments`.
- One creativity assessment to many creativity responses.
- One chat session to many chat messages.

The main limitation is that some fields that look relational are currently stored as text rather than as foreign keys. Examples include `subject_quiz_results.subject`, `subject_quiz_results.topic`, `weak_topics.subject`, `weak_topics.topic`, `flow_sessions.subject`, and `flow_sessions.topic`.

## Data Types

The schema uses common SQLite-compatible types: `INTEGER`, `VARCHAR`, `TEXT`, `FLOAT`, `BOOLEAN`, and `DATETIME`. These map well from SQLAlchemy and are easy to migrate to PostgreSQL equivalents such as `INTEGER`, `VARCHAR`, `TEXT`, `DOUBLE PRECISION` or `NUMERIC`, `BOOLEAN`, and `TIMESTAMP`.

For a production migration, score fields may benefit from explicit precision rules or validation ranges. For example, quiz scores, confidence scores, flow scores, and creativity dimensions could use check constraints to enforce valid bounds such as 0 to 100 or 0 to 1, depending on the application convention.

## SQLite Suitability

SQLite is suitable for the local development and academic demonstration version because it is lightweight, file-based, requires no separate database server, and integrates cleanly with SQLAlchemy. It is also easy to inspect using DB Browser for SQLite, which is useful for final-year project evidence and screenshots.

SQLite is less suitable for high-concurrency production workloads, complex role-based database permissions, and advanced analytics at scale. For the submitted prototype, however, SQLite is appropriate because the platform can demonstrate database design, authentication, learning records, ML-supporting event logs, and dashboards without deployment complexity.

## PostgreSQL Migration Readiness

The schema is reasonably ready for PostgreSQL because it is already defined through SQLAlchemy models and uses conventional relational concepts. The configuration also supports replacing a `postgres://` connection string with a PostgreSQL-compatible SQLAlchemy URL.

Migration readiness strengths:

- Consistent integer primary keys.
- SQLAlchemy model layer separates application code from the database engine.
- Most important relationships are represented with foreign keys.
- Data types have clear PostgreSQL equivalents.
- The application already uses a configurable `DATABASE_URL`.

Migration work still recommended:

- Add Alembic migrations so schema changes are versioned.
- Replace SQLite-specific assumptions around booleans and datetimes with explicit PostgreSQL-safe handling.
- Add missing indexes on frequent foreign-key and analytics columns, such as `student_id`, `quiz_id`, `created_at`, `timestamp`, `subject`, and `topic`.
- Convert text-based subject/topic references into foreign keys where strict integrity is required.
- Add check constraints for score ranges, roles, statuses, and enumerated values.

## Strengths

- The schema covers the major features of the platform, including learning content, assessment, analytics, personalization, interventions, and administrative oversight.
- Primary keys are consistent across tables.
- The design uses foreign keys for most high-value relationships.
- Separate tables for logs, events, attempts, profiles, and summaries support dashboard and ML use cases.
- Unique constraints prevent important duplicate records, especially for emails and one-to-one learner profiles.
- The event and history tables provide evidence of longitudinal learner tracking.

## Limitations

- The `students` table stores all user roles, so the table name does not fully describe teachers and admins.
- Role values are stored as free text rather than as a constrained enum or separate roles table.
- Several foreign-key-like fields are stored as plain text, especially subject and topic references in analytics tables.
- Many foreign key columns do not have dedicated indexes, which may affect performance as data grows.
- There are few database-level check constraints for scores, booleans, role values, and statuses.
- Cascade behaviour is not specified, so deletion rules depend on application logic.
- Password hashes are stored in a column named `password`; for clarity in documentation and future maintenance this should ideally be named `password_hash`.

## Recommended Improvements

1. Rename `students` to `users`, or document clearly that it represents all authenticated users.
2. Add a role constraint or separate `roles` table for `student`, `teacher`, and `admin`.
3. Add foreign keys from weak-topic and subject-result tables to normalized `subjects` and `topics` where appropriate.
4. Add indexes for common dashboard queries, especially by `student_id`, `teacher_id`, `quiz_id`, and timestamp fields.
5. Add check constraints for scores and confidence values.
6. Add Alembic migrations for controlled schema evolution.
7. Define deletion behaviour, such as restrict, cascade, or soft delete, for parent-child relationships.
8. Consider separating current analytical summaries from immutable event history to preserve auditability.

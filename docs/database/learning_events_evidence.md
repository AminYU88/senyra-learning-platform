# Learning Events Evidence

Generated on: 2026-06-26 16:52:23

## Database Inspected

- Exact database file: `C:\Users\abdia\OneDrive\Documents\senyra-learning-platform\senyra.db`
- Learning event table found: `learning_events`
- Candidate table names checked: `learning_events`, `learning_event`, `student_learning_events`
- Row count: `80`
- Status: The table is populated and can be used as dissertation evidence for implemented event logging.

## Table Schema

| Column | Type | Not Null | Default | Primary Key |
| --- | --- | --- | --- | --- |
| id | INTEGER | Yes |  | Yes |
| student_id | INTEGER | No |  | No |
| event_type | VARCHAR | Yes |  | No |
| event_value | VARCHAR | No |  | No |
| timestamp | DATETIME | No |  | No |

Foreign keys: `student_id` references `students.id`

Indexes: `ix_learning_events_id`

## First 20 Rows

| id | student_id | event_type | event_value | timestamp |
| --- | --- | --- | --- | --- |
| 1 | 1 | video_watch |  | 2026-05-19 19:16:12.328464 |
| 2 | 1 | quiz_attempt |  | 2026-05-19 19:19:45.453376 |
| 3 | 1 | coding_practice |  | 2026-05-19 19:20:07.451106 |
| 4 | 1 | video_watch | Python Video | 2026-05-20 15:49:40.589915 |
| 5 | 1 | video_watch | Python Video | 2026-05-20 15:49:42.155972 |
| 6 | 1 | video_watch | Python Video | 2026-05-20 15:49:43.161113 |
| 7 | 2 | video | Python Video | 2026-05-21 16:08:23.933553 |
| 8 | 2 | video_watch | Python Video | 2026-06-01 18:33:54.217052 |
| 9 | 2 | quiz_attempt | Quiz Completed | 2026-06-01 19:14:30.839376 |
| 10 | 2 | quiz_attempt | Quiz Completed | 2026-06-01 19:14:32.310723 |
| 11 | 2 | video_watch | Python Video | 2026-06-01 19:14:33.115832 |
| 12 | 2 | coding_practice | Coding Practice | 2026-06-01 19:14:40.327641 |
| 13 | 2 | video_watch | Introduction to Python | 2026-06-02 16:44:41.864838 |
| 14 | 2 | video_watch | Introduction to Python | 2026-06-02 16:44:44.282028 |
| 15 | 2 | video_watch | Introduction to Python | 2026-06-02 16:44:48.904502 |
| 16 | 2 | quiz_attempt | Quiz Completed | 2026-06-02 17:22:22.538079 |
| 17 | 2 | quiz_attempt | Quiz score: 100% | 2026-06-02 18:50:33.741920 |
| 18 | 2 | video_watch | Introduction to Python | 2026-06-03 14:29:25.468813 |
| 19 | 2 | video_watch | Introduction to Python | 2026-06-03 14:29:29.346857 |
| 20 | 2 | quiz_attempt | Quiz score: 100% | 2026-06-03 16:56:46.175576 |

## Event Types Found

`video_watch`, `quiz_attempt`, `coding_practice`, `lesson_complete`, `resource_view`, `video`

## Count of Each Event Type

| Event Type | Count |
| --- | --- |
| video_watch | 26 |
| quiz_attempt | 20 |
| coding_practice | 13 |
| lesson_complete | 10 |
| resource_view | 10 |
| video | 1 |

## Learning Analytics Relevance

The `learning_events` table provides direct evidence that the platform records learner interaction events over time. Each row links an event to a student account through `student_id`, classifies the behaviour using `event_type`, stores optional contextual information in `event_value`, and records when the interaction occurred using `timestamp`. This structure supports learning analytics because the backend can aggregate activity frequency, detect engagement patterns, identify common behaviours such as quiz attempts or lesson completion, and feed dashboard, recommendation, weak-topic, and machine learning features.

The populated event types show that the system captures multiple forms of learner activity rather than only assessment scores. For example, video/resource interactions, quiz attempts, coding practice, and lesson completion can be analysed together to build a more complete picture of learner engagement and progress. These records can also support time-based analysis, such as recent activity, activity trends, and evidence of sustained participation.

## Final-Year Report Paragraph

The Senyra Learning Platform implements event logging through the `learning_events` table in the SQLite database. This table stores learner interaction events using a relational structure containing an event identifier, optional student reference, event type, event value, and timestamp. In the inspected local database, the table contains 80 recorded events across 6 event type(s), including video_watch, quiz_attempt, coding_practice, lesson_complete, resource_view, video. This demonstrates that learning analytics is supported by stored behavioural data rather than being limited to static user or course records. The event log can be used by dashboards, recommendation logic, weak topic detection, and machine learning components to analyse engagement, progress, and learner behaviour over time.

## Notes on Seeding

No new seed script was created because the inspected table is already populated. The project does contain `backend/seed_demo_data.py`, which creates demo learning events, but it also deletes and refreshes demo student data before reseeding; therefore it should only be used deliberately when resetting demo data is acceptable.

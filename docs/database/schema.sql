-- Senyra Learning Platform SQLite schema export
-- Source database: senyra.db
-- Export date: 2026-06-26
-- Data rows are intentionally excluded.

-- table: audit_logs
CREATE TABLE audit_logs (
	id INTEGER NOT NULL,
	user_id INTEGER,
	user_role VARCHAR,
	action VARCHAR NOT NULL,
	description VARCHAR NOT NULL,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(user_id) REFERENCES students (id)
);

-- table: chat_messages
CREATE TABLE chat_messages (
	id INTEGER NOT NULL,
	session_id INTEGER NOT NULL,
	role VARCHAR NOT NULL,
	content TEXT NOT NULL,
	timestamp DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(session_id) REFERENCES chat_sessions (id)
);

-- table: chat_sessions
CREATE TABLE chat_sessions (
	id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	title VARCHAR,
	is_favourite BOOLEAN,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(user_id) REFERENCES students (id)
);

-- table: class_enrollments
CREATE TABLE class_enrollments (
	id INTEGER NOT NULL,
	class_id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(class_id) REFERENCES class_groups (id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: class_groups
CREATE TABLE class_groups (
	id INTEGER NOT NULL,
	name VARCHAR NOT NULL,
	teacher_id INTEGER NOT NULL,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(teacher_id) REFERENCES students (id)
);

-- table: courses
CREATE TABLE courses (
	id INTEGER NOT NULL,
	title VARCHAR NOT NULL,
	description TEXT,
	level VARCHAR,
	PRIMARY KEY (id)
);

-- table: creativity_assessments
CREATE TABLE creativity_assessments (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	assessment_type VARCHAR NOT NULL,
	creativity_score FLOAT NOT NULL,
	fluency_score FLOAT NOT NULL,
	flexibility_score FLOAT NOT NULL,
	originality_score FLOAT NOT NULL,
	elaboration_score FLOAT NOT NULL,
	creative_confidence VARCHAR NOT NULL,
	problem_solving_style VARCHAR NOT NULL,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: creativity_responses
CREATE TABLE creativity_responses (
	id INTEGER NOT NULL,
	assessment_id INTEGER NOT NULL,
	prompt VARCHAR NOT NULL,
	response_text TEXT NOT NULL,
	score FLOAT NOT NULL,
	feedback TEXT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(assessment_id) REFERENCES creativity_assessments (id)
);

-- table: feedback_messages
CREATE TABLE feedback_messages (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	teacher_id INTEGER NOT NULL,
	subject VARCHAR NOT NULL,
	message VARCHAR NOT NULL,
	is_read BOOLEAN,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id),
	FOREIGN KEY(teacher_id) REFERENCES students (id)
);

-- table: flow_sessions
CREATE TABLE flow_sessions (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	started_at DATETIME,
	ended_at DATETIME,
	duration_minutes FLOAT,
	activity_type VARCHAR NOT NULL,
	subject VARCHAR,
	topic VARCHAR,
	completed_task BOOLEAN,
	quiz_score FLOAT,
	resource_views INTEGER,
	engagement_events INTEGER,
	flow_score FLOAT,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: flow_summaries
CREATE TABLE flow_summaries (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	average_flow_score FLOAT,
	best_time_start VARCHAR,
	best_time_end VARCHAR,
	strongest_subject VARCHAR,
	weakest_subject VARCHAR,
	updated_at DATETIME,
	PRIMARY KEY (id),
	UNIQUE (student_id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: intervention_plans
CREATE TABLE intervention_plans (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	teacher_id INTEGER NOT NULL,
	title VARCHAR NOT NULL,
	target_area VARCHAR NOT NULL,
	action_plan VARCHAR NOT NULL,
	status VARCHAR,
	is_completed BOOLEAN,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id),
	FOREIGN KEY(teacher_id) REFERENCES students (id)
);

-- table: learning_dna_profiles
CREATE TABLE learning_dna_profiles (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	learner_type VARCHAR NOT NULL,
	confidence_score FLOAT NOT NULL,
	analytical_score FLOAT NOT NULL,
	creative_score FLOAT NOT NULL,
	visual_score FLOAT NOT NULL,
	problem_solver_score FLOAT NOT NULL,
	exploratory_score FLOAT NOT NULL,
	created_at DATETIME,
	updated_at DATETIME,
	PRIMARY KEY (id),
	UNIQUE (student_id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: learning_dna_questionnaire_responses
CREATE TABLE learning_dna_questionnaire_responses (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	question TEXT NOT NULL,
	answer TEXT NOT NULL,
	score_category VARCHAR NOT NULL,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: learning_events
CREATE TABLE learning_events (
	id INTEGER NOT NULL,
	student_id INTEGER,
	event_type VARCHAR NOT NULL,
	event_value VARCHAR,
	timestamp DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: lesson_progress
CREATE TABLE lesson_progress (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	lesson_id INTEGER NOT NULL,
	completed_at DATETIME,
	PRIMARY KEY (id),
	CONSTRAINT unique_student_lesson_progress UNIQUE (student_id, lesson_id),
	FOREIGN KEY(student_id) REFERENCES students (id),
	FOREIGN KEY(lesson_id) REFERENCES lessons (id)
);

-- table: lessons
CREATE TABLE lessons (
	id INTEGER NOT NULL,
	title VARCHAR NOT NULL,
	content TEXT,
	video_url VARCHAR,
	course_id INTEGER,
	PRIMARY KEY (id),
	FOREIGN KEY(course_id) REFERENCES courses (id)
);

-- table: notifications
CREATE TABLE notifications (
	id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	title VARCHAR NOT NULL,
	message VARCHAR NOT NULL,
	notification_type VARCHAR,
	is_read BOOLEAN,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(user_id) REFERENCES students (id)
);

-- table: questions
CREATE TABLE questions (
	id INTEGER NOT NULL,
	quiz_id INTEGER NOT NULL,
	question_text VARCHAR NOT NULL,
	option_a VARCHAR NOT NULL,
	option_b VARCHAR NOT NULL,
	option_c VARCHAR NOT NULL,
	option_d VARCHAR NOT NULL,
	correct_answer VARCHAR NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(quiz_id) REFERENCES quizzes (id)
);

-- table: quiz_attempts
CREATE TABLE quiz_attempts (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	quiz_id INTEGER NOT NULL,
	score INTEGER NOT NULL,
	attempted_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id),
	FOREIGN KEY(quiz_id) REFERENCES quizzes (id)
);

-- table: quizzes
CREATE TABLE quizzes (
	id INTEGER NOT NULL,
	title VARCHAR NOT NULL,
	course_id INTEGER NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(course_id) REFERENCES courses (id)
);

-- table: recommendation_history
CREATE TABLE recommendation_history (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	recommendation VARCHAR NOT NULL,
	reason VARCHAR,
	is_helpful BOOLEAN,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: student_notes
CREATE TABLE student_notes (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	teacher_id INTEGER NOT NULL,
	note VARCHAR NOT NULL,
	action_taken VARCHAR,
	created_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id),
	FOREIGN KEY(teacher_id) REFERENCES students (id)
);

-- table: students
CREATE TABLE students (
	id INTEGER NOT NULL,
	full_name VARCHAR NOT NULL,
	email VARCHAR NOT NULL,
	password VARCHAR NOT NULL,
	role VARCHAR,
	PRIMARY KEY (id),
	UNIQUE (email)
);

-- table: subject_quiz_results
CREATE TABLE subject_quiz_results (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	subject VARCHAR NOT NULL,
	topic VARCHAR NOT NULL,
	score FLOAT NOT NULL,
	taken_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- table: subjects
CREATE TABLE subjects (
	id INTEGER NOT NULL,
	name VARCHAR NOT NULL,
	description VARCHAR,
	PRIMARY KEY (id),
	UNIQUE (name)
);

-- table: topics
CREATE TABLE topics (
	id INTEGER NOT NULL,
	name VARCHAR NOT NULL,
	subject_id INTEGER NOT NULL,
	difficulty_level VARCHAR NOT NULL,
	curriculum_level VARCHAR NOT NULL,
	age_range VARCHAR NOT NULL,
	description VARCHAR,
	PRIMARY KEY (id),
	FOREIGN KEY(subject_id) REFERENCES subjects (id)
);

-- table: weak_topics
CREATE TABLE weak_topics (
	id INTEGER NOT NULL,
	student_id INTEGER NOT NULL,
	subject VARCHAR NOT NULL,
	topic VARCHAR NOT NULL,
	confidence_level FLOAT NOT NULL,
	detected_at DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(student_id) REFERENCES students (id)
);

-- indexes
CREATE INDEX ix_audit_logs_id ON audit_logs (id);
CREATE INDEX ix_chat_messages_id ON chat_messages (id);
CREATE INDEX ix_chat_messages_session_id ON chat_messages (session_id);
CREATE INDEX ix_chat_sessions_id ON chat_sessions (id);
CREATE INDEX ix_chat_sessions_user_id ON chat_sessions (user_id);
CREATE INDEX ix_class_enrollments_id ON class_enrollments (id);
CREATE INDEX ix_class_groups_id ON class_groups (id);
CREATE INDEX ix_courses_id ON courses (id);
CREATE INDEX ix_creativity_assessments_id ON creativity_assessments (id);
CREATE INDEX ix_creativity_responses_id ON creativity_responses (id);
CREATE INDEX ix_feedback_messages_id ON feedback_messages (id);
CREATE INDEX ix_flow_sessions_id ON flow_sessions (id);
CREATE INDEX ix_flow_summaries_id ON flow_summaries (id);
CREATE INDEX ix_intervention_plans_id ON intervention_plans (id);
CREATE INDEX ix_learning_dna_profiles_id ON learning_dna_profiles (id);
CREATE INDEX ix_learning_dna_questionnaire_responses_id ON learning_dna_questionnaire_responses (id);
CREATE INDEX ix_learning_events_id ON learning_events (id);
CREATE INDEX ix_lesson_progress_id ON lesson_progress (id);
CREATE INDEX ix_lessons_id ON lessons (id);
CREATE INDEX ix_notifications_id ON notifications (id);
CREATE INDEX ix_questions_id ON questions (id);
CREATE INDEX ix_quiz_attempts_id ON quiz_attempts (id);
CREATE INDEX ix_quizzes_id ON quizzes (id);
CREATE INDEX ix_recommendation_history_id ON recommendation_history (id);
CREATE INDEX ix_student_notes_id ON student_notes (id);
CREATE INDEX ix_students_id ON students (id);
CREATE INDEX ix_subject_quiz_results_id ON subject_quiz_results (id);
CREATE INDEX ix_subjects_id ON subjects (id);
CREATE INDEX ix_topics_id ON topics (id);
CREATE INDEX ix_weak_topics_id ON weak_topics (id);

import { useNavigate } from "react-router-dom";
import { FaClipboardCheck, FaExclamationTriangle, FaRedo } from "react-icons/fa";


const severityClasses = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700"
};

const statusClasses = {
  Weak: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Strong: "bg-emerald-100 text-emerald-700"
};


function WeakTopicsCard({
  title = "Weak Topics",
  subtitle = "Topics detected from quiz scores, engagement and lesson completion.",
  topics = [],
  loading = false,
  error = "",
  mode = "student",
  compact = false
}) {
  const navigate = useNavigate();
  const visibleTopics = compact ? topics.slice(0, 3) : topics;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-amber-600">
            Weak Topic Detection
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <FaExclamationTriangle />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      {!error && loading && (
        <div className="rounded-xl bg-slate-50 p-4 font-semibold text-slate-500">
          Classifying topic strength from quiz scores, attempts, progress and engagement...
        </div>
      )}

      {!error && !loading && visibleTopics.length === 0 && (
        <div className="rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
          No topic evidence is available yet. Complete topic quizzes and lessons to unlock Weak, Medium and Strong classifications.
        </div>
      )}

      {!error && !loading && visibleTopics.length > 0 && (
        <div className="space-y-3">
          {visibleTopics.map((topic) => (
            <WeakTopicRow
              key={`${topic.subject}-${topic.topic}-${topic.student_id || "group"}`}
              topic={topic}
              mode={mode}
              compact={compact}
              onRevise={() => navigate(`/study-planner?subject=${encodeURIComponent(topic.subject)}&topic=${encodeURIComponent(topic.topic)}`)}
              onQuiz={() => navigate(`/quiz-generator?subject=${encodeURIComponent(topic.subject)}&topic=${encodeURIComponent(topic.topic)}`)}
            />
          ))}
        </div>
      )}

      {compact && topics.length > 3 && (
        <button
          type="button"
          onClick={() => navigate("/weak-topics")}
          className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800"
        >
          View all topic strengths
        </button>
      )}
    </section>
  );
}


function WeakTopicRow({
  topic,
  mode,
  compact,
  onRevise,
  onQuiz
}) {
  const strugglingCount = topic.struggling_students?.length || 0;
  const score = Number(topic.average_score || 0);
  const status = topic.status || (score < 60 ? "Weak" : score < 80 ? "Medium" : "Strong");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-950">
              {topic.topic}
            </h3>

            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[status] || "bg-slate-200 text-slate-700"}`}>
              {status}
            </span>

            <span className={`rounded-full px-3 py-1 text-xs font-bold ${severityClasses[topic.severity] || "bg-slate-200 text-slate-700"}`}>
              {topic.severity} priority
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {topic.subject} - average {Math.round(score)}% - {topic.attempts || 0} attempt{topic.attempts === 1 ? "" : "s"}
          </p>

          {!compact && (
            <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
              Engagement {Math.round(topic.engagement_score || 0)}% - Lesson completion {Math.round(topic.lesson_completion || 0)}%
            </p>
          )}

          {mode !== "student" && strugglingCount > 0 && (
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {topic.weak_students || strugglingCount} weak - {topic.medium_students || 0} medium - {topic.strong_students || 0} strong
            </p>
          )}

          {!compact && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {topic.recommendation}
            </p>
          )}

          {!compact && mode !== "student" && strugglingCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {topic.struggling_students.slice(0, 5).map((student) => (
                <span
                  key={student.student_id}
                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {student.student}
                </span>
              ))}
            </div>
          )}
        </div>

        {mode === "student" && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={onRevise}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <FaRedo />
              Revise Topic
            </button>

            <button
              type="button"
              onClick={onQuiz}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              <FaClipboardCheck />
              Take Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export default WeakTopicsCard;

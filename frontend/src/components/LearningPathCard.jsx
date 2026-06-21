import { FaBrain, FaRoute } from "react-icons/fa";


const difficultyClasses = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700"
};


function LearningPathCard({
  path,
  loading = false,
  error = "",
  compact = false,
  onOpen
}) {
  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
        {error}
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-500 shadow-sm">
        Generating adaptive learning path...
      </section>
    );
  }

  if (!path) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-500 shadow-sm">
        Not enough learning data for an adaptive path yet.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-blue-600">
            Adaptive Learning Path
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {path.recommended_level || path.level}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {path.reason}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <FaRoute />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniMetric label="Current Level" value={path.current_level || "Not assessed"} />
        <MiniMetric label="Recommended" value={path.recommended_level || path.level} />
        <MiniMetric label="Status" value={path.progress_status || `${Math.round(path.progress_percent || 0)}%`} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniMetric label="Subject" value={path.subject} />
        <MiniMetric label="Difficulty" value={path.difficulty} className={difficultyClasses[path.difficulty]} />
        <MiniMetric label="Progress" value={`${Math.round(path.progress_percent || 0)}%`} />
      </div>

      {!compact && (
        <div className="mt-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-950">
            <FaBrain className="text-blue-600" />
            Why this path
          </h3>
          <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Quiz average {Math.round(path.signals?.average_quiz_score || 0)}%, engagement {Math.round(path.signals?.engagement_score || 0)}%, flow {Math.round(path.signals?.flow_score || 0)}%, weak topics {path.signals?.weak_topic_count || 0}, learner type {path.signals?.learner_type || "Not assessed"}.
          </p>
        </div>
      )}

      {compact && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800"
        >
          Open learning path
        </button>
      )}
    </section>
  );
}


function MiniMetric({
  label,
  value,
  className = "bg-slate-100 text-slate-700"
}) {
  return (
    <div className={`rounded-xl p-4 ${className}`}>
      <p className="text-xs font-bold uppercase opacity-70">
        {label}
      </p>
      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}


export default LearningPathCard;

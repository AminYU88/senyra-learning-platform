import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";


function WeakTopicsWidget({
  topics = [],
  loading,
  error
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-slate-500 font-semibold">
            Weak Topics
          </p>

          <h2 className="text-2xl font-bold text-slate-950 mt-2">
            Personalised Revision Focus
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
          <FaExclamationTriangle />
        </div>
      </div>

      {error && (
        <p className="text-red-600 font-semibold">
          {error}
        </p>
      )}

      {!error && loading && (
        <p className="text-slate-500">
          Analysing quiz scores and weak topic records...
        </p>
      )}

      {!error && !loading && topics.length === 0 && (
        <div className="bg-slate-50 rounded-xl p-4 text-slate-600">
          No weak topics recorded yet. Complete quizzes to unlock topic-level insights.
        </div>
      )}

      {!error && !loading && topics.length > 0 && (
        <div className="space-y-3">
          {topics.slice(0, 5).map((item) => (
            <div
              key={`${item.subject}-${item.topic}`}
              className="bg-slate-50 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-slate-950">
                  {item.topic}
                </h3>

                <p className="text-sm text-slate-500">
                  {item.subject}
                  {item.score !== null && item.score !== undefined
                    ? ` - latest score ${Math.round(item.score)}%`
                    : item.average_score !== null && item.average_score !== undefined
                    ? ` - average ${Math.round(item.average_score)}%`
                    : ""}
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                Focus
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate("/weak-topics")}
        className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold"
      >
        Revise weak topics
      </button>
    </div>
  );
}

export default WeakTopicsWidget;

import { useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";


function FlowScoreWidget({
  today,
  summary,
  loading,
  error
}) {
  const navigate = useNavigate();
  const score = Math.round(today?.average_flow_score || 0);
  const hasFlowData = Boolean(
    (today?.sessions || []).length > 0
    || (summary?.average_flow_score || 0) > 0
  );

  const nextAction = hasFlowData
    ? summary?.recommendation || today?.recommendation || "Use your strongest focus window for harder topics."
    : "Start your first focus session.";

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-slate-500 font-semibold">
            Flow Score
          </p>

          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            {loading ? "Loading..." : hasFlowData ? `${score}%` : "Not started"}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-xl">
          <FaBolt />
        </div>
      </div>

      {error ? (
        <p className="text-red-600 font-semibold">
          {error}
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-slate-600">
            Best focus time: <span className="font-bold">{summary?.best_time || "Learning from your sessions"}</span>
          </p>

          <div className="bg-slate-50 rounded-xl p-4 text-slate-700">
            {nextAction}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate("/flow-state")}
        className="mt-5 w-full bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-xl font-bold"
      >
        View Flow State
      </button>
    </div>
  );
}

export default FlowScoreWidget;

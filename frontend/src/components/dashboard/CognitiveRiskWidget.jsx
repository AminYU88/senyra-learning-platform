import { useNavigate } from "react-router-dom";
import { FaBrain } from "react-icons/fa";


function CognitiveRiskWidget({
  summary,
  loading,
  error
}) {
  const navigate = useNavigate();
  const hasInsights = Boolean(summary?.cognitive_risk_level);
  const mainRisk = summary?.key_risk_factors?.[0] || "No main risk factor detected";
  const mainProtection = summary?.protective_factors?.[0] || "Protective factors will appear with more activity";

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-slate-500 font-semibold">
            Cognitive Risk
          </p>

          <h2 className="text-2xl font-bold text-slate-950 mt-2">
            {loading ? "Loading..." : hasInsights ? summary.cognitive_risk_level : "Not available"}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center text-xl">
          <FaBrain />
        </div>
      </div>

      {error ? (
        <p className="text-red-600 font-semibold">
          {error}
        </p>
      ) : hasInsights ? (
        <div className="space-y-3">
          <p className="text-slate-600">
            Confidence: <span className="font-bold">{Math.round(summary.confidence_score)}%</span>
          </p>

          <div className="bg-red-50 rounded-xl p-3 text-red-800 text-sm font-semibold">
            {mainRisk}
          </div>

          <div className="bg-green-50 rounded-xl p-3 text-green-800 text-sm font-semibold">
            {mainProtection}
          </div>
        </div>
      ) : (
        <p className="text-slate-500">
          Complete learning activities to generate cognitive risk insights.
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate("/cognitive-risk")}
        className="mt-5 w-full bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-bold"
      >
        View Cognitive Risk
      </button>
    </div>
  );
}

export default CognitiveRiskWidget;

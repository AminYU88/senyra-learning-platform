import { FaBrain, FaChartLine } from "react-icons/fa";


function riskStyles(level) {
  if (level === "High") {
    return "bg-red-50 text-red-700 border-red-100";
  }
  if (level === "Medium") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  return "bg-green-50 text-green-700 border-green-100";
}


function CognitiveRiskCard({
  prediction
}) {
  if (!prediction) {
    return (
      <section className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
        Run an advanced cognitive risk prediction or review your current summary.
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">
            Cognitive Risk Level
          </p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">
            {prediction.cognitive_risk_level}
          </h2>
        </div>

        <div className={`w-14 h-14 rounded-xl border flex items-center justify-center text-2xl ${riskStyles(prediction.cognitive_risk_level)}`}>
          <FaBrain />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 font-semibold flex items-center gap-2">
            <FaChartLine />
            Confidence
          </span>
          <span className="font-bold text-slate-950">
            {Math.round(prediction.confidence_score || 0)}%
          </span>
        </div>

        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${Math.min(Math.round(prediction.confidence_score || 0), 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 bg-slate-50 rounded-xl p-4">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
          AI Recommendation
        </p>
        <p className="text-slate-800 font-semibold mt-2 leading-relaxed">
          {prediction.recommendation}
        </p>
      </div>
    </section>
  );
}

export default CognitiveRiskCard;

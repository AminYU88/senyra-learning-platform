import { FaLightbulb } from "react-icons/fa";


function FlowRecommendationCard({
  summary,
  today
}) {
  const recommendation = summary?.recommendation
    || today?.recommendation
    || "Start a flow session to receive personalised focus recommendations.";

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
          <FaLightbulb />
        </div>

        <div>
          <p className="text-sm font-bold text-amber-600 uppercase tracking-wide">
            Personalised Recommendation
          </p>
          <h2 className="text-2xl font-bold text-slate-950 mt-1">
            Improve your flow state
          </h2>
        </div>
      </div>

      <p className="text-slate-700 mt-5 leading-relaxed">
        {recommendation}
      </p>

      {today?.message && (
        <div className="mt-5 bg-slate-50 rounded-xl p-4">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Today
          </p>
          <p className="text-slate-800 font-semibold mt-1">
            {today.message}
          </p>
        </div>
      )}
    </section>
  );
}

export default FlowRecommendationCard;

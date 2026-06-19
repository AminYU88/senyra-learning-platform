import { FaBrain } from "react-icons/fa";


const riskStyles = {
  Low: "bg-green-50 text-green-700",
  Medium: "bg-yellow-50 text-yellow-700",
  High: "bg-red-50 text-red-700",
  Unknown: "bg-slate-100 text-slate-700",
  Unavailable: "bg-slate-100 text-slate-700"
};


function RiskPredictorWidget({
  data,
  loading,
  error
}) {
  const riskLevel = data?.risk_level || "Unavailable";
  const confidence = data?.confidence;
  const factors = data?.factors || [];
  const isAvailable = data?.available !== false;

  return (
    <div className="bg-white rounded-2xl shadow p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-slate-500 font-semibold">
            Student Risk
          </p>

          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            {loading ? "Loading..." : riskLevel}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl">
          <FaBrain />
        </div>
      </div>

      {error ? (
        <p className="text-red-600 font-semibold">
          {error}
        </p>
      ) : (
        <>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${riskStyles[riskLevel] || riskStyles.Unknown}`}>
            {isAvailable ? `${riskLevel} Risk` : "Prediction unavailable"}
          </span>

          <p className="text-slate-600 mt-4">
            {isAvailable && confidence !== null && confidence !== undefined
              ? `Confidence: ${Math.round(confidence)}%`
              : "Risk prediction unavailable until model is trained."}
          </p>

          {factors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-bold text-slate-500 mb-2">
                Contributing factors
              </p>

              <div className="space-y-2">
                {factors.map((factor) => (
                  <div
                    key={factor}
                    className="flex items-center gap-3 text-slate-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 bg-slate-50 rounded-xl p-4 text-slate-600">
            {data?.recommendation || "Complete more learning activity to unlock personalised risk guidance."}
          </div>
        </>
      )}
    </div>
  );
}

export default RiskPredictorWidget;

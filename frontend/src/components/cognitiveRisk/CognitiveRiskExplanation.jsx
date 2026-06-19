import { FaInfoCircle } from "react-icons/fa";


function CognitiveRiskExplanation({
  prediction,
  factorsInfo
}) {
  const explanations = factorsInfo?.feature_explanations || {};

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <FaInfoCircle />
        </div>
        <h2 className="text-2xl font-bold text-slate-950">
          How Prediction Works
        </h2>
      </div>

      <p className="text-slate-700 leading-relaxed">
        Cognitive Risk Prediction combines the existing academic risk signals with cognitive and behavioural evidence:
        creativity assessment scores, Flow State focus data, Learning DNA profile confidence, study consistency,
        task completion, problem-solving patterns and weak topic detection.
      </p>

      {prediction && (
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <Info label="Prediction source" value={prediction.prediction_source} />
          <Info label="Model" value={prediction.model_name} />
        </div>
      )}

      {Object.keys(explanations).length > 0 && (
        <div className="mt-6 space-y-3">
          {Object.entries(explanations).map(([feature, explanation]) => (
            <div key={feature} className="bg-slate-50 rounded-xl p-4">
              <p className="font-bold text-slate-950">
                {feature.replaceAll("_", " ")}
              </p>
              <p className="text-slate-600 mt-1">
                {explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


function Info({
  label,
  value
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-sm text-slate-500 font-semibold">
        {label}
      </p>
      <p className="font-bold text-slate-950 mt-1">
        {value || "Unavailable"}
      </p>
    </div>
  );
}

export default CognitiveRiskExplanation;

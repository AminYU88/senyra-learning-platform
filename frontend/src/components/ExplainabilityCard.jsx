import { FaBrain, FaInfoCircle } from "react-icons/fa";

import FactorImpactList from "./FactorImpactList";
import PredictionExplanation from "./PredictionExplanation";


function ExplainabilityCard({
  explanation,
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
        Loading AI explanation...
      </section>
    );
  }

  if (!explanation) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-500 shadow-sm">
        No explanation available yet.
      </section>
    );
  }

  const hasConfidence = explanation.confidence !== null && explanation.confidence !== undefined;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-indigo-600">
            Why this recommendation?
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {explanation.prediction_type}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Result: {explanation.result}
            {hasConfidence ? ` - confidence ${Math.round(explanation.confidence * 100)}%` : ""}
          </p>
          {explanation.confidence_label && (
            <p className="mt-1 text-xs font-bold uppercase text-slate-400">
              {explanation.confidence_label}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <FaBrain />
        </div>
      </div>

      <div className="mt-5">
        <PredictionExplanation
          explanation={explanation.explanation}
          suggestedAction={explanation.suggested_action}
        />
      </div>

      {!compact && explanation.evidence_source && (
        <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm font-semibold leading-6 text-indigo-800">
          Evidence source: {explanation.evidence_source}
        </div>
      )}

      {!compact && (
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <FactorImpactList
            title="Positive Factors"
            factors={explanation.positive_factors || []}
          />
          <FactorImpactList
            title="Negative Factors"
            factors={explanation.negative_factors || []}
          />
        </div>
      )}

      {compact && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800"
        >
          <FaInfoCircle />
          View explanations
        </button>
      )}
    </section>
  );
}


export default ExplainabilityCard;

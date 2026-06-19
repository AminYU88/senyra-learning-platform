function PredictionExplanation({
  explanation,
  suggestedAction
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-blue-50 p-4">
        <p className="text-sm font-bold uppercase text-blue-700">
          Plain-English Explanation
        </p>
        <p className="mt-2 leading-6 text-blue-900">
          {explanation || "No explanation is available yet."}
        </p>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-bold uppercase text-slate-500">
          Suggested Action
        </p>
        <p className="mt-2 leading-6 text-slate-700">
          {suggestedAction || "Collect more learning evidence before taking action."}
        </p>
      </div>
    </div>
  );
}


export default PredictionExplanation;

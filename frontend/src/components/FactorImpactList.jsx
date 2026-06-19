const impactStyles = {
  positive: "bg-emerald-50 text-emerald-700",
  negative: "bg-red-50 text-red-700",
  neutral: "bg-slate-100 text-slate-700"
};


function FactorImpactList({
  factors = [],
  title = "Contributing Factors"
}) {
  if (!factors.length) {
    return (
      <div className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
        No factor evidence available yet.
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 font-bold text-slate-950">
        {title}
      </h3>

      <div className="space-y-2">
        {factors.map((factor) => (
          <div
            key={`${factor.factor}-${factor.value}-${factor.impact}`}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-slate-950">
                {factor.factor}
              </p>
              <p className="text-sm text-slate-500">
                {factor.value}
              </p>
            </div>

            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${impactStyles[factor.impact] || impactStyles.neutral}`}>
              {factor.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


export default FactorImpactList;

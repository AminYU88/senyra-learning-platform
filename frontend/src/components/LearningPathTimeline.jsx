function LearningPathTimeline({
  steps = []
}) {
  if (!steps.length) {
    return (
      <div className="rounded-xl bg-slate-50 p-4 font-semibold text-slate-500">
        No learning path steps available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div
          key={step.step}
          className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            {step.step}
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              {step.title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {step.description}
            </p>

            <p className="mt-2 text-xs font-bold uppercase text-slate-400">
              {step.subject} · {step.topic} · {step.estimated_minutes} min
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}


export default LearningPathTimeline;

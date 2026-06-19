function LearningDNAResultCard({
  title,
  value,
  detail,
  barColor = "bg-blue-600"
}) {
  const score = Number(value || 0);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500 font-semibold">
        {title}
      </p>

      <h2 className="text-4xl font-bold text-slate-950 mt-2">
        {score}%
      </h2>

      <div className="mt-4 w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      {detail && (
        <p className="text-sm text-slate-500 mt-3">
          {detail}
        </p>
      )}
    </div>
  );
}

export default LearningDNAResultCard;

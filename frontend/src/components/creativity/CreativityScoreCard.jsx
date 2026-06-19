function CreativityScoreCard({
  label,
  value,
  detail,
  barColor = "bg-blue-600"
}) {
  const numericValue = Number(value || 0);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500 font-semibold">
        {label}
      </p>

      <h2 className="text-4xl font-bold text-slate-950 mt-2">
        {numericValue}
      </h2>

      <div className="mt-4 w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(numericValue, 100)}%` }}
        />
      </div>

      {detail && (
        <p className="text-slate-500 mt-3 text-sm">
          {detail}
        </p>
      )}
    </div>
  );
}

export default CreativityScoreCard;

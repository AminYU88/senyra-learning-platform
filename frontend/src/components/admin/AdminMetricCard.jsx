function AdminMetricCard({
  icon,
  title,
  value,
  detail,
  color = "bg-slate-100 text-slate-700"
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            {value}
          </h2>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${color}`}>
          {icon}
        </div>
      </div>

      {detail && (
        <p className="text-sm text-slate-500 mt-4">
          {detail}
        </p>
      )}
    </div>
  );
}

export default AdminMetricCard;

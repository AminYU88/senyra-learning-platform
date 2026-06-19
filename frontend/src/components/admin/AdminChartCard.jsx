function AdminChartCard({
  title,
  subtitle,
  children
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-950">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

export default AdminChartCard;

function AdminQuickActionCard({
  icon,
  title,
  description,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 p-4 transition"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div>
          <h3 className="font-bold text-slate-950">
            {title}
          </h3>

          <p className="text-sm text-slate-500 mt-1 leading-5">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default AdminQuickActionCard;

import { FaClock, FaGraduationCap } from "react-icons/fa";


function BestStudyTimeCard({
  summary,
  loading,
  error
}) {
  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-wide">
            Best Study Time
          </p>
          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            {loading ? "--" : summary?.best_time || "Not enough data"}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl">
          <FaClock />
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 font-semibold">
          {error}
        </p>
      ) : (
        <p className="mt-4 text-slate-600">
          {summary?.message || "Complete more sessions so Senyra can detect your strongest focus window."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
            <FaGraduationCap />
            Strongest
          </div>
          <p className="font-bold text-slate-950 mt-1">
            {summary?.strongest_subject || "Pending"}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
            <FaGraduationCap />
            Needs support
          </div>
          <p className="font-bold text-slate-950 mt-1">
            {summary?.weakest_subject || "Pending"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default BestStudyTimeCard;

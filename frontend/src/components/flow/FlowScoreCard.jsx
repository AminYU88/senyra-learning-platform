import { FaBolt, FaClock, FaChartLine } from "react-icons/fa";


function FlowScoreCard({
  today,
  loading,
  error
}) {
  const score = Math.round(today?.average_flow_score || 0);
  const duration = Math.round(today?.total_duration_minutes || 0);
  const sessions = today?.sessions?.length || 0;

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">
            Today&apos;s Flow Score
          </p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">
            {loading ? "--" : `${score}%`}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">
          <FaBolt />
        </div>
      </div>

      <div className="mt-5 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 font-semibold">
          {error}
        </p>
      ) : (
        <p className="mt-4 text-slate-600">
          {loading ? "Loading flow analytics..." : today?.message || "Start a focus session to calculate your flow score."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
            <FaClock />
            Duration
          </div>
          <p className="text-2xl font-bold text-slate-950 mt-1">
            {duration} min
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
            <FaChartLine />
            Sessions
          </div>
          <p className="text-2xl font-bold text-slate-950 mt-1">
            {sessions}
          </p>
        </div>
      </div>
    </section>
  );
}

export default FlowScoreCard;

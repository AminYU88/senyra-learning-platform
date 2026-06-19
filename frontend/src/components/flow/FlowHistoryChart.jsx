import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";


function formatLabel(value) {
  if (!value) {
    return "Session";
  }

  return new Date(value).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric"
    }
  );
}


function FlowHistoryChart({
  history = [],
  loading,
  error
}) {
  const chartData = history
    .filter((session) => session.ended_at)
    .slice()
    .reverse()
    .map((session) => ({
      name: formatLabel(session.started_at),
      score: Math.round(session.flow_score || 0),
      duration: Math.round(session.duration_minutes || 0),
      subject: session.subject || "General"
    }));

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Flow History
          </p>
          <h2 className="text-2xl font-bold text-slate-950 mt-1">
            Recent focus trend
          </h2>
        </div>

        <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold">
          {chartData.length} completed sessions
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {!error && loading && (
        <div className="h-72 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 font-semibold">
          Loading flow history...
        </div>
      )}

      {!error && !loading && chartData.length === 0 && (
        <div className="h-72 bg-slate-50 rounded-xl flex items-center justify-center text-center px-6">
          <p className="text-slate-500 font-semibold">
            Complete your first focus session to see flow trends over time.
          </p>
        </div>
      )}

      {!error && !loading && chartData.length > 0 && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis domain={[0, 100]} stroke="#64748b" />
              <Tooltip
                formatter={(value, name) => [
                  name === "score" ? `${value}%` : value,
                  name === "score" ? "Flow score" : name
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default FlowHistoryChart;

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";


function FlowAnalyticsPanel({
  overview,
  loading,
  error
}) {
  const bestWindow = overview?.best_time_distribution?.[0]?.hour || "Not enough data";
  const strongestSubject = overview?.strongest_subjects?.[0]?.subject || "Pending";

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-950">
          Flow Analytics
        </h2>
        <p className="text-slate-500 mt-1">
          Focus score, productive study times, engagement trends and low-flow support signals.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {!error && loading && (
        <p className="text-slate-500">
          Loading flow analytics...
        </p>
      )}

      {!error && !loading && (overview?.total_sessions || 0) === 0 && (
        <div className="bg-slate-50 rounded-xl p-4 text-slate-600">
          No flow sessions have been completed yet.
        </div>
      )}

      {!error && !loading && (overview?.total_sessions || 0) > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MiniMetric label="Average class flow" value={`${Math.round(overview.average_flow_score || 0)}%`} />
            <MiniMetric label="Productive time" value={bestWindow} />
            <MiniMetric label="Avg duration" value={`${Math.round(overview.average_duration_minutes || 0)} min`} />
            <MiniMetric label="Highest focus" value={strongestSubject} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-950 mb-4">
                Engagement trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overview.engagement_trends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="average_flow_score" stroke="#0891b2" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-950 mb-4">
                Most productive study times
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.best_time_distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ListPanel
              title="Subject focus"
              items={(overview.strongest_subjects || []).map(item => `${item.subject}: ${Math.round(item.average_flow_score)}% average flow`)}
              emptyText="Subject focus will appear after students log subject sessions."
            />

            <ListPanel
              title="Students with low flow scores"
              items={(overview.low_flow_students || []).map(item => `${item.student}: ${Math.round(item.average_flow_score)}% average flow`)}
              emptyText="No low-flow students detected."
            />
          </div>

          <div className="bg-cyan-50 rounded-xl p-4 text-cyan-900 font-semibold">
            {overview.recommendation || "Use flow analytics to schedule harder topics during high-focus windows."}
          </div>
        </div>
      )}
    </section>
  );
}


function MiniMetric({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-sm text-slate-500 font-semibold">{label}</p>
      <h3 className="text-2xl font-bold text-slate-950 mt-2">{value}</h3>
    </div>
  );
}


function ListPanel({ title, items, emptyText }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <h3 className="font-bold text-slate-950 mb-3">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => (
            <div key={item} className="bg-white rounded-lg px-3 py-2 text-slate-700 font-semibold">
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">
          {emptyText}
        </p>
      )}
    </div>
  );
}

export default FlowAnalyticsPanel;

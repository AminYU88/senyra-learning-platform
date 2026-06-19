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


function CognitiveRiskOverviewPanel({
  overview,
  loading,
  error
}) {
  const distribution = [
    { level: "Low", students: overview?.low_risk_students || 0 },
    { level: "Medium", students: overview?.medium_risk_students || 0 },
    { level: "High", students: overview?.high_risk_students || 0 }
  ];

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-950">
          Cognitive Risk Overview
        </h2>
        <p className="text-slate-500 mt-1">
          Advanced risk signals combining quiz scores, creativity, flow, engagement and learning behaviour.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {!error && loading && (
        <p className="text-slate-500">
          Loading cognitive risk overview...
        </p>
      )}

      {!error && !loading && (overview?.total_students || 0) === 0 && (
        <div className="bg-slate-50 rounded-xl p-4 text-slate-600">
          No student data is available for cognitive risk analysis.
        </div>
      )}

      {!error && !loading && (overview?.total_students || 0) > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MiniMetric label="Low risk" value={overview.low_risk_students} />
            <MiniMetric label="Medium risk" value={overview.medium_risk_students} />
            <MiniMetric label="High risk" value={overview.high_risk_students} />
            <MiniMetric label="Avg risk score" value={`${Math.round(overview.average_cognitive_risk_score)}%`} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartBlock title="Risk Distribution">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartBlock>

            <ChartBlock title="Class-Level Cognitive Risk Trend">
              <LineChart data={overview.class_cognitive_risk_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="average_cognitive_risk_score" stroke="#dc2626" strokeWidth={3} />
              </LineChart>
            </ChartBlock>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <ListPanel
              title="Common risk factors"
              items={(overview.common_risk_factors || []).map(item => `${item.factor}: ${item.count}`)}
              emptyText="No common risk factors detected."
            />
            <ListPanel
              title="Common protective factors"
              items={(overview.protective_factor_summary || []).map(item => `${item.factor}: ${item.count}`)}
              emptyText="No protective factors detected yet."
            />
            <ListPanel
              title="Students needing intervention"
              items={(overview.students_needing_support || []).map(item => `${item.student}: ${item.risk_level} risk (${Math.round(item.confidence_score)}%)`)}
              emptyText="No intervention list generated."
            />
          </div>

          <div className="bg-violet-50 rounded-xl p-4 text-violet-900 font-semibold">
            {overview.recommendation}
          </div>
        </div>
      )}
    </section>
  );
}


function ChartBlock({
  title,
  children
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <h3 className="font-bold text-slate-950 mb-4">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}


function MiniMetric({
  label,
  value
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-sm text-slate-500 font-semibold">{label}</p>
      <h3 className="text-2xl font-bold text-slate-950 mt-2">{value}</h3>
    </div>
  );
}


function ListPanel({
  title,
  items,
  emptyText
}) {
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

export default CognitiveRiskOverviewPanel;

import { useNavigate } from "react-router-dom";
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


function CreativityAnalyticsPanel({
  overview,
  loading,
  error,
  fullAnalyticsPath = "/education/analytics"
}) {
  const navigate = useNavigate();

  const breakdown = [
    { area: "Fluency", score: overview?.average_fluency_score || 0 },
    { area: "Flexibility", score: overview?.average_flexibility_score || 0 },
    { area: "Originality", score: overview?.average_originality_score || 0 },
    { area: "Elaboration", score: overview?.average_elaboration_score || 0 }
  ];

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Creativity Analytics
          </h2>

          <p className="text-slate-500 mt-1">
            Creativity Intelligence signals from student assessment submissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(fullAnalyticsPath)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold"
        >
          Full creativity analytics
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {!error && loading && (
        <p className="text-slate-500">
          Loading creativity analytics...
        </p>
      )}

      {!error && !loading && overview?.total_assessments === 0 && (
        <div className="bg-slate-50 rounded-xl p-4 text-slate-600">
          No creativity assessments submitted yet.
        </div>
      )}

      {!error && !loading && overview?.total_assessments > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MiniMetric label="Average creativity" value={`${Math.round(overview.average_creativity_score)}%`} />
            <MiniMetric label="Assessments" value={overview.total_assessments} />
            <MiniMetric label="Assessed students" value={overview.assessed_students} />
            <MiniMetric label="High creativity" value={overview.high_creativity_count} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-950 mb-4">
                Creativity trends
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overview.creativity_trends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-950 mb-4">
                Skill breakdown
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <DimensionList
              title="Common strengths"
              items={overview.common_strengths || []}
              emptyText="No strengths identified yet."
            />
            <DimensionList
              title="Common improvement areas"
              items={overview.common_improvement_areas || []}
              emptyText="No improvement areas identified yet."
            />
          </div>
        </div>
      )}
    </section>
  );
}


function MiniMetric({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-sm text-slate-500 font-semibold">
        {label}
      </p>
      <h3 className="text-2xl font-bold text-slate-950 mt-2">
        {value}
      </h3>
    </div>
  );
}


function DimensionList({ title, items, emptyText }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <h3 className="font-bold text-slate-950 mb-3">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.slice(0, 4).map((item) => (
            <div
              key={item.area}
              className="flex items-center justify-between gap-4 bg-white rounded-lg px-3 py-2"
            >
              <span className="font-semibold text-slate-700">
                {item.area}
              </span>
              <span className="text-sm text-slate-500">
                {item.count}
              </span>
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

export default CreativityAnalyticsPanel;

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";


function LearningDNAAnalyticsPanel({
  overview,
  loading,
  error
}) {
  const scoreBreakdown = [
    { area: "Analytical", score: overview?.average_analytical_score || 0 },
    { area: "Creative", score: overview?.average_creative_score || 0 },
    { area: "Visual", score: overview?.average_visual_score || 0 },
    { area: "Problem Solver", score: overview?.average_problem_solver_score || 0 },
    { area: "Exploratory", score: overview?.average_exploratory_score || 0 }
  ];

  const strengths = scoreBreakdown
    .filter(item => item.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const supportRecommendations = [
    "Group students by learner type for targeted study activities.",
    "Offer multiple quiz formats: structured, visual, scenario and challenge-based.",
    "Use Learning DNA with weak topics before assigning interventions."
  ];

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-950">
          Learning DNA Analytics
        </h2>
        <p className="text-slate-500 mt-1">
          Learner type distribution, strengths and support recommendations.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {!error && loading && (
        <p className="text-slate-500">
          Loading Learning DNA analytics...
        </p>
      )}

      {!error && !loading && overview?.total_profiles === 0 && (
        <div className="bg-slate-50 rounded-xl p-4 text-slate-600">
          No Learning DNA profiles completed yet.
        </div>
      )}

      {!error && !loading && overview?.total_profiles > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniMetric label="Profiles" value={overview.total_profiles} />
            <MiniMetric label="Average confidence" value={`${Math.round(overview.average_confidence_score)}%`} />
            <MiniMetric label="Most common type" value={overview.learner_type_distribution?.[0]?.learner_type || "Mixed"} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-950 mb-4">
                Learner type distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.learner_type_distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="learner_type" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-950 mb-4">
                Common learner strengths
              </h3>
              <div className="space-y-3">
                {strengths.map((item) => (
                  <div key={item.area} className="bg-white rounded-xl p-4 flex justify-between gap-4">
                    <span className="font-semibold text-slate-700">{item.area}</span>
                    <span className="text-slate-500">{Math.round(item.score)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4">
            <h3 className="font-bold text-indigo-900 mb-3">
              Support recommendations
            </h3>
            <div className="space-y-2">
              {supportRecommendations.map((item) => (
                <p key={item} className="text-indigo-800">
                  {item}
                </p>
              ))}
            </div>
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

export default LearningDNAAnalyticsPanel;

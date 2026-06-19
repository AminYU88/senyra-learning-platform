import { useEffect, useState } from "react";
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

import { FaArrowLeft, FaChartLine, FaExclamationTriangle } from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";
import { getEducationAnalytics, getEducationRecommendations } from "../api/educationApi";
import { getCreativityHistory, getCreativitySummary } from "../api/creativityApi";
import { getFlowHistory, getFlowSummary } from "../api/flowApi";
import {
  getCognitiveRiskFactors,
  getCognitiveRiskSummary
} from "../api/cognitiveRiskApi";


function EducationAnalyticsPage() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [creativitySummary, setCreativitySummary] = useState(null);
  const [creativityHistory, setCreativityHistory] = useState([]);
  const [creativityError, setCreativityError] = useState("");
  const [flowSummary, setFlowSummary] = useState(null);
  const [flowHistory, setFlowHistory] = useState([]);
  const [flowError, setFlowError] = useState("");
  const [cognitiveRiskSummary, setCognitiveRiskSummary] = useState(null);
  const [cognitiveRiskFactors, setCognitiveRiskFactors] = useState(null);
  const [cognitiveRiskError, setCognitiveRiskError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const analyticsResult = await getEducationAnalytics();
    const recommendationsResult = await getEducationRecommendations();
    const creativityResults = await Promise.allSettled([
      getCreativitySummary(),
      getCreativityHistory()
    ]);
    const flowResults = await Promise.allSettled([
      getFlowSummary(),
      getFlowHistory()
    ]);
    const cognitiveRiskResults = await Promise.allSettled([
      getCognitiveRiskSummary(),
      getCognitiveRiskFactors()
    ]);

    if (analyticsResult?.response.ok) {
      setAnalytics(analyticsResult.data);
    }

    if (recommendationsResult?.response.ok) {
      setRecommendations(recommendationsResult.data.recommendations || []);
    }

    if (creativityResults[0].status === "fulfilled") {
      setCreativitySummary(creativityResults[0].value);
    }

    if (creativityResults[1].status === "fulfilled") {
      setCreativityHistory(creativityResults[1].value || []);
    }

    if (creativityResults.some(result => result.status === "rejected")) {
      setCreativityError("Could not load creativity analytics.");
    }

    if (flowResults[0].status === "fulfilled") {
      setFlowSummary(flowResults[0].value);
    }

    if (flowResults[1].status === "fulfilled") {
      setFlowHistory(flowResults[1].value || []);
    }

    if (flowResults.some(result => result.status === "rejected")) {
      setFlowError("Could not load Flow State analytics.");
    }

    if (cognitiveRiskResults[0].status === "fulfilled") {
      setCognitiveRiskSummary(cognitiveRiskResults[0].value);
    }

    if (cognitiveRiskResults[1].status === "fulfilled") {
      setCognitiveRiskFactors(cognitiveRiskResults[1].value);
    }

    if (cognitiveRiskResults.some(result => result.status === "rejected")) {
      setCognitiveRiskError("Could not load Cognitive Risk analytics.");
    }

    setLoading(false);
  };

  const completedFlowSessions = flowHistory.filter((session) => session.ended_at);
  const flowChartData = completedFlowSessions
    .slice()
    .reverse()
    .map((session) => ({
      date: new Date(session.started_at).toLocaleDateString(),
      flow_score: Math.round(session.flow_score || 0),
      duration_minutes: Math.round(session.duration_minutes || 0),
      completed_task: session.completed_task ? 1 : 0,
      subject: session.subject || "General"
    }));

  const subjectFocus = completedFlowSessions.reduce((accumulator, session) => {
    const subject = session.subject || "General";
    if (!accumulator[subject]) {
      accumulator[subject] = [];
    }
    accumulator[subject].push(session.flow_score || 0);
    return accumulator;
  }, {});

  const strongestFlowSubject = Object.entries(subjectFocus)
    .map(([subject, scores]) => ({
      subject,
      average: scores.reduce((total, score) => total + score, 0) / scores.length
    }))
    .sort((a, b) => b.average - a.average)[0];

  const cognitiveFeatures = cognitiveRiskSummary?.input_features || {};
  const cognitiveRelationshipData = [
    { signal: "Quiz", score: cognitiveFeatures.average_quiz_score || 0 },
    { signal: "Creativity", score: cognitiveFeatures.creativity_score || 0 },
    { signal: "Flow", score: cognitiveFeatures.flow_score || 0 },
    { signal: "Engagement", score: cognitiveFeatures.engagement_score || 0 },
    { signal: "Consistency", score: cognitiveFeatures.study_consistency || 0 },
    { signal: "Completion", score: cognitiveFeatures.task_completion_rate || 0 }
  ];

  if (loading) {
    return <LoadingSpinner text="Loading Education Analytics..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Learning Analytics
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Subject performance, topic performance, weak areas, engagement and predicted risk.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <FaArrowLeft />
          Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Metric title="Engagement Score" value={`${analytics?.engagement_score || 0}%`} icon={<FaChartLine />} />
        <Metric title="Predicted Risk" value={analytics?.predicted_risk_level || "Unknown"} icon={<FaExclamationTriangle />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Subject Performance</h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.subject_performance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average_score" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Progress Over Time</h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.progress_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl shadow p-8 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold">
              Flow Analytics
            </h2>

            <p className="text-slate-500 mt-2">
              Flow score over time, best learning time, study duration, task completion and strongest focus subject.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/flow-state")}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Open Flow State
          </button>
        </div>

        {flowError && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
            {flowError}
          </div>
        )}

        {!flowError && completedFlowSessions.length === 0 && (
          <div className="bg-slate-50 rounded-xl p-4 text-slate-600">
            Start your first focus session to unlock Flow State analytics.
          </div>
        )}

        {!flowError && completedFlowSessions.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Metric title="Average Flow" value={`${Math.round(flowSummary?.average_flow_score || 0)}%`} icon={<FaChartLine />} />
              <Metric title="Best Learning Time" value={flowSummary?.best_time || "Pending"} icon={<FaChartLine />} />
              <Metric title="Highest Focus Subject" value={strongestFlowSubject?.subject || "Pending"} icon={<FaChartLine />} />
              <Metric title="Completed Tasks" value={completedFlowSessions.filter(session => session.completed_task).length} icon={<FaChartLine />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Flow Score Over Time
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flowChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="flow_score" stroke="#0891b2" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">
                  Study Duration Trends
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flowChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="duration_minutes" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">
                Task Completion Trends
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flowChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value ? "Completed" : "Not completed", "Task"]} />
                    <Bar dataKey="completed_task" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow p-8 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold">
              Cognitive Risk Analytics
            </h2>

            <p className="text-slate-500 mt-2">
              Advanced risk signals across quiz performance, creativity, flow, engagement and behavioural consistency.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/cognitive-risk")}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            View Cognitive Risk
          </button>
        </div>

        {cognitiveRiskError && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
            {cognitiveRiskError}
          </div>
        )}

        {!cognitiveRiskError && !cognitiveRiskSummary && (
          <div className="bg-slate-50 rounded-xl p-4 text-slate-600">
            Complete learning activities to generate cognitive risk insights.
          </div>
        )}

        {!cognitiveRiskError && cognitiveRiskSummary && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Metric title="Cognitive Risk" value={cognitiveRiskSummary.cognitive_risk_level} icon={<FaExclamationTriangle />} />
              <Metric title="Confidence" value={`${Math.round(cognitiveRiskSummary.confidence_score || 0)}%`} icon={<FaChartLine />} />
              <Metric title="Learning Signals" value={Object.values(cognitiveRiskSummary.data_completeness || {}).filter(Boolean).length} icon={<FaChartLine />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Cognitive Risk Trend
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        {
                          label: "Current",
                          confidence: Math.round(cognitiveRiskSummary.confidence_score || 0)
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="confidence" stroke="#7c3aed" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">
                  Quiz, Creativity, Flow and Engagement
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cognitiveRelationshipData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="signal" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#7c3aed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FactorPanel
                title="Risk Factors"
                items={cognitiveRiskSummary.key_risk_factors || cognitiveRiskFactors?.risk_factors || []}
                emptyText="No major cognitive risk factors detected."
                tone="risk"
              />
              <FactorPanel
                title="Protective Factors"
                items={cognitiveRiskSummary.protective_factors || cognitiveRiskFactors?.protective_factors || []}
                emptyText="Protective factors will appear with stronger learning signals."
                tone="protective"
              />
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow p-8 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold">
              Creativity Analytics
            </h2>

            <p className="text-slate-500 mt-2">
              Creativity score over time and fluency, flexibility, originality and elaboration breakdown.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/creativity-lab")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Open Creativity Lab
          </button>
        </div>

        {creativityError && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
            {creativityError}
          </div>
        )}

        {!creativityError && creativitySummary?.total_assessments === 0 && (
          <div className="bg-slate-50 rounded-xl p-4 text-slate-600">
            Complete your first creativity assessment to unlock creativity analytics.
          </div>
        )}

        {!creativityError && creativitySummary?.total_assessments > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                Creativity Score Over Time
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[...creativityHistory].reverse().map((item) => ({
                      date: new Date(item.created_at).toLocaleDateString(),
                      score: item.creativity_score
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">
                Creativity Breakdown
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { area: "Fluency", score: creativitySummary.average_fluency_score },
                      { area: "Flexibility", score: creativitySummary.average_flexibility_score },
                      { area: "Originality", score: creativitySummary.average_originality_score },
                      { area: "Elaboration", score: creativitySummary.average_elaboration_score }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-5">Weak Areas</h2>

          <div className="space-y-3">
            {(analytics?.weak_topics || []).length > 0 ? (
              analytics.weak_topics.map((item) => (
                <div key={`${item.subject}-${item.topic}-${item.detected_at}`} className="bg-red-50 text-red-800 p-4 rounded-xl font-semibold">
                  {item.subject}: {item.topic} ({item.confidence_level}% confidence)
                </div>
              ))
            ) : (
              <p className="text-slate-500">No weak topics recorded yet. Complete subject quizzes to generate analytics.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-5">Personalised Recommendations</h2>

          <div className="space-y-3">
            {recommendations.map((item) => (
              <div key={item} className="bg-blue-50 text-blue-800 p-4 rounded-xl font-semibold">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}


function Metric({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="text-blue-600 text-4xl mb-4">{icon}</div>
      <p className="text-slate-500 font-semibold">{title}</p>
      <h2 className="text-4xl font-bold mt-2">{value}</h2>
    </div>
  );
}


function FactorPanel({
  title,
  items,
  emptyText,
  tone
}) {
  const style = tone === "risk"
    ? "bg-red-50 text-red-800"
    : "bg-green-50 text-green-800";

  return (
    <section className="bg-slate-50 rounded-xl p-4">
      <h3 className="text-xl font-bold mb-4">
        {title}
      </h3>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className={`${style} p-4 rounded-xl font-semibold`}>
              {item}
            </div>
          ))
        ) : (
          <p className="text-slate-500">
            {emptyText}
          </p>
        )}
      </div>
    </section>
  );
}

export default EducationAnalyticsPage;

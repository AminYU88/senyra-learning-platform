import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft, FaLightbulb } from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";
import { apiJson } from "../api/client";
import { getCognitiveRiskSummary } from "../api/cognitiveRiskApi";
import { getFlowHistory, getFlowSummary, getFlowToday } from "../api/flowApi";
import { getStudentRecommendations } from "../api/recommendationApi";


function RecommendationsPage() {
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState(null);
  const [flowSummary, setFlowSummary] = useState(null);
  const [flowToday, setFlowToday] = useState(null);
  const [flowHistory, setFlowHistory] = useState([]);
  const [flowError, setFlowError] = useState("");
  const [cognitiveRiskSummary, setCognitiveRiskSummary] = useState(null);
  const [cognitiveRiskError, setCognitiveRiskError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    const me = await apiJson("/me");

    if (!me?.response.ok) {
      setLoading(false);
      return;
    }

    const [result, flowSummaryResult, flowTodayResult, flowHistoryResult, cognitiveRiskResult] = await Promise.allSettled([
      getStudentRecommendations(me.data.id),
      getFlowSummary(),
      getFlowToday(),
      getFlowHistory(),
      getCognitiveRiskSummary()
    ]);

    if (result.status === "fulfilled" && result.value?.response.ok) {
      setRecommendations(result.value.data);
    }

    if (flowSummaryResult.status === "fulfilled") {
      setFlowSummary(flowSummaryResult.value);
    }

    if (flowTodayResult.status === "fulfilled") {
      setFlowToday(flowTodayResult.value);
    }

    if (flowHistoryResult.status === "fulfilled") {
      setFlowHistory(flowHistoryResult.value || []);
    }

    if ([flowSummaryResult, flowTodayResult, flowHistoryResult].some(item => item.status === "rejected")) {
      setFlowError("Flow recommendations will appear after Flow State analytics loads.");
    }

    if (cognitiveRiskResult.status === "fulfilled") {
      setCognitiveRiskSummary(cognitiveRiskResult.value);
    } else {
      setCognitiveRiskError("Cognitive risk recommendations will appear after advanced risk analytics loads.");
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading Recommendations..." />;
  }

  const completedFlowSessions = flowHistory.filter((session) => session.ended_at);
  const completedTasks = completedFlowSessions.filter((session) => session.completed_task).length;
  const completionRate = completedFlowSessions.length
    ? completedTasks / completedFlowSessions.length
    : 0;
  const averageFlow = flowSummary?.average_flow_score || flowToday?.average_flow_score || 0;

  const flowRecommendations = [];

  if (!completedFlowSessions.length && !(flowToday?.sessions || []).length) {
    flowRecommendations.push("Start your first focus session to unlock Flow State recommendations.");
  }

  if (flowSummary?.best_time) {
    flowRecommendations.push(`Schedule difficult topics during your strongest focus window: ${flowSummary.best_time}.`);
  }

  if (averageFlow > 0 && averageFlow < 50) {
    flowRecommendations.push("Your flow score is low. Try shorter 20-25 minute sessions with clear breaks.");
  }

  if (completionRate >= 0.75 && completedFlowSessions.length > 0) {
    flowRecommendations.push("Your task completion is strong. Add advanced challenges during high-focus sessions.");
  }

  if (flowSummary?.strongest_subject) {
    flowRecommendations.push(`Use your high-focus strategy from ${flowSummary.strongest_subject} when revising weaker subjects.`);
  }

  if (flowError) {
    flowRecommendations.push(flowError);
  }

  const cognitiveRiskRecommendations = [];
  const cognitiveRiskLevel = cognitiveRiskSummary?.cognitive_risk_level;

  if (!cognitiveRiskSummary) {
    cognitiveRiskRecommendations.push("Complete learning activities to generate cognitive risk recommendations.");
  }

  if (cognitiveRiskLevel === "High") {
    cognitiveRiskRecommendations.push("Use shorter study sessions, targeted weak-topic quizzes and teacher support this week.");
    cognitiveRiskRecommendations.push("Prioritise the top cognitive risk factor before adding new advanced topics.");
  }

  if (cognitiveRiskLevel === "Medium") {
    cognitiveRiskRecommendations.push("Follow a structured revision plan and schedule harder work during your strongest Flow State window.");
    cognitiveRiskRecommendations.push("Review one weak topic, then complete a short quiz to check improvement.");
  }

  if (cognitiveRiskLevel === "Low") {
    cognitiveRiskRecommendations.push("Move into advanced challenges and independent projects while maintaining current study habits.");
    cognitiveRiskRecommendations.push("Use high-confidence areas to support weaker topics through mixed practice.");
  }

  if (cognitiveRiskSummary?.key_risk_factors?.[0]) {
    cognitiveRiskRecommendations.push(`Main cognitive risk factor: ${cognitiveRiskSummary.key_risk_factors[0]}`);
  }

  if (cognitiveRiskSummary?.protective_factors?.[0]) {
    cognitiveRiskRecommendations.push(`Protective factor to keep using: ${cognitiveRiskSummary.protective_factors[0]}`);
  }

  if (cognitiveRiskError) {
    cognitiveRiskRecommendations.push(cognitiveRiskError);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">Personalised Recommendations</h1>
          <p className="text-slate-500 mt-2 text-lg">Weak topics, suggested revision, quizzes and study plan.</p>
        </div>

        <button onClick={() => navigate("/dashboard")} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2">
          <FaArrowLeft />
          Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Panel
          title="Learning DNA"
          items={[
            recommendations?.learner_type
              ? `Learner type: ${recommendations.learner_type}`
              : "Complete your Learning DNA profile to personalise recommendations.",
            ...(recommendations?.learning_dna_recommendations || [])
          ]}
        />
        <Panel title="Weak Topics" items={recommendations?.weak_topics || []} />
        <Panel title="Suggested Revision" items={recommendations?.suggested_revision || []} />
        <Panel title="Recommended Quizzes" items={recommendations?.recommended_quizzes || []} />
        <Panel title="Recommended Study Plan" items={recommendations?.recommended_study_plan || []} />
        <Panel title="Flow-Optimised Study" items={flowRecommendations} />
        <Panel title="Cognitive Risk Support" items={cognitiveRiskRecommendations} />
      </div>
    </div>
  );
}


function Panel({ title, items }) {
  return (
    <section className="bg-white rounded-2xl shadow p-8">
      <div className="flex items-center gap-3 mb-5">
        <FaLightbulb className="text-blue-600 text-3xl" />
        <h2 className="text-3xl font-bold">{title}</h2>
      </div>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="bg-blue-50 text-blue-800 p-4 rounded-xl font-semibold">
              {item}
            </div>
          ))
        ) : (
          <p className="text-slate-500">No recommendations yet.</p>
        )}
      </div>
    </section>
  );
}

export default RecommendationsPage;

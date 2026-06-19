/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBrain,
  FaChartLine,
  FaDatabase,
  FaExclamationTriangle,
  FaFileCsv,
  FaMicroscope,
  FaPalette,
  FaSchool,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserShield,
  FaUsers,
  FaUserPlus
} from "react-icons/fa";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import AdminAlertCard from "../components/admin/AdminAlertCard";
import AdminChartCard from "../components/admin/AdminChartCard";
import AdminMetricCard from "../components/admin/AdminMetricCard";
import AdminQuickActionCard from "../components/admin/AdminQuickActionCard";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopNavbar from "../components/admin/AdminTopNavbar";
import CreativityAnalyticsPanel from "../components/creativity/CreativityAnalyticsPanel";
import { getCreativityAdminOverview } from "../api/creativityApi";
import LearningDNAAnalyticsPanel from "../components/learningDNA/LearningDNAAnalyticsPanel";
import { getLearningDNAAdminOverview } from "../api/learningDnaApi";
import FlowAnalyticsPanel from "../components/flow/FlowAnalyticsPanel";
import { getFlowAdminOverview } from "../api/flowApi";
import CognitiveRiskOverviewPanel from "../components/cognitiveRisk/CognitiveRiskOverviewPanel";
import { getCognitiveRiskAdminOverview } from "../api/cognitiveRiskApi";
import { apiJson } from "../api/client";
import { getAdminDashboardSummary } from "../api/dashboardApi";
import { getExplainableAiAdminSummary } from "../api/explainableAiApi";
import { getLearningPathAdminSummary } from "../api/learningPathApi";
import { getAdminWeakTopicSummary } from "../api/weakTopicApi";
import { getModelInfo } from "../api/mlApi";
import ExplainabilityCard from "../components/ExplainabilityCard";
import LearningPathCard from "../components/LearningPathCard";
import WeakTopicsCard from "../components/WeakTopicsCard";


const riskColors = [
  "#dc2626",
  "#d97706",
  "#16a34a"
];


const quickActions = [
  {
    title: "Manage Users",
    description: "Manage accounts, roles, students and teachers.",
    path: "/admin/users",
    icon: <FaUserShield />
  },
  {
    title: "Reports",
    description: "Export academic and platform evidence.",
    path: "/admin/reports",
    icon: <FaFileCsv />
  },
  {
    title: "Datasets",
    description: "Review education datasets and summaries.",
    path: "/datasets",
    icon: <FaDatabase />
  },
  {
    title: "Audit Logs",
    description: "Inspect administrative system activity.",
    path: "/admin/audit-logs",
    icon: <FaShieldAlt />
  },
  {
    title: "ML Analytics",
    description: "View model metrics and feature importance.",
    path: "/ml/analytics",
    icon: <FaMicroscope />
  },
  {
    title: "Risk Predictor",
    description: "Review student risk prediction tools.",
    path: "/ml/student-risk",
    icon: <FaExclamationTriangle />
  }
];


function AdminDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showRiskTable, setShowRiskTable] = useState(false);
  const [creativityOverview, setCreativityOverview] = useState(null);
  const [creativityError, setCreativityError] = useState("");
  const [learningDNAOverview, setLearningDNAOverview] = useState(null);
  const [learningDNAError, setLearningDNAError] = useState("");
  const [flowOverview, setFlowOverview] = useState(null);
  const [flowError, setFlowError] = useState("");
  const [cognitiveRiskOverview, setCognitiveRiskOverview] = useState(null);
  const [cognitiveRiskError, setCognitiveRiskError] = useState("");
  const [weakTopicSummary, setWeakTopicSummary] = useState(null);
  const [weakTopicError, setWeakTopicError] = useState("");
  const [learningPathSummary, setLearningPathSummary] = useState(null);
  const [learningPathError, setLearningPathError] = useState("");
  const [explainabilitySummary, setExplainabilitySummary] = useState(null);
  const [explainabilityError, setExplainabilityError] = useState("");
  const [modelInfo, setModelInfo] = useState(null);

  const [overview, setOverview] = useState({
    total_students: 0,
    high_risk: 0,
    medium_risk: 0,
    low_risk: 0,
    average_engagement: 0,
    average_quiz_score: 0,
    average_lesson_progress: 0,
    prediction_source: "Machine Learning Model",
    total_teachers: 0,
    active_users_today: 0,
    new_registrations_this_week: 0,
    average_creativity_score: 0,
    average_flow_score: 0,
    risk_distribution: [],
    ai_insights: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadAdminDashboard();
  }, []);

  const loadAdminDashboard = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      fetchStudentRiskAnalysis(),
      fetchOverview(),
      fetchUsers(),
      fetchCreativityOverview(),
      fetchLearningDNAOverview(),
      fetchFlowOverview(),
      fetchCognitiveRiskOverview(),
      fetchWeakTopicSummary(),
      fetchLearningPathSummary(),
      fetchExplainabilitySummary(),
      fetchModelInfo()
    ]);

    setLoading(false);
  };

  const fetchStudentRiskAnalysis = async () => {
    try {
      const result = await apiJson("/admin/student-risk-analysis");
      if (!result) return;

      if (!result.response.ok) {
        setError("Could not load student risk analysis.");
        return;
      }

      setStudents(result.data);
    } catch (error) {
      console.log("ADMIN STUDENT RISK ERROR:", error);
      setError(error.message || "Could not connect to backend.");
    }
  };

  const fetchOverview = async () => {
    try {
      const data = await getAdminDashboardSummary();
      setOverview(data);
    } catch (error) {
      console.log("ADMIN OVERVIEW ERROR:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await apiJson("/admin/users/");
      if (!result) return;

      if (!result.response.ok) return;

      setUsers(result.data);
    } catch (error) {
      console.log("ADMIN USERS ERROR:", error);
    }
  };

  const fetchCreativityOverview = async () => {
    setCreativityError("");

    try {
      const data = await getCreativityAdminOverview();
      setCreativityOverview(data);
    } catch (error) {
      console.log("ADMIN CREATIVITY ERROR:", error);
      setCreativityError("Could not load creativity analytics.");
    }
  };

  const fetchLearningDNAOverview = async () => {
    setLearningDNAError("");

    try {
      const data = await getLearningDNAAdminOverview();
      setLearningDNAOverview(data);
    } catch (error) {
      console.log("ADMIN LEARNING DNA ERROR:", error);
      setLearningDNAError("Could not load Learning DNA analytics.");
    }
  };

  const fetchFlowOverview = async () => {
    setFlowError("");

    try {
      const data = await getFlowAdminOverview();
      setFlowOverview(data);
    } catch (error) {
      console.log("ADMIN FLOW ERROR:", error);
      setFlowError("Could not load Flow State analytics.");
    }
  };

  const fetchCognitiveRiskOverview = async () => {
    setCognitiveRiskError("");

    try {
      const data = await getCognitiveRiskAdminOverview();
      setCognitiveRiskOverview(data);
    } catch (error) {
      console.log("ADMIN COGNITIVE RISK ERROR:", error);
      setCognitiveRiskError("Could not load Cognitive Risk overview.");
    }
  };

  const fetchWeakTopicSummary = async () => {
    setWeakTopicError("");

    try {
      const data = await getAdminWeakTopicSummary();
      setWeakTopicSummary(data);
    } catch (error) {
      console.log("ADMIN WEAK TOPIC ERROR:", error);
      setWeakTopicError("Could not load weak topic detection.");
    }
  };

  const fetchLearningPathSummary = async () => {
    setLearningPathError("");

    try {
      setLearningPathSummary(await getLearningPathAdminSummary());
    } catch (error) {
      console.log("ADMIN LEARNING PATH ERROR:", error);
      setLearningPathError("Could not load adaptive learning paths.");
    }
  };

  const fetchExplainabilitySummary = async () => {
    setExplainabilityError("");

    try {
      setExplainabilitySummary(await getExplainableAiAdminSummary());
    } catch (error) {
      console.log("ADMIN EXPLAINABLE AI ERROR:", error);
      setExplainabilityError("Could not load Explainable AI summary.");
    }
  };

  const fetchModelInfo = async () => {
    try {
      const result = await getModelInfo();
      if (!result?.response.ok) return;

      setModelInfo(result.data);
    } catch (error) {
      console.log("ADMIN MODEL INFO ERROR:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  const highRiskStudents = students.filter(
    student => student.risk_level === "High"
  );

  const totalStudents = users.length
    ? users.filter(user => user.role === "student").length
    : overview.total_students;

  const totalTeachers = overview.total_teachers || users.filter(user => user.role === "teacher").length;

  const riskData = overview.risk_distribution?.length ? overview.risk_distribution : [
    {
      name: "High Risk",
      value: overview.high_risk || 0
    },
    {
      name: "Medium Risk",
      value: overview.medium_risk || 0
    },
    {
      name: "Low Risk",
      value: overview.low_risk || 0
    }
  ];

  const engagementData = students.map(student => ({
    name: student.student,
    engagement: student.engagement_score
  }));

  const activeUsersToday = students.filter(
    student => (student.total_events || 0) > 0
  ).length || overview.active_users_today || 0;

  const averageCreativityScore = overview.average_creativity_score || creativityOverview?.average_creativity_score
    ? `${Math.round(overview.average_creativity_score || creativityOverview.average_creativity_score)}%`
    : "No data";

  const averageFlowScore = overview.average_flow_score || flowOverview?.average_flow_score
    ? `${Math.round(overview.average_flow_score || flowOverview.average_flow_score)}%`
    : "No data";

  const learningDnaTopType = learningDNAOverview?.learner_type_distribution?.[0]?.learner_type
    || "No profiles";

  const trainedModelCount = (modelInfo?.saved_models || []).filter(model => model.trained).length;
  const totalModelCount = modelInfo?.saved_models?.length || 0;
  const systemHealthLabel = error
    ? "Needs Review"
    : trainedModelCount === totalModelCount && totalModelCount > 0
    ? "Healthy"
    : "Partial";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={logout}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0">
        <AdminTopNavbar onOpenMenu={() => setMobileSidebarOpen(true)} />

        <div className="p-5 md:p-8 xl:p-10">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 mb-8">
            <div>
              <p className="text-sm font-bold text-blue-700 mb-2">
                Prediction source: {overview.prediction_source || "Machine Learning Model"}
              </p>

              <h1 className="text-4xl font-bold text-slate-950">
                Admin Overview
              </h1>

              <p className="text-slate-500 mt-2 text-lg max-w-3xl">
                Monitor users, learning analytics, risk signals and AI-powered education performance from one focused workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="hidden lg:flex bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-700 px-5 py-3 rounded-xl font-bold items-center gap-2"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-2xl mb-6 font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-700 font-bold">
              Loading Admin Dashboard...
            </div>
          ) : (
            <div className="space-y-8">
              <section className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-5 gap-4">
                <AdminMetricCard
                  icon={<FaUsers />}
                  title="Total Students"
                  value={totalStudents}
                  detail="Learner accounts"
                  color="bg-blue-50 text-blue-700"
                />

                <AdminMetricCard
                  icon={<FaSchool />}
                  title="Total Teachers"
                  value={totalTeachers}
                  detail="Teacher accounts"
                  color="bg-indigo-50 text-indigo-700"
                />

                <AdminMetricCard
                  icon={<FaExclamationTriangle />}
                  title="High Risk Students"
                  value={overview.high_risk}
                  detail="Need attention"
                  color="bg-red-50 text-red-700"
                />

                <AdminMetricCard
                  icon={<FaChartLine />}
                  title="Average Engagement"
                  value={`${overview.average_engagement}%`}
                  detail="Across analysed learners"
                  color="bg-green-50 text-green-700"
                />

                <AdminMetricCard
                  icon={<FaChartLine />}
                  title="Average Quiz Score"
                  value={`${overview.average_quiz_score || 0}%`}
                  detail="Assessment performance"
                  color="bg-cyan-50 text-cyan-700"
                />
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
                <AdminMetricCard
                  icon={<FaUsers />}
                  title="Active Users Today"
                  value={activeUsersToday}
                  detail="Students with recorded learning activity"
                  color="bg-emerald-50 text-emerald-700"
                />

                <AdminMetricCard
                  icon={<FaUserPlus />}
                  title="New Registrations This Week"
                  value={overview.new_registrations_this_week || 0}
                  detail="User table does not store created_at yet"
                  color="bg-slate-100 text-slate-700"
                />

                <AdminMetricCard
                  icon={<FaExclamationTriangle />}
                  title="At-Risk Students"
                  value={(overview.high_risk || 0) + (overview.medium_risk || 0)}
                  detail="High and medium risk learners"
                  color="bg-amber-50 text-amber-700"
                />

                <AdminMetricCard
                  icon={<FaPalette />}
                  title="Average Creativity Score"
                  value={averageCreativityScore}
                  detail="Creativity Intelligence assessments"
                  color="bg-purple-50 text-purple-700"
                />

                <AdminMetricCard
                  icon={<FaChartLine />}
                  title="Average Flow Score"
                  value={averageFlowScore}
                  detail="Completed Flow State sessions"
                  color="bg-cyan-50 text-cyan-700"
                />

                <AdminMetricCard
                  icon={<FaBrain />}
                  title="Learning DNA Distribution"
                  value={learningDnaTopType}
                  detail="Most common learner type"
                  color="bg-violet-50 text-violet-700"
                />

                <AdminMetricCard
                  icon={<FaMicroscope />}
                  title="ML Model Status"
                  value={`${trainedModelCount}/${totalModelCount || 4}`}
                  detail="Saved joblib models available"
                  color="bg-slate-100 text-slate-700"
                />
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-4">
                <AdminMetricCard
                  icon={<FaShieldAlt />}
                  title="System Health"
                  value={systemHealthLabel}
                  detail="Based on API errors and model availability"
                  color="bg-green-50 text-green-700"
                />

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        ML Model Inventory
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Demo-ready view of trained model files and dataset coverage.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/ml/analytics")}
                      className="w-fit rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                    >
                      Open ML analytics
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {(modelInfo?.saved_models || []).map((model) => (
                      <div
                        key={model.name}
                        className="rounded-xl bg-slate-50 p-4"
                      >
                        <p className="font-bold text-slate-950">
                          {model.name}
                        </p>
                        <p className={`mt-1 text-sm font-semibold ${model.trained ? "text-green-700" : "text-amber-700"}`}>
                          {model.trained ? "Trained" : "Not trained"}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    Dataset rows verified: {modelInfo?.dataset_rows ?? "Not loaded"}
                  </p>
                </div>
              </section>

              <AdminAlertCard
                highRiskCount={highRiskStudents.length}
                onClick={() => setShowRiskTable(true)}
              />

              <WeakTopicsCard
                title="Platform Weak Topics"
                subtitle="Platform-wide weak topic detection from quiz results, engagement and lesson completion."
                topics={weakTopicSummary?.topics || []}
                loading={loading}
                error={weakTopicError}
                mode="admin"
                compact
              />

              <LearningPathCard
                path={learningPathSummary?.paths?.[0] || null}
                loading={loading}
                error={learningPathError}
                compact
                onOpen={() => navigate("/learning-path")}
              />

              <ExplainabilityCard
                explanation={explainabilitySummary?.student_summaries?.[0]?.explanations?.[0]}
                loading={loading}
                error={explainabilityError}
                compact
                onOpen={() => navigate("/explainable-ai")}
              />

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-slate-950">
                    AI Insights
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Backend-generated signals for the final-year-project demo narrative.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                  {(overview.ai_insights || []).length > 0 ? overview.ai_insights.map((insight) => (
                    <div
                      key={insight}
                      className="rounded-xl bg-blue-50 p-4 font-semibold text-blue-800"
                    >
                      {insight}
                    </div>
                  )) : (
                    <div className="rounded-xl bg-slate-50 p-4 font-semibold text-slate-500">
                      No AI insights available yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                <AdminChartCard
                  title="Risk Distribution"
                  subtitle="High, medium and low risk learner split"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={105}
                        label
                      >
                        {riskData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={riskColors[index]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </AdminChartCard>

                <AdminChartCard
                  title="Student Engagement"
                  subtitle="Engagement score by learner"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-18}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />

                      <Bar
                        dataKey="engagement"
                        fill="#2563eb"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </AdminChartCard>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-950">
                    Quick Actions
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Compact access to every admin feature without crowding the overview.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <AdminQuickActionCard
                      key={action.title}
                      icon={action.icon}
                      title={action.title}
                      description={action.description}
                      onClick={() => navigate(action.path)}
                    />
                  ))}
                </div>
              </section>

              <details className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <summary className="cursor-pointer p-6 list-none flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">
                      Advanced AI Analytics
                    </h2>
                    <p className="text-slate-500 mt-1">
                      Creativity, Learning DNA, Flow State and Cognitive Risk panels are preserved here for deeper review.
                    </p>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold">
                    Expand panels
                  </span>
                </summary>

                <div className="border-t border-slate-200 p-6 space-y-6">
                  <CreativityAnalyticsPanel
                    overview={creativityOverview}
                    loading={loading}
                    error={creativityError}
                    fullAnalyticsPath="/admin/advanced-analytics"
                  />

                  <LearningDNAAnalyticsPanel
                    overview={learningDNAOverview}
                    loading={loading}
                    error={learningDNAError}
                  />

                  <FlowAnalyticsPanel
                    overview={flowOverview}
                    loading={loading}
                    error={flowError}
                  />

                  <CognitiveRiskOverviewPanel
                    overview={cognitiveRiskOverview}
                    loading={loading}
                    error={cognitiveRiskError}
                  />
                </div>
              </details>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowRiskTable(!showRiskTable)}
                  className="w-full p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-left"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">
                      Student ML Risk Analysis
                    </h2>

                    <p className="text-slate-500 mt-1">
                      Full analytics table preserved for review, reports and presentation evidence.
                    </p>
                  </div>

                  <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold">
                    {showRiskTable ? "Hide table" : "Show table"}
                  </span>
                </button>

                {showRiskTable && (
                  <div className="border-t border-slate-200 p-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-slate-500">
                          <th className="py-4">Student</th>
                          <th>Email</th>
                          <th>Engagement</th>
                          <th>Risk</th>
                          <th>Confidence</th>
                          <th>Videos</th>
                          <th>Quizzes</th>
                          <th>Practice</th>
                          <th>Quiz Attempts</th>
                          <th>Average Quiz Score</th>
                          <th>Lessons Completed</th>
                          <th>Lesson Progress</th>
                        </tr>
                      </thead>

                      <tbody>
                        {students.length > 0 ? (
                          students.map(student => (
                            <tr
                              key={student.id}
                              className="border-b hover:bg-slate-50"
                            >
                              <td className="py-5 font-semibold">
                                {student.student}
                              </td>

                              <td>
                                {student.email}
                              </td>

                              <td>
                                {student.engagement_score}%
                              </td>

                              <td>
                                <span
                                  className={`px-3 py-1 rounded-full font-semibold ${
                                    student.risk_level === "High"
                                      ? "bg-red-100 text-red-700"
                                      : student.risk_level === "Medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {student.risk_level}
                                </span>
                              </td>

                              <td>
                                {student.confidence_score}%
                              </td>

                              <td>
                                {student.event_breakdown?.videos || student.videos || 0}
                              </td>

                              <td>
                                {student.event_breakdown?.quizzes || student.quizzes || 0}
                              </td>

                              <td>
                                {student.event_breakdown?.practice || student.practice || 0}
                              </td>

                              <td>
                                {student.quiz_attempts || 0}
                              </td>

                              <td>
                                {student.average_quiz_score || 0}%
                              </td>

                              <td>
                                {student.completed_lessons || 0}/{student.total_lessons || 0}
                              </td>

                              <td>
                                {student.lesson_progress || 0}%
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="12"
                              className="py-8 text-center text-slate-500"
                            >
                              No student analytics found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaBars,
  FaBell,
  FaBookOpen,
  FaChartLine,
  FaChevronDown,
  FaClipboardCheck,
  FaClipboardList,
  FaComments,
  FaExclamationTriangle,
  FaHome,
  FaLightbulb,
  FaRobot,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUserCog,
  FaUserGraduate,
  FaUsers
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

import { getTeacherDashboardSummary } from "../api/dashboardApi";
import { getExplainableAiAdminSummary } from "../api/explainableAiApi";
import { getLearningPathAdminSummary } from "../api/learningPathApi";
import { getClassWeakTopicSummary } from "../api/weakTopicApi";
import ExplainabilityCard from "../components/ExplainabilityCard";
import LearningPathCard from "../components/LearningPathCard";
import WeakTopicsCard from "../components/WeakTopicsCard";
import { getCreativityAdminOverview } from "../api/creativityApi";
import CreativityAnalyticsPanel from "../components/creativity/CreativityAnalyticsPanel";
import { getLearningDNAAdminOverview } from "../api/learningDnaApi";
import LearningDNAAnalyticsPanel from "../components/learningDNA/LearningDNAAnalyticsPanel";
import { getFlowAdminOverview } from "../api/flowApi";
import FlowAnalyticsPanel from "../components/flow/FlowAnalyticsPanel";
import { getCognitiveRiskAdminOverview } from "../api/cognitiveRiskApi";
import CognitiveRiskOverviewPanel from "../components/cognitiveRisk/CognitiveRiskOverviewPanel";


const sidebarItems = [
  { label: "Overview", path: "/teacher", icon: <FaHome /> },
  { label: "Students", path: "/teacher", icon: <FaUserGraduate /> },
  { label: "Class Progress", path: "/teacher", icon: <FaUsers /> },
  { label: "Support Notes", path: "/teacher/notes", icon: <FaClipboardList /> },
  { label: "Intervention Plans", path: "/teacher/interventions", icon: <FaClipboardCheck /> },
  { label: "Feedback", path: "/teacher/feedback", icon: <FaComments /> },
  { label: "Analytics", path: "/education/analytics", icon: <FaChartLine /> },
  { label: "Study Planner", path: "/study-planner", icon: <FaBookOpen /> },
  { label: "Quiz Generator", path: "/quiz-generator", icon: <FaClipboardCheck /> },
  { label: "AI Assistant", path: "/chatbot", icon: <FaRobot /> },
  { label: "Settings", path: "/account-settings", icon: <FaUserCog /> }
];

const quickActions = [
  {
    title: "Add Support Note",
    description: "Record context for a student.",
    path: "/teacher/notes",
    icon: <FaClipboardList />,
    color: "bg-indigo-50 text-indigo-700"
  },
  {
    title: "Create Intervention Plan",
    description: "Plan targeted support.",
    path: "/teacher/interventions",
    icon: <FaClipboardCheck />,
    color: "bg-amber-50 text-amber-700"
  },
  {
    title: "Send Feedback",
    description: "Review and send feedback.",
    path: "/teacher/feedback",
    icon: <FaComments />,
    color: "bg-sky-50 text-sky-700"
  },
  {
    title: "Generate Quiz",
    description: "Create practice questions.",
    path: "/quiz-generator",
    icon: <FaClipboardCheck />,
    color: "bg-emerald-50 text-emerald-700"
  },
  {
    title: "Open AI Assistant",
    description: "Draft lessons and support ideas.",
    path: "/chatbot",
    icon: <FaRobot />,
    color: "bg-violet-50 text-violet-700"
  },
  {
    title: "View Analytics",
    description: "Open detailed learning analytics.",
    path: "/education/analytics",
    icon: <FaChartLine />,
    color: "bg-slate-100 text-slate-700"
  }
];


function getInitials(name) {
  if (!name) return "T";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
}


function TeacherDashboard() {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [summary, setSummary] = useState({
    total_students: 0,
    high_risk_students: 0,
    average_progress: 0,
    average_quiz_score: 0,
    risk_distribution: [],
    quiz_performance: null,
    ai_insights: []
  });

  const [error, setError] = useState("");
  const [creativityOverview, setCreativityOverview] = useState(null);
  const [creativityLoading, setCreativityLoading] = useState(true);
  const [creativityError, setCreativityError] = useState("");
  const [learningDNAOverview, setLearningDNAOverview] = useState(null);
  const [learningDNALoading, setLearningDNALoading] = useState(true);
  const [learningDNAError, setLearningDNAError] = useState("");
  const [flowOverview, setFlowOverview] = useState(null);
  const [flowLoading, setFlowLoading] = useState(true);
  const [flowError, setFlowError] = useState("");
  const [cognitiveRiskOverview, setCognitiveRiskOverview] = useState(null);
  const [cognitiveRiskLoading, setCognitiveRiskLoading] = useState(true);
  const [cognitiveRiskError, setCognitiveRiskError] = useState("");
  const [weakTopicSummary, setWeakTopicSummary] = useState(null);
  const [weakTopicLoading, setWeakTopicLoading] = useState(true);
  const [weakTopicError, setWeakTopicError] = useState("");
  const [learningPathSummary, setLearningPathSummary] = useState(null);
  const [learningPathLoading, setLearningPathLoading] = useState(true);
  const [learningPathError, setLearningPathError] = useState("");
  const [explainabilitySummary, setExplainabilitySummary] = useState(null);
  const [explainabilityLoading, setExplainabilityLoading] = useState(true);
  const [explainabilityError, setExplainabilityError] = useState("");

  const teacherName = localStorage.getItem("full_name") || "Teacher";
  const teacherInitials = getInitials(teacherName);

  async function fetchTeacherData() {
    try {
      const summaryData = await getTeacherDashboardSummary();
      setSummary(summaryData);
      setStudents(summaryData.students || []);

      await fetchCreativityOverview();
      await fetchLearningDNAOverview();
      await fetchFlowOverview();
      await fetchCognitiveRiskOverview();
      await fetchWeakTopicSummary();
      await fetchLearningPathSummary();
      await fetchExplainabilitySummary();

    } catch (error) {
      console.log(error);
      setError(error.message || "Backend connection error.");
    }
  }

  async function fetchLearningPathSummary() {
    setLearningPathLoading(true);
    setLearningPathError("");

    try {
      setLearningPathSummary(await getLearningPathAdminSummary());
    } catch (error) {
      console.log(error);
      setLearningPathError("Could not load adaptive learning paths.");
    }

    setLearningPathLoading(false);
  }

  async function fetchExplainabilitySummary() {
    setExplainabilityLoading(true);
    setExplainabilityError("");

    try {
      setExplainabilitySummary(await getExplainableAiAdminSummary());
    } catch (error) {
      console.log(error);
      setExplainabilityError("Could not load Explainable AI summary.");
    }

    setExplainabilityLoading(false);
  }

  async function fetchWeakTopicSummary() {
    setWeakTopicLoading(true);
    setWeakTopicError("");

    try {
      const data = await getClassWeakTopicSummary();
      setWeakTopicSummary(data);
    } catch (error) {
      console.log(error);
      setWeakTopicError("Could not load weak topic detection.");
    }

    setWeakTopicLoading(false);
  }

  async function fetchCognitiveRiskOverview() {
    setCognitiveRiskLoading(true);
    setCognitiveRiskError("");

    try {
      const overview = await getCognitiveRiskAdminOverview();
      setCognitiveRiskOverview(overview);
    } catch (error) {
      console.log(error);
      setCognitiveRiskError("Could not load Cognitive Risk overview.");
    }

    setCognitiveRiskLoading(false);
  }

  async function fetchFlowOverview() {
    setFlowLoading(true);
    setFlowError("");

    try {
      const overview = await getFlowAdminOverview();
      setFlowOverview(overview);
    } catch (error) {
      console.log(error);
      setFlowError("Could not load Flow State analytics.");
    }

    setFlowLoading(false);
  }

  async function fetchLearningDNAOverview() {
    setLearningDNALoading(true);
    setLearningDNAError("");

    try {
      const overview = await getLearningDNAAdminOverview();
      setLearningDNAOverview(overview);
    } catch (error) {
      console.log(error);
      setLearningDNAError("Could not load Learning DNA analytics.");
    }

    setLearningDNALoading(false);
  }

  async function fetchCreativityOverview() {
    setCreativityLoading(true);
    setCreativityError("");

    try {
      const overview = await getCreativityAdminOverview();
      setCreativityOverview(overview);
    } catch (error) {
      console.log(error);
      setCreativityError("Could not load creativity analytics.");
    }

    setCreativityLoading(false);
  }

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeProfileMenu);

    return () => {
      document.removeEventListener("mousedown", closeProfileMenu);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) => {
      return [
        student.student,
        student.email,
        student.risk_level
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query));
    });
  }, [searchTerm, students]);

  const studentsAtRisk = students.filter(student => student.risk_level === "High");
  const mediumRiskStudents = students.filter(student => student.risk_level === "Medium");
  const averageEngagement = students.length
    ? Math.round(
      students.reduce((total, student) => total + Number(student.engagement_score || 0), 0) / students.length
    )
    : summary.average_engagement || summary.average_progress || 0;

  const lowQuizStudents = students
    .filter(student => Number(student.average_quiz_score || 0) < 70)
    .sort((a, b) => Number(a.average_quiz_score || 0) - Number(b.average_quiz_score || 0));

  const recentQuizStudents = students
    .filter(student => Number(student.quiz_attempts || 0) > 0)
    .sort((a, b) => Number(b.quiz_attempts || 0) - Number(a.quiz_attempts || 0))
    .slice(0, 4);

  const metricCards = [
    {
      title: "Total Students",
      value: summary.total_students || students.length,
      detail: "Currently visible in class progress",
      icon: <FaUsers />,
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "Students At Risk",
      value: summary.high_risk_students || studentsAtRisk.length,
      detail: `${mediumRiskStudents.length} medium risk`,
      icon: <FaExclamationTriangle />,
      color: "bg-red-50 text-red-700"
    },
    {
      title: "Average Quiz Score",
      value: `${summary.average_quiz_score || 0}%`,
      detail: "Across recorded attempts",
      icon: <FaChartLine />,
      color: "bg-violet-50 text-violet-700"
    },
    {
      title: "Average Engagement",
      value: `${averageEngagement}%`,
      detail: "Based on student engagement scores",
      icon: <FaBookOpen />,
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      title: "Pending Feedback",
      value: summary.pending_feedback || 0,
      detail: "Open feedback items",
      icon: <FaComments />,
      color: "bg-sky-50 text-sky-700"
    },
    {
      title: "Active Intervention Plans",
      value: summary.active_intervention_plans || 0,
      detail: "Plans currently in progress",
      icon: <FaClipboardCheck />,
      color: "bg-amber-50 text-amber-700"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="lg:flex">
        <TeacherSidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={logout}
        />

        <main className="min-w-0 flex-1">
          <TeacherTopNavbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            teacherName={teacherName}
            teacherInitials={teacherInitials}
            profileMenuOpen={profileMenuOpen}
            setProfileMenuOpen={setProfileMenuOpen}
            profileMenuRef={profileMenuRef}
            onOpenSidebar={() => setSidebarOpen(true)}
            onLogout={logout}
          />

          <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
                {error}
              </div>
            )}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase text-blue-600">
                Overview
              </p>

              <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
                    Teacher Dashboard
                  </h1>

                  <p className="mt-2 max-w-2xl text-slate-600">
                    Monitor student progress, quiz performance and learning risk.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/education/analytics")}
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  <FaChartLine />
                  View Analytics
                </button>
              </div>
            </section>

            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {metricCards.map((card) => (
                <TeacherMetricCard
                  key={card.title}
                  {...card}
                />
              ))}
            </section>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
              <div className="space-y-8">
                <DashboardSection
                  title="Quick Actions"
                  description="Common teacher workflows are grouped here without crowding the overview."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {quickActions.map((action) => (
                      <QuickActionCard
                        key={action.title}
                        action={action}
                        onClick={() => navigate(action.path)}
                      />
                    ))}
                  </div>
                </DashboardSection>

                <DashboardSection
                  title="Class Signal Overview"
                  description="Live risk distribution and quiz performance from backend dashboard data."
                >
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <TeacherChart
                      title="Risk Distribution"
                      emptyText="No class risk data found."
                    >
                      {(summary.risk_distribution || []).some(item => item.value > 0) ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={summary.risk_distribution}
                              dataKey="value"
                              nameKey="name"
                              outerRadius={90}
                              label
                            >
                              {(summary.risk_distribution || []).map((entry, index) => (
                                <Cell
                                  key={entry.name}
                                  fill={["#dc2626", "#d97706", "#16a34a"][index] || "#2563eb"}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : null}
                    </TeacherChart>

                    <TeacherChart
                      title="Quiz Performance"
                      emptyText="No quiz attempts recorded for this class."
                    >
                      {(summary.quiz_performance?.trend || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={summary.quiz_performance.trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="score" fill="#2563eb" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : null}
                    </TeacherChart>
                  </div>
                </DashboardSection>

                <WeakTopicsCard
                  title="Class Weak Topics"
                  subtitle="Detected from repeated low quiz scores, engagement and lesson completion."
                  topics={weakTopicSummary?.topics || []}
                  loading={weakTopicLoading}
                  error={weakTopicError}
                  mode="teacher"
                  compact
                />

                <LearningPathCard
                  path={learningPathSummary?.paths?.[0] || null}
                  loading={learningPathLoading}
                  error={learningPathError}
                  compact
                  onOpen={() => navigate("/learning-path")}
                />

                <ExplainabilityCard
                  explanation={explainabilitySummary?.student_summaries?.[0]?.explanations?.[0]}
                  loading={explainabilityLoading}
                  error={explainabilityError}
                  compact
                  onOpen={() => navigate("/explainable-ai")}
                />

                <DashboardSection
                  title="Student Progress Tracker"
                  description="Search and review class engagement, risk, quiz performance and lesson progress."
                >
                  <StudentProgressTable students={filteredStudents} />
                </DashboardSection>

                <DashboardSection
                  title="Learning Analytics"
                  description="AI-supported learning signals remain available from the dashboard."
                >
                  <div className="space-y-6">
                    <CreativityAnalyticsPanel
                      overview={creativityOverview}
                      loading={creativityLoading}
                      error={creativityError}
                      fullAnalyticsPath="/education/analytics"
                    />

                    <LearningDNAAnalyticsPanel
                      overview={learningDNAOverview}
                      loading={learningDNALoading}
                      error={learningDNAError}
                    />

                    <FlowAnalyticsPanel
                      overview={flowOverview}
                      loading={flowLoading}
                      error={flowError}
                    />

                    <CognitiveRiskOverviewPanel
                      overview={cognitiveRiskOverview}
                      loading={cognitiveRiskLoading}
                      error={cognitiveRiskError}
                    />
                  </div>
                </DashboardSection>
              </div>

              <TeacherInsights
                studentsAtRisk={studentsAtRisk}
                mediumRiskStudents={mediumRiskStudents}
                lowQuizStudents={lowQuizStudents}
                recentQuizStudents={recentQuizStudents}
                aiInsights={summary.ai_insights || []}
                navigate={navigate}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function TeacherSidebar({
  mobileOpen,
  onClose,
  onLogout
}) {
  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Senyra
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Teacher Workspace
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 lg:hidden"
          title="Close navigation"
        >
          <FaTimes />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {sidebarItems.map((item) => (
          <NavLink
            key={`${item.label}-${item.path}`}
            to={item.path}
            end={item.path === "/teacher"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`
            }
          >
            <span className="text-base">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-600 hover:bg-red-50"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="sticky top-0 hidden h-screen lg:block">
        {sidebar}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close teacher navigation"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40"
          />

          <div className="relative h-full w-72 max-w-[86vw]">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}


function TeacherTopNavbar({
  searchTerm,
  setSearchTerm,
  teacherName,
  teacherInitials,
  profileMenuOpen,
  setProfileMenuOpen,
  profileMenuRef,
  onOpenSidebar,
  onLogout
}) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 lg:hidden"
            title="Open navigation"
          >
            <FaBars />
          </button>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="relative min-w-0 flex-1 xl:w-[32rem]"
          >
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search students/classes..."
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            title="Notifications"
          >
            <FaBell />
          </button>

          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            aria-label="Class selector"
            defaultValue="all"
          >
            <option value="all">All classes</option>
            <option value="year-10">Year 10</option>
            <option value="year-11">Year 11</option>
          </select>

          <div
            ref={profileMenuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex h-11 items-center gap-3 rounded-xl bg-slate-100 py-1 pl-1 pr-3 font-bold text-slate-800 hover:bg-slate-200"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm text-white">
                {teacherInitials}
              </span>

              <span className="hidden max-w-40 truncate sm:inline">
                {teacherName}
              </span>

              <FaChevronDown className="text-xs text-slate-500" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 z-40 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => navigate("/account-settings")}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <FaUserCog className="text-blue-600" />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


function DashboardSection({
  title,
  description,
  children
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}


function TeacherMetricCard({
  icon,
  title,
  value,
  detail,
  color
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${color}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {detail}
      </p>
    </div>
  );
}


function QuickActionCard({
  action,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-32 w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${action.color}`}>
        {action.icon}
      </span>

      <span className="min-w-0">
        <span className="block font-bold text-slate-950 group-hover:text-blue-700">
          {action.title}
        </span>

        <span className="mt-1 block text-sm leading-6 text-slate-500">
          {action.description}
        </span>
      </span>
    </button>
  );
}


function TeacherInsights({
  studentsAtRisk,
  mediumRiskStudents,
  lowQuizStudents,
  recentQuizStudents,
  aiInsights,
  navigate
}) {
  return (
    <aside className="space-y-6">
      <DashboardSection
        title="Teacher Insights"
        description="A compact view of the next areas to review."
      >
        <div className="space-y-5">
          <InsightBlock
            icon={<FaExclamationTriangle />}
            title="Students needing attention"
            actionLabel="Open support notes"
            onAction={() => navigate("/teacher/notes")}
          >
            <StudentList
              students={[...studentsAtRisk, ...mediumRiskStudents].slice(0, 4)}
              emptyText="No high or medium risk students found."
            />
          </InsightBlock>

          <InsightBlock
            icon={<FaLightbulb />}
            title="AI Insights"
            actionLabel="Generate quiz"
            onAction={() => navigate("/quiz-generator")}
          >
            <div className="space-y-3">
              {aiInsights.length > 0 ? aiInsights.map((insight) => (
                <p
                  key={insight}
                  className="rounded-xl bg-blue-50 p-3 text-sm font-semibold leading-6 text-blue-800"
                >
                  {insight}
                </p>
              )) : (
                <p className="text-sm leading-6 text-slate-600">
                  No AI insights available yet.
                </p>
              )}
            </div>
          </InsightBlock>

          <InsightBlock
            icon={<FaChartLine />}
            title="Recent quiz performance"
            actionLabel="View analytics"
            onAction={() => navigate("/education/analytics")}
          >
            <StudentList
              students={recentQuizStudents}
              emptyText="No recent quiz attempts found."
              metricKey="average_quiz_score"
              metricSuffix="%"
            />
          </InsightBlock>

          <InsightBlock
            icon={<FaClipboardCheck />}
            title="Recommended interventions"
            actionLabel="Create plan"
            onAction={() => navigate("/teacher/interventions")}
          >
            {lowQuizStudents.length > 0 ? (
              <div className="space-y-3">
                {lowQuizStudents.slice(0, 3).map((student) => (
                  <div
                    key={student.id}
                    className="rounded-xl bg-slate-50 p-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {student.student}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Targeted quiz practice and a short feedback note recommended.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No intervention recommendations from current quiz scores.
              </p>
            )}
          </InsightBlock>
        </div>
      </DashboardSection>
    </aside>
  );
}


function InsightBlock({
  icon,
  title,
  actionLabel,
  onAction,
  children
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            {icon}
          </span>

          <h3 className="font-bold text-slate-950">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
        >
          {actionLabel}
        </button>
      </div>

      {children}
    </div>
  );
}


function StudentList({
  students,
  emptyText,
  metricKey,
  metricSuffix = ""
}) {
  if (!students.length) {
    return (
      <p className="text-sm text-slate-500">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <div
          key={student.id}
          className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {student.student}
            </p>
            <p className="text-sm text-slate-500">
              {student.risk_level || "Risk not set"}
            </p>
          </div>

          {metricKey && (
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700">
              {student[metricKey] || 0}{metricSuffix}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}


function StudentProgressTable({
  students
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b bg-slate-50 text-sm text-slate-500">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Engagement</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Quiz Attempts</th>
            <th className="px-4 py-3">Quiz Score</th>
            <th className="px-4 py-3">Lessons</th>
            <th className="px-4 py-3">Progress</th>
          </tr>
        </thead>

        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr
                key={student.id}
                className="border-b text-sm hover:bg-slate-50"
              >
                <td className="px-4 py-4 font-semibold text-slate-950">
                  {student.student}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {student.email}
                </td>

                <td className="px-4 py-4">
                  {student.engagement_score}%
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      student.risk_level === "High"
                        ? "bg-red-100 text-red-700"
                        : student.risk_level === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {student.risk_level}
                  </span>
                </td>

                <td className="px-4 py-4">
                  {student.quiz_attempts}
                </td>

                <td className="px-4 py-4">
                  {student.average_quiz_score}%
                </td>

                <td className="px-4 py-4">
                  {student.completed_lessons}/{student.total_lessons}
                </td>

                <td className="px-4 py-4">
                  {student.lesson_progress}%
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="py-8 text-center text-slate-500"
              >
                No student progress found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


function TeacherChart({
  title,
  emptyText,
  children
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="mb-4 font-bold text-slate-950">
        {title}
      </h3>

      {children || (
        <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-center text-sm font-semibold text-slate-500">
          {emptyText}
        </div>
      )}
    </div>
  );
}


export default TeacherDashboard;

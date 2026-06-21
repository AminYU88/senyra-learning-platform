/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopNavbar from "../components/admin/AdminTopNavbar";
import LearningPathCard from "../components/LearningPathCard";
import LearningPathTimeline from "../components/LearningPathTimeline";
import RecommendedTopicCard from "../components/RecommendedTopicCard";
import StudentShell from "../components/StudentShell";
import {
  generateLearningPath,
  getLearningPathAdminSummary,
  getMyLearningPath
} from "../api/learningPathApi";


function LearningPathPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";
  const [path, setPath] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  const loadLearningPath = async () => {
    setLoading(true);
    setError("");

    try {
      if (role === "student") {
        setPath(await getMyLearningPath());
      } else {
        const data = await getLearningPathAdminSummary();
        setSummary(data);
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not load adaptive learning path.");
    }

    setLoading(false);
  };

  const regeneratePath = async () => {
    setLoading(true);
    setError("");

    try {
      setPath(await generateLearningPath());
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not regenerate learning path.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadLearningPath();
  }, []);

  const content = role === "student"
    ? (
      <StudentLearningPathView
        path={path}
        loading={loading}
        error={error}
        onRegenerate={regeneratePath}
        navigate={navigate}
      />
    )
    : (
      <StaffLearningPathView
        role={role}
        summary={summary}
        loading={loading}
        error={error}
        navigate={navigate}
      />
    );

  if (role === "admin") {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <AdminSidebar
          collapsed={adminSidebarCollapsed}
          onToggle={() => setAdminSidebarCollapsed(!adminSidebarCollapsed)}
          onLogout={() => logout(navigate)}
          mobileOpen={adminMobileOpen}
          onClose={() => setAdminMobileOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <AdminTopNavbar onOpenMenu={() => setAdminMobileOpen(true)} />
          <div className="p-5 md:p-8 xl:p-10">
            {content}
          </div>
        </main>
      </div>
    );
  }

  if (role === "teacher") {
    return (
      <div className="min-h-screen bg-slate-100 p-5 md:p-8 xl:p-10">
        {content}
      </div>
    );
  }

  return (
    <StudentShell
      title="Adaptive Learning Path"
      subtitle="A personalised sequence shaped by your current learning signals."
      studentName={localStorage.getItem("full_name") || "Student"}
    >
      {content}
    </StudentShell>
  );
}


function StudentLearningPathView({
  path,
  loading,
  error,
  onRegenerate,
  navigate
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-blue-600">
              Adaptive Path
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Your Personalised Learning Path
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Built from weak topics, quiz performance, engagement, risk, cognitive risk, Flow State, creativity and Learning DNA.
            </p>
          </div>

          <button
            type="button"
            onClick={onRegenerate}
            className="w-fit rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
          >
            Regenerate Path
          </button>
        </div>
      </section>

      <LearningPathCard
        path={path}
        loading={loading}
        error={error}
      />

      {path && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Recommended Topic Sequence
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Start with the next topic, then move through the path in order.
            </p>
            <div className="mt-5 space-y-3">
              {(path.next_topic_cards || (path.next_topics || []).map((topic) => ({ topic, subject: path.subject, difficulty: path.difficulty }))).map((item) => (
                <RecommendedTopicCard
                  key={item.topic}
                  topic={item.topic}
                  subject={item.subject || path.subject}
                  difficulty={item.difficulty || path.difficulty}
                  status={item.status}
                  reason={item.reason}
                  recommendedActivity={item.recommended_activity}
                  onRevise={() => navigate(`/study-planner?subject=${encodeURIComponent(item.subject || path.subject)}&topic=${encodeURIComponent(item.topic)}`)}
                  onQuiz={() => navigate(`/quiz-generator?subject=${encodeURIComponent(item.subject || path.subject)}&topic=${encodeURIComponent(item.topic)}`)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Daily Tasks
            </h2>
            <div className="mt-4 space-y-3">
              {(path.daily_tasks || []).map((task) => (
                <div
                  key={task}
                  className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                >
                  {task}
                </div>
              ))}
            </div>
          </section>
        </section>
      )}

      {path && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-bold text-slate-950">
            Weekly Timeline
          </h2>
          <LearningPathTimeline steps={path.learning_path || []} />
        </section>
      )}
    </div>
  );
}


function StaffLearningPathView({
  role,
  summary,
  loading,
  error,
  navigate
}) {
  const paths = summary?.paths || [];
  const chartData = summary?.level_distribution || [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-600">
          Adaptive Learning Paths
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          {role === "admin" ? "Platform Path Distribution" : "Class Learning Paths"}
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Review recommended levels, identify students needing easier support, and spot learners ready for harder paths.
        </p>
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 font-semibold text-slate-500">
          Loading adaptive paths...
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Metric label="Students" value={summary?.total_students || 0} />
            <Metric label="Need Easier Path" value={summary?.students_needing_easier_path?.length || 0} />
            <Metric label="Ready For Harder Path" value={summary?.students_ready_for_harder_path?.length || 0} />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Learning Level Distribution
              </h2>
              <div className="mt-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="level" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={90} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Student Learning Paths
              </h2>
              <div className="mt-5 space-y-4">
                {paths.length > 0 ? paths.map((item) => (
                  <button
                    key={item.student_id}
                    type="button"
                    onClick={() => navigate(`/learning-path?student=${item.student_id}`)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100"
                  >
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {item.student}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.current_level || "Not assessed"} to {item.recommended_level || item.level} - {item.subject} - {item.difficulty}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700">
                        {item.progress_status || `${Math.round(item.progress_percent || 0)}%`}
                      </span>
                    </div>
                  </button>
                )) : (
                  <div className="rounded-xl bg-slate-50 p-4 font-semibold text-slate-500">
                    No learning paths available yet.
                  </div>
                )}
              </div>
            </section>
          </section>
        </>
      )}
    </div>
  );
}


function Metric({
  label,
  value
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}


function logout(navigate) {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("full_name");
  navigate("/login");
}


export default LearningPathPage;

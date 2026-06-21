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

import WeakTopicsCard from "../components/WeakTopicsCard";
import StudentShell from "../components/StudentShell";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopNavbar from "../components/admin/AdminTopNavbar";
import {
  getAdminWeakTopicSummary,
  getClassWeakTopicSummary,
  getMyWeakTopics
} from "../api/weakTopicApi";


function WeakTopicsPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";
  const [topics, setTopics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  const loadWeakTopics = async () => {
    setLoading(true);
    setError("");

    try {
      if (role === "student") {
        const data = await getMyWeakTopics();
        setTopics(data);
      } else if (role === "admin") {
        const data = await getAdminWeakTopicSummary();
        setSummary(data);
        setTopics(data.topics || []);
      } else {
        const data = await getClassWeakTopicSummary();
        setSummary(data);
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not load weak topic data.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadWeakTopics();
  }, []);

  const title = role === "admin"
    ? "Platform Weak Topics"
    : role === "teacher"
    ? "Class Weak Topics"
    : "My Weak Topics";

  const subtitle = role === "student"
    ? "Senyra detects struggling topics from your quiz results, engagement and lesson completion."
    : "Senyra groups weak topics across learners using quiz scores, repeated low attempts and engagement signals.";

  const chartData = topics.map((topic) => ({
    name: topic.topic,
    score: Math.round(topic.average_score || 0),
    attempts: topic.attempts || 0
  }));

  const content = (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-amber-600">
              Weak Topic Detection Engine
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {title}
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={loadWeakTopics}
            className="w-fit rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
          >
            Refresh Detection
          </button>
        </div>
      </section>

      {role !== "student" && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metric
            label="Detected Topics"
            value={summary?.total_topics || 0}
          />
          <Metric
            label="Weak Topics"
            value={summary?.weak_topics || summary?.high_severity_topics || 0}
          />
          <Metric
            label="Medium / Strong"
            value={`${summary?.medium_topics || 0} / ${summary?.strong_topics || 0}`}
          />
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <WeakTopicsCard
          title={title}
          subtitle="Priority is higher when low scores repeat, engagement is low, or lesson completion is low."
          topics={topics}
          loading={loading}
          error={error}
          mode={role}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Topic Score Snapshot
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Lower bars need more support.
          </p>

          {loading ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-4 font-semibold text-slate-500">
              Loading chart...
            </div>
          ) : chartData.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-4 font-semibold text-slate-500">
              No chart data available yet.
            </div>
          ) : (
            <div className="mt-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#d97706" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </section>
    </div>
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

  if (role === "student") {
    return (
      <StudentShell
        title="Weak Topics"
        subtitle="Target the topics that need the most revision."
        studentName={localStorage.getItem("full_name") || "Student"}
      >
        {content}
      </StudentShell>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-8 xl:p-10">
      {content}
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


export default WeakTopicsPage;

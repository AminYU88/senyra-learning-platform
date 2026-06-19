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
import ExplainabilityCard from "../components/ExplainabilityCard";
import FactorImpactList from "../components/FactorImpactList";
import StudentShell from "../components/StudentShell";
import {
  getExplainableAiAdminSummary,
  getMyExplainableAi
} from "../api/explainableAiApi";


function ExplainableAIDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";
  const [studentExplainability, setStudentExplainability] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  const loadExplainability = async () => {
    setLoading(true);
    setError("");

    try {
      if (role === "student") {
        setStudentExplainability(await getMyExplainableAi());
      } else {
        setSummary(await getExplainableAiAdminSummary());
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not load Explainable AI dashboard.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadExplainability();
  }, []);

  const content = role === "student"
    ? (
      <StudentExplainabilityView
        data={studentExplainability}
        loading={loading}
        error={error}
        onRefresh={loadExplainability}
      />
    )
    : (
      <StaffExplainabilityView
        role={role}
        summary={summary}
        loading={loading}
        error={error}
        onRefresh={loadExplainability}
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
      title="Explainable AI"
      subtitle="Understand why Senyra made each prediction or recommendation."
      studentName={localStorage.getItem("full_name") || "Student"}
    >
      {content}
    </StudentShell>
  );
}


function StudentExplainabilityView({
  data,
  loading,
  error,
  onRefresh
}) {
  return (
    <div className="space-y-6">
      <Header
        title="Why Was This Recommended?"
        subtitle="Plain-English explanations for risk, cognitive risk, engagement, weak topics, learning paths and AI recommendations."
        onRefresh={onRefresh}
      />

      {error && <ErrorMessage error={error} />}

      {loading ? (
        <LoadingBlock />
      ) : (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {(data?.explanations || []).map((item) => (
            <ExplainabilityCard
              key={item.prediction_type}
              explanation={item}
            />
          ))}

          {(data?.explanations || []).length === 0 && (
            <EmptyBlock />
          )}
        </section>
      )}
    </div>
  );
}


function StaffExplainabilityView({
  role,
  summary,
  loading,
  error,
  onRefresh
}) {
  const chartData = summary?.common_negative_factors || [];
  const firstStudent = summary?.student_summaries?.[0];

  return (
    <div className="space-y-6">
      <Header
        title={role === "admin" ? "Explainable AI Summary" : "Class Explainable AI"}
        subtitle="Review common risk factors, model explanations and intervention reasons across learners."
        onRefresh={onRefresh}
      />

      {error && <ErrorMessage error={error} />}

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Metric label="Students" value={summary?.total_students || 0} />
            <Metric label="Explanations" value={summary?.explanations_generated || 0} />
            <Metric label="Common Negative Factors" value={summary?.common_negative_factors?.length || 0} />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Common Risk Factors
              </h2>
              <div className="mt-5 h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="factor" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={90} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#dc2626" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyBlock text="No common factors found yet." />
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Model Explanation Summary
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <FactorImpactList
                  title="Common Positive Factors"
                  factors={(summary?.common_positive_factors || []).map((item) => ({
                    factor: item.factor,
                    impact: "positive",
                    value: `${item.count} student signal(s)`
                  }))}
                />
                <FactorImpactList
                  title="Common Negative Factors"
                  factors={(summary?.common_negative_factors || []).map((item) => ({
                    factor: item.factor,
                    impact: "negative",
                    value: `${item.count} student signal(s)`
                  }))}
                />
              </div>
            </section>
          </section>

          {firstStudent && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Example Student Explanation
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-2">
                {firstStudent.explanations.slice(0, 2).map((item) => (
                  <ExplainabilityCard
                    key={`${firstStudent.student_id}-${item.prediction_type}`}
                    explanation={item}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}


function Header({
  title,
  subtitle,
  onRefresh
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-indigo-600">
            Explainable AI Dashboard
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
          onClick={onRefresh}
          className="w-fit rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
        >
          Refresh Explanations
        </button>
      </div>
    </section>
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


function LoadingBlock() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 font-semibold text-slate-500">
      Loading AI explanations...
    </div>
  );
}


function EmptyBlock({
  text = "No explainability data is available yet."
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 font-semibold text-slate-500">
      {text}
    </div>
  );
}


function ErrorMessage({
  error
}) {
  return (
    <div className="rounded-xl bg-red-50 p-4 font-semibold text-red-700">
      {error}
    </div>
  );
}


function logout(navigate) {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("full_name");
  navigate("/login");
}


export default ExplainableAIDashboard;

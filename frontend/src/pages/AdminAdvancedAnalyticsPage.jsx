import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaChartPie,
  FaChartLine,
  FaUsers,
  FaCertificate
} from "react-icons/fa";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import CreativityAnalyticsPanel from "../components/creativity/CreativityAnalyticsPanel";
import { getCreativityAdminOverview } from "../api/creativityApi";


function AdminAdvancedAnalyticsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    overview: {
      total_students: 0,
      high_risk: 0,
      medium_risk: 0,
      low_risk: 0,
      certificate_ready: 0,
      average_quiz_score: 0,
      average_lesson_progress: 0,
      average_engagement: 0
    },
    students: []
  });

  const [message, setMessage] = useState("");
  const [creativityOverview, setCreativityOverview] = useState(null);
  const [creativityLoading, setCreativityLoading] = useState(true);
  const [creativityError, setCreativityError] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/advanced-analytics/`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const result = await response.json();

      if (!response.ok) {
        setMessage("Could not load advanced analytics.");
        return;
      }

      setData(result);
      await fetchCreativityOverview();

    } catch (error) {
      console.log(error);
      setMessage("Backend connection error.");
    }
  };

  const fetchCreativityOverview = async () => {
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
  };

  const riskData = [
    {
      name: "High Risk",
      value: data.overview.high_risk
    },
    {
      name: "Medium Risk",
      value: data.overview.medium_risk
    },
    {
      name: "Low Risk",
      value: data.overview.low_risk
    }
  ];

  const progressData = data.students.map((student) => ({
    name: student.student,
    progress: student.lesson_progress
  }));

  const quizData = data.students.map((student) => ({
    name: student.student,
    score: student.average_quiz_score
  }));

  const COLORS = [
    "#ef4444",
    "#f59e0b",
    "#22c55e"
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Advanced Admin Analytics
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Deep analytics for risk, progress, quizzes and certificate readiness.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin")}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <FaArrowLeft />
          Admin Dashboard
        </button>

      </div>

      {message && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <AnalyticsCard
          icon={<FaUsers />}
          title="Total Students"
          value={data.overview.total_students}
          color="bg-blue-100 text-blue-600"
        />

        <AnalyticsCard
          icon={<FaChartPie />}
          title="High Risk"
          value={data.overview.high_risk}
          color="bg-red-100 text-red-600"
        />

        <AnalyticsCard
          icon={<FaChartLine />}
          title="Avg Progress"
          value={`${data.overview.average_lesson_progress}%`}
          color="bg-green-100 text-green-600"
        />

        <AnalyticsCard
          icon={<FaCertificate />}
          title="Certificate Ready"
          value={data.overview.certificate_ready}
          color="bg-yellow-100 text-yellow-700"
        />

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">

        <div className="bg-white rounded-3xl shadow p-8">

          <h2 className="text-3xl font-bold mb-6">
            Risk Distribution
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {riskData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

        </div>

        <div className="bg-white rounded-3xl shadow p-8">

          <h2 className="text-3xl font-bold mb-6">
            Lesson Progress by Student
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar
                dataKey="progress"
                fill="#2563eb"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow p-8 mb-8">

        <h2 className="text-3xl font-bold mb-6">
          Quiz Performance by Student
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={quizData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="score"
              fill="#7c3aed"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

      </div>

      <div className="mb-8">
        <CreativityAnalyticsPanel
          overview={creativityOverview}
          loading={creativityLoading}
          error={creativityError}
          fullAnalyticsPath="/admin/advanced-analytics"
        />
      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          Student Analytics Table
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Student</th>
                <th>Email</th>
                <th>Engagement</th>
                <th>Risk</th>
                <th>Quiz Average</th>
                <th>Lesson Progress</th>
                <th>Certificate Ready</th>
              </tr>
            </thead>

            <tbody>
              {data.students.map((student, index) => (
                <tr
                  key={index}
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
                      className={`px-4 py-2 rounded-full text-white font-bold ${
                        student.risk_level === "High"
                          ? "bg-red-500"
                          : student.risk_level === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {student.risk_level}
                    </span>
                  </td>

                  <td>
                    {student.average_quiz_score}%
                  </td>

                  <td>
                    {student.lesson_progress}%
                  </td>

                  <td>
                    {student.certificate_ready ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


function AnalyticsCard({
  icon,
  title,
  value,
  color
}) {
  return (
    <div className="bg-white rounded-3xl shadow p-8">

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 ${color}`}>
        {icon}
      </div>

      <h2 className="text-slate-500 font-semibold text-xl">
        {title}
      </h2>

      <p className="text-4xl font-bold mt-3">
        {value}
      </p>

    </div>
  );
}

export default AdminAdvancedAnalyticsPage;

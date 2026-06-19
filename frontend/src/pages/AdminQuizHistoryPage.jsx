import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaHistory,
  FaTrophy,
  FaUsers
} from "react-icons/fa";

function AdminQuizHistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchHistory();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/quiz-history/admin`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not load admin quiz history.");
        return;
      }

      setHistory(data);

    } catch (error) {
      console.log(error);
      setMessage("Server error while loading quiz history.");
    }
  };

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((total, item) => total + item.score, 0) /
            history.length
        )
      : 0;

  const uniqueStudents = new Set(
    history.map((item) => item.email)
  ).size;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Admin Quiz History
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Monitor all student quiz attempts and assessment performance.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <AdminCard
          icon={<FaHistory />}
          title="Total Quiz Attempts"
          value={history.length}
          color="bg-blue-100 text-blue-600"
        />

        <AdminCard
          icon={<FaTrophy />}
          title="Average Score"
          value={`${averageScore}%`}
          color="bg-yellow-100 text-yellow-700"
        />

        <AdminCard
          icon={<FaUsers />}
          title="Students Assessed"
          value={uniqueStudents}
          color="bg-green-100 text-green-600"
        />

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          All Quiz Attempts
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Student</th>
                <th>Email</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Performance</th>
              </tr>
            </thead>

            <tbody>
              {history.length > 0 ? (
                history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="py-5 font-semibold">
                      {item.student}
                    </td>

                    <td>
                      {item.email}
                    </td>

                    <td>
                      {item.quiz_title}
                    </td>

                    <td>
                      {item.score}%
                    </td>

                    <td>
                      <span
                        className={`px-4 py-2 rounded-full text-white font-semibold ${
                          item.score >= 80
                            ? "bg-green-500"
                            : item.score >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        {item.score >= 80
                          ? "Excellent"
                          : item.score >= 50
                          ? "Good"
                          : "Needs Support"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-slate-500"
                  >
                    No quiz attempts found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function AdminCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-3xl shadow p-8">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 ${color}`}
      >
        {icon}
      </div>

      <h2 className="text-slate-500 font-semibold text-xl">
        {title}
      </h2>

      <p className="text-5xl font-bold mt-3">
        {value}
      </p>
    </div>
  );
}

export default AdminQuizHistoryPage;
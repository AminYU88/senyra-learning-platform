import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaHistory,
  FaTrophy
} from "react-icons/fa";


function QuizHistoryPage() {
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
        `${API_BASE_URL}/quiz-history/me`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not load quiz history.");
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
          history.reduce(
            (total, item) => total + item.score,
            0
          ) / history.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Quiz History
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Review your previous quiz attempts and performance.
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

      {message && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <div className="bg-white rounded-3xl shadow p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-5">
            <FaHistory />
          </div>

          <h2 className="text-slate-500 font-semibold text-xl">
            Total Attempts
          </h2>

          <p className="text-5xl font-bold mt-3">
            {history.length}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-8">
          <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-3xl mb-5">
            <FaTrophy />
          </div>

          <h2 className="text-slate-500 font-semibold text-xl">
            Average Score
          </h2>

          <p className="text-5xl font-bold mt-3">
            {averageScore}%
          </p>
        </div>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          Attempt History
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Quiz</th>
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
                          : "Needs Revision"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="py-8 text-center text-slate-500"
                  >
                    No quiz attempts yet.
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

export default QuizHistoryPage;
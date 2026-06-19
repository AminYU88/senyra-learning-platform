import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaTrophy,
  FaMedal,
  FaChartLine,
  FaBookOpen
} from "react-icons/fa";


function LeaderboardPage() {
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
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

    fetchLeaderboard();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/leaderboard/`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not load leaderboard.");
        return;
      }

      setLeaderboard(data);

    } catch (error) {
      console.log(error);
      setMessage("Server error while loading leaderboard.");
    }
  };

  const topStudent = leaderboard[0];

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Student Leaderboard
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Ranking students by XP, quiz performance and lesson progress.
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

      {topStudent && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-3xl shadow p-8 mb-8">
          <div className="flex items-center gap-4">
            <FaTrophy className="text-6xl" />

            <div>
              <h2 className="text-3xl font-bold">
                Current Top Learner
              </h2>

              <p className="text-2xl mt-2">
                {topStudent.student} — {topStudent.leaderboard_score} points
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <MetricCard
          icon={<FaTrophy />}
          title="Students Ranked"
          value={leaderboard.length}
          color="bg-yellow-100 text-yellow-700"
        />

        <MetricCard
          icon={<FaChartLine />}
          title="Top Score"
          value={topStudent ? topStudent.leaderboard_score : 0}
          color="bg-green-100 text-green-600"
        />

        <MetricCard
          icon={<FaBookOpen />}
          title="Ranking Method"
          value="XP + Quiz + Progress"
          color="bg-blue-100 text-blue-600"
        />

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          Leaderboard Table
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Rank</th>
                <th>Student</th>
                <th>Email</th>
                <th>XP</th>
                <th>Quiz Score</th>
                <th>Lesson Progress</th>
                <th>Lessons</th>
                <th>Total Score</th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.length > 0 ? (
                leaderboard.map((item) => (
                  <tr
                    key={item.email}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="py-5 font-bold text-xl">
                      {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : item.rank}
                    </td>

                    <td className="font-semibold">
                      {item.student}
                    </td>

                    <td>
                      {item.email}
                    </td>

                    <td>
                      {item.xp}
                    </td>

                    <td>
                      {item.average_quiz_score}%
                    </td>

                    <td>
                      {item.lesson_progress}%
                    </td>

                    <td>
                      {item.completed_lessons}/{item.total_lessons}
                    </td>

                    <td>
                      <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
                        {item.leaderboard_score}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="py-8 text-center text-slate-500"
                  >
                    No leaderboard data found.
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


function MetricCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-3xl shadow p-8">

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 ${color}`}>
        {icon}
      </div>

      <h2 className="text-slate-500 font-semibold text-xl">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>

    </div>
  );
}

export default LeaderboardPage;
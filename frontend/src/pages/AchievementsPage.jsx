import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaTrophy,
  FaLock,
  FaStar,
  FaChartLine
} from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";


function AchievementsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
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

    fetchAchievements();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/achievements/me`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const result = await response.json();

      if (!response.ok) {
        setMessage("Could not load achievements.");
        return;
      }

      setData(result);

    } catch (error) {
      console.log(error);
      setMessage("Server error while loading achievements.");
    }
  };

  if (!data) {
    return (
      <LoadingSpinner text="Loading Achievements..." />
    );
  }

  const progress = Math.round(
    (data.unlocked_count / data.total_achievements) * 100
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Achievements
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Track your learning badges, XP milestones and progress rewards.
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

      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-3xl shadow p-8 mb-8">

        <div className="flex items-center gap-5">
          <FaTrophy className="text-6xl" />

          <div>
            <h2 className="text-3xl font-bold">
              {data.unlocked_count} / {data.total_achievements} Achievements Unlocked
            </h2>

            <p className="text-white mt-2 text-xl">
              Achievement progress: {progress}%
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <MetricCard
          icon={<FaStar />}
          title="XP Points"
          value={data.xp}
          color="bg-yellow-100 text-yellow-700"
        />

        <MetricCard
          icon={<FaChartLine />}
          title="Lesson Progress"
          value={`${data.lesson_progress}%`}
          color="bg-blue-100 text-blue-600"
        />

        <MetricCard
          icon={<FaTrophy />}
          title="Quiz Average"
          value={`${data.average_quiz_score}%`}
          color="bg-green-100 text-green-600"
        />

        <MetricCard
          icon={<FaStar />}
          title="Unlocked"
          value={`${data.unlocked_count}/${data.total_achievements}`}
          color="bg-purple-100 text-purple-600"
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {data.achievements.map((achievement, index) => (
          <div
            key={index}
            className={`rounded-3xl shadow p-8 ${
              achievement.unlocked
                ? "bg-white"
                : "bg-slate-200 opacity-70"
            }`}
          >

            <div className="text-6xl mb-5">
              {achievement.unlocked
                ? achievement.icon
                : <FaLock className="text-slate-500" />}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {achievement.title}
            </h2>

            <p className="text-slate-600 mb-5">
              {achievement.description}
            </p>

            <span
              className={`px-4 py-2 rounded-full font-bold ${
                achievement.unlocked
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-300 text-slate-600"
              }`}
            >
              {achievement.unlocked
                ? "Unlocked"
                : "Locked"}
            </span>

          </div>
        ))}

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

      <p className="text-4xl font-bold mt-3">
        {value}
      </p>

    </div>
  );
}

export default AchievementsPage;

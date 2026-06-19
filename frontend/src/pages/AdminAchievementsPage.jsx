import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaMedal,
  FaUsers,
  FaTrophy,
  FaChartLine
} from "react-icons/fa";


function AdminAchievementsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
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

    fetchAdminAchievements();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchAdminAchievements = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/achievements/`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not load admin achievements.");
        return;
      }

      setStudents(data);

    } catch (error) {
      console.log(error);
      setMessage("Server error while loading achievements.");
    }
  };

  const totalStudents = students.length;

  const totalUnlocked = students.reduce(
    (sum, student) => sum + student.unlocked_achievements,
    0
  );

  const averageUnlocked =
    totalStudents > 0
      ? Math.round(totalUnlocked / totalStudents)
      : 0;

  const topStudent = students.reduce(
    (best, student) =>
      !best || student.unlocked_achievements > best.unlocked_achievements
        ? student
        : best,
    null
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Admin Achievements
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Monitor student badges, XP, quiz performance and achievement progress.
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

        <AdminCard
          icon={<FaUsers />}
          title="Total Students"
          value={totalStudents}
          color="bg-blue-100 text-blue-600"
        />

        <AdminCard
          icon={<FaMedal />}
          title="Total Badges Unlocked"
          value={totalUnlocked}
          color="bg-amber-100 text-amber-700"
        />

        <AdminCard
          icon={<FaChartLine />}
          title="Avg Unlocked"
          value={`${averageUnlocked}/7`}
          color="bg-green-100 text-green-600"
        />

        <AdminCard
          icon={<FaTrophy />}
          title="Top Achiever"
          value={topStudent ? topStudent.student : "None"}
          color="bg-purple-100 text-purple-600"
        />

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          Student Achievement Status
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Student</th>
                <th>Email</th>
                <th>XP</th>
                <th>Quiz Average</th>
                <th>Lesson Progress</th>
                <th>Lessons</th>
                <th>Quiz Attempts</th>
                <th>Achievements</th>
              </tr>
            </thead>

            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
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
                      {student.xp}
                    </td>

                    <td>
                      {student.average_quiz_score}%
                    </td>

                    <td>
                      {student.lesson_progress}%
                    </td>

                    <td>
                      {student.completed_lessons}/{student.total_lessons}
                    </td>

                    <td>
                      {student.quiz_attempts}
                    </td>

                    <td>
                      <span
                        className={`px-4 py-2 rounded-full font-bold ${
                          student.unlocked_achievements === student.total_achievements
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {student.unlocked_achievements}/{student.total_achievements}
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
                    No achievement data found.
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

export default AdminAchievementsPage;
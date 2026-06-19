import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaGraduationCap,
  FaChartLine,
  FaTrophy,
  FaBrain,
  FaCertificate
} from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";

function ProfilePage() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [risk, setRisk] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [error, setError] = useState("");

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

    loadProfile();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const loadProfile = async () => {
    await fetchStudent();
    await fetchRisk();
    await fetchCertificate();
    await fetchLearningPath();
  };

  const fetchStudent = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/me`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError("Could not load student profile.");
        return;
      }

      setStudent(data);

    } catch (error) {
      console.log(error);
      setError("Backend connection error.");
    }
  };

  const fetchRisk = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ml/risk-prediction`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        setRisk(data);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const fetchCertificate = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/certificates/eligibility`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        setCertificate(data);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const fetchLearningPath = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/learning-path/me`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        setLearningPath(data);
      }

    } catch (error) {
      console.log(error);
    }
  };

  if (!student) {
    return (
      <LoadingSpinner text={error || "Loading Profile..."} />
    );
  }

  const quizAverage = risk?.quiz_analytics?.average_score || 0;
  const quizAttempts = risk?.quiz_analytics?.attempts || 0;
  const lessonProgress = risk?.progress_analytics?.lesson_progress || 0;
  const completedLessons = risk?.progress_analytics?.completed_lessons || 0;
  const totalLessons = risk?.progress_analytics?.total_lessons || 0;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Student Profile
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            View your account, AI analytics, progress and certificate status.
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

      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl shadow p-10 mb-8">

        <div className="flex items-center gap-6">

          <div className="w-24 h-24 rounded-3xl bg-white text-blue-700 flex items-center justify-center text-5xl">
            <FaUser />
          </div>

          <div>
            <h2 className="text-4xl font-bold">
              {student.full_name}
            </h2>

            <p className="text-blue-100 mt-2 text-xl">
              {student.email}
            </p>

            <p className="text-blue-100 mt-1">
              Role: {student.role}
            </p>
          </div>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <ProfileCard
          icon={<FaChartLine />}
          title="Engagement"
          value={`${risk?.engagement_score || 0}%`}
          color="bg-green-100 text-green-600"
        />

        <ProfileCard
          icon={<FaBrain />}
          title="AI Risk Level"
          value={risk?.risk_level || "Unknown"}
          color="bg-purple-100 text-purple-600"
        />

        <ProfileCard
          icon={<FaTrophy />}
          title="Quiz Average"
          value={`${quizAverage}%`}
          color="bg-yellow-100 text-yellow-700"
        />

        <ProfileCard
          icon={<FaCertificate />}
          title="Certificate"
          value={certificate?.eligible ? "Unlocked" : "Locked"}
          color="bg-blue-100 text-blue-600"
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

        <div className="bg-white rounded-3xl shadow p-8">

          <h2 className="text-3xl font-bold mb-6">
            Learning Progress
          </h2>

          <p className="text-slate-600 mb-3">
            {completedLessons} of {totalLessons} lessons completed
          </p>

          <div className="w-full bg-slate-200 rounded-full h-5 mb-4">
            <div
              className="bg-blue-600 h-5 rounded-full"
              style={{
                width: `${lessonProgress}%`
              }}
            />
          </div>

          <p className="text-4xl font-bold text-blue-700">
            {lessonProgress}%
          </p>

        </div>

        <div className="bg-white rounded-3xl shadow p-8">

          <h2 className="text-3xl font-bold mb-6">
            Quiz Performance
          </h2>

          <div className="space-y-4">

            <p className="text-xl">
              <strong>Attempts:</strong> {quizAttempts}
            </p>

            <p className="text-xl">
              <strong>Average Score:</strong> {quizAverage}%
            </p>

            <p className="text-xl">
              <strong>Learning Level:</strong> {learningPath?.learning_level || "Unknown"}
            </p>

          </div>

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          AI Profile Summary
        </h2>

        <p className="text-lg text-slate-700 leading-relaxed">
          {risk?.risk_level === "Low"
            ? "Your learning profile shows strong engagement, good quiz performance and positive progress. Keep working through advanced tasks to maintain your performance."
            : risk?.risk_level === "Medium"
            ? "Your learning profile is improving, but more lesson completion and coding practice will help strengthen your performance."
            : "Your learning profile shows that more activity is needed. Focus on completing lessons, attempting quizzes and practising coding tasks."
          }
        </p>

      </div>

    </div>
  );
}

function ProfileCard({ icon, title, value, color }) {
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

export default ProfilePage;

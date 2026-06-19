import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaComments,
  FaCheckCircle
} from "react-icons/fa";


function StudentFeedbackPage() {
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    fetchFeedback();
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

  const fetchFeedback = async () => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/student/me`,
      {
        headers: authHeaders
      }
    );

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    if (response.ok) {
      setFeedback(data);
    } else {
      setMessage("Could not load feedback.");
    }
  };

  const markAsRead = async (id) => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/${id}/read`,
      {
        method: "PUT",
        headers: authHeaders
      }
    );

    if (handleUnauthorized(response)) return;

    fetchFeedback();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Teacher Feedback
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            View feedback and support messages from your teacher.
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

      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl shadow p-8 mb-8">

        <div className="flex items-center gap-5">
          <FaComments className="text-6xl" />

          <div>
            <h2 className="text-3xl font-bold">
              Feedback Centre
            </h2>

            <p className="text-blue-100 mt-2 text-xl">
              Your teacher feedback appears here.
            </p>
          </div>
        </div>

      </div>

      <div className="space-y-5">

        {feedback.length > 0 ? (
          feedback.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl shadow p-6 ${
                item.is_read
                  ? "bg-white"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >

              <h2 className="text-2xl font-bold text-slate-900">
                {item.subject}
              </h2>

              <p className="text-slate-500 mt-1">
                From: {item.teacher_name}
              </p>

              <p className="text-slate-700 mt-4">
                {item.message}
              </p>

              <p className="text-slate-400 text-sm mt-3">
                {new Date(item.created_at).toLocaleString()}
              </p>

              {!item.is_read && (
                <button
                  onClick={() => markAsRead(item.id)}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                >
                  <FaCheckCircle />
                  Mark Read
                </button>
              )}

            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl shadow p-8 text-center text-slate-500">
            No feedback messages yet.
          </div>
        )}

      </div>

    </div>
  );
}

export default StudentFeedbackPage;
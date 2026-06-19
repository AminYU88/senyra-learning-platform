import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCertificate,
  FaUsers,
  FaTrophy
} from "react-icons/fa";


function AdminCertificatesPage() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
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

    fetchCertificates();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/certificates/admin`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not load certificate data.");
        return;
      }

      setCertificates(data);

    } catch (error) {
      console.log(error);
      setMessage("Server error while loading certificates.");
    }
  };

  const eligibleCount = certificates.filter(
    item => item.eligible
  ).length;

  const lockedCount = certificates.length - eligibleCount;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Admin Certificates
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Monitor student certificate eligibility.
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
          icon={<FaUsers />}
          title="Total Students"
          value={certificates.length}
          color="bg-blue-100 text-blue-600"
        />

        <AdminCard
          icon={<FaCertificate />}
          title="Certificates Unlocked"
          value={eligibleCount}
          color="bg-green-100 text-green-600"
        />

        <AdminCard
          icon={<FaTrophy />}
          title="Certificates Locked"
          value={lockedCount}
          color="bg-yellow-100 text-yellow-700"
        />

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          Student Certificate Status
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Student</th>
                <th>Email</th>
                <th>Lesson Progress</th>
                <th>Quiz Score</th>
                <th>Lessons</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {certificates.length > 0 ? (
                certificates.map((item) => (
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
                      {item.lesson_progress}%
                    </td>

                    <td>
                      {item.average_quiz_score}%
                    </td>

                    <td>
                      {item.completed_lessons}/{item.total_lessons}
                    </td>

                    <td>
                      <span
                        className={`px-4 py-2 rounded-full text-white font-semibold ${
                          item.eligible
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {item.eligible
                          ? "Certificate Unlocked"
                          : "Locked"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 text-center text-slate-500"
                  >
                    No certificate data found.
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

      <p className="text-5xl font-bold mt-3">
        {value}
      </p>

    </div>
  );
}

export default AdminCertificatesPage;
import API_BASE_URL from "../api/config";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  FaArrowLeft,
  FaCertificate,
  FaTrophy,
  FaBookOpen,
  FaChartLine,
  FaDownload
} from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";


function CertificatePage() {
  const navigate = useNavigate();
  const certificateRef = useRef(null);

  const [certificate, setCertificate] = useState(null);
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

    fetchCertificateEligibility();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchCertificateEligibility = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/certificates/eligibility`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not load certificate eligibility.");
        return;
      }

      setCertificate(data);

    } catch (error) {
      console.log(error);
      setMessage("Server error while loading certificate.");
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) {
      return;
    }

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true
    });

    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(
      imageData,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight
    );

    pdf.save(
      `${certificate.student}-Senyra-Certificate.pdf`
    );
  };

  if (!certificate) {
    return (
      <LoadingSpinner text="Loading Certificate..." />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Certificate Centre
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Check your course completion certificate eligibility.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <MetricCard
          icon={<FaBookOpen />}
          title="Lesson Progress"
          value={`${certificate.lesson_progress}%`}
          color="bg-blue-100 text-blue-600"
        />

        <MetricCard
          icon={<FaChartLine />}
          title="Average Quiz Score"
          value={`${certificate.average_quiz_score}%`}
          color="bg-green-100 text-green-600"
        />

        <MetricCard
          icon={<FaTrophy />}
          title="Lessons Completed"
          value={`${certificate.completed_lessons}/${certificate.total_lessons}`}
          color="bg-yellow-100 text-yellow-700"
        />

      </div>

      <div
        className={`rounded-3xl shadow p-10 text-center ${
          certificate.eligible
            ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white"
            : "bg-white text-slate-900"
        }`}
      >

        <div className="flex justify-center mb-6">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl ${
              certificate.eligible
                ? "bg-white text-green-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <FaCertificate />
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-4">
          {certificate.eligible
            ? "Certificate Unlocked"
            : "Certificate Locked"}
        </h2>

        <p className="text-xl mb-8">
          {certificate.message}
        </p>

        {certificate.eligible && (
          <>

            <div
              ref={certificateRef}
              className="bg-white text-slate-900 rounded-3xl p-12 max-w-5xl mx-auto border-8 border-yellow-400"
            >

              <h3 className="text-5xl font-extrabold mb-4 text-blue-700">
                Certificate of Completion
              </h3>

              <p className="text-slate-500 mb-6 text-xl">
                This certificate is proudly presented to
              </p>

              <h2 className="text-6xl font-extrabold text-slate-900 mb-8">
                {certificate.student}
              </h2>

              <p className="text-2xl mb-8">
                for successfully completing the Senyra Learning Programme.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg mt-8">
                <p>
                  <strong>Lesson Progress:</strong> {certificate.lesson_progress}%
                </p>

                <p>
                  <strong>Average Quiz Score:</strong> {certificate.average_quiz_score}%
                </p>
              </div>

              <div className="mt-12 border-t pt-6">
                <p className="text-slate-500">
                  Senyra AI Learning Platform
                </p>

                <p className="text-slate-400 text-sm mt-2">
                  AI-powered learning analytics, assessment and progress tracking
                </p>
              </div>

            </div>

            <button
              onClick={downloadCertificate}
              className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
            >
              <FaDownload />
              Download PDF Certificate
            </button>

          </>
        )}

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

      <p className="text-5xl font-bold mt-3">
        {value}
      </p>

    </div>
  );
}

export default CertificatePage;

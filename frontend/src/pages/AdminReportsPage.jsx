import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaDownload,
  FaFileCsv,
  FaChartLine,
  FaCertificate,
  FaMedal
} from "react-icons/fa";

import { apiRequest } from "../api/client";


function AdminReportsPage() {
  const navigate = useNavigate();

  const downloadReport = async (endpoint, filename) => {
    try {
      const response = await apiRequest(
        `/admin/reports/${endpoint}`
      );

      if (!response) return;

      if (!response.ok) {
        alert("Could not download report.");
        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.log(error);
      alert("Server error while downloading report.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Admin Reports
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Export analytics, certificate and achievement reports.
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

      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl shadow p-8 mb-8">

        <div className="flex items-center gap-5">
          <FaChartLine className="text-6xl" />

          <div>
            <h2 className="text-3xl font-bold">
              Senyra Analytics Export Centre
            </h2>

            <p className="text-blue-100 mt-2 text-xl">
              Download CSV reports for testing evidence, evaluation and final project documentation.
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <ReportCard
          icon={<FaFileCsv />}
          title="Student Analytics CSV"
          description="Exports XP, events, quiz attempts, quiz average, progress and certificate eligibility."
          buttonText="Download Analytics"
          color="bg-green-100 text-green-600"
          buttonColor="bg-green-600 hover:bg-green-700"
          onClick={() =>
            downloadReport(
              "student-analytics",
              "senyra_student_analytics_report.csv"
            )
          }
        />

        <ReportCard
          icon={<FaCertificate />}
          title="Certificate CSV"
          description="Exports student certificate status, lesson progress and quiz score."
          buttonText="Download Certificates"
          color="bg-yellow-100 text-yellow-700"
          buttonColor="bg-yellow-500 hover:bg-yellow-600"
          onClick={() =>
            downloadReport(
              "certificates",
              "senyra_certificate_report.csv"
            )
          }
        />

        <ReportCard
          icon={<FaMedal />}
          title="Achievements CSV"
          description="Exports XP, quiz score, progress and unlocked achievement count."
          buttonText="Download Achievements"
          color="bg-amber-100 text-amber-700"
          buttonColor="bg-amber-600 hover:bg-amber-700"
          onClick={() =>
            downloadReport(
              "achievements",
              "senyra_achievement_report.csv"
            )
          }
        />

      </div>

    </div>
  );
}


function ReportCard({
  icon,
  title,
  description,
  buttonText,
  color,
  buttonColor,
  onClick
}) {
  return (
    <div className="bg-white rounded-3xl shadow p-8">

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 ${color}`}>
        {icon}
      </div>

      <h2 className="text-3xl font-bold mb-4">
        {title}
      </h2>

      <p className="text-slate-600 mb-6">
        {description}
      </p>

      <button
        onClick={onClick}
        className={`${buttonColor} text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3`}
      >
        <FaDownload />
        {buttonText}
      </button>

    </div>
  );
}

export default AdminReportsPage;

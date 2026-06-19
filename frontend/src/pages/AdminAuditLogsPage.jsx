import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaClipboardList,
  FaShieldAlt
} from "react-icons/fa";


function AdminAuditLogsPage() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/audit-logs/`,
        {
          headers: authHeaders
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not load audit logs.");
        return;
      }

      setLogs(data);

    } catch (error) {
      console.log(error);
      setMessage("Server error while loading audit logs.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Admin Audit Logs
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Track important system actions for security and accountability.
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

      <div className="bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-3xl shadow p-8 mb-8">

        <div className="flex items-center gap-5">
          <FaShieldAlt className="text-6xl" />

          <div>
            <h2 className="text-3xl font-bold">
              Security Activity Monitor
            </h2>

            <p className="text-slate-300 mt-2 text-xl">
              Shows admin exports, sensitive actions and important system events.
            </p>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <div className="flex items-center gap-3 mb-6">
          <FaClipboardList className="text-blue-600 text-3xl" />

          <h2 className="text-3xl font-bold">
            Recent Audit Events
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Time</th>
                <th>User ID</th>
                <th>Role</th>
                <th>Action</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="py-5">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td>
                      {log.user_id || "System"}
                    </td>

                    <td>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                        {log.user_role || "system"}
                      </span>
                    </td>

                    <td className="font-semibold">
                      {log.action}
                    </td>

                    <td>
                      {log.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-slate-500"
                  >
                    No audit logs found yet.
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

export default AdminAuditLogsPage;
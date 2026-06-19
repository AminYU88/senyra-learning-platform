import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUsers,
  FaUserShield
} from "react-icons/fa";


function AdminUsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/`,
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
        setMessage("Could not load users.");
        return;
      }

      setUsers(data);

    } catch (error) {
      console.log(error);
      setMessage("Backend connection error.");
    }
  };

  const updateRole = async (userId, role) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            role: role
          })
        }
      );

      if (!response.ok) {
        setMessage("Could not update role.");
        return;
      }

      setMessage("User role updated successfully.");

      fetchUsers();

    } catch (error) {
      console.log(error);
      setMessage("Server error while updating role.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Admin User Management
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Manage student, teacher and admin roles.
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
        <div className="bg-blue-100 text-blue-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-3xl shadow p-8 mb-8">

        <div className="flex items-center gap-5">
          <FaUserShield className="text-6xl" />

          <div>
            <h2 className="text-3xl font-bold">
              Role-Based Access Control
            </h2>

            <p className="text-slate-300 mt-2 text-xl">
              Admin controls user privileges using least-privilege security.
            </p>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <div className="flex items-center gap-3 mb-6">
          <FaUsers className="text-blue-600 text-3xl" />

          <h2 className="text-3xl font-bold">
            Users
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="py-5 font-semibold">
                      {user.full_name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <select
                        value={user.role}
                        onChange={(event) =>
                          updateRole(
                            user.id,
                            event.target.value
                          )
                        }
                        className="input"
                      >
                        <option value="student">
                          student
                        </option>

                        <option value="teacher">
                          teacher
                        </option>

                        <option value="admin">
                          admin
                        </option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-slate-500"
                  >
                    No users found.
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

export default AdminUsersPage;
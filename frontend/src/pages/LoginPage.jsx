import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
} from "react-icons/fa";

import {
  backendConnectionMessage,
  getDashboardPath,
  getStoredUser,
  getToken,
  loginRequest,
} from "../api/client";

import { checkBackendHealth } from "../api/healthApi";


function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [healthMessage, setHealthMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (token && user) {
      navigate(getDashboardPath(user.role), {
        replace: true,
      });
    }
  }, [navigate]);

  useEffect(() => {
    const checkHealth = async () => {
      const result = await checkBackendHealth();

      if (!result.ok) {
        setHealthMessage(result.message);
      }
    };

    checkHealth();
  }, []);

  const login = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginRequest(
        form.email,
        form.password,
      );

      navigate(getDashboardPath(data.user.role), {
        replace: true,
      });
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      setError(backendConnectionMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <form
        onSubmit={login}
        className="bg-white rounded-3xl shadow p-8 w-full max-w-md"
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Login
        </h1>

        <p className="text-slate-500 mb-8">
          Access your Senyra learning account.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
            {error}
          </div>
        )}

        {!error && healthMessage && (
          <div className="bg-amber-100 text-amber-800 p-4 rounded-xl mb-6 font-semibold">
            {healthMessage}
          </div>
        )}

        <label className="block font-semibold mb-2">
          Email
        </label>

        <div className="relative mb-5">
          <FaEnvelope className="absolute left-4 top-4 text-slate-400" />

          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value,
              })
            }
            className="input pl-12"
            placeholder="Enter your email"
            required
          />
        </div>

        <label className="block font-semibold mb-2">
          Password
        </label>

        <div className="relative mb-6">
          <FaLock className="absolute left-4 top-4 text-slate-400" />

          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
            className="input pl-12"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-60"
        >
          <FaSignInAlt />
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-6 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
          <p className="font-bold mb-2">Demo accounts</p>
          <p>Admin: admin@senyra.com / Admin123!</p>
          <p>Teacher: teacher@senyra.com / Teacher123!</p>
          <p>Student: student@senyra.com / Student123!</p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
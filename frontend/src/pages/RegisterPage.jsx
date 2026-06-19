import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserPlus
} from "react-icons/fa";

import API_BASE_URL from "../api/config";


function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed.");
        setLoading(false);
        return;
      }

      navigate("/login", {
        replace: true
      });

    } catch (error) {
      console.log("REGISTER ERROR:", error);
      setError("Could not connect to backend.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <form
        onSubmit={register}
        className="bg-white rounded-3xl shadow p-8 w-full max-w-md"
      >

        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Register
        </h1>

        <p className="text-slate-500 mb-8">
          Create your Senyra student account.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
            {error}
          </div>
        )}

        <label className="block font-semibold mb-2">
          Full Name
        </label>

        <div className="relative mb-5">
          <FaUser className="absolute left-4 top-4 text-slate-400" />

          <input
            value={form.full_name}
            onChange={(event) =>
              setForm({
                ...form,
                full_name: event.target.value
              })
            }
            className="input pl-12"
            placeholder="Enter your full name"
            required
          />
        </div>

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
                email: event.target.value
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
            minLength={6}
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value
              })
            }
            className="input pl-12"
            placeholder="Create a password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-60"
        >
          <FaUserPlus />
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-slate-500 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-700 font-bold hover:underline"
          >
            Login
          </button>
        </p>

      </form>

    </div>
  );
}

export default RegisterPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUserCog,
  FaSave,
  FaLock
} from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";
import { apiJson } from "../api/client";


function AccountSettingsPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    role: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: ""
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiJson("/account/me");

      if (!result) return;

      const { response, data } = result;

      if (!response.ok) {
        setError("Could not load account.");
        setLoading(false);
        return;
      }

      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        role: data.role || ""
      });

    } catch (error) {
      console.log(error);
      setError("Backend connection error.");
    }

    setLoading(false);
  };

  const updateProfile = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setSavingProfile(true);

    try {
      const result = await apiJson(
        "/account/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            full_name: profile.full_name,
            email: profile.email
          })
        }
      );

      if (!result) return;

      const { response, data } = result;

      if (!response.ok) {
        setError(data.detail || "Could not update profile.");
        setSavingProfile(false);
        return;
      }

      setMessage("Profile updated successfully.");

    } catch (error) {
      console.log(error);
      setError("Server error while updating profile.");
    }

    setSavingProfile(false);
  };

  const changePassword = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setChangingPassword(true);

    try {
      const result = await apiJson(
        "/account/password",
        {
          method: "PUT",
          body: JSON.stringify(passwordForm)
        }
      );

      if (!result) return;

      const { response, data } = result;

      if (!response.ok) {
        setError(data.detail || "Could not change password.");
        setChangingPassword(false);
        return;
      }

      setPasswordForm({
        current_password: "",
        new_password: ""
      });

      setMessage("Password changed successfully.");

    } catch (error) {
      console.log(error);
      setError("Server error while changing password.");
    }

    setChangingPassword(false);
  };

  const goBack = () => {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <LoadingSpinner text="Loading Account Settings..." />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Account Settings
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Manage your profile information and password securely.
          </p>
        </div>

        <button
          onClick={goBack}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <FaArrowLeft />
          Back
        </button>

      </div>

      {message && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-3xl shadow p-8 mb-8">

        <div className="flex items-center gap-5">
          <FaUserCog className="text-6xl" />

          <div>
            <h2 className="text-3xl font-bold">
              {profile.full_name || "User Account"}
            </h2>

            <p className="text-slate-300 mt-2 text-xl">
              Role: {profile.role}
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <form
          onSubmit={updateProfile}
          className="bg-white rounded-3xl shadow p-8"
        >

          <h2 className="text-3xl font-bold mb-6">
            Profile Details
          </h2>

          <label className="block font-semibold mb-2">
            Full Name
          </label>

          <input
            type="text"
            value={profile.full_name}
            onChange={(event) =>
              setProfile({
                ...profile,
                full_name: event.target.value
              })
            }
            className="input mb-5"
            required
          />

          <label className="block font-semibold mb-2">
            Email
          </label>

          <input
            type="email"
            value={profile.email}
            onChange={(event) =>
              setProfile({
                ...profile,
                email: event.target.value
              })
            }
            className="input mb-6"
            required
          />

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60"
          >
            <FaSave />
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>

        </form>

        <form
          onSubmit={changePassword}
          className="bg-white rounded-3xl shadow p-8"
        >

          <h2 className="text-3xl font-bold mb-6">
            Change Password
          </h2>

          <label className="block font-semibold mb-2">
            Current Password
          </label>

          <input
            type="password"
            value={passwordForm.current_password}
            onChange={(event) =>
              setPasswordForm({
                ...passwordForm,
                current_password: event.target.value
              })
            }
            className="input mb-5"
            required
          />

          <label className="block font-semibold mb-2">
            New Password
          </label>

          <input
            type="password"
            value={passwordForm.new_password}
            onChange={(event) =>
              setPasswordForm({
                ...passwordForm,
                new_password: event.target.value
              })
            }
            className="input mb-6"
            required
          />

          <button
            type="submit"
            disabled={changingPassword}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60"
          >
            <FaLock />
            {changingPassword ? "Changing..." : "Change Password"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AccountSettingsPage;

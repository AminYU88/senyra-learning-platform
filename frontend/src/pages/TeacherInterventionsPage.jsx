/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaClipboardCheck,
  FaSave,
  FaCheckCircle
} from "react-icons/fa";

import { apiRequest } from "../api/client";


function TeacherInterventionsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);

  const [form, setForm] = useState({
    student_id: "",
    title: "",
    target_area: "",
    action_plan: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchPlans();
  }, []);

  const fetchStudents = async () => {
    const response = await apiRequest("/teacher/student-progress");
    if (!response) return;

    const data = await response.json();

    if (response.ok) {
      setStudents(data);
    }
  };

  const fetchPlans = async () => {
    const response = await apiRequest("/teacher/interventions/");
    if (!response) return;

    const data = await response.json();

    if (response.ok) {
      setPlans(data);
    }
  };

  const createPlan = async (event) => {
    event.preventDefault();

    const response = await apiRequest(
      "/teacher/interventions/",
      {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(form.student_id),
          title: form.title,
          target_area: form.target_area,
          action_plan: form.action_plan
        })
      }
    );

    if (!response) return;

    if (!response.ok) {
      setMessage("Could not create intervention plan.");
      return;
    }

    setMessage("Intervention plan created successfully.");

    setForm({
      student_id: "",
      title: "",
      target_area: "",
      action_plan: ""
    });

    fetchPlans();
  };

  const completePlan = async (planId) => {
    const response = await apiRequest(
      `/teacher/interventions/${planId}/complete`,
      {
        method: "PUT"
      }
    );

    if (!response) return;

    if (response.ok) {
      setMessage("Plan marked as completed.");
      fetchPlans();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Intervention Plans
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Create structured support plans for students who need extra help.
          </p>
        </div>

        <button
          onClick={() => navigate("/teacher")}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <FaArrowLeft />
          Teacher Dashboard
        </button>

      </div>

      {message && (
        <div className="bg-blue-100 text-blue-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <form
          onSubmit={createPlan}
          className="bg-white rounded-3xl shadow p-8"
        >

          <h2 className="text-3xl font-bold mb-6">
            Create Intervention Plan
          </h2>

          <label className="block font-semibold mb-2">
            Student
          </label>

          <select
            value={form.student_id}
            onChange={(event) =>
              setForm({
                ...form,
                student_id: event.target.value
              })
            }
            className="input mb-5"
            required
          >
            <option value="">Select student</option>

            {students.map((student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.student} - {student.email}
              </option>
            ))}
          </select>

          <label className="block font-semibold mb-2">
            Plan Title
          </label>

          <input
            value={form.title}
            onChange={(event) =>
              setForm({
                ...form,
                title: event.target.value
              })
            }
            className="input mb-5"
            placeholder="Example: Improve Python quiz performance"
            required
          />

          <label className="block font-semibold mb-2">
            Target Area
          </label>

          <input
            value={form.target_area}
            onChange={(event) =>
              setForm({
                ...form,
                target_area: event.target.value
              })
            }
            className="input mb-5"
            placeholder="Example: Quiz score, lesson progress, engagement"
            required
          />

          <label className="block font-semibold mb-2">
            Action Plan
          </label>

          <textarea
            value={form.action_plan}
            onChange={(event) =>
              setForm({
                ...form,
                action_plan: event.target.value
              })
            }
            className="input mb-6 min-h-32"
            placeholder="Example: Complete beginner lessons, retake quiz, attend support session."
            required
          />

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <FaSave />
            Save Plan
          </button>

        </form>

        <div className="bg-white rounded-3xl shadow p-8">

          <div className="flex items-center gap-3 mb-6">
            <FaClipboardCheck className="text-purple-600 text-3xl" />

            <h2 className="text-3xl font-bold">
              Existing Plans
            </h2>
          </div>

          <div className="space-y-5 max-h-[650px] overflow-y-auto">

            {plans.length > 0 ? (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-slate-100 rounded-2xl p-5"
                >

                  <div className="flex justify-between items-start gap-4">

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {plan.title}
                      </h3>

                      <p className="text-slate-500 text-sm">
                        {plan.student_name} — {plan.student_email}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-full font-bold ${
                        plan.is_completed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {plan.status}
                    </span>

                  </div>

                  <p className="mt-4">
                    <strong>Target:</strong> {plan.target_area}
                  </p>

                  <p className="mt-3">
                    <strong>Plan:</strong> {plan.action_plan}
                  </p>

                  <p className="text-slate-400 text-sm mt-3">
                    Created by {plan.teacher_name} on {new Date(plan.created_at).toLocaleString()}
                  </p>

                  {!plan.is_completed && (
                    <button
                      onClick={() => completePlan(plan.id)}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                    >
                      <FaCheckCircle />
                      Mark Completed
                    </button>
                  )}

                </div>
              ))
            ) : (
              <p className="text-slate-500">
                No intervention plans found.
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default TeacherInterventionsPage;

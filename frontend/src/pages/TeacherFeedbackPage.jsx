/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaPaperPlane,
  FaComments
} from "react-icons/fa";

import { apiRequest } from "../api/client";


function TeacherFeedbackPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const [form, setForm] = useState({
    student_id: "",
    subject: "",
    message: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchFeedback();
  }, []);

  const fetchStudents = async () => {
    const response = await apiRequest("/teacher/student-progress");
    if (!response) return;

    const data = await response.json();

    if (response.ok) {
      setStudents(data);
    }
  };

  const fetchFeedback = async () => {
    const response = await apiRequest("/feedback/teacher/all");
    if (!response) return;

    const data = await response.json();

    if (response.ok) {
      setFeedback(data);
    }
  };

  const sendFeedback = async (event) => {
    event.preventDefault();

    const response = await apiRequest(
      "/feedback/",
      {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(form.student_id),
          subject: form.subject,
          message: form.message
        })
      }
    );

    if (!response) return;

    if (!response.ok) {
      setMessage("Could not send feedback.");
      return;
    }

    setMessage("Feedback sent successfully.");

    setForm({
      student_id: "",
      subject: "",
      message: ""
    });

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
            Send personalised feedback messages to students.
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
          onSubmit={sendFeedback}
          className="bg-white rounded-3xl shadow p-8"
        >

          <h2 className="text-3xl font-bold mb-6">
            Send Feedback
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
            <option value="">
              Select student
            </option>

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
            Subject
          </label>

          <input
            value={form.subject}
            onChange={(event) =>
              setForm({
                ...form,
                subject: event.target.value
              })
            }
            className="input mb-5"
            placeholder="Example: Quiz improvement advice"
            required
          />

          <label className="block font-semibold mb-2">
            Message
          </label>

          <textarea
            value={form.message}
            onChange={(event) =>
              setForm({
                ...form,
                message: event.target.value
              })
            }
            className="input mb-6 min-h-40"
            placeholder="Write feedback for the student..."
            required
          />

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <FaPaperPlane />
            Send Feedback
          </button>

        </form>

        <div className="bg-white rounded-3xl shadow p-8">

          <div className="flex items-center gap-3 mb-6">
            <FaComments className="text-purple-600 text-3xl" />

            <h2 className="text-3xl font-bold">
              Sent Feedback
            </h2>
          </div>

          <div className="space-y-5 max-h-[650px] overflow-y-auto">

            {feedback.length > 0 ? (
              feedback.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-100 rounded-2xl p-5"
                >

                  <h3 className="text-xl font-bold text-slate-900">
                    {item.subject}
                  </h3>

                  <p className="text-slate-500 text-sm">
                    To: {item.student_name} — {item.student_email}
                  </p>

                  <p className="text-slate-700 mt-4">
                    {item.message}
                  </p>

                  <p className="text-slate-400 text-sm mt-3">
                    Sent by {item.teacher_name} on {new Date(item.created_at).toLocaleString()}
                  </p>

                  <span
                    className={`inline-block mt-3 px-3 py-1 rounded-full font-bold ${
                      item.is_read
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.is_read ? "Read" : "Unread"}
                  </span>

                </div>
              ))
            ) : (
              <p className="text-slate-500">
                No feedback sent yet.
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default TeacherFeedbackPage;

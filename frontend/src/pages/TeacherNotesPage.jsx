/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaClipboardList,
  FaSave
} from "react-icons/fa";

import { apiRequest } from "../api/client";


function TeacherNotesPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState([]);

  const [form, setForm] = useState({
    student_id: "",
    note: "",
    action_taken: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchNotes();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiRequest("/teacher/student-progress");
      if (!response) return;

      const data = await response.json();

      if (response.ok) {
        setStudents(data);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await apiRequest("/teacher/notes/");
      if (!response) return;

      const data = await response.json();

      if (response.ok) {
        setNotes(data);
      }

    } catch (error) {
      console.log(error);
      setMessage("Could not load notes.");
    }
  };

  const createNote = async (event) => {
    event.preventDefault();

    if (!form.student_id) {
      setMessage("Please select a student.");
      return;
    }

    try {
      const response = await apiRequest(
        "/teacher/notes/",
        {
          method: "POST",
          body: JSON.stringify({
            student_id: Number(form.student_id),
            note: form.note,
            action_taken: form.action_taken
          })
        }
      );

      if (!response) return;

      if (!response.ok) {
        setMessage("Could not save note.");
        return;
      }

      setMessage("Support note saved successfully.");

      setForm({
        student_id: "",
        note: "",
        action_taken: ""
      });

      fetchNotes();

    } catch (error) {
      console.log(error);
      setMessage("Server error while saving note.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Teacher Support Notes
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Record student support actions, interventions and classroom progress notes.
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
          onSubmit={createNote}
          className="bg-white rounded-3xl shadow p-8"
        >

          <h2 className="text-3xl font-bold mb-6">
            Create Support Note
          </h2>

          <label className="block font-semibold mb-2">
            Select Student
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
            Teacher Note
          </label>

          <textarea
            value={form.note}
            onChange={(event) =>
              setForm({
                ...form,
                note: event.target.value
              })
            }
            className="input mb-5 min-h-32"
            placeholder="Example: Student is struggling with quiz concepts and needs additional practice."
            required
          />

          <label className="block font-semibold mb-2">
            Action Taken
          </label>

          <textarea
            value={form.action_taken}
            onChange={(event) =>
              setForm({
                ...form,
                action_taken: event.target.value
              })
            }
            className="input mb-6 min-h-24"
            placeholder="Example: Assigned extra practice and recommended beginner lesson review."
          />

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <FaSave />
            Save Note
          </button>

        </form>

        <div className="bg-white rounded-3xl shadow p-8">

          <div className="flex items-center gap-3 mb-6">
            <FaClipboardList className="text-purple-600 text-3xl" />

            <h2 className="text-3xl font-bold">
              Recent Notes
            </h2>
          </div>

          <div className="space-y-5 max-h-[650px] overflow-y-auto">

            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-100 rounded-2xl p-5"
                >

                  <h3 className="text-xl font-bold text-slate-900">
                    {note.student_name}
                  </h3>

                  <p className="text-slate-500 text-sm">
                    {note.student_email}
                  </p>

                  <p className="mt-4 text-slate-700">
                    <strong>Note:</strong> {note.note}
                  </p>

                  <p className="mt-3 text-slate-700">
                    <strong>Action:</strong> {note.action_taken || "No action recorded"}
                  </p>

                  <p className="text-slate-400 text-sm mt-3">
                    Added by {note.teacher_name} on {new Date(note.created_at).toLocaleString()}
                  </p>

                </div>
              ))
            ) : (
              <p className="text-slate-500">
                No support notes found yet.
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default TeacherNotesPage;

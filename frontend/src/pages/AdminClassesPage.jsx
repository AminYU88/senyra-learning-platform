import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUsers,
  FaPlus,
  FaUserPlus
} from "react-icons/fa";


function AdminClassesPage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);

  const [classForm, setClassForm] = useState({
    name: "",
    teacher_id: ""
  });

  const [enrolForm, setEnrolForm] = useState({
    class_id: "",
    student_id: ""
  });

  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    fetchClasses();
    fetchUsers();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchClasses = async () => {
    const response = await fetch(
      `${API_BASE_URL}/admin/classes/`,
      {
        headers: authHeaders
      }
    );

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    if (response.ok) {
      setClasses(data);
    }
  };

  const fetchUsers = async () => {
    const response = await fetch(
      `${API_BASE_URL}/admin/classes/users`,
      {
        headers: authHeaders
      }
    );

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    if (response.ok) {
      setUsers(data);
    }
  };

  const createClass = async (event) => {
    event.preventDefault();

    const response = await fetch(
      `${API_BASE_URL}/admin/classes/`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: classForm.name,
          teacher_id: Number(classForm.teacher_id)
        })
      }
    );

    if (handleUnauthorized(response)) return;

    if (!response.ok) {
      setMessage("Could not create class.");
      return;
    }

    setMessage("Class created successfully.");

    setClassForm({
      name: "",
      teacher_id: ""
    });

    fetchClasses();
  };

  const enrolStudent = async (event) => {
    event.preventDefault();

    const response = await fetch(
      `${API_BASE_URL}/admin/classes/enrol`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          class_id: Number(enrolForm.class_id),
          student_id: Number(enrolForm.student_id)
        })
      }
    );

    if (handleUnauthorized(response)) return;

    if (!response.ok) {
      setMessage("Could not enrol student.");
      return;
    }

    setMessage("Student enrolled successfully.");

    setEnrolForm({
      class_id: "",
      student_id: ""
    });

    fetchClasses();
  };

  const teachers = users.filter(user => user.role === "teacher");
  const students = users.filter(user => user.role === "student");

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Class Management
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Assign teachers to classes and enrol students.
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">

        <form
          onSubmit={createClass}
          className="bg-white rounded-3xl shadow p-8"
        >
          <h2 className="text-3xl font-bold mb-6">
            Create Class
          </h2>

          <label className="block font-semibold mb-2">
            Class Name
          </label>

          <input
            value={classForm.name}
            onChange={(event) =>
              setClassForm({
                ...classForm,
                name: event.target.value
              })
            }
            className="input mb-5"
            placeholder="Example: Python Year 1"
            required
          />

          <label className="block font-semibold mb-2">
            Teacher
          </label>

          <select
            value={classForm.teacher_id}
            onChange={(event) =>
              setClassForm({
                ...classForm,
                teacher_id: event.target.value
              })
            }
            className="input mb-6"
            required
          >
            <option value="">
              Select teacher
            </option>

            {teachers.map((teacher) => (
              <option
                key={teacher.id}
                value={teacher.id}
              >
                {teacher.full_name} - {teacher.email}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <FaPlus />
            Create Class
          </button>
        </form>

        <form
          onSubmit={enrolStudent}
          className="bg-white rounded-3xl shadow p-8"
        >
          <h2 className="text-3xl font-bold mb-6">
            Enrol Student
          </h2>

          <label className="block font-semibold mb-2">
            Class
          </label>

          <select
            value={enrolForm.class_id}
            onChange={(event) =>
              setEnrolForm({
                ...enrolForm,
                class_id: event.target.value
              })
            }
            className="input mb-5"
            required
          >
            <option value="">
              Select class
            </option>

            {classes.map((classGroup) => (
              <option
                key={classGroup.id}
                value={classGroup.id}
              >
                {classGroup.name}
              </option>
            ))}
          </select>

          <label className="block font-semibold mb-2">
            Student
          </label>

          <select
            value={enrolForm.student_id}
            onChange={(event) =>
              setEnrolForm({
                ...enrolForm,
                student_id: event.target.value
              })
            }
            className="input mb-6"
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
                {student.full_name} - {student.email}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <FaUserPlus />
            Enrol Student
          </button>
        </form>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <div className="flex items-center gap-3 mb-6">
          <FaUsers className="text-blue-600 text-3xl" />

          <h2 className="text-3xl font-bold">
            Classes
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Class</th>
                <th>Teacher</th>
                <th>Students</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((classGroup) => (
                <tr
                  key={classGroup.id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="py-5 font-semibold">
                    {classGroup.name}
                  </td>

                  <td>
                    {classGroup.teacher_name}
                  </td>

                  <td>
                    {classGroup.student_count}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AdminClassesPage;
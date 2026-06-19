import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBookOpen,
  FaLaptopCode,
  FaLayerGroup,
  FaPlay,
  FaShieldAlt
} from "react-icons/fa";

import StudentShell from "../components/StudentShell";


const subjectPathways = [
  {
    title: "Mathematics",
    description: "KS3, GCSE, A-Level, Further Maths and adult preparation.",
    path: "/learn/mathematics",
    color: "bg-blue-50 text-blue-700",
    icon: <FaBookOpen />
  },
  {
    title: "English Language",
    description: "Reading, writing, grammar, vocabulary and exam technique.",
    path: "/learn/english-language",
    color: "bg-green-50 text-green-700",
    icon: <FaBookOpen />
  },
  {
    title: "English Literature",
    description: "Poetry, Shakespeare, modern texts, themes and essays.",
    path: "/learn/english-literature",
    color: "bg-purple-50 text-purple-700",
    icon: <FaBookOpen />
  },
  {
    title: "Computer Science",
    description: "Programming, databases, algorithms and problem solving.",
    path: "/courses",
    color: "bg-slate-100 text-slate-700",
    icon: <FaLaptopCode />
  },
  {
    title: "Cyber Security",
    description: "Networking, threats, encryption and secure systems.",
    path: "/courses",
    color: "bg-rose-50 text-rose-700",
    icon: <FaShieldAlt />
  }
];


function CoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({
    total_lessons: 0,
    completed_lessons: 0,
    progress_percentage: 0
  });

  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchCourses();
    fetchProgress();
  }, []);

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const fetchCourses = async () => {
    const response = await fetch(
      `${API_BASE_URL}/courses/`,
      {
        headers: authHeaders
      }
    );

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    setCourses(data);
  };

  const fetchProgress = async () => {
    const response = await fetch(
      `${API_BASE_URL}/progress/summary`,
      {
        headers: authHeaders
      }
    );

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    setProgress(data);
  };

  const startLesson = async (lesson) => {
    await fetch(
      `${API_BASE_URL}/events/`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          event_type: "video_watch",
          event_value: lesson.title
        })
      }
    );

    await completeLesson(lesson.id);
  };

  const completeLesson = async (lessonId) => {
    const response = await fetch(
      `${API_BASE_URL}/progress/lessons/${lessonId}/complete`,
      {
        method: "POST",
        headers: authHeaders
      }
    );

    if (handleUnauthorized(response)) return;

    setMessage("Lesson completed successfully.");

    await fetchProgress();

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <StudentShell
      title="Courses"
      subtitle="Choose a subject pathway or continue your active lessons."
    >
      {message && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {subjectPathways.map((subject) => (
          <button
            key={subject.title}
            onClick={() => navigate(subject.path)}
            className="bg-white hover:bg-slate-50 rounded-2xl shadow p-5 text-left transition"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${subject.color}`}>
              {subject.icon}
            </div>

            <h2 className="text-lg font-bold text-slate-950">
              {subject.title}
            </h2>

            <p className="text-slate-500 text-sm mt-2 leading-6">
              {subject.description}
            </p>
          </button>
        ))}
      </section>

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-3">
          Learning Progress
        </h2>

        <p className="text-slate-600 mb-3">
          {progress.completed_lessons} of {progress.total_lessons} lessons completed
        </p>

        <div className="w-full bg-slate-200 rounded-full h-5">
          <div
            className="bg-blue-600 h-5 rounded-full"
            style={{
              width: `${progress.progress_percentage}%`
            }}
          />
        </div>

        <p className="mt-3 font-bold text-blue-600">
          {progress.progress_percentage}% complete
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl shadow p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-5">
              <FaBookOpen />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              {course.title}
            </h2>

            <p className="text-slate-600 mb-4">
              {course.description}
            </p>

            <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-semibold mb-6">
              <FaLayerGroup />
              {course.level}
            </span>

            <h3 className="text-xl font-bold mb-4">
              Lessons
            </h3>

            {course.lessons?.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-slate-100 rounded-xl p-4 mb-4"
              >
                <h4 className="font-bold text-slate-900">
                  {lesson.title}
                </h4>

                <p className="text-slate-600 mt-1">
                  {lesson.content}
                </p>

                <button
                  onClick={() => startLesson(lesson)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                >
                  <FaPlay />
                  Start and Complete Lesson
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </StudentShell>
  );
}

export default CoursesPage;

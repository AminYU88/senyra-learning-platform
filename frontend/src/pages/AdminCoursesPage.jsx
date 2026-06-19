import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBookOpen,
  FaPlus,
  FaQuestionCircle
} from "react-icons/fa";


function AdminCoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [message, setMessage] = useState("");

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    level: "Beginner"
  });

  const [lessonForm, setLessonForm] = useState({
    course_id: "",
    title: "",
    content: "",
    video_url: ""
  });

  const [quizForm, setQuizForm] = useState({
    course_id: "",
    title: ""
  });

  const [questionForm, setQuestionForm] = useState({
    course_id: "",
    quiz_id: "",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A"
  });

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

  const fetchQuizzesByCourse = async (courseId) => {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/course/${courseId}`,
      {
        headers: authHeaders
      }
    );

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    setQuizzes(data);
  };

  const createCourse = async (event) => {
    event.preventDefault();

    const response = await fetch(
      `${API_BASE_URL}/courses/`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(courseForm)
      }
    );

    if (handleUnauthorized(response)) return;

    if (!response.ok) {
      setMessage("Could not create course.");
      return;
    }

    setMessage("Course created successfully ✅");

    setCourseForm({
      title: "",
      description: "",
      level: "Beginner"
    });

    fetchCourses();
  };

  const createLesson = async (event) => {
    event.preventDefault();

    const response = await fetch(
      `${API_BASE_URL}/courses/lessons`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ...lessonForm,
          course_id: Number(lessonForm.course_id)
        })
      }
    );

    if (handleUnauthorized(response)) return;

    if (!response.ok) {
      setMessage("Could not create lesson.");
      return;
    }

    setMessage("Lesson created successfully ✅");

    setLessonForm({
      course_id: "",
      title: "",
      content: "",
      video_url: ""
    });

    fetchCourses();
  };

  const createQuiz = async (event) => {
    event.preventDefault();

    const response = await fetch(
      `${API_BASE_URL}/quizzes/`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: quizForm.title,
          course_id: Number(quizForm.course_id)
        })
      }
    );

    if (handleUnauthorized(response)) return;

    if (!response.ok) {
      setMessage("Could not create quiz.");
      return;
    }

    const data = await response.json();

    setMessage(`Quiz created successfully ✅ Quiz ID: ${data.id}`);

    setQuizForm({
      course_id: "",
      title: ""
    });
  };

  const createQuestion = async (event) => {
    event.preventDefault();

    const response = await fetch(
      `${API_BASE_URL}/quizzes/questions`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          quiz_id: Number(questionForm.quiz_id),
          question_text: questionForm.question_text,
          option_a: questionForm.option_a,
          option_b: questionForm.option_b,
          option_c: questionForm.option_c,
          option_d: questionForm.option_d,
          correct_answer: questionForm.correct_answer
        })
      }
    );

    if (handleUnauthorized(response)) return;

    if (!response.ok) {
      setMessage("Could not create question.");
      return;
    }

    setMessage("Question created successfully ✅");

    setQuestionForm({
      course_id: questionForm.course_id,
      quiz_id: questionForm.quiz_id,
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A"
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Admin Course Management
          </h1>

          <p className="text-slate-500 mt-2">
            Create courses, lessons, quizzes and quiz questions.
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <FormCard title="Create Course" icon={<FaBookOpen />}>
          <form onSubmit={createCourse} className="space-y-4">

            <input
              className="input"
              placeholder="Course title"
              value={courseForm.title}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  title: e.target.value
                })
              }
              required
            />

            <textarea
              className="input"
              placeholder="Course description"
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  description: e.target.value
                })
              }
            />

            <select
              className="input"
              value={courseForm.level}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  level: e.target.value
                })
              }
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <SubmitButton text="Create Course" />

          </form>
        </FormCard>

        <FormCard title="Create Lesson" icon={<FaPlus />}>
          <form onSubmit={createLesson} className="space-y-4">

            <select
              className="input"
              value={lessonForm.course_id}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  course_id: e.target.value
                })
              }
              required
            >
              <option value="">Select course</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <input
              className="input"
              placeholder="Lesson title"
              value={lessonForm.title}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  title: e.target.value
                })
              }
              required
            />

            <textarea
              className="input"
              placeholder="Lesson content"
              value={lessonForm.content}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  content: e.target.value
                })
              }
            />

            <input
              className="input"
              placeholder="Video URL"
              value={lessonForm.video_url}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  video_url: e.target.value
                })
              }
            />

            <SubmitButton text="Create Lesson" />

          </form>
        </FormCard>

        <FormCard title="Create Quiz" icon={<FaQuestionCircle />}>
          <form onSubmit={createQuiz} className="space-y-4">

            <select
              className="input"
              value={quizForm.course_id}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  course_id: e.target.value
                })
              }
              required
            >
              <option value="">Select course</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <input
              className="input"
              placeholder="Quiz title"
              value={quizForm.title}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  title: e.target.value
                })
              }
              required
            />

            <SubmitButton text="Create Quiz" />

          </form>
        </FormCard>

        <FormCard title="Create Quiz Question" icon={<FaQuestionCircle />}>
          <form onSubmit={createQuestion} className="space-y-4">

            <select
              className="input"
              value={questionForm.course_id}
              onChange={(e) => {
                const courseId = e.target.value;

                setQuestionForm({
                  ...questionForm,
                  course_id: courseId,
                  quiz_id: ""
                });

                if (courseId) {
                  fetchQuizzesByCourse(courseId);
                }
              }}
              required
            >
              <option value="">Select course</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <select
              className="input"
              value={questionForm.quiz_id}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  quiz_id: e.target.value
                })
              }
              required
            >
              <option value="">Select quiz</option>

              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>

            <textarea
              className="input"
              placeholder="Question text"
              value={questionForm.question_text}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  question_text: e.target.value
                })
              }
              required
            />

            <input
              className="input"
              placeholder="Option A"
              value={questionForm.option_a}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  option_a: e.target.value
                })
              }
              required
            />

            <input
              className="input"
              placeholder="Option B"
              value={questionForm.option_b}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  option_b: e.target.value
                })
              }
              required
            />

            <input
              className="input"
              placeholder="Option C"
              value={questionForm.option_c}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  option_c: e.target.value
                })
              }
              required
            />

            <input
              className="input"
              placeholder="Option D"
              value={questionForm.option_d}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  option_d: e.target.value
                })
              }
              required
            />

            <select
              className="input"
              value={questionForm.correct_answer}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  correct_answer: e.target.value
                })
              }
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>

            <SubmitButton text="Create Question" />

          </form>
        </FormCard>

      </div>

    </div>
  );
}


function FormCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl shadow p-8">

      <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-5">
        {icon}
      </div>

      <h2 className="text-2xl font-bold mb-6">
        {title}
      </h2>

      {children}

    </div>
  );
}


function SubmitButton({ text }) {
  return (
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
    >
      <FaPlus />
      {text}
    </button>
  );
}

export default AdminCoursesPage;
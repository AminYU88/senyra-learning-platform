import API_BASE_URL from "../api/config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBrain,
  FaCheckCircle,
  FaQuestionCircle,
  FaTrophy
} from "react-icons/fa";

import StudentShell from "../components/StudentShell";


function QuizPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
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
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      setCourses(data);
    } catch (error) {
      console.log(error);
      setMessage("Could not load courses.");
    }
  };

  const fetchQuizzes = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedQuiz("");
    setQuestions([]);
    setAnswers({});
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/quizzes/course/${courseId}`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      setQuizzes(data);
    } catch (error) {
      console.log(error);
      setMessage("Could not load quizzes.");
    }
  };

  const fetchQuestions = async (quizId) => {
    setSelectedQuiz(quizId);
    setAnswers({});
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/quizzes/${quizId}/questions`,
        {
          headers: authHeaders
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      setQuestions(data);
    } catch (error) {
      console.log(error);
      setMessage("Could not load quiz questions.");
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const submitQuiz = async () => {
    if (questions.length === 0) {
      setMessage("No questions available for this quiz.");
      return;
    }

    const unanswered = questions.filter(
      question => !answers[question.id]
    );

    if (unanswered.length > 0) {
      setMessage("Please answer all questions before submitting.");
      return;
    }

    const formattedAnswers = questions.map(question => ({
      question_id: question.id,
      answer: answers[question.id]
    }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/quizzes/submit`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            quiz_id: Number(selectedQuiz),
            answers: formattedAnswers
          })
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not submit quiz.");
        return;
      }

      setResult(data);
      setMessage("Quiz submitted successfully.");
    } catch (error) {
      console.log(error);
      setMessage("Server error while submitting quiz.");
    }
  };

  return (
    <StudentShell
      title="Quizzes"
      subtitle="Generate revision quizzes or complete course assessments."
    >
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => navigate("/quiz-generator")}
          className="bg-white hover:bg-slate-50 rounded-2xl shadow p-6 text-left transition"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl mb-5">
            <FaBrain />
          </div>

          <h2 className="text-2xl font-bold text-slate-950">
            Generate AI Quiz
          </h2>

          <p className="text-slate-500 mt-2 leading-7">
            Create practice questions from a topic, weak area or revision goal.
          </p>
        </button>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl mb-5">
            <FaQuestionCircle />
          </div>

          <h2 className="text-2xl font-bold text-slate-950">
            Complete Quiz
          </h2>

          <p className="text-slate-500 mt-2 leading-7">
            Choose a course and quiz below. Scores are saved for analytics and recommendations.
          </p>
        </div>
      </section>

      {message && (
        <div className="bg-blue-100 text-blue-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Select Course and Quiz
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <select
            value={selectedCourse}
            onChange={(event) => fetchQuizzes(event.target.value)}
            className="input"
          >
            <option value="">
              Select Course
            </option>

            {courses.map(course => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={selectedQuiz}
            onChange={(event) => fetchQuestions(event.target.value)}
            className="input"
            disabled={!selectedCourse}
          >
            <option value="">
              Select Quiz
            </option>

            {quizzes.map(quiz => (
              <option
                key={quiz.id}
                value={quiz.id}
              >
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FaQuestionCircle className="text-blue-600" />
            Quiz Questions
          </h2>

          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-slate-100 rounded-xl p-5 mb-5"
            >
              <h3 className="font-bold text-lg mb-4">
                {index + 1}. {question.question_text}
              </h3>

              {["A", "B", "C", "D"].map(option => (
                <label
                  key={option}
                  className={`block bg-white rounded-xl p-3 mb-3 cursor-pointer hover:bg-blue-50 ${
                    answers[question.id] === option
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() =>
                      handleAnswerChange(question.id, option)
                    }
                    className="mr-3"
                  />

                  {option === "A" && question.option_a}
                  {option === "B" && question.option_b}
                  {option === "C" && question.option_c}
                  {option === "D" && question.option_d}
                </label>
              ))}
            </div>
          ))}

          <button
            onClick={submitQuiz}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <FaCheckCircle />
            Submit Quiz
          </button>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <FaTrophy className="text-yellow-500" />
            Quiz Result
          </h2>

          <p className="text-xl mb-2">
            Score:
            <span className="font-bold text-blue-600 ml-2">
              {result.score}%
            </span>
          </p>

          <p className="text-slate-600 mb-6">
            Correct answers: {result.correct_answers} / {result.total_questions}
          </p>

          <div className="bg-slate-100 rounded-xl p-4 mb-6">
            {result.score >= 80 ? (
              <p className="text-green-700 font-semibold">
                Excellent work. Your quiz performance shows strong understanding.
              </p>
            ) : result.score >= 50 ? (
              <p className="text-yellow-700 font-semibold">
                Good attempt. Review the lesson again to improve your score.
              </p>
            ) : (
              <p className="text-red-700 font-semibold">
                You need more revision. Revisit the lesson and try again.
              </p>
            )}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            View Updated Dashboard
          </button>
        </div>
      )}
    </StudentShell>
  );
}

export default QuizPage;

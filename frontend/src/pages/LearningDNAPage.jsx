import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBrain,
  FaCheckCircle
} from "react-icons/fa";

import LearningDNAQuestionnaire from "../components/learningDNA/LearningDNAQuestionnaire";
import LoadingSpinner from "../components/LoadingSpinner";
import StudentShell from "../components/StudentShell";
import {
  getLearningDNAQuestions,
  submitLearningDNA
} from "../api/learningDnaApi";


function LearningDNAPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getLearningDNAQuestions();
      setQuestions(data);
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not load Learning DNA questions.");
    }

    setLoading(false);
  };

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  const saveAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer
    });
  };

  const goNext = () => {
    if (!answers[currentQuestion.id]) {
      setError("Please choose an answer before continuing.");
      return;
    }

    setError("");
    setCurrentIndex(currentIndex + 1);
  };

  const goBack = () => {
    setError("");
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const submitProfile = async () => {
    const responses = questions.map(question => answers[question.id]).filter(Boolean);

    if (responses.length !== questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await submitLearningDNA({
        responses
      });

      navigate(
        "/learning-dna/results",
        {
          state: {
            result
          }
        }
      );
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not submit Learning DNA profile.");
    }

    setSubmitting(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading Learning DNA..." />;
  }

  return (
    <StudentShell
      title="Learning DNA Profile"
      subtitle="Answer a short questionnaire to classify your learning personality and unlock personalised study advice."
    >
      <div className="space-y-6">
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">
                <FaBrain />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Question {currentIndex + 1} of {questions.length}
                </h2>

                <p className="text-slate-500">
                  Build your personalised learning profile.
                </p>
              </div>
            </div>

            <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold">
              {progressPercent}% complete
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl font-semibold">
            {error}
          </div>
        )}

        {currentQuestion ? (
          <section className="bg-white rounded-2xl shadow p-6 md:p-8">
            <LearningDNAQuestionnaire
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.id]}
              onAnswer={saveAnswer}
            />
          </section>
        ) : (
          <div className="bg-white rounded-2xl shadow p-8 text-slate-500">
            No Learning DNA questions are available.
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <button
            type="button"
            onClick={currentIndex === 0 ? () => navigate("/dashboard") : goBack}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            {currentIndex === 0 ? "Dashboard" : "Previous"}
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={submitProfile}
              disabled={submitting || questions.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              {submitting ? "Building profile..." : "Submit Learning DNA"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!currentQuestion}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              Next Question
              <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </StudentShell>
  );
}

export default LearningDNAPage;

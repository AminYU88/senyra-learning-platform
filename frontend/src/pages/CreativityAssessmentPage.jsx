import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBrain,
  FaCheckCircle
} from "react-icons/fa";

import AlternativeUsesTask from "../components/creativity/AlternativeUsesTask";
import RemoteAssociatesTask from "../components/creativity/RemoteAssociatesTask";
import ScenarioChallengeTask from "../components/creativity/ScenarioChallengeTask";
import WordAssociationTask from "../components/creativity/WordAssociationTask";
import StudentShell from "../components/StudentShell";
import { submitCreativityAssessment } from "../api/creativityApi";


const tasks = [
  {
    id: "remote_associates",
    title: "Remote Associates Test",
    prompt: "Find a creative connection between these words: bridge, code, memory.",
    category: "associative thinking",
    component: RemoteAssociatesTask
  },
  {
    id: "alternative_uses",
    title: "Alternative Uses Test",
    prompt: "List as many unusual uses as you can for a paperclip.",
    category: "divergent thinking",
    component: AlternativeUsesTask
  },
  {
    id: "scenario_challenge",
    title: "Creative Scenario Challenge",
    prompt: "A school wants to make revision more engaging without increasing screen time. What would you design?",
    category: "problem solving",
    component: ScenarioChallengeTask
  },
  {
    id: "word_association",
    title: "Word Association Chain",
    prompt: "Start with the word learning and create a chain of surprising associations.",
    category: "word association",
    component: WordAssociationTask
  }
];


function CreativityAssessmentPage() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState(
    tasks.reduce((accumulator, task) => ({
      ...accumulator,
      [task.id]: ""
    }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentTask = tasks[currentIndex];
  const TaskComponent = currentTask.component;
  const progressPercent = Math.round(((currentIndex + 1) / tasks.length) * 100);
  const isLastTask = currentIndex === tasks.length - 1;

  const updateResponse = (value) => {
    setResponses({
      ...responses,
      [currentTask.id]: value
    });
  };

  const goNext = () => {
    if (!responses[currentTask.id].trim()) {
      setError("Please add a response before moving to the next task.");
      return;
    }

    setError("");
    setCurrentIndex(currentIndex + 1);
  };

  const goBack = () => {
    setError("");
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const submitAssessment = async () => {
    const unanswered = tasks.filter(task => !responses[task.id].trim());

    if (unanswered.length > 0) {
      setError("Please complete every creativity task before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await submitCreativityAssessment({
        assessment_type: "creativity_lab",
        responses: tasks.map(task => ({
          prompt: task.prompt,
          response_text: responses[task.id],
          category: task.category
        }))
      });

      navigate(
        "/creativity-lab/results",
        {
          state: {
            result
          }
        }
      );
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not submit creativity assessment.");
    }

    setLoading(false);
  };

  return (
    <StudentShell
      title="Creativity Lab"
      subtitle="Complete four short activities to generate your Creativity Intelligence profile."
    >
      <div className="space-y-6">
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
                <FaBrain />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Task {currentIndex + 1} of {tasks.length}
                </h2>

                <p className="text-slate-500">
                  {currentTask.title}
                </p>
              </div>
            </div>

            <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold">
              {progressPercent}% complete
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl font-semibold">
            {error}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow p-6 md:p-8">
          <TaskComponent
            value={responses[currentTask.id]}
            onChange={updateResponse}
          />
        </section>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <button
            type="button"
            onClick={currentIndex === 0 ? () => navigate("/dashboard") : goBack}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            {currentIndex === 0 ? "Dashboard" : "Previous"}
          </button>

          {isLastTask ? (
            <button
              type="button"
              onClick={submitAssessment}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              {loading ? "Scoring..." : "Submit Creativity Lab"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              Next Task
              <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </StudentShell>
  );
}

export default CreativityAssessmentPage;

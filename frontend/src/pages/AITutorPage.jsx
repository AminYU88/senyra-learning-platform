import { useNavigate } from "react-router-dom";

import {
  FaBrain,
  FaHistory,
  FaLightbulb,
  FaRobot,
  FaRoute
} from "react-icons/fa";

import StudentShell from "../components/StudentShell";


function AITutorPage() {
  const navigate = useNavigate();

  const tools = [
    {
      title: "AI Assistant",
      description: "Ask questions, generate explanations, flashcards, quizzes and revision support.",
      path: "/chatbot",
      icon: <FaRobot />,
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "AI Learning Path",
      description: "View your adaptive learning path based on progress, engagement and quiz performance.",
      path: "/learning-path",
      icon: <FaRoute />,
      color: "bg-purple-50 text-purple-700"
    },
    {
      title: "AI History",
      description: "Review previous recommendations and mark which advice helped.",
      path: "/recommendation-history",
      icon: <FaHistory />,
      color: "bg-teal-50 text-teal-700"
    },
    {
      title: "Recommendations",
      description: "See weak topics, suggested revision, recommended quizzes and study plan actions.",
      path: "/recommendations",
      icon: <FaLightbulb />,
      color: "bg-yellow-50 text-yellow-700"
    }
  ];

  return (
    <StudentShell
      title="AI Tutor"
      subtitle="All AI learning support is grouped here so the dashboard stays focused."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.title}
            onClick={() => navigate(tool.path)}
            className="bg-white rounded-2xl shadow p-6 text-left hover:shadow-lg transition"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 ${tool.color}`}>
              {tool.icon}
            </div>

            <h2 className="text-2xl font-bold text-slate-950">
              {tool.title}
            </h2>

            <p className="text-slate-500 mt-3 leading-7">
              {tool.description}
            </p>
          </button>
        ))}
      </div>

      <section className="mt-8 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl shadow p-8 text-white">
        <div className="flex items-start gap-4">
          <FaBrain className="text-4xl shrink-0" />

          <div>
            <h2 className="text-3xl font-bold">
              Ask better questions, learn faster.
            </h2>

            <p className="text-blue-100 mt-3 max-w-3xl">
              Use the assistant for explanations, worked examples, exam-style practice, English analysis, Maths revision and study planning.
            </p>
          </div>
        </div>
      </section>
    </StudentShell>
  );
}

export default AITutorPage;

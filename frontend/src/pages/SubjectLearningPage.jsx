import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBookOpen,
  FaBrain,
  FaQuestionCircle
} from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";
import { generatePractice, getEducationTopics } from "../api/educationApi";


function SubjectLearningPage({
  subject,
  title,
  subtitle
}) {
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTopics();
  }, [subject]);

  const loadTopics = async () => {
    setLoading(true);

    const result = await getEducationTopics(subject);

    if (!result) return;

    if (result.response.ok) {
      setTopics(result.data);
    } else {
      setMessage("Could not load curriculum topics.");
    }

    setLoading(false);
  };

  const createPractice = async (topic) => {
    const result = await generatePractice({
      subject,
      topic: topic.name,
      curriculum_level: topic.curriculum_level,
      age_range: topic.age_range
    });

    if (!result) return;

    if (result.response.ok) {
      setPractice(result.data);
    }
  };

  if (loading) {
    return <LoadingSpinner text={`Loading ${subject}...`} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            {title}
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            {subtitle}
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <FaArrowLeft />
          Dashboard
        </button>
      </div>

      {message && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {topics.map((topic) => (
          <div
            key={`${topic.subject}-${topic.name}-${topic.curriculum_level}`}
            className="bg-white rounded-2xl shadow p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {topic.name}
                </h2>

                <p className="text-blue-700 font-bold mt-1">
                  {topic.curriculum_level}
                </p>
              </div>

              <FaBookOpen className="text-blue-600 text-3xl" />
            </div>

            <p className="text-slate-600 mt-4 leading-7">
              {topic.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl font-semibold">
                {topic.difficulty_level}
              </span>

              <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl font-semibold">
                Ages {topic.age_range}
              </span>
            </div>

            <button
              onClick={() => createPractice(topic)}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              <FaQuestionCircle />
              Practice
            </button>
          </div>
        ))}
      </div>

      {practice && (
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex items-center gap-3 mb-5">
            <FaBrain className="text-purple-600 text-3xl" />

            <h2 className="text-3xl font-bold">
              Practice Tasks: {practice.topic}
            </h2>
          </div>

          <ul className="space-y-3">
            {practice.practice_tasks.map((task) => (
              <li
                key={task}
                className="bg-purple-50 text-purple-800 p-4 rounded-xl font-semibold"
              >
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

export default SubjectLearningPage;

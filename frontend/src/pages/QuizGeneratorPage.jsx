import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft, FaQuestionCircle, FaSave } from "react-icons/fa";

import { generateEducationQuiz, saveEducationQuizResult } from "../api/educationApi";


function QuizGeneratorPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: "Mathematics",
    topic: "Algebra",
    curriculum_level: "GCSE Mathematics Higher",
    number_of_questions: 10,
    question_type: "exam-style"
  });
  const [quiz, setQuiz] = useState(null);
  const [score, setScore] = useState(60);
  const [message, setMessage] = useState("");

  const createQuiz = async (event) => {
    event.preventDefault();

    const result = await generateEducationQuiz({
      ...form,
      number_of_questions: Number(form.number_of_questions)
    });

    if (result?.response.ok) {
      setQuiz(result.data);
    }
  };

  const saveScore = async () => {
    const result = await saveEducationQuizResult({
      subject: form.subject,
      topic: form.topic,
      score: Number(score)
    });

    if (result?.response.ok) {
      setMessage("Quiz result saved. Analytics and weak topic recommendations updated.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">Quiz Generator</h1>
          <p className="text-slate-500 mt-2 text-lg">Generate Maths and English exam-style questions, then save scores for analytics.</p>
        </div>

        <button onClick={() => navigate("/dashboard")} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2">
          <FaArrowLeft />
          Dashboard
        </button>
      </div>

      {message && <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6 font-semibold">{message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <form onSubmit={createQuiz} className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Quiz Settings</h2>

          <Select label="Subject" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} options={["Mathematics", "English Language", "English Literature"]} />
          <Input label="Topic" value={form.topic} onChange={(value) => setForm({ ...form, topic: value })} />
          <Input label="Curriculum Level" value={form.curriculum_level} onChange={(value) => setForm({ ...form, curriculum_level: value })} />
          <Input label="Number of Questions" type="number" value={form.number_of_questions} onChange={(value) => setForm({ ...form, number_of_questions: value })} />

          <button type="submit" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2">
            <FaQuestionCircle />
            Generate Quiz
          </button>
        </form>

        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Generated Quiz</h2>

          {quiz ? (
            <>
              {quiz.learning_dna_guidance && (
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl mb-6">
                  <p className="font-bold">
                    Learning DNA: {quiz.learning_dna_guidance.learner_type}
                  </p>
                  <p className="mt-1">
                    {quiz.learning_dna_guidance.quiz_strategy}
                  </p>
                  <p className="mt-1 text-sm">
                    Suggested difficulty: {quiz.learning_dna_guidance.suggested_difficulty}
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                {quiz.questions.map((item, index) => (
                  <div key={`${item.question}-${index}`} className="bg-slate-50 p-4 rounded-xl">
                    <p className="font-bold text-slate-900">{item.question}</p>
                    <p className="text-slate-600 mt-2">Answer guidance: {item.answer}</p>
                    {item.suggested_difficulty && (
                      <p className="text-slate-500 mt-2 text-sm">
                        Difficulty guidance: {item.suggested_difficulty}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-end">
                <div className="flex-1">
                  <label className="block font-semibold mb-2">Score</label>
                  <input type="number" min="0" max="100" value={score} onChange={(event) => setScore(event.target.value)} className="input" />
                </div>

                <button onClick={saveScore} className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2">
                  <FaSave />
                  Save Score
                </button>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Generate a quiz to view questions here.</p>
          )}
        </section>
      </div>
    </div>
  );
}


function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="mb-5">
      <label className="block font-semibold mb-2">{label}</label>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="input" required />
    </div>
  );
}


function Select({ label, value, onChange, options }) {
  return (
    <div className="mb-5">
      <label className="block font-semibold mb-2">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="input">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

export default QuizGeneratorPage;

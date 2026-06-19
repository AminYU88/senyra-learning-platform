import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

import { generateStudyPlan } from "../api/educationApi";


function StudyPlannerPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: "Mathematics",
    topic: "Algebra",
    age_range: "14-16",
    days: 7
  });
  const [plan, setPlan] = useState(null);

  const createPlan = async (event) => {
    event.preventDefault();

    const result = await generateStudyPlan({
      ...form,
      days: Number(form.days)
    });

    if (result?.response.ok) {
      setPlan(result.data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">Study Planner</h1>
          <p className="text-slate-500 mt-2 text-lg">Generate personalised revision plans for Maths and English learners aged 12-25.</p>
        </div>

        <button onClick={() => navigate("/dashboard")} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2">
          <FaArrowLeft />
          Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <form onSubmit={createPlan} className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Plan Details</h2>

          <Select label="Subject" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} options={["Mathematics", "English Language", "English Literature"]} />
          <Input label="Topic" value={form.topic} onChange={(value) => setForm({ ...form, topic: value })} />
          <Select label="Age Range" value={form.age_range} onChange={(value) => setForm({ ...form, age_range: value })} options={["12-14", "14-16", "16-18", "18-25"]} />
          <Input label="Days" type="number" value={form.days} onChange={(value) => setForm({ ...form, days: value })} />

          <button type="submit" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2">
            <FaCalendarAlt />
            Generate Plan
          </button>
        </form>

        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Generated Plan</h2>

          {plan ? (
            <div className="space-y-3">
              {plan.learning_dna_guidance && (
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl mb-5">
                  <p className="font-bold">
                    Learning DNA: {plan.learning_dna_guidance.learner_type}
                  </p>
                  <p className="mt-1">
                    {plan.learning_dna_guidance.planner_strategy}
                  </p>
                </div>
              )}

              {plan.plan.map((item) => (
                <div key={item.day} className="bg-blue-50 text-blue-800 p-4 rounded-xl">
                  <strong>Day {item.day}:</strong> {item.task}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Choose a subject and topic to generate a revision plan.</p>
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

export default StudyPlannerPage;

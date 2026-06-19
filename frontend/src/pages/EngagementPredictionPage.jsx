import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft, FaChartLine } from "react-icons/fa";

import { predictEngagement } from "../api/mlApi";


function EngagementPredictionPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    raised_hands: 70,
    visited_resources: 65,
    announcements_view: 24,
    discussion: 8,
    parent_satisfaction: 4,
    gender: "F",
    nationality: "UK",
    topic: "Maths",
    stage: "GCSE",
    grade_band: "B",
    parent_answering_survey: "Good",
    student_absence_days: "Under-7"
  });
  const [prediction, setPrediction] = useState(null);

  const update = (field, value) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const submit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      raised_hands: Number(form.raised_hands),
      visited_resources: Number(form.visited_resources),
      announcements_view: Number(form.announcements_view),
      discussion: Number(form.discussion),
      parent_satisfaction: Number(form.parent_satisfaction)
    };

    const result = await predictEngagement(payload);

    if (result?.response.ok) {
      setPrediction(result.data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">Engagement Prediction</h1>
          <p className="text-slate-500 mt-2 text-lg">Predict engagement from xAPI-style participation metrics.</p>
        </div>

        <button onClick={() => navigate("/admin")} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2">
          <FaArrowLeft />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <form onSubmit={submit} className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Participation Metrics</h2>

          {["raised_hands", "visited_resources", "announcements_view", "discussion", "parent_satisfaction"].map((field) => (
            <div key={field} className="mb-5">
              <label className="block font-semibold mb-2">{field.replaceAll("_", " ")}</label>
              <input type="number" value={form[field]} onChange={(event) => update(field, event.target.value)} className="input" />
            </div>
          ))}

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2">
            <FaChartLine />
            Predict Engagement
          </button>
        </form>

        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Prediction Output</h2>

          {prediction ? (
            <div className="space-y-4">
              <p className="text-4xl font-bold text-blue-700">{prediction.engagement_level}</p>
              <p className="text-slate-700"><strong>Confidence:</strong> {prediction.confidence_score}%</p>
              <p className="text-slate-700"><strong>Explanation:</strong> {prediction.explanation}</p>
              <p className="bg-blue-50 text-blue-800 p-4 rounded-xl font-semibold">{prediction.personalised_recommendation}</p>
            </div>
          ) : (
            <p className="text-slate-500">Submit metrics to generate an engagement prediction.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default EngagementPredictionPage;

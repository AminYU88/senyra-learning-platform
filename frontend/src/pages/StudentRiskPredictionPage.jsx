import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBrain,
  FaBullseye,
  FaChartLine,
  FaLightbulb
} from "react-icons/fa";

import { predictStudentRisk } from "../api/mlApi";


const initialMetrics = {
  attendance_rate: 72,
  engagement_score: 60,
  average_quiz_score: 58,
  assignment_score: 62,
  lesson_completion_rate: 55,
  study_hours_per_week: 5,
  late_submissions: 2,
  forum_posts: 2,
  practice_exercises_completed: 8,
  previous_failures: 1,
  course_level: "beginner",
  primary_topic: "sql"
};


function StudentRiskPredictionPage() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "student";

  const [metrics, setMetrics] = useState(initialMetrics);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateMetric = (field, value) => {
    setMetrics({
      ...metrics,
      [field]: value
    });
  };

  const submitPrediction = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...metrics,
        attendance_rate: Number(metrics.attendance_rate),
        engagement_score: Number(metrics.engagement_score),
        average_quiz_score: Number(metrics.average_quiz_score),
        assignment_score: Number(metrics.assignment_score),
        lesson_completion_rate: Number(metrics.lesson_completion_rate),
        study_hours_per_week: Number(metrics.study_hours_per_week),
        late_submissions: Number(metrics.late_submissions),
        forum_posts: Number(metrics.forum_posts),
        practice_exercises_completed: Number(metrics.practice_exercises_completed),
        previous_failures: Number(metrics.previous_failures)
      };

      const result = await predictStudentRisk(payload);

      if (!result) return;

      const { response, data } = result;

      if (!response.ok) {
        setError(data.detail || "Could not run prediction.");
        setLoading(false);
        return;
      }

      setPrediction(data);
    } catch (error) {
      console.log(error);
      setError("Backend connection error.");
    }

    setLoading(false);
  };

  const goBack = () => {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Student Risk Prediction
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Enter educational metrics to predict academic risk, pass/fail outcome, weak topic and recommendations.
          </p>
        </div>

        <button
          onClick={goBack}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <form
          onSubmit={submitPrediction}
          className="bg-white rounded-2xl shadow p-8"
        >
          <h2 className="text-3xl font-bold mb-6">
            Learning Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NumberInput label="Attendance Rate" field="attendance_rate" value={metrics.attendance_rate} onChange={updateMetric} />
            <NumberInput label="Engagement Score" field="engagement_score" value={metrics.engagement_score} onChange={updateMetric} />
            <NumberInput label="Average Quiz Score" field="average_quiz_score" value={metrics.average_quiz_score} onChange={updateMetric} />
            <NumberInput label="Assignment Score" field="assignment_score" value={metrics.assignment_score} onChange={updateMetric} />
            <NumberInput label="Lesson Completion Rate" field="lesson_completion_rate" value={metrics.lesson_completion_rate} onChange={updateMetric} />
            <NumberInput label="Study Hours Per Week" field="study_hours_per_week" value={metrics.study_hours_per_week} onChange={updateMetric} max={80} />
            <NumberInput label="Late Submissions" field="late_submissions" value={metrics.late_submissions} onChange={updateMetric} max={50} />
            <NumberInput label="Forum Posts" field="forum_posts" value={metrics.forum_posts} onChange={updateMetric} max={500} />
            <NumberInput label="Practice Exercises" field="practice_exercises_completed" value={metrics.practice_exercises_completed} onChange={updateMetric} max={500} />
            <NumberInput label="Previous Failures" field="previous_failures" value={metrics.previous_failures} onChange={updateMetric} max={20} />

            <div>
              <label className="block font-semibold mb-2">
                Course Level
              </label>

              <select
                value={metrics.course_level}
                onChange={(event) => updateMetric("course_level", event.target.value)}
                className="input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Primary Topic
              </label>

              <select
                value={metrics.primary_topic}
                onChange={(event) => updateMetric("primary_topic", event.target.value)}
                className="input"
              >
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="networking">Networking</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="web">Web Development</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60"
          >
            <FaBrain />
            {loading ? "Running Prediction..." : "Predict Student Risk"}
          </button>
        </form>

        <div className="space-y-6">
          {prediction ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ResultCard icon={<FaBullseye />} title="Risk Level" value={prediction.risk_level} />
                <ResultCard icon={<FaChartLine />} title="Confidence" value={`${prediction.confidence_score}%`} />
                <ResultCard icon={<FaBrain />} title="Pass/Fail" value={`${prediction.pass_fail_prediction} (${prediction.pass_probability}%)`} />
                <ResultCard icon={<FaLightbulb />} title="Engagement" value={prediction.engagement_prediction} />
              </div>

              <section className="bg-white rounded-2xl shadow p-8">
                <h2 className="text-3xl font-bold mb-3">
                  Weak Topic Detection
                </h2>

                <p className="text-xl text-slate-700">
                  {prediction.weak_topic}
                </p>
              </section>

              <section className="bg-white rounded-2xl shadow p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Personalised Recommendations
                </h2>

                <ul className="space-y-3">
                  {prediction.recommendations.map((item) => (
                    <li
                      key={item}
                      className="bg-blue-50 text-blue-800 p-4 rounded-xl font-semibold"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white rounded-2xl shadow p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Model Explanation
                </h2>

                <p className="text-slate-700">
                  Prediction source: {prediction.prediction_source}
                </p>

                <p className="text-slate-700 mt-2">
                  Model: {prediction.model_name}
                </p>
              </section>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
              Run a prediction to see risk level, confidence, weak topic and study recommendations.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}


function NumberInput({
  label,
  field,
  value,
  onChange,
  max = 100
}) {
  return (
    <div>
      <label className="block font-semibold mb-2">
        {label}
      </label>

      <input
        type="number"
        min="0"
        max={max}
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        className="input"
        required
      />
    </div>
  );
}


function ResultCard({
  icon,
  title,
  value
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="text-blue-600 text-4xl mb-4">
        {icon}
      </div>

      <h2 className="text-slate-500 font-semibold">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

export default StudentRiskPredictionPage;

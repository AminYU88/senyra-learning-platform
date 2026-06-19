import { FaBrain } from "react-icons/fa";


const numericFields = [
  ["attendance_rate", "Attendance Rate"],
  ["average_quiz_score", "Average Quiz Score"],
  ["engagement_score", "Engagement Score"],
  ["creativity_score", "Creativity Score"],
  ["flow_score", "Flow Score"],
  ["learning_dna_confidence", "Learning DNA Confidence"],
  ["study_consistency", "Study Consistency"],
  ["task_completion_rate", "Task Completion Rate"],
  ["weak_topic_count", "Weak Topic Count"],
  ["problem_solving_score", "Problem Solving Score"]
];


function CognitiveRiskForm({
  metrics,
  onChange,
  onSubmit,
  loading
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow p-8"
    >
      <h2 className="text-3xl font-bold mb-2">
        Cognitive Metrics
      </h2>
      <p className="text-slate-500 mb-6">
        Enter behavioural and cognitive learning signals for an advanced prediction.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {numericFields.map(([field, label]) => (
          <NumberInput
            key={field}
            label={label}
            field={field}
            value={metrics[field]}
            onChange={onChange}
            max={field === "weak_topic_count" ? 100 : 100}
          />
        ))}

        <div>
          <label className="block font-semibold mb-2">
            Course Level
          </label>

          <select
            value={metrics.course_level}
            onChange={(event) => onChange("course_level", event.target.value)}
            className="input"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Learner Type
          </label>

          <select
            value={metrics.learner_type}
            onChange={(event) => onChange("learner_type", event.target.value)}
            className="input"
          >
            <option value="Unknown">Unknown</option>
            <option value="Analytical Learner">Analytical Learner</option>
            <option value="Creative Learner">Creative Learner</option>
            <option value="Visual Learner">Visual Learner</option>
            <option value="Problem Solver">Problem Solver</option>
            <option value="Exploratory Learner">Exploratory Learner</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60"
      >
        <FaBrain />
        {loading ? "Running Cognitive Prediction..." : "Predict Cognitive Risk"}
      </button>
    </form>
  );
}


function NumberInput({
  label,
  field,
  value,
  onChange,
  max
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

export default CognitiveRiskForm;

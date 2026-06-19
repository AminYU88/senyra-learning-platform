import { useNavigate } from "react-router-dom";
import { FaDna } from "react-icons/fa";


function LearningDNAWidget({
  profile,
  recommendations,
  loading,
  error
}) {
  const navigate = useNavigate();
  const hasProfile = Boolean(profile?.learner_type);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-slate-500 font-semibold">
            Learning DNA
          </p>

          <h2 className="text-2xl font-bold text-slate-950 mt-2">
            {loading ? "Loading..." : hasProfile ? profile.learner_type : "Not assessed"}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl">
          <FaDna />
        </div>
      </div>

      {error ? (
        <p className="text-red-600 font-semibold">
          {error}
        </p>
      ) : hasProfile ? (
        <div className="space-y-3">
          <p className="text-slate-600">
            Confidence: <span className="font-bold">{Math.round(profile.confidence_score)}%</span>
          </p>

          <div className="bg-slate-50 rounded-xl p-4 text-slate-700">
            {recommendations?.study_strategy || "Use your learner profile to personalise your next study session."}
          </div>
        </div>
      ) : (
        <p className="text-slate-500">
          Complete your Learning DNA profile.
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate(hasProfile ? "/learning-dna/results" : "/learning-dna")}
        className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold"
      >
        View Learning DNA
      </button>
    </div>
  );
}

export default LearningDNAWidget;

import { useNavigate } from "react-router-dom";
import { FaLightbulb } from "react-icons/fa";


function strongestArea(summary) {
  const areas = [
    ["Fluency", summary?.average_fluency_score || 0],
    ["Flexibility", summary?.average_flexibility_score || 0],
    ["Originality", summary?.average_originality_score || 0],
    ["Elaboration", summary?.average_elaboration_score || 0]
  ];

  return areas.sort((a, b) => b[1] - a[1])[0][0];
}


function weakestArea(summary) {
  const areas = [
    ["Fluency", summary?.average_fluency_score || 0],
    ["Flexibility", summary?.average_flexibility_score || 0],
    ["Originality", summary?.average_originality_score || 0],
    ["Elaboration", summary?.average_elaboration_score || 0]
  ];

  return areas.sort((a, b) => a[1] - b[1])[0][0];
}


function CreativityScoreWidget({
  summary,
  loading,
  error
}) {
  const navigate = useNavigate();
  const hasData = summary?.total_assessments > 0;
  const score = Math.round(summary?.average_creativity_score || 0);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-slate-500 font-semibold">
            Creativity Score
          </p>

          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            {loading ? "Loading..." : hasData ? `${score}%` : "--"}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
          <FaLightbulb />
        </div>
      </div>

      {error ? (
        <p className="text-red-600 font-semibold">
          {error}
        </p>
      ) : hasData ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">
              Main strength
            </p>
            <p className="font-bold text-slate-800">
              {strongestArea(summary)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase font-bold text-slate-400">
              Improvement area
            </p>
            <p className="font-bold text-slate-800">
              {weakestArea(summary)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-slate-500">
          Complete your first creativity assessment.
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate("/creativity-lab")}
        className="mt-5 w-full bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold"
      >
        Open Creativity Lab
      </button>
    </div>
  );
}

export default CreativityScoreWidget;

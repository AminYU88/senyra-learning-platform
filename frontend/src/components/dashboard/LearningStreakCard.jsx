import { FaFire } from "react-icons/fa";


function LearningStreakCard({
  data,
  loading,
  error
}) {
  const streakDays = data?.streak_days ?? 0;
  const progress = data?.progress_percent ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-slate-500 font-semibold">
            Learning Streak
          </p>

          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            {loading ? "Loading..." : `${streakDays} Days`}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center text-xl">
          <FaFire />
        </div>
      </div>

      {error ? (
        <p className="text-red-600 font-semibold">
          {error}
        </p>
      ) : (
        <>
          <p className="text-slate-600 min-h-12">
            {loading
              ? "Checking your learning activity..."
              : data?.message || "Start learning today to build a streak."}
          </p>

          <div className="mt-5">
            <div className="flex justify-between text-sm text-slate-500 font-semibold mb-2">
              <span>14-day habit goal</span>
              <span>{progress}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LearningStreakCard;

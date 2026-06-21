import { FaClipboardCheck, FaRedo } from "react-icons/fa";


function RecommendedTopicCard({
  topic,
  subject,
  difficulty,
  status,
  reason,
  recommendedActivity,
  onRevise,
  onQuiz
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-950">
            {topic}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {subject} - {difficulty} difficulty{status ? ` - ${status}` : ""}
          </p>
          {reason && (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {reason}
            </p>
          )}
          {recommendedActivity && (
            <p className="mt-2 text-xs font-bold uppercase text-slate-400">
              {recommendedActivity}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onRevise}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <FaRedo />
            Revise
          </button>

          <button
            type="button"
            onClick={onQuiz}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            <FaClipboardCheck />
            Quiz
          </button>
        </div>
      </div>
    </div>
  );
}


export default RecommendedTopicCard;

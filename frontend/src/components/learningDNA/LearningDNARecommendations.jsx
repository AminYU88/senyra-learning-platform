import { FaLightbulb } from "react-icons/fa";


function LearningDNARecommendations({
  title,
  items = [],
  emptyText
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <FaLightbulb />
        </div>

        <h2 className="text-2xl font-bold text-slate-950">
          {title}
        </h2>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item}
              className="bg-slate-50 rounded-xl p-4 text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">
          {emptyText || "No recommendations available yet."}
        </p>
      )}
    </div>
  );
}

export default LearningDNARecommendations;

const badgeStyles = {
  "Analytical Learner": "bg-blue-50 text-blue-700 border-blue-200",
  "Creative Learner": "bg-purple-50 text-purple-700 border-purple-200",
  "Visual Learner": "bg-green-50 text-green-700 border-green-200",
  "Problem Solver": "bg-amber-50 text-amber-700 border-amber-200",
  "Exploratory Learner": "bg-cyan-50 text-cyan-700 border-cyan-200"
};


function LearnerTypeBadge({
  learnerType
}) {
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full border font-bold ${
      badgeStyles[learnerType] || "bg-slate-100 text-slate-700 border-slate-200"
    }`}>
      {learnerType || "Not assessed"}
    </span>
  );
}

export default LearnerTypeBadge;

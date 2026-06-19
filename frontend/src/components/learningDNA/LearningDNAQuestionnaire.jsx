function LearningDNAQuestionnaire({
  question,
  selectedAnswer,
  onAnswer
}) {
  return (
    <div>
      <p className="text-sm font-bold text-blue-700 mb-2">
        Learning DNA questionnaire
      </p>

      <h2 className="text-3xl font-bold text-slate-950">
        {question.question}
      </h2>

      <div className="mt-6 space-y-3">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onAnswer({
              question: question.question,
              answer: option,
              score_category: question.score_categories[option]
            })}
            className={`w-full text-left rounded-xl border p-4 font-semibold transition ${
              selectedAnswer?.answer === option
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 text-slate-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LearningDNAQuestionnaire;

function WordAssociationTask({
  value,
  onChange
}) {
  return (
    <div>
      <p className="text-sm font-bold text-blue-700 mb-2">
        Creativity task
      </p>

      <h2 className="text-3xl font-bold text-slate-950">
        Word Association Chain
      </h2>

      <p className="text-slate-700 text-lg mt-5 font-semibold">
        Start with the word learning and create a chain of surprising associations.
      </p>

      <p className="text-slate-500 mt-2">
        Explain at least a few links in the chain so elaboration can be scored.
      </p>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="learning -> curiosity -> map -> hidden route -> discovery..."
        className="mt-6 w-full min-h-56 rounded-2xl border border-slate-200 bg-slate-50 p-5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

export default WordAssociationTask;

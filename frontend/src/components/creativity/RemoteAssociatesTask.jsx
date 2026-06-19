function RemoteAssociatesTask({
  value,
  onChange
}) {
  return (
    <TaskShell
      title="Remote Associates Test"
      prompt="Find a creative connection between these words: bridge, code, memory."
      helper="Write the linking idea and explain why the words belong together."
      value={value}
      onChange={onChange}
      placeholder="Example: A bridge can connect memories, while code can preserve them in a digital archive..."
    />
  );
}


function TaskShell({
  title,
  prompt,
  helper,
  value,
  onChange,
  placeholder
}) {
  return (
    <div>
      <p className="text-sm font-bold text-blue-700 mb-2">
        Creativity task
      </p>

      <h2 className="text-3xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="text-slate-700 text-lg mt-5 font-semibold">
        {prompt}
      </p>

      <p className="text-slate-500 mt-2">
        {helper}
      </p>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-6 w-full min-h-56 rounded-2xl border border-slate-200 bg-slate-50 p-5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

export default RemoteAssociatesTask;

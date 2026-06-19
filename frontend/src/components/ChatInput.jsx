import { useState } from "react";

import {
  FaPaperPlane,
  FaWandMagicSparkles
} from "react-icons/fa6";


function ChatInput({
  onSend,
  loading,
  role
}) {
  const [message, setMessage] = useState("");

  const studentPrompts = [
    "Explain TCP vs UDP",
    "Create a 7-day revision plan for CCNA",
    "Generate 10 quiz questions on Python",
    "Help me understand SQL joins"
  ];

  const teacherPrompts = [
    "Generate a lesson plan for Python functions",
    "Create a 20-question networking quiz",
    "Create a marking rubric for a web development project",
    "Recommend interventions for low quiz scores"
  ];

  const prompts = role === "teacher" ? teacherPrompts : studentPrompts;

  const submit = (event) => {
    event.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    onSend(message.trim());
    setMessage("");
  };

  return (
    <div className="space-y-4">

      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() => setMessage(prompt)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <FaWandMagicSparkles />
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="flex items-end gap-3"
      >

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              submit(event);
            }
          }}
          className="input min-h-[64px] max-h-40 resize-y"
          placeholder="Ask Senyra AI about revision, quizzes, code, lesson plans, rubrics, or weak areas..."
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="h-16 w-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xl disabled:opacity-50"
          title="Send message"
        >
          <FaPaperPlane />
        </button>

      </form>

    </div>
  );
}

export default ChatInput;

import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";


function ChatWindow({
  messages,
  loading,
  darkMode
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">

      {messages.length === 0 ? (
        <div className="h-full min-h-[420px] flex items-center justify-center text-center">
          <div>
            <h2 className={`text-4xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Senyra AI Learning Assistant
            </h2>

            <p className={`text-lg max-w-2xl ${darkMode ? "text-slate-300" : "text-slate-500"}`}>
              Ask for explanations, quizzes, flashcards, lesson plans, rubrics, study plans, code help, resources, or personalised progress advice.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id || `${message.role}-${index}`}
              message={message}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-start mt-5">
          <div className={`rounded-2xl px-5 py-4 shadow-sm ${darkMode ? "bg-slate-800 text-slate-100" : "bg-white text-slate-700"}`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:120ms]" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:240ms]" />
              <span className="ml-2 font-semibold">Senyra AI is thinking...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />

    </div>
  );
}

export default ChatWindow;

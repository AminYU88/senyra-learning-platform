import { useState } from "react";

import {
  FaCheck,
  FaClipboard
} from "react-icons/fa";


function renderInlineMarkdown(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}


function MessageBubble({
  message,
  darkMode
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const parts = message.content.split(/```/g);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>

      <div
        className={`group max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : darkMode
            ? "bg-slate-800 text-slate-100 border border-slate-700"
            : "bg-white text-slate-900 border border-slate-200"
        }`}
      >

        <div className="flex items-start justify-between gap-4">

          <div className="space-y-3 leading-7">
            {parts.map((part, index) => {
              const isCode = index % 2 === 1;

              if (isCode) {
                const code = part.replace(/^[a-zA-Z]+\n/, "");

                return (
                  <pre
                    key={index}
                    className="overflow-x-auto rounded-xl bg-slate-950 text-slate-100 p-4 text-sm leading-6"
                  >
                    <code>{code}</code>
                  </pre>
                );
              }

              return part
                .split("\n")
                .filter(line => line.trim() !== "")
                .map((line, lineIndex) => {
                  if (line.startsWith("## ")) {
                    return (
                      <h2
                        key={`${index}-${lineIndex}`}
                        className="text-xl font-bold mt-2"
                      >
                        {line.replace("## ", "")}
                      </h2>
                    );
                  }

                  if (line.startsWith("### ")) {
                    return (
                      <h3
                        key={`${index}-${lineIndex}`}
                        className="text-lg font-bold mt-2"
                      >
                        {line.replace("### ", "")}
                      </h3>
                    );
                  }

                  return (
                    <p
                      key={`${index}-${lineIndex}`}
                      dangerouslySetInnerHTML={{
                        __html: renderInlineMarkdown(line)
                      }}
                    />
                  );
                });
            })}
          </div>

          {!isUser && (
            <button
              type="button"
              onClick={copyMessage}
              className={`shrink-0 opacity-0 group-hover:opacity-100 transition rounded-lg p-2 ${
                darkMode
                  ? "hover:bg-slate-700"
                  : "hover:bg-slate-100"
              }`}
              title="Copy response"
            >
              {copied ? <FaCheck /> : <FaClipboard />}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default MessageBubble;

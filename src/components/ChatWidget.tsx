import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const mockRespond = (q: string): string => {
  const text = q.toLowerCase().trim();

  if (/tomato/.test(text) && /apple/.test(text)) {
    return "Warning: Ethylene conflict. Tomatoes produce ethylene which can prematurely ripen apples during transport.";
  }

  if (/hi|hello|hey/.test(text)) {
    return "Hello! I’m the ShelfLife+ Assistant. Ask me about produce compatibility, ethylene, or transport tips.";
  }

  if (/compatible|together|mix|combine|pair/i.test(text)) {
    return "I can help check compatibility. Tell me the items you plan to transport together.";
  }

  if (/ethylene/i.test(text)) {
    return "Ethylene is a ripening gas. Keep high ethylene producers away from ethylene‑sensitive items to avoid spoilage.";
  }

  if (/temperature|cold|warm/i.test(text)) {
    return "Match each crop’s ideal temperature range. Consider a refrigerated truck if multiple sensitive items are mixed.";
  }

  return "Got it. For best results, avoid mixing high ethylene producers with ethylene‑sensitive crops, and keep temperatures within each crop’s ideal range.";
};

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    id: crypto.randomUUID(),
    role: "assistant",
    text: "Hi! I’m your ShelfLife+ Assistant. Try asking: ‘Can I transport tomatoes with apples?’"
  }]);

  const endRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    if (!canSend) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Simulate latency, then respond
    const replyText = mockRespond(userMsg.text);
    setTimeout(() => {
      const botMsg: Message = { id: crypto.randomUUID(), role: "assistant", text: replyText };
      setMessages((m) => [...m, botMsg]);
    }, 500);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          aria-label={open ? "Close chat" : "Open chat"}
          onClick={() => setOpen((v) => !v)}
          className="relative h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        >
          {/* Subtle pulsing glow */}
          <span className="pointer-events-none absolute inset-0 rounded-full animate-ping bg-emerald-500/25" aria-hidden />
          <span className="relative flex items-center justify-center h-full w-full">
            <Bot className="h-7 w-7" />
          </span>
        </button>
      </div>

      {/* Chat Window */}
      <div
        className={[
          "fixed bottom-24 right-6 z-50 w-80 max-w-[90vw] h-96 max-h-[65vh]",
          "rounded-2xl border border-gray-200 bg-white shadow-2xl dark:bg-neutral-900 dark:border-neutral-800",
          "overflow-hidden",
          "transition-all duration-200 ease-out",
          open ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 translate-y-2 scale-95"
        ].join(" ")}
        role="dialog"
        aria-label="ShelfLife+ Assistant"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-emerald-600 text-white">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="h-5 w-5" />
            <span>ShelfLife+ Assistant</span>
          </div>
          <button
            aria-label="Close chat"
            onClick={() => setOpen(false)}
            className="rounded-full p-1 hover:bg-white/15 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-2 p-3 h-[calc(100%-52px-54px)] overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={[
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                m.role === "user"
                  ? "self-end bg-emerald-600 text-white"
                  : "self-start bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100"
              ].join(" ")}
            >
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-neutral-800 p-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about compatibility…"
              className="flex-1 bg-transparent outline-none px-3 py-2 text-sm placeholder:text-gray-400"
            />
            <button
              onClick={send}
              disabled={!canSend}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white h-9 w-9 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;

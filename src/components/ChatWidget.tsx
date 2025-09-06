import { useEffect, useMemo, useRef, useState } from "react";
import { Truck, Send, X, Sparkles } from "lucide-react";
import { MOCK_QA, QUESTION_ALIASES } from "@/lib/mockChatData";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  typing?: boolean;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findAnswerFromMock = (q: string): string => {
  const raw = q.toLowerCase().trim();
  const text = raw.replace(/[^\p{L}\p{N}\s]/gu, " ");

  // Build a quick expanded list of keywords per entry using aliases
  for (const item of MOCK_QA) {
    const expanded: string[] = [];
    for (const kw of item.question) {
      expanded.push(kw);
      if (QUESTION_ALIASES[kw]) expanded.push(...QUESTION_ALIASES[kw]);
    }
    // match word-boundary for each keyword (loose includes for multi-word phrases)
    const matched = expanded.some((kw) => {
      const k = kw.toLowerCase();
      if (k.split(" ").length > 1) {
        return text.includes(k);
      }
      return new RegExp(`\\b${escapeRegex(k)}\\b`, "i").test(text);
    });
    if (matched) return item.answer;
  }

  // Domain-friendly fallbacks
  if (/tomato/.test(text) && /apple/.test(text)) {
    return "Heads up: tomatoes produce ethylene and can prematurely ripen apples. Consider separating them during transport.";
  }
  if (/ethylene/i.test(text)) {
    return "Ethylene is a ripening gas. Keep high producers away from ethylene‑sensitive items to reduce spoilage risk.";
  }
  if (/compatible|together|mix|combine|pair/i.test(text)) {
    return "I can help with compatibility. Tell me which items you plan to transport together.";
  }

  // General CTA aligned with landing page
  return "I can guide you through the demo. Try the Simulator to enter vegetable types and see truck layout and impact charts.";
};

type Position = "right" | "left" | "auto"; // auto: right desktop, left mobile

export const ChatWidget = ({ position = "right" }: { position?: Position }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text:
        "👋 Hi! I’m TraceBot. I can help you plan produce transport. Try: ‘What is this?’, ‘How do I start?’, or ‘Impact?’ — or open the Simulator to load a vegetable shipment and see space usage.",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const [unread, setUnread] = useState(0);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus management and keyboard shortcuts
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setUnread(0);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // External open/close and navigation hooks
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    window.addEventListener("tracebot:open", onOpen as any);
    window.addEventListener("tracebot:close", onClose as any);
    return () => {
      window.removeEventListener("tracebot:open", onOpen as any);
      window.removeEventListener("tracebot:close", onClose as any);
    };
  }, []);

  const runCommand = (cmd: string) => {
    const c = cmd.toLowerCase();
    const dispatch = (name: string, detail?: any) =>
      window.dispatchEvent(new CustomEvent(name, { detail }));
    if (c === "/demo" || c === "/start") {
      dispatch("tracebot:navigate", { tab: "analysis" });
      dispatch("tracebot:action", { type: "addSampleShipment" });
      return "Loaded a sample demo scenario and moved to Analysis.";
    }
    if (c === "/impact") {
      dispatch("tracebot:navigate", { tab: "impact" });
      return "Opening Impact tab to view emissions.";
    }
    if (c === "/layout") {
      dispatch("tracebot:navigate", { tab: "layout" });
      return "Opening Layout tab to view truck usage.";
    }
    if (c === "/reset") {
      dispatch("tracebot:action", { type: "reset" });
      return "Scenario reset. You can start fresh.";
    }
    if (c === "/share") {
      dispatch("tracebot:action", { type: "share" });
      return "Created a shareable link for your current scenario.";
    }
    return "Unknown command. Try /demo, /impact, /layout, /reset, or /share.";
  };

  const send = () => {
    if (!canSend) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Commands (slash) are handled locally
    const isCommand = userMsg.text.trim().startsWith("/");
    const replyText = isCommand ? runCommand(userMsg.text.trim()) : findAnswerFromMock(userMsg.text);

    // Add typing indicator then replace
    const typingId = crypto.randomUUID();
    const typingMsg: Message = { id: typingId, role: "assistant", text: "…", typing: true };
    setMessages((m) => [...m, typingMsg]);
    setTimeout(() => {
      setMessages((m) =>
        m.map((msg) => (msg.id === typingId ? { ...msg, typing: false, text: replyText } : msg))
      );
      if (!open) setUnread((u) => u + 1);
    }, isCommand ? 250 : 600);
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
      <div
        className={[
          "fixed bottom-6 z-50",
          position === "left" ? "left-6" : position === "right" ? "right-6" : "left-6 sm:left-auto sm:right-6",
        ].join(" ")}
      >
        <button
          aria-label={open ? "Close chat" : "Open chat"}
          onClick={() => setOpen((v) => !v)}
          ref={launcherRef}
          className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-brand-forest text-white shadow-lg hover:bg-brand-teal transition focus:outline-none focus:ring-4 focus:ring-brand-teal/40"
        >
          {/* Subtle pulsing glow */}
          <span className="pointer-events-none absolute inset-0 rounded-full animate-ping bg-brand-teal/25" aria-hidden />
          <span className="relative flex items-center justify-center h-full w-full">
            <Truck className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          {unread > 0 && !open && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-white text-[10px] grid place-items-center">
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      <div
        className={[
          "fixed bottom-24 z-50 w-80 max-w-[90vw] h-96 max-h-[65vh]",
          position === "left" ? "left-6" : position === "right" ? "right-6" : "left-6 sm:left-auto sm:right-6",
          "rounded-2xl border border-gray-200 bg-white shadow-2xl dark:bg-neutral-900 dark:border-neutral-800",
          "overflow-hidden flex flex-col min-h-0",
          "transition-all duration-200 ease-out",
          open ? "opacity-100 translate-y-0 scale-100 animate-chat-in" : "pointer-events-none opacity-0 translate-y-2 scale-95 animate-chat-out"
        ].join(" ")}
        role="dialog"
        aria-label="TraceBot Assistant"
        aria-hidden={!open}
        aria-modal={open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-brand-forest text-white">
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/15"><Truck className="h-4 w-4" /></span>
            <span>TraceBot</span>
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
        <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2 overscroll-contain">
          {messages.map((m) => (
            <div
              key={m.id}
              className={[
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm message-in",
                m.role === "user"
                  ? "self-end bg-brand-forest text-white"
                  : "self-start bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100"
              ].join(" ")}
            >
              {m.typing ? (
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse [animation-delay:120ms]" />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse [animation-delay:240ms]" />
                </span>
              ) : (
                m.text
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Suggestions + Input Area */}
        <div className="border-t border-gray-200 dark:border-neutral-800 p-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 pb-[env(safe-area-inset-bottom)]">
          {/* Quick suggestions to preload scripted Q&A */}
          <div className="flex flex-wrap gap-2 px-1 pb-2">
            {[
              { label: "What is this?", text: "what is this" },
              { label: "How do I start?", text: "how do i start" },
              { label: "Impact?", text: "impact" },
              { label: "Try Simulator", text: "try" },
              { label: "Add sample shipment", action: "addSampleShipment" },
              { label: "Show truck layout", action: "showLayout" },
              { label: "Estimate impact", action: "showImpact" },
              { label: "Compatibility check", text: "compatible" },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  if ((s as any).action) {
                    const a = (s as any).action as string;
                    if (a === "addSampleShipment") {
                      window.dispatchEvent(new CustomEvent("tracebot:action", { detail: { type: "addSampleShipment" } }));
                      window.dispatchEvent(new CustomEvent("tracebot:navigate", { detail: { tab: "analysis" } }));
                    } else if (a === "showLayout") {
                      window.dispatchEvent(new CustomEvent("tracebot:navigate", { detail: { tab: "layout" } }));
                    } else if (a === "showImpact") {
                      window.dispatchEvent(new CustomEvent("tracebot:navigate", { detail: { tab: "impact" } }));
                    }
                    setMessages((m) => [
                      ...m,
                      { id: crypto.randomUUID(), role: "assistant", text: "Done. I’ve updated the simulator for you." },
                    ]);
                    if (!open) setUnread((u) => u + 1);
                  } else if (s.text) {
                    setInput(s.text!);
                    setTimeout(() => send(), 0);
                  }
                }}
                className="text-xs rounded-full px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => {
                document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="ml-auto text-xs inline-flex items-center gap-1 rounded-full px-3 py-1 bg-fresh-green-light text-brand-forest hover:bg-neutral-light border border-brand-forest/20 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-700"
              title="Open Simulator"
            >
              <Sparkles className="h-3 w-3" /> Open Simulator
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about compatibility…"
              ref={inputRef}
              className="flex-1 bg-transparent outline-none px-3 py-2 text-sm placeholder:text-gray-400"
            />
            <button
              onClick={send}
              disabled={!canSend}
              className="inline-flex items-center justify-center rounded-lg bg-brand-forest text-white h-9 w-9 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-teal transition"
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

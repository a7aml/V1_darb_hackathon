import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/auth";

const ease = [0.22, 1, 0.36, 1];

// ─── ChatbotBubble ────────────────────────────────────────────────────────────
const ChatbotBubble = () => {
  const [open,    setOpen]    = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI study assistant. Ask me anything about your lectures 📚" },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot/ask", { question: text });
      const answer = res.data?.answer || "Sorry, I couldn't find an answer. Try rephrasing.";
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">

      {/* chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.3, ease }}
            className="w-80 sm:w-96 bg-white rounded-3xl border border-forest-100 shadow-card-lg flex flex-col overflow-hidden"
            style={{ height: 460 }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-forest-100/60" style={{ backgroundColor: "#1a4a47" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center">
                  <BotIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Study Tutor</p>
                  <p className="text-2xs text-white/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Always available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-cream-50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-forest-700 flex items-center justify-center shrink-0 me-2 mt-0.5">
                      <BotIconSm />
                    </div>
                  )}
                  <div
                    className={`
                      max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${msg.role === "user"
                        ? "text-ink-900 rounded-tr-sm"
                        : "bg-white border border-forest-100/60 text-ink-700 rounded-tl-sm shadow-sm"
                      }
                    `}
                    style={msg.role === "user" ? { backgroundColor: "#F5C842" } : {}}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-forest-700 flex items-center justify-center shrink-0">
                    <BotIconSm />
                  </div>
                  <div className="bg-white border border-forest-100/60 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-ink-300"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className="px-4 py-3 border-t border-forest-100/60 bg-white flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your lectures…"
                disabled={loading}
                className="flex-1 text-sm text-ink-800 bg-cream-50 border border-forest-100 rounded-xl px-4 py-2.5 outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100 placeholder:text-ink-300 transition-all disabled:opacity-50"
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#1a4a47" }}
              >
                <SendIcon />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* floating bubble button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={{ boxShadow: open
          ? "0 8px 24px rgba(26,74,71,0.35)"
          : ["0 4px 16px rgba(26,74,71,0.25)", "0 8px 28px rgba(26,74,71,0.35)", "0 4px 16px rgba(26,74,71,0.25)"],
        }}
        transition={open ? {} : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white relative"
        style={{ backgroundColor: "#1a4a47" }}
        aria-label="Open AI Tutor chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <CloseIcon />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <BotIcon />
            </motion.div>
          )}
        </AnimatePresence>

        {/* unread dot — only when closed */}
        {!open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0.5 end-0.5 w-3 h-3 rounded-full bg-gold-400 border-2 border-white"
          />
        )}
      </motion.button>
    </div>
  );
};

// ─── icons ────────────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-ink-900">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M12 2a3 3 0 0 1 3 3v6H9V5a3 3 0 0 1 3-3z"/>
    <line x1="8" y1="16" x2="8.01" y2="16"/>
    <line x1="16" y1="16" x2="16.01" y2="16"/>
  </svg>
);

const BotIconSm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M12 2a3 3 0 0 1 3 3v6H9V5a3 3 0 0 1 3-3z"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6"  y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);

export default ChatbotBubble;
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const TOOLS = [
  { key: "summary",    icon: "📄", color: "rgba(26,74,71,0.08)",    label: "Summarize Lecture",    desc: "Full lecture overview",      needsSlide: false },
  { key: "flashcards", icon: "🃏", color: "rgba(239,68,68,0.08)",   label: "Generate Flashcards",  desc: "Interactive study cards",    needsSlide: false },
  { key: "glossary",   icon: "📖", color: "rgba(168,85,247,0.08)",  label: "Key Terms & Glossary", desc: "Definitions & examples",     needsSlide: false },
  { key: "mindmap",    icon: "🗺️", color: "rgba(59,130,246,0.08)", label: "Mind Map",             desc: "Visual concept structure",   needsSlide: false },
  { key: "explain",    icon: "💡", color: "rgba(245,200,66,0.15)",  label: "Explain Slide",        desc: "Enter slide number below",   needsSlide: true  },
  { key: "tldr",       icon: "⚡", color: "rgba(26,74,71,0.06)",    label: "TL;DR",                desc: "One-sentence summary",       needsSlide: true  },
];

const AIToolsDropPanel = ({ hasLecture, onCallTool, loading, session }) => {
  const [open,       setOpen]       = useState(false);
  // track which slide-number tool is expanded for input
  const [slideInputs, setSlideInputs] = useState({ explain: "1", tldr: "1" });

  const handleTool = (tool) => {
    if (!hasLecture) return;

    const slideNumber = tool.needsSlide
      ? parseInt(slideInputs[tool.key] || "1", 10) || 1
      : undefined;

    onCallTool({
      toolKey:         tool.key,
      displayQuestion: tool.needsSlide
        ? `${tool.label} — Slide ${slideNumber}`
        : tool.label,
      slideNumber,
      session,
    });
  };

  const updateSlide = (key, val) => {
    // only allow positive integers
    if (val === "" || /^\d+$/.test(val)) {
      setSlideInputs((prev) => ({ ...prev, [key]: val }));
    }
  };

  return (
    <div className="relative flex flex-col shrink-0">
      {/* vertical toggle tab */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ x: open ? 2 : -2 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded-l-xl transition-all shadow-sm"
        style={{ backgroundColor: "#1a4a47", writingMode: "vertical-lr", textOrientation: "mixed" }}
        title={open ? "Hide AI Tools" : "Show AI Tools"}
      >
        <span className="rotate-180">⚡ AI Tools</span>
      </motion.button>

      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0,   opacity: 0 }}
            animate={{ width: 232, opacity: 1 }}
            exit={{    width: 0,   opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="absolute end-8 top-0 overflow-hidden z-20 bg-white border border-forest-100 rounded-2xl shadow-card-lg flex flex-col"
            style={{ maxHeight: "calc(100vh - 180px)" }}
          >
            {/* header */}
            <div className="px-4 py-3 border-b border-forest-100/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚡</span>
                <span className="text-sm font-semibold text-ink-900">AI Tools</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-700 hover:bg-cream-100 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* no lecture warning */}
            {!hasLecture && (
              <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 shrink-0">
                <p className="text-xs text-amber-700 font-medium">Upload a lecture to use AI tools</p>
              </div>
            )}

            {/* tool list */}
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {TOOLS.map((tool) => {
                const disabled = !hasLecture;
                return (
                  <div key={tool.key}>
                    {/* tool row */}
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                        ${disabled ? "opacity-40" : "hover:bg-cream-50"}`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{ backgroundColor: tool.color }}
                      >
                        {tool.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-ink-900 leading-tight">{tool.label}</p>
                        <p className="text-2xs text-ink-400">{tool.desc}</p>
                      </div>

                      {/* run button */}
                      {!tool.needsSlide && (
                        <motion.button
                          onClick={() => !disabled && handleTool(tool)}
                          disabled={disabled || loading}
                          whileHover={{ scale: disabled ? 1 : 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-40 transition-all"
                          style={{ backgroundColor: "#1a4a47" }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </motion.button>
                      )}
                    </div>

                    {/* slide number input row for explain / tldr */}
                    {tool.needsSlide && (
                      <div className="flex items-center gap-2 px-3 pb-2.5 -mt-1">
                        <input
                          type="number"
                          min="1"
                          value={slideInputs[tool.key]}
                          onChange={(e) => updateSlide(tool.key, e.target.value)}
                          placeholder="Slide #"
                          disabled={disabled}
                          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-forest-100 bg-cream-50 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-100 placeholder:text-ink-300 transition-all disabled:opacity-40"
                        />
                        <motion.button
                          onClick={() => !disabled && handleTool(tool)}
                          disabled={disabled || loading || !slideInputs[tool.key]}
                          whileHover={{ scale: disabled ? 1 : 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-40 transition-all"
                          style={{ backgroundColor: "#1a4a47" }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </motion.button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIToolsDropPanel;
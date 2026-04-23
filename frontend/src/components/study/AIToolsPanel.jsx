import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const Spinner = () => (
  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
    <path className="opacity-80" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

const ResultPanel = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{    opacity: 0, height: 0 }}
    transition={{ duration: 0.28, ease }}
    className="overflow-hidden"
  >
    <div className="mt-3 relative">
      <button
        onClick={onClose}
        className="absolute top-2 end-2 w-5 h-5 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-700 hover:bg-cream-200 transition-colors z-10"
      >
        <CloseIcon />
      </button>
      <div className="bg-cream-50 border border-forest-100 rounded-xl p-4 pe-7 text-sm text-ink-700 leading-relaxed max-h-60 overflow-y-auto">
        {children}
      </div>
    </div>
  </motion.div>
);

const ToolCard = ({ iconBg, icon, title, description, loading, hasResult, onRun, onClose, children, extra }) => (
  <div className="bg-white rounded-2xl border border-forest-100/70 p-4 hover:border-forest-200 hover:shadow-card transition-all duration-200">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900 leading-tight">{title}</p>
          <p className="text-xs text-ink-400 mt-0.5 leading-snug">{description}</p>
        </div>
      </div>
      <motion.button
        onClick={onRun}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.08 }}
        whileTap={{  scale: loading ? 1 : 0.92 }}
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 transition-all"
        style={{ backgroundColor: "#1a4a47" }}
      >
        {loading ? <Spinner /> : <ArrowIcon />}
      </motion.button>
    </div>

    {extra && !hasResult && <div className="mt-3">{extra}</div>}

    <AnimatePresence>
      {hasResult && (
        <ResultPanel onClose={onClose}>
          {children}
        </ResultPanel>
      )}
    </AnimatePresence>
  </div>
);

// flip card for flashcards
const Flashcard = ({ card, index }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => setFlipped(v => !v)}
      className="cursor-pointer select-none"
      style={{ perspective: 700 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.38 }}
        style={{ transformStyle: "preserve-3d", position: "relative", minHeight: 64 }}
      >
        <div className="absolute inset-0 flex items-center p-3 rounded-xl bg-forest-50 border border-forest-100" style={{ backfaceVisibility: "hidden" }}>
          <p className="text-xs font-medium text-forest-800">{card.front}</p>
        </div>
        <div className="absolute inset-0 flex items-center p-3 rounded-xl bg-gold-400/15 border border-gold-400/30" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <p className="text-xs text-ink-700">{card.back}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// recursive mind map
const MindNode = ({ node, depth = 0 }) => (
  <div className={depth > 0 ? "ms-4 border-s-2 border-forest-100 ps-3 mt-1.5" : ""}>
    <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium mb-1 ${
      depth === 0 ? "bg-forest-700 text-white" : depth === 1 ? "bg-forest-100 text-forest-800" : "bg-cream-200 text-ink-700"
    }`}>
      {node.label || node.central}
    </div>
    {node.children?.map(c  => <MindNode key={c.id}  node={c}  depth={depth + 1} />)}
    {node.branches?.map(b  => <MindNode key={b.id}  node={b}  depth={depth + 1} />)}
  </div>
);

const AIToolsPanel = ({
  currentSlide, loading,
  summary, explanation, flashcards, mindmap, glossary, tldr,
  onSummary, onExplain, onFlashcards, onMindmap, onGlossary, onTldr,
  clearTool,
}) => {
  const [explainNum, setExplainNum] = useState("");
  const [tldrNum,    setTldrNum]    = useState("");

  const sliderInput = (val, setVal, placeholder) => (
    <input
      type="number"
      min="1"
      value={val}
      onChange={e => setVal(e.target.value)}
      placeholder={placeholder}
      className="w-full text-xs px-3 py-2 rounded-xl border border-forest-100 bg-cream-50 outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100 placeholder:text-ink-300 transition-all"
    />
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <span className="text-gold-400 text-lg">⚡</span>
        <h2 className="font-display text-lg text-ink-900">AI Study Tools</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pe-1 min-h-0">

        {/* 1 — summarize */}
        <ToolCard
          iconBg="rgba(245,200,66,0.15)" icon={<SummaryIcon />}
          title="Summarize Lecture" description="Key takeaways from the entire lecture."
          loading={loading.summary} hasResult={!!summary}
          onRun={onSummary} onClose={() => clearTool("summary")}
        >
          <p className="font-semibold text-ink-800 mb-2">{summary?.title}</p>
          <p>{summary?.summary}</p>
        </ToolCard>

        {/* 2 — explain slide */}
        <ToolCard
          iconBg="rgba(26,74,71,0.08)" icon={<ExplainIcon />}
          title="Explain Slide" description="Clear breakdown of a specific slide."
          loading={loading.explanation} hasResult={!!explanation}
          onRun={() => onExplain(explainNum || currentSlide)}
          onClose={() => clearTool("explanation")}
          extra={sliderInput(explainNum, setExplainNum, `Current slide (${currentSlide})`)}
        >
          <p className="font-semibold text-ink-800 mb-2">Slide {explanation?.slide_number}</p>
          <p>{explanation?.explanation}</p>
        </ToolCard>

        {/* 3 — flashcards */}
        <ToolCard
          iconBg="rgba(239,68,68,0.08)" icon={<FlashcardIcon />}
          title="Generate Flashcards" description="Tap a card to flip it."
          loading={loading.flashcards} hasResult={!!flashcards}
          onRun={onFlashcards} onClose={() => clearTool("flashcards")}
        >
          <p className="text-xs text-ink-400 mb-3">Tap any card to flip ↩</p>
          <div className="space-y-2">
            {flashcards?.flashcards?.map((c, i) => <Flashcard key={c.id} card={c} index={i} />)}
          </div>
        </ToolCard>

        {/* 4 — mind map */}
        <ToolCard
          iconBg="rgba(59,130,246,0.08)" icon={<MindmapIcon />}
          title="Mind Map" description="Visual concept structure of the lecture."
          loading={loading.mindmap} hasResult={!!mindmap}
          onRun={onMindmap} onClose={() => clearTool("mindmap")}
        >
          {mindmap?.mindmap && <MindNode node={mindmap.mindmap} depth={0} />}
        </ToolCard>

        {/* 5 — glossary */}
        <ToolCard
          iconBg="rgba(168,85,247,0.08)" icon={<GlossaryIcon />}
          title="Key Terms & Glossary" description="Definitions for important terms."
          loading={loading.glossary} hasResult={!!glossary}
          onRun={onGlossary} onClose={() => clearTool("glossary")}
        >
          <div className="space-y-3">
            {glossary?.glossary?.map(item => (
              <div key={item.id} className="pb-3 border-b border-forest-100/60 last:border-0 last:pb-0">
                <p className="font-semibold text-forest-700 text-xs mb-1">{item.term}</p>
                <p className="text-xs text-ink-600 mb-1">{item.definition}</p>
                {item.example && <p className="text-xs text-ink-400 italic">e.g. {item.example}</p>}
                {item.slide_ref && (
                  <span className="inline-block mt-1 text-2xs px-2 py-0.5 rounded-full bg-forest-50 text-forest-600 border border-forest-100">
                    Slide {item.slide_ref}
                  </span>
                )}
              </div>
            ))}
          </div>
        </ToolCard>

        {/* 6 — TL;DR */}
        <ToolCard
          iconBg="rgba(245,200,66,0.12)" icon={<TldrIcon />}
          title="TL;DR" description="One sentence summary of a slide."
          loading={loading.tldr} hasResult={!!tldr}
          onRun={() => onTldr(tldrNum || currentSlide)}
          onClose={() => clearTool("tldr")}
          extra={sliderInput(tldrNum, setTldrNum, `Current slide (${currentSlide})`)}
        >
          <p className="text-xs text-ink-400 mb-2">Slide {tldr?.slide_number}</p>
          <p className="font-medium text-ink-800">"{tldr?.tldr}"</p>
        </ToolCard>
      </div>
    </div>
  );
};

// icons
const ArrowIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const CloseIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SummaryIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08d00" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const ExplainIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a4a47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const FlashcardIcon= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const MindmapIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><line x1="9.5" y1="10.5" x2="5.5" y2="7.5"/><line x1="14.5" y1="10.5" x2="18.5" y2="7.5"/><line x1="9.5" y1="13.5" x2="5.5" y2="16.5"/><line x1="14.5" y1="13.5" x2="18.5" y2="16.5"/></svg>;
const GlossaryIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const TldrIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08d00" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

export default AIToolsPanel;
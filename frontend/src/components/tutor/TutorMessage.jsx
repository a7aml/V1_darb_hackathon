import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── simple bold renderer ─────────────────────────────────────────────────────
const renderText = (text) => {
  if (!text) return null;
  return text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={j} className="font-semibold text-ink-900">{p.slice(2, -2)}</strong>
        : p
    );
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
};

// ─── single flip flashcard ────────────────────────────────────────────────────
const FlipCard = ({ card, index, isCurrent }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setFlipped((v) => !v)}
      className="cursor-pointer w-full select-none"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d", position: "relative", minHeight: 160 }}
      >
        {/* front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gold-400/30 bg-white shadow-sm"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-2xs font-bold tracking-widest uppercase text-forest-500 mb-3">QUESTION</p>
          <p className="text-base font-bold text-ink-900 text-center leading-snug">{card.front}</p>
          <p className="text-xs text-ink-300 mt-4 flex items-center gap-1">
            <span>👆</span> Hover to reveal answer
          </p>
          {card.slide_ref && (
            <span className="absolute bottom-3 end-3 text-2xs text-ink-300 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200">
              Slide {card.slide_ref}
            </span>
          )}
        </div>
        {/* back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-forest-700 shadow-sm"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-2xs font-bold tracking-widest uppercase text-forest-200 mb-3">ANSWER</p>
          <p className="text-sm text-white text-center leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── flashcard carousel ───────────────────────────────────────────────────────
const FlashcardsWidget = ({ flashcards }) => {
  const [index, setIndex] = useState(0);
  const total = flashcards?.length || 0;
  if (!total) return <p className="text-sm text-ink-400">No flashcards found.</p>;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* progress */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-forest-700">
          Card {index + 1} of {total}
        </p>
        <div className="flex items-center gap-1.5">
          {/* mini progress bar */}
          <div className="w-24 h-1.5 bg-cream-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-forest-700 rounded-full"
              animate={{ width: `${((index + 1) / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => Math.max(i - 1, 0)); }}
            disabled={index === 0}
            className="w-7 h-7 rounded-full border border-forest-200 flex items-center justify-center text-ink-500 hover:border-forest-600 transition-all disabled:opacity-30"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => Math.min(i + 1, total - 1)); }}
            disabled={index === total - 1}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30"
            style={{ backgroundColor: index === total - 1 ? "#c4c2be" : "#F5C842" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 16  }}
          animate={{ opacity: 1, x: 0   }}
          exit={{    opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          <FlipCard card={flashcards[index]} index={index} isCurrent />
        </motion.div>
      </AnimatePresence>

      {/* tag row */}
      {flashcards[index]?.front && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {flashcards[index].front.split(" ").filter((w) => w.length > 5).slice(0, 3).map((w, i) => (
            <span key={i} className="text-2xs font-medium text-forest-700 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full">
              #{w.replace(/[^a-zA-Z]/g, "")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── mind map SVG ─────────────────────────────────────────────────────────────
const MindMapWidget = ({ mindmap }) => {
  const [hovered, setHovered] = useState(null);
  if (!mindmap) return null;

  const branches = mindmap.branches || [];
  const cx = 220, cy = 160;
  const radius = 110;

  // place branches in a circle
  const positions = branches.map((b, i) => {
    const angle = (i / branches.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  return (
    <div className="w-full rounded-2xl border border-forest-100/60 bg-white overflow-hidden">
      <svg viewBox="0 0 440 320" className="w-full" style={{ maxHeight: 320 }}>
        {/* connecting lines */}
        {positions.map((pos, i) => (
          <motion.line
            key={i}
            x1={cx} y1={cy} x2={pos.x} y2={pos.y}
            stroke="#d0e4e2" strokeWidth="2" strokeDasharray="5,4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
          />
        ))}

        {/* branch nodes */}
        {branches.map((branch, i) => {
          const pos = positions[i];
          const isHovered = hovered === i;
          const w = 110, h = 38;

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
              <motion.rect
                x={pos.x - w / 2} y={pos.y - h / 2}
                width={w} height={h} rx={10}
                fill={isHovered ? "#1a4a47" : "#1a4a47"}
                opacity={isHovered ? 1 : 0.85}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: isHovered ? 1 : 0.85 }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.08 }}
              />
              <motion.text
                x={pos.x} y={pos.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="11" fontWeight="600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                {branch.label.length > 14 ? branch.label.slice(0, 14) + "…" : branch.label}
              </motion.text>
              {/* sub-label */}
              {branch.children?.[0] && (
                <motion.text
                  x={pos.x} y={pos.y + h / 2 + 12}
                  textAnchor="middle"
                  fill="#8a8782" fontSize="8" fontStyle="italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  {branch.children.slice(0, 2).map((c) => c.label).join(" · ").slice(0, 22)}
                </motion.text>
              )}
            </g>
          );
        })}

        {/* central node */}
        <motion.ellipse
          cx={cx} cy={cy} rx={62} ry={30}
          fill="#F5C842"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
        />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#1a1917" fontSize="12" fontWeight="700">
          {mindmap.central?.length > 16 ? mindmap.central.slice(0, 16) + "…" : mindmap.central}
        </text>
      </svg>

      {/* hovered branch detail */}
      <AnimatePresence>
        {hovered !== null && branches[hovered]?.children?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0 }}
            className="border-t border-forest-100/60 px-4 py-3 overflow-hidden bg-forest-50"
          >
            <p className="text-xs font-semibold text-forest-700 mb-1.5">{branches[hovered].label}</p>
            <div className="flex flex-wrap gap-1.5">
              {branches[hovered].children.map((c, i) => (
                <span key={i} className="text-xs text-ink-600 bg-white border border-forest-100 px-2.5 py-1 rounded-lg">
                  {c.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── TutorMessage ─────────────────────────────────────────────────────────────
const TutorMessage = ({ msg }) => {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-forest-700 flex items-center justify-center text-base shrink-0 mt-0.5">
          🎓
        </div>
      )}

      <div className={`flex flex-col gap-2 ${isUser ? "items-end max-w-[75%]" : "items-start max-w-[85%] w-full"}`}>

        {/* file attachment */}
        {msg.attachment && (
          <div className="rounded-2xl overflow-hidden border border-forest-100 bg-white shadow-sm">
            {msg.attachment.type === "image" && msg.attachment.preview
              ? <img src={msg.attachment.preview} alt="attachment" className="max-w-xs max-h-48 object-cover" />
              : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-lg">📄</div>
                  <div>
                    <p className="text-xs font-semibold text-ink-900 truncate max-w-[180px]">{msg.attachment.name}</p>
                    <p className="text-2xs text-ink-400">{(msg.attachment.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              )
            }
          </div>
        )}

        {/* rich tool content — flashcards / mindmap shown as widgets */}
        {msg.toolKey === "flashcards" && msg.toolData ? (
          <div className="w-full">
            <div className="px-4 py-3 bg-white border border-forest-100/60 rounded-2xl rounded-tl-sm shadow-sm mb-3">
              <p className="text-sm text-ink-700 leading-relaxed">{renderText(msg.text.split("\n\n")[0])}</p>
            </div>
            <FlashcardsWidget flashcards={msg.toolData?.flashcards} />
          </div>
        ) : msg.toolKey === "mindmap" && msg.toolData ? (
          <div className="w-full">
            <div className="px-4 py-3 bg-white border border-forest-100/60 rounded-2xl rounded-tl-sm shadow-sm mb-3">
              <p className="text-sm text-ink-700 leading-relaxed">{renderText(msg.text.split("\n\n")[0])}</p>
            </div>
            <MindMapWidget mindmap={msg.toolData?.mindmap} />
          </div>
        ) : (
          /* default text bubble */
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${isUser
                ? "text-ink-900 rounded-tr-sm"
                : msg.isError
                ? "bg-red-50 border border-red-100 text-red-700 rounded-tl-sm"
                : "bg-white border border-forest-100/60 text-ink-700 rounded-tl-sm shadow-sm"
              }`}
            style={isUser ? { backgroundColor: "#F5C842" } : {}}
          >
            {renderText(msg.text)}
          </div>
        )}

        {/* source slides */}
        {msg.source_slides?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-2xs text-ink-400">Sources:</span>
            {msg.source_slides.map((s) => (
              <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold text-forest-700 bg-forest-50 border border-forest-100">
                📑 Slide {s}
              </span>
            ))}
          </div>
        )}

        {/* timestamp */}
        <p className="text-2xs text-ink-300 px-1">
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-cream-200 border border-cream-300 flex items-center justify-center text-sm shrink-0 mt-0.5">👤</div>
      )}
    </motion.div>
  );
};

export { FlashcardsWidget, MindMapWidget };
export default TutorMessage;
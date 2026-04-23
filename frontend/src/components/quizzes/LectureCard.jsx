import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

// status derived from progress data
const getStatus = (progress) => {
  if (!progress) return { label: "Not Started", color: "#6b6b6b", bg: "rgba(107,107,107,0.12)" };
  const score = progress.best_score || 0;
  if (score >= 90)      return { label: "Mastered",    color: "#1a4a47", bg: "rgba(26,74,71,0.12)"   };
  if (score > 0)        return { label: "In Progress", color: "#2d9e96", bg: "rgba(45,158,150,0.15)" };
  return                       { label: "Not Started", color: "#6b6b6b", bg: "rgba(107,107,107,0.12)" };
};

const getActionLabel = (progress) => {
  if (!progress || !progress.best_score) return "Start Quiz";
  if (progress.best_score >= 90)         return "Retake Quiz";
  return "Resume Quiz";
};

// gradient covers per lecture — cycles through a set
const COVERS = [
  "linear-gradient(135deg, #1a4a47 0%, #2d8a84 100%)",
  "linear-gradient(135deg, #1e3a5f 0%, #2d6b9e 100%)",
  "linear-gradient(135deg, #4a1a47 0%, #8a2d84 100%)",
  "linear-gradient(135deg, #3a2a1a 0%, #8a6a2d 100%)",
  "linear-gradient(135deg, #1a3a1a 0%, #4a8a4a 100%)",
  "linear-gradient(135deg, #3a1a1a 0%, #8a4a2d 100%)",
];

const EMOJIS = ["🔬", "⚡", "🏛️", "🧬", "📐", "🌊", "🧠", "🚀", "🎯", "📊"];

const LectureCard = ({ lecture, progress, index, onStartQuiz }) => {
  const status      = getStatus(progress);
  const actionLabel = getActionLabel(progress);
  const cover       = COVERS[index % COVERS.length];
  const emoji       = EMOJIS[index % EMOJIS.length];
  const scorePercent = progress?.best_score || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, ease, delay: index * 0.07 }}
      className="bg-white rounded-2xl border border-forest-100/60 overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 group flex flex-col"
    >
      {/* cover image area */}
      <div
        className="relative h-32 flex items-center justify-center overflow-hidden"
        style={{ background: cover }}
      >
        {/* status badge */}
        <div
          className="absolute top-3 start-3 px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: status.bg, color: status.color, backdropFilter: "blur(4px)" }}
        >
          {status.label}
        </div>

        {/* decorative emoji */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
          className="text-4xl opacity-80"
        >
          {emoji}
        </motion.div>

        {/* slide count badge */}
        <div className="absolute bottom-3 end-3 text-2xs text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
          {lecture.total_slides} slides
        </div>
      </div>

      {/* content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-ink-900 mb-3 leading-snug line-clamp-2 flex-1">
          {lecture.title}
        </h3>

        {/* progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-2xs text-ink-400 mb-1">
            <span>Progress</span>
            <span className="font-semibold text-ink-600">{scorePercent}%</span>
          </div>
          <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: scorePercent >= 90 ? "#1a4a47" : scorePercent > 0 ? "#2d9e96" : "#e5e7eb" }}
              initial={{ width: 0 }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 0.8, ease, delay: 0.2 + index * 0.07 }}
            />
          </div>
        </div>

        {/* stats row */}
        {progress && (
          <div className="flex items-center gap-3 text-2xs text-ink-400 mb-3">
            <span>📊 {progress.total_sessions || 0} attempts</span>
            <span>⚡ {progress.total_xp || 0} XP</span>
          </div>
        )}

        {/* action button */}
        <motion.button
          onClick={() => onStartQuiz(lecture)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${scorePercent === 0
              ? "text-ink-900"
              : "border border-forest-200 text-forest-700 hover:bg-forest-50"
            }`}
          style={scorePercent === 0
            ? { backgroundColor: "#F5C842", boxShadow: "0 2px 8px rgba(245,200,66,0.3)" }
            : {}
          }
        >
          {actionLabel}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LectureCard;
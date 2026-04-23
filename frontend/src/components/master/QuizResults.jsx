import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

// ─── animated circular score ──────────────────────────────────────────────────
const ScoreCircle = ({ score }) => {
  const [displayed, setDisplayed] = useState(0);
  const radius      = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash  = (displayed / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const step = score / 60; // animate over ~60 frames
    const id = setInterval(() => {
      start += step;
      if (start >= score) { setDisplayed(score); clearInterval(id); }
      else setDisplayed(Math.round(start));
    }, 16);
    return () => clearInterval(id);
  }, [score]);

  const color = score >= 80 ? "#1a4a47" : score >= 60 ? "#F5C842" : "#ef4444";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg width="144" height="144" className="-rotate-90">
        {/* track */}
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        {/* progress */}
        <motion.circle
          cx="72" cy="72" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeDash }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl text-ink-900 leading-none">{displayed}%</span>
        <span className="text-2xs font-semibold tracking-widest uppercase text-ink-400 mt-0.5">Score</span>
      </div>
    </div>
  );
};

// ─── mastery card (right panel, dark teal) ────────────────────────────────────
const MasteryCard = ({ progress, lectureTitle }) => {
  const level = progress?.best_score || 0;
  const remaining = 100 - level;

  const getMessage = () => {
    if (level >= 90) return "You've mastered this lecture! 🏆";
    if (level >= 70) return `Only ${remaining}% left to unlock the Master Badge!`;
    if (level >= 50) return "Good progress — keep pushing!";
    return "Keep going — you're building a solid foundation.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0  }}
      transition={{ duration: 0.5, ease, delay: 0.3 }}
      className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{ backgroundColor: "#1a4a47" }}
    >
      {/* subtle wave bg */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-1">
          Lecture Mastery
        </p>
        <p className="font-display text-lg text-white leading-tight truncate">{lectureTitle}</p>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Best Score</span>
          <span className="text-sm font-bold text-white">{level}%</span>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "#F5C842" }}
            initial={{ width: 0 }}
            animate={{ width: `${level}%` }}
            transition={{ duration: 1, ease, delay: 0.5 }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Total XP</span>
          <span className="text-sm font-bold text-white">+{progress?.total_xp || 0} XP</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Attempts</span>
          <span className="text-sm font-bold text-white">{progress?.total_sessions || 1}</span>
        </div>
      </div>

      <p className="relative z-10 text-sm text-white/70 italic leading-relaxed">
        "{getMessage()}"
      </p>

      {level >= 90 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="relative z-10 w-full py-3 rounded-xl text-sm font-semibold text-forest-800 bg-white transition-all hover:bg-cream-100"
        >
          🏅 View Badge
        </motion.button>
      )}
    </motion.div>
  );
};

// ─── QuizResults ──────────────────────────────────────────────────────────────
const QuizResults = ({ result, progress, lectureTitle, onRetry, onViewMistakes }) => {
  const scorePercent = result ? Math.round((result.score / result.total) * 100) : 0;

  const getMessage = () => {
    if (scorePercent >= 90) return { emoji: "🎉", title: "Outstanding!", sub: "You're becoming a subject expert. Keep up that momentum!" };
    if (scorePercent >= 70) return { emoji: "🎯", title: "Incredible Progress!", sub: "You're on the right track. A little more practice and you'll ace it!" };
    if (scorePercent >= 50) return { emoji: "💪", title: "Good Effort!", sub: "You've got the basics down. Focus on the areas you missed." };
    return { emoji: "📚", title: "Keep Studying!", sub: "Review the slides and try again — every attempt makes you stronger." };
  };

  const msg = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6"
    >
      {/* left — score card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.5, ease }}
        className="auth-card p-8 flex flex-col items-center text-center"
      >
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-forest-200 to-transparent" />

        {/* emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ backgroundColor: "rgba(245,200,66,0.15)" }}
        >
          {msg.emoji}
        </motion.div>

        <h2 className="font-display text-2xl text-ink-900 mb-1">{msg.title}</h2>
        <p className="text-sm text-ink-500 mb-8 max-w-xs">{msg.sub}</p>

        {/* score circle */}
        <ScoreCircle score={scorePercent} />

        {/* stats row */}
        <div className="flex items-center gap-8 mt-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cream-100 border border-cream-200">
            <span className="text-base">⏱</span>
            <div className="text-left">
              <p className="text-xs text-ink-400">Time</p>
              <p className="text-sm font-semibold text-ink-700">
                {Math.floor((result?.time_taken || 0) / 60)}:{String((result?.time_taken || 0) % 60).padStart(2, "0")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400/10 border border-gold-400/20">
            <span className="text-base">⚡</span>
            <div className="text-left">
              <p className="text-xs text-ink-400">XP Earned</p>
              <p className="text-sm font-semibold text-ink-700">+{result?.xp_earned || 0} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-50 border border-forest-100">
            <span className="text-base">✅</span>
            <div className="text-left">
              <p className="text-xs text-ink-400">Correct</p>
              <p className="text-sm font-semibold text-ink-700">{result?.correct} / {result?.total / 10 * (result?.total / 10)}</p>
            </div>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex gap-3 mt-8 w-full max-w-sm">
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-ink-700 border border-forest-200 hover:bg-cream-100 transition-all"
          >
            Try Again
          </motion.button>
          <motion.button
            onClick={onViewMistakes}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-ink-900 transition-all"
            style={{ backgroundColor: "#F5C842", boxShadow: "0 2px 8px rgba(245,200,66,0.35)" }}
          >
            Review Mistakes
          </motion.button>
        </div>
      </motion.div>

      {/* right — mastery card */}
      <MasteryCard progress={progress} lectureTitle={lectureTitle} />
    </motion.div>
  );
};

export default QuizResults;
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

// ─── streak dots ──────────────────────────────────────────────────────────────
const StreakDots = ({ days = 5 }) => (
  <div className="flex gap-1">
    {Array.from({ length: 7 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.05, duration: 0.3, ease }}
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
        style={{
          backgroundColor: i < days ? "#1a4a47" : "#e5e7eb",
          color: i < days ? "white" : "#9ca3af",
        }}
      >
        {i < days ? "✓" : ""}
      </motion.div>
    ))}
  </div>
);

const HeroRecommendation = ({ dashboard, recommendation, topLecture, onStartQuiz }) => {
  const navigate = useNavigate();

  // pick the lecture with lowest avg score for recommendation
  const weakLecture = dashboard?.lectures?.reduce((prev, curr) =>
    (curr.average_score || 100) < (prev?.average_score || 100) ? curr : prev
  , null);

  const heroLecture = topLecture || weakLecture;
  const quizzesCompleted = dashboard?.total_quizzes || 0;
  const dailyGoal        = 3;
  const todayDone        = Math.min(quizzesCompleted % dailyGoal || 1, dailyGoal);

  // streak from localStorage
  const streak = (() => {
    try { return parseInt(localStorage.getItem("streak_days") || "0"); }
    catch { return 0; }
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 mb-8">

      {/* ── recommendation card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.5, ease }}
        className="relative overflow-hidden rounded-2xl border border-forest-100/60 bg-white p-6 flex items-start gap-6 shadow-card"
      >
        {/* background gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(26,74,71,0.04) 0%, rgba(245,200,66,0.06) 100%)" }} />

        <div className="relative z-10 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold tracking-widest uppercase text-forest-700 bg-forest-50 border border-forest-100 mb-3">
            ✨ Recommended for you
          </div>

          {heroLecture ? (
            <>
              <h2 className="font-display text-xl text-ink-900 mb-2 leading-tight">
                Boost your score in{" "}
                <span className="text-forest-700">{heroLecture.title}!</span>
              </h2>
              <p className="text-sm text-ink-500 leading-relaxed mb-5">
                {recommendation?.general_advice ||
                  `Based on your last quiz, a quick review will help you master this topic.`}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl text-ink-900 mb-2">Ready to test your knowledge?</h2>
              <p className="text-sm text-ink-500 mb-5">Upload a lecture and start a quiz to track your progress.</p>
            </>
          )}

          <motion.button
            onClick={() => heroLecture ? onStartQuiz(heroLecture) : navigate("/ai-tutor")}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-ink-900 transition-all"
            style={{ backgroundColor: "#F5C842", boxShadow: "0 3px 10px rgba(245,200,66,0.4)" }}
          >
            {heroLecture ? "Take Quiz Now ⚡" : "Upload Lecture →"}
          </motion.button>
        </div>

        {/* illustration */}
        <div className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-forest-100 bg-forest-50 flex items-center justify-center text-5xl shadow-sm">
          📚
        </div>
      </motion.div>

      {/* ── daily goal + streak ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        {/* daily goal */}
        <div className="bg-white rounded-2xl border border-forest-100/60 p-5 shadow-card flex-1">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3">Daily Goal</p>
          <p className="text-sm font-medium text-ink-900 mb-3">
            {todayDone}/{dailyGoal} Quizzes Completed
          </p>
          <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden mb-1">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "#1a4a47" }}
              initial={{ width: 0 }}
              animate={{ width: `${(todayDone / dailyGoal) * 100}%` }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
            />
          </div>
          <p className="text-2xs text-ink-400">
            {todayDone >= dailyGoal ? "🎉 Goal achieved!" : `${dailyGoal - todayDone} more to reach your goal`}
          </p>
        </div>

        {/* streak */}
        <div className="bg-white rounded-2xl border border-forest-100/60 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔥</span>
            <p className="text-sm font-semibold text-ink-900">Streak!</p>
          </div>
          <p className="text-xs text-ink-500 mb-3">
            {streak > 0
              ? `You've studied for ${streak} day${streak !== 1 ? "s" : ""} in a row. Keep it up!`
              : "Start studying today to begin your streak!"}
          </p>
          <StreakDots days={streak} />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroRecommendation;
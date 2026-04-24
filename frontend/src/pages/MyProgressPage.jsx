import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAssessmentDashboard, getLectureProgress, getAllLectures, getQuizHistory } from "../api/progress";
import { getUser } from "../utils/storage";

const ease = [0.22, 1, 0.36, 1];

// ─── helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (s) => {
  if (s >= 85) return { bar: "#1a4a47", text: "#1a4a47", bg: "rgba(26,74,71,0.10)" };
  if (s >= 65) return { bar: "#F5C842", text: "#b08d00", bg: "rgba(245,200,66,0.12)" };
  return               { bar: "#ef4444", text: "#ef4444", bg: "rgba(239,68,68,0.10)" };
};

const getTitle = (avg) => {
  if (avg >= 90) return { title: "Learning Legend! 🏆",    badge: "Excellent Retention",  sub: "You're mastering everything you touch. Incredible work!" };
  if (avg >= 75) return { title: "Rising Scholar! 🎯",     badge: "Strong Performance",   sub: "Your recall is consistently improving. Keep the momentum going!" };
  if (avg >= 60) return { title: "Steady Climber! 📈",     badge: "Good Progress",        sub: "You're building solid foundations. Every session counts!" };
  return               { title: "Just Getting Started 💪", badge: "Keep Going",           sub: "Every expert started as a beginner. You've got this!" };
};

const getLearnerBadges = (dashboard) => {
  const badges = [];
  if ((dashboard?.total_quizzes || 0) >= 5)  badges.push("Active Learner");
  if ((dashboard?.average_score  || 0) >= 80) badges.push("High Achiever");
  if ((dashboard?.total_xp       || 0) >= 200) badges.push("XP Master");
  if ((dashboard?.total_lectures || 0) >= 3)  badges.push("Multi-Subject");
  if (badges.length === 0) badges.push("Getting Started");
  return badges;
};

const streak = () => {
  try { return parseInt(localStorage.getItem("streak_days") || "0"); }
  catch { return 0; }
};

// ─── animated score circle ────────────────────────────────────────────────────
const ScoreCircle = ({ score, size = 120 }) => {
  const [displayed, setDisplayed] = useState(0);
  const r = (size / 2) - 12;
  const circ = 2 * Math.PI * r;
  const dash  = (displayed / 100) * circ;
  const col   = scoreColor(score);

  useEffect(() => {
    let cur = 0;
    const step = score / 60;
    const id = setInterval(() => {
      cur += step;
      if (cur >= score) { setDisplayed(score); clearInterval(id); }
      else setDisplayed(Math.round(cur));
    }, 16);
    return () => clearInterval(id);
  }, [score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="10"/>
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={col.bar} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl text-ink-900 leading-none">{displayed}%</span>
        <span className="text-2xs font-bold tracking-widest uppercase text-ink-400 mt-0.5">Score</span>
      </div>
    </div>
  );
};

// ─── subject mastery bar ──────────────────────────────────────────────────────
const MasteryBar = ({ title, score, index }) => {
  const col = scoreColor(score);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1,  x:  0  }}
      transition={{ duration: 0.4, ease, delay: index * 0.08 }}
      className="mb-4 last:mb-0"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-ink-800 truncate max-w-[180px]">{title}</span>
        <span className="text-sm font-bold ms-3 shrink-0" style={{ color: col.text }}>{score}%</span>
      </div>
      <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: col.bar }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease, delay: 0.2 + index * 0.08 }}
        />
      </div>
    </motion.div>
  );
};

// ─── session card ─────────────────────────────────────────────────────────────
const SessionCard = ({ attempt, index }) => {
  const stars = Math.round((attempt.score / 100) * 5);
  const timeLabel = (() => {
    const d = new Date(attempt.date);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0   }}
      transition={{ duration: 0.35, ease, delay: index * 0.08 }}
      className="bg-cream-50 border border-forest-100/60 rounded-2xl p-4 hover:shadow-card transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-xl bg-white border border-forest-100 flex items-center justify-center text-sm">
          {attempt.type === "mcq" ? "🔤" : "✓✗"}
        </div>
        <span className="text-2xs text-ink-400">{timeLabel}</span>
      </div>
      <p className="text-sm font-semibold text-ink-900 mb-1 leading-snug">{attempt.lectureTitle || "Quiz"}</p>
      <p className="text-2xs text-ink-400 mb-3">
        {attempt.correct || 0} correct · {attempt.xp_earned || 0} XP · {attempt.difficulty}
      </p>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24"
            fill={i < stars ? "#F5C842" : "none"}
            stroke={i < stars ? "#F5C842" : "#d1d0cc"} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
        <span className="text-2xs text-ink-400 ms-1.5">{attempt.score}%</span>
      </div>
    </motion.div>
  );
};

// ─── stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0   }}
    transition={{ duration: 0.4, ease, delay }}
    className="bg-white rounded-2xl border border-forest-100/60 p-5 shadow-sm flex flex-col items-center text-center"
  >
    <div className="text-2xl mb-2">{icon}</div>
    <p className="font-display text-2xl leading-none mb-1" style={{ color }}>{value}</p>
    <p className="text-xs text-ink-400">{label}</p>
  </motion.div>
);

// ─── MyProgressPage ───────────────────────────────────────────────────────────
const MyProgressPage = () => {
  const navigate  = useNavigate();
  const user      = getUser();
  const [dashboard,  setDashboard]  = useState(null);
  const [lectures,   setLectures]   = useState([]);
  const [masteries,  setMasteries]  = useState([]); // [{ title, score }]
  const [sessions,   setSessions]   = useState([]); // flat history
  const [loading,    setLoading]    = useState(true);
  const [showAll,    setShowAll]    = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dash, lectureData] = await Promise.all([
          getAssessmentDashboard(),
          getAllLectures(),
        ]);
        setDashboard(dash);
        const list = lectureData.lectures || [];
        setLectures(list);

        // fetch progress + history for each lecture in parallel
        const [progressResults, historyResults] = await Promise.all([
          Promise.allSettled(list.map((l) => getLectureProgress(l.id).then((d) => ({ id: l.id, title: l.title, score: d.best_score || d.average_score || 0 })))),
          Promise.allSettled(list.slice(0, 8).map((l) => getQuizHistory(l.id).then((d) => (d.attempts || []).map((a) => ({ ...a, lectureId: l.id, lectureTitle: l.title }))))),
        ]);

        const mast = progressResults.filter((r) => r.status === "fulfilled").map((r) => r.value).filter((m) => m.score > 0);
        setMasteries(mast);

        const flat = historyResults.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
        flat.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSessions(flat);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const avgScore   = dashboard?.average_score || 0;
  const titleInfo  = getTitle(avgScore);
  const badges     = getLearnerBadges(dashboard);
  const streakDays = streak();
  const shownSessions = showAll ? sessions : sessions.slice(0, 4);

  // ── PDF report download (simple text) ──────────────────────────────────────
  const downloadReport = () => {
    const lines = [
      `Study GPT — Progress Report`,
      `Student: ${user?.full_name || "Student"}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      ``,
      `─── Overall Stats ───`,
      `Average Score: ${dashboard?.average_score || 0}%`,
      `Best Score: ${dashboard?.best_score || 0}%`,
      `Total Quizzes: ${dashboard?.total_quizzes || 0}`,
      `Total XP: ${dashboard?.total_xp || 0}`,
      ``,
      `─── Subject Mastery ───`,
      ...masteries.map((m) => `${m.title}: ${m.score}%`),
      ``,
      `─── Recent Sessions ───`,
      ...sessions.slice(0, 10).map((s) => `${s.lectureTitle} — ${s.score}% (${s.date})`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "study-gpt-progress-report.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0,1,2].map((i) => (
              <motion.div key={i} className="w-3 h-3 rounded-full bg-forest-400"
                animate={{ y: [0,-10,0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i*0.15 }} />
            ))}
          </div>
          <p className="text-sm text-ink-400">Loading your progress…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 pb-20">
      <div className="max-w-6xl mx-auto px-5 md:px-10 pt-8">

        {/* page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-4xl text-ink-900 leading-tight">Your Progress Dashboard</h1>
            <p className="text-sm text-ink-500 mt-1">
              {user?.full_name ? `Hey ${user.full_name.split(" ")[0]},` : ""} you're doing amazing! Let's see how much you've grown.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              onClick={downloadReport}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-700 border border-forest-200 bg-white hover:bg-cream-50 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Report
            </motion.button>
            <motion.button
              onClick={() => navigate("/quizzes")}
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-900 transition-all"
              style={{ backgroundColor: "#F5C842", boxShadow: "0 2px 8px rgba(245,200,66,0.35)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Start New Session
            </motion.button>
          </div>
        </motion.div>

        {/* ── top stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon="📚" value={dashboard?.total_lectures || 0}  label="Lectures Studied" color="#1a4a47" delay={0}    />
          <StatCard icon="🎯" value={dashboard?.total_quizzes  || 0}  label="Quizzes Taken"    color="#1a4a47" delay={0.07} />
          <StatCard icon="⚡" value={`${dashboard?.total_xp || 0}`}   label="Total XP"         color="#b08d00" delay={0.14} />
          <StatCard icon="🏆" value={`${dashboard?.average_score || 0}%`} label="Avg Score"    color="#1a4a47" delay={0.21} />
        </div>

        {/* ── hero section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5 mb-6">

          {/* main achievement card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="relative bg-white rounded-3xl border border-forest-100/60 p-8 shadow-card overflow-hidden flex items-center gap-8"
          >
            {/* bg gradient */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(26,74,71,0.04) 0%, rgba(245,200,66,0.05) 100%)" }} />

            {/* score circle */}
            <div className="relative z-10 shrink-0">
              <ScoreCircle score={avgScore} size={130} />
            </div>

            {/* text */}
            <div className="relative z-10 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold tracking-wider text-forest-700 bg-forest-50 border border-forest-100 mb-3">
                ✨ {titleInfo.badge}
              </div>
              <h2 className="font-display text-3xl text-ink-900 mb-2 leading-tight">
                You're a {titleInfo.title}
              </h2>
              <p className="text-sm text-ink-500 leading-relaxed mb-4 max-w-sm">
                {titleInfo.sub}
              </p>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span key={b} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-forest-700 bg-forest-50 border border-forest-100">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* decorative brain illustration */}
            <div className="hidden lg:flex relative z-10 w-20 h-20 rounded-2xl bg-cream-100 border border-cream-200 items-center justify-center text-4xl shrink-0 opacity-60">
              🧠
            </div>
          </motion.div>

          {/* streak card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.1 }}
            className="relative rounded-3xl p-6 flex flex-col items-center justify-center text-center overflow-hidden"
            style={{ background: "linear-gradient(145deg, #ffe4d6 0%, #ffd1bd 100%)", border: "1px solid rgba(255,150,100,0.2)" }}
          >
            <div className="text-3xl mb-2">🔥</div>
            <p className="font-display text-5xl text-ink-900 leading-none mb-1">{streakDays}</p>
            <p className="text-sm font-semibold text-ink-700 mb-3">Days<br/>Mastery Streak</p>
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: Math.min(streakDays, 5) }).map((_, i) => (
                <motion.div key={i} className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#ef8c5a" }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
                />
              ))}
            </div>
            <p className="text-xs text-ink-500 italic">
              {streakDays > 0 ? '"Consistency is the key to brilliance!"' : "Start your streak today!"}
            </p>
          </motion.div>
        </div>

        {/* ── subject mastery + recent sessions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* subject mastery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="bg-white rounded-3xl border border-forest-100/60 p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-ink-900">Subject Mastery</h2>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8782" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>

            {masteries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-ink-400 text-sm">Take some quizzes to track your mastery per subject.</p>
              </div>
            ) : (
              masteries.map((m, i) => (
                <MasteryBar key={m.id} title={m.title} score={m.score} index={i} />
              ))
            )}

            {lectures.length > 0 && masteries.length < lectures.length && (
              <p className="text-2xs text-ink-300 mt-4 text-center">
                {lectures.length - masteries.length} lecture{lectures.length - masteries.length !== 1 ? "s" : ""} not yet attempted
              </p>
            )}
          </motion.div>

          {/* recent sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.15 }}
            className="bg-white rounded-3xl border border-forest-100/60 p-6 shadow-card flex flex-col"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-ink-900">Recent Sessions</h2>
              {sessions.length > 4 && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="text-xs font-semibold text-forest-700 hover:underline underline-offset-2 transition-colors"
                >
                  {showAll ? "Show Less" : "View All →"}
                </button>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-ink-400 text-sm">No sessions yet. Take your first quiz!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <AnimatePresence>
                  {shownSessions.map((s, i) => (
                    <SessionCard key={s.session_id} attempt={s} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── CTA banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden p-10 flex items-center justify-between gap-8"
          style={{ background: "linear-gradient(135deg, #d4f0ed 0%, #a8e0d8 40%, #c8e8b0 100%)" }}
        >
          {/* bg decoration */}
          <div className="absolute end-0 top-0 bottom-0 w-48 opacity-15 pointer-events-none flex items-center justify-center text-[8rem]">
            🚀
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-3xl text-forest-900 mb-2">Ready to level up?</h2>
            <p className="text-sm text-forest-800/70 max-w-sm leading-relaxed">
              {avgScore >= 80
                ? "You're on fire! Challenge yourself with harder quizzes to push your score even higher."
                : "Take another quiz to boost your score and climb the leaderboard. Every session brings you closer!"}
            </p>
          </div>

          <motion.button
            onClick={() => navigate("/quizzes")}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="relative z-10 shrink-0 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all shadow-lg"
            style={{ backgroundColor: "#1a4a47", boxShadow: "0 6px 20px rgba(26,74,71,0.35)" }}
          >
            {avgScore >= 80 ? "Try Hard Mode 🔥" : "Start Quiz →"}
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
};

export default MyProgressPage;
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const scoreColor = (score) => {
  if (score >= 80) return { text: "#1a4a47", bg: "rgba(26,74,71,0.10)" };
  if (score >= 60) return { text: "#b08d00", bg: "rgba(245,200,66,0.15)" };
  return                   { text: "#ef4444", bg: "rgba(239,68,68,0.10)" };
};

// ─── result detail modal ──────────────────────────────────────────────────────
const ResultModal = ({ result, recommendations, onClose, loading }) => {
  if (!result) return null;
  const wrong = result.questions?.filter((q) => !q.is_correct) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl border border-forest-100 shadow-card-lg overflow-hidden flex flex-col"
        style={{ maxHeight: "85vh" }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-forest-100/60 shrink-0">
          <div>
            <h2 className="font-display text-xl text-ink-900">Quiz Results</h2>
            <p className="text-xs text-ink-400 mt-0.5">
              {result.correct} correct · {result.wrong} wrong · {Math.floor((result.time_taken || 0) / 60)}m {(result.time_taken || 0) % 60}s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="px-4 py-2 rounded-xl text-lg font-bold"
              style={scoreColor(result.score)}
            >
              {result.score}%
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-cream-100 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* XP earned */}
          <div className="flex items-center gap-3 p-4 bg-gold-400/10 border border-gold-400/20 rounded-2xl">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm font-semibold text-ink-900">+{result.xp_earned || 0} XP Earned</p>
              <p className="text-xs text-ink-400">Keep going to earn more!</p>
            </div>
          </div>

          {/* general advice */}
          {recommendations?.general_advice && (
            <div className="p-4 bg-forest-50 border border-forest-100 rounded-2xl">
              <p className="text-xs font-semibold text-forest-700 mb-1">🤖 AI Advice</p>
              <p className="text-sm text-ink-700 leading-relaxed">{recommendations.general_advice}</p>
              {recommendations.suggested_actions?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {recommendations.suggested_actions.map((a, i) => (
                    <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5">
                      <span className="text-forest-500 mt-0.5">→</span> {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* wrong questions */}
          {wrong.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-ink-900 mb-3">
                Mistakes to Review ({wrong.length})
              </p>
              <div className="space-y-3">
                {wrong.map((q, i) => {
                  const rec = recommendations?.weak_topics?.find(
                    (t) => t.slide_number === q.slide_ref
                  );
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-3"
                    >
                      {/* question */}
                      <div className="bg-white border border-forest-100/60 rounded-2xl p-4">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-2xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                            ✗ Wrong
                          </span>
                          {q.slide_ref && (
                            <span className="text-2xs text-ink-400 bg-cream-100 border border-cream-200 px-2.5 py-1 rounded-full">
                              Slide {q.slide_ref}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-ink-900 mb-3 leading-snug">{q.question}</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 text-xs">
                            <span className="text-red-400">✗ Yours:</span>
                            <span className="font-bold text-red-600">{q.student_answer}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-50 border border-forest-100 text-xs">
                            <span className="text-forest-500">✓ Correct:</span>
                            <span className="font-bold text-forest-700">{q.correct_answer}</span>
                          </div>
                        </div>
                        {rec?.recommendation && (
                          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl border-s-4 border-red-400 bg-red-50/60">
                            <span className="text-sm">🤖</span>
                            <p className="text-xs text-red-700 italic leading-relaxed">{rec.recommendation}</p>
                          </div>
                        )}
                      </div>

                      {/* slide ref */}
                      {q.slide_ref && (
                        <div className="bg-cream-50 border border-cream-200 rounded-2xl p-4 flex flex-col justify-between">
                          <div>
                            <p className="text-xs text-ink-400 mb-1">Found on</p>
                            <p className="text-sm font-semibold text-ink-800">Slide {q.slide_ref}</p>
                            {rec?.topic && <p className="text-xs text-ink-500 mt-0.5">"{rec.topic}"</p>}
                          </div>
                          <div
                            className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-white text-center"
                            style={{ backgroundColor: "#2d9e96" }}
                          >
                            📑 Revise Slide {q.slide_ref}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {wrong.length === 0 && (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🎯</p>
              <p className="font-display text-lg text-forest-700">Perfect score!</p>
              <p className="text-sm text-ink-400">You got everything right.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── RecentResults ────────────────────────────────────────────────────────────
const RecentResults = ({ history, loading, onOpenResult, selectedResult, recommendations, onClose, resultLoading }) => {
  const shown = history.slice(0, 10);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink-900">Recent Results</h2>
          {loading.history && (
            <svg className="animate-spin w-4 h-4 text-forest-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
        </div>

        {shown.length === 0 && !loading.history ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-forest-100/60">
            <p className="text-ink-400 text-sm">No quiz attempts yet. Take a quiz to see results here!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-forest-100/60 overflow-hidden shadow-sm">
            {/* table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-forest-100/40 bg-cream-50">
              {["Quiz Topic", "Date", "Score", "Action"].map((h) => (
                <p key={h} className="text-2xs font-bold tracking-widest uppercase text-ink-400">{h}</p>
              ))}
            </div>

            {/* rows */}
            <div className="divide-y divide-forest-100/30">
              {shown.map((attempt, i) => {
                const sc = scoreColor(attempt.score);
                return (
                  <motion.div
                    key={attempt.session_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-cream-50/60 transition-colors"
                  >
                    {/* topic */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-sm shrink-0">
                        {attempt.type === "mcq" ? "🔤" : "✓✗"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">{attempt.lectureTitle || "Lecture"}</p>
                        <p className="text-2xs text-ink-400 capitalize">{attempt.type} · {attempt.difficulty}</p>
                      </div>
                    </div>

                    {/* date */}
                    <p className="text-xs text-ink-500">
                      {attempt.date ? new Date(attempt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </p>

                    {/* score */}
                    <div>
                      <span className="px-3 py-1.5 rounded-xl text-sm font-bold" style={sc}>
                        {attempt.score}%
                      </span>
                    </div>

                    {/* action */}
                    <button
                      onClick={() => onOpenResult(attempt.session_id, attempt.lectureId)}
                      className="text-xs font-semibold text-forest-700 hover:text-forest-800 hover:underline underline-offset-2 transition-colors text-start"
                    >
                      {resultLoading ? "Loading…" : "Review Mistakes →"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* result modal */}
      <AnimatePresence>
        {selectedResult && (
          <ResultModal
            result={selectedResult}
            recommendations={recommendations[selectedResult.lectureId]}
            onClose={onClose}
            loading={resultLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default RecentResults;
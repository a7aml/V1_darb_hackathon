import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useQuiz        from "../hooks/useQuiz";
import QuizSetup      from "../components/master/QuizSetup";
import QuizQuestion   from "../components/master/QuizQuestion";
import QuizResults    from "../components/master/QuizResults";
import MistakeAnalysis from "../components/master/MistakeAnalysis";
import ProcessingOverlay from "../components/ui/ProcessingOverlay";

const ease = [0.22, 1, 0.36, 1];

// ─── active quiz view ─────────────────────────────────────────────────────────
const ActiveQuiz = ({ quizData, answers, onAnswer, onSubmit, submitting }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const questions    = quizData?.questions || [];
  const total        = questions.length;
  const current      = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered   = answeredCount === total;

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.45, ease }}
      className="max-w-2xl mx-auto"
    >
      {/* progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-ink-400 mb-2">
          <span>{answeredCount} of {total} answered</span>
          <span>{Math.round((answeredCount / total) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-forest-700"
            animate={{ width: `${(answeredCount / total) * 100}%` }}
            transition={{ duration: 0.4, ease }}
          />
        </div>
      </div>

      {/* question card */}
      <div className="auth-card p-7 mb-5 min-h-[320px] flex flex-col justify-between">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-forest-200 to-transparent" />

        <AnimatePresence mode="wait">
          {current && (
            <QuizQuestion
              key={current.id}
              question={current}
              index={currentIndex}
              total={total}
              selectedAnswer={answers[current.id]}
              onAnswer={onAnswer}
            />
          )}
        </AnimatePresence>
      </div>

      {/* navigation */}
      <div className="flex items-center justify-between gap-3">
        <motion.button
          onClick={goPrev}
          disabled={currentIndex === 0}
          whileHover={{ scale: currentIndex === 0 ? 1 : 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-ink-600 border border-forest-200 hover:bg-cream-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </motion.button>

        {/* question dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center flex-1">
          {questions.map((q, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrentIndex(i)}
              whileHover={{ scale: 1.2 }}
              className="transition-all duration-200"
            >
              <motion.div
                animate={{
                  width:           i === currentIndex ? 20 : 8,
                  backgroundColor: answers[q.id]
                    ? "#1a4a47"
                    : i === currentIndex
                    ? "#F5C842"
                    : "#d1d0cc",
                }}
                transition={{ duration: 0.2 }}
                className="h-2 rounded-full"
              />
            </motion.button>
          ))}
        </div>

        {currentIndex < total - 1 ? (
          <motion.button
            onClick={goNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-ink-900 transition-all"
            style={{ backgroundColor: "#F5C842" }}
          >
            Next →
          </motion.button>
        ) : (
          <motion.button
            onClick={onSubmit}
            disabled={!allAnswered || submitting}
            whileHover={{ scale: !allAnswered || submitting ? 1 : 1.02, y: !allAnswered || submitting ? 0 : -1 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-ink-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#F5C842", boxShadow: allAnswered ? "0 2px 8px rgba(245,200,66,0.4)" : "none" }}
          >
            {submitting ? "Submitting…" : allAnswered ? "Submit Quiz ✓" : `${total - answeredCount} left`}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ─── MasterPage ───────────────────────────────────────────────────────────────
const MasterPage = ({ lecture, onReviseSlide }) => {
  const [showMistakes, setShowMistakes] = useState(false);

  const {
    phase, quizData, answers, result, detailedResult,
    progress, recommendations, loading,
    generate, answerQuestion, submit, reset,
    fetchProgress, fetchRecommendations,
  } = useQuiz(lecture?.id);

  // fetch progress on mount
  useEffect(() => {
    if (lecture?.id) fetchProgress();
  }, [lecture?.id]);

  const handleReviseSlide = (slideNumber) => {
    // go back to learn view at specific slide
    onReviseSlide?.(slideNumber);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">

        {/* ── setup ── */}
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuizSetup
              onGenerate={generate}
              loading={loading.generate}
              lectureTitle={lecture?.title}
            />

            {/* quiz history */}
            {progress && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ duration: 0.4, ease, delay: 0.2 }}
                className="max-w-lg mx-auto mt-6 p-5 bg-white rounded-2xl border border-forest-100/60"
              >
                <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3">Your Progress</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Best Score",  value: `${progress.best_score}%`,   icon: "🏆" },
                    { label: "Avg Score",   value: `${progress.average_score}%`, icon: "📊" },
                    { label: "Total XP",    value: `+${progress.total_xp}`,     icon: "⚡" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 bg-cream-50 rounded-xl border border-cream-200">
                      <div className="text-xl mb-1">{stat.icon}</div>
                      <p className="text-sm font-bold text-ink-900">{stat.value}</p>
                      <p className="text-xs text-ink-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── active quiz ── */}
        {phase === "active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0  }}
            exit={{    opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease }}
          >
            <ActiveQuiz
              quizData={quizData}
              answers={answers}
              onAnswer={answerQuestion}
              onSubmit={submit}
              submitting={loading.submit}
            />
          </motion.div>
        )}

        {/* ── results ── */}
        {phase === "results" && !showMistakes && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1   }}
            exit={{    opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.45, ease }}
          >
            <QuizResults
              result={result}
              progress={progress}
              lectureTitle={lecture?.title}
              onRetry={() => { reset(); }}
              onViewMistakes={() => setShowMistakes(true)}
            />
          </motion.div>
        )}

        {/* ── mistake analysis ── */}
        {phase === "results" && showMistakes && (
          <motion.div
            key="mistakes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease }}
          >
            {/* back to results */}
            <button
              onClick={() => setShowMistakes(false)}
              className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-forest-700 transition-colors mb-5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Results
            </button>

            <MistakeAnalysis
              detailedResult={detailedResult}
              recommendations={recommendations}
              loading={loading}
              onReviseSlide={handleReviseSlide}
              onFetchRecommendations={fetchRecommendations}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* overlays */}
      <ProcessingOverlay visible={loading.generate} type="quiz" />
      <ProcessingOverlay visible={loading.submit}   type="summary"    />
    </div>
  );
};

export default MasterPage;
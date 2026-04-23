import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const MCQ_LABELS = ["A", "B", "C", "D"];

// ─── single mistake card ──────────────────────────────────────────────────────
const MistakeCard = ({ item, index, recommendations, onReviseSlide }) => {
  // find a recommendation matching this slide if available
  const rec = recommendations?.weak_topics?.find(
    (t) => t.slide_number === item.slide_ref
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, ease, delay: index * 0.08 }}
      className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4"
    >
      {/* left — question + AI insight */}
      <div className="bg-white rounded-2xl border border-forest-100/70 p-5 hover:shadow-card transition-all duration-200">
        {/* question meta */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
            Question {item.question_id}
          </span>
          {rec?.topic && (
            <span className="text-xs text-ink-400 bg-cream-100 border border-cream-200 px-2.5 py-1 rounded-full">
              {rec.topic}
            </span>
          )}
        </div>

        {/* question text */}
        <p className="text-sm font-semibold text-ink-900 mb-4 leading-relaxed">
          {item.question}
        </p>

        {/* your answer vs correct */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100">
            <span className="text-xs text-red-400">✗ Your answer:</span>
            <span className="text-xs font-bold text-red-600">{item.student_answer}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-50 border border-forest-100">
            <span className="text-xs text-forest-500">✓ Correct:</span>
            <span className="text-xs font-bold text-forest-700">{item.correct_answer}</span>
          </div>
        </div>

        {/* AI insight */}
        {rec?.recommendation && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border-s-4 border-red-400 bg-red-50/60">
            <span className="text-base mt-0.5">🤖</span>
            <div>
              <span className="text-xs font-bold text-red-700">AI Insight: </span>
              <span className="text-xs text-red-700 italic leading-relaxed">{rec.recommendation}</span>
            </div>
          </div>
        )}
      </div>

      {/* right — slide reference */}
      {item.slide_ref && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0  }}
          transition={{ duration: 0.4, ease, delay: index * 0.08 + 0.1 }}
          className="bg-cream-100 rounded-2xl border border-cream-200 p-5 flex flex-col justify-between"
        >
          <div>
            <p className="text-xs text-ink-400 mb-1">Found on</p>
            <p className="text-sm font-semibold text-ink-800 leading-snug">
              Slide {item.slide_ref}
              {rec?.topic && (
                <span className="block text-xs font-normal text-ink-500 mt-0.5">
                  "{rec.topic}"
                </span>
              )}
            </p>
          </div>
          <motion.button
            onClick={() => onReviseSlide(item.slide_ref)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white mt-4 transition-all"
            style={{ backgroundColor: "#2d9e96" }}
          >
            <BookIcon />
            Revise Slide {item.slide_ref}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ─── MistakeAnalysis ──────────────────────────────────────────────────────────
const MistakeAnalysis = ({
  detailedResult,
  recommendations,
  loading,
  onReviseSlide,
  onFetchRecommendations,
}) => {
  const wrongQuestions = detailedResult?.questions?.filter((q) => !q.is_correct) || [];
  const wrongCount     = wrongQuestions.length;

  useEffect(() => {
    // auto-fetch recommendations when we have wrong questions
    if (wrongCount > 0 && !recommendations && !loading.recommend) {
      onFetchRecommendations();
    }
  }, [wrongCount]);

  if (loading.result) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-forest-400"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <p className="text-sm text-ink-400">Loading your results…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, ease }}
    >
      {/* header bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AnalysisIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Mistake Analysis & AI Revision</p>
            {recommendations?.general_advice && (
              <p className="text-xs text-ink-400 mt-0.5 max-w-md">{recommendations.general_advice}</p>
            )}
          </div>
        </div>
        <span className="text-xs font-medium text-ink-500 bg-cream-100 border border-cream-200 px-3 py-1.5 rounded-full">
          {wrongCount} {wrongCount === 1 ? "question" : "questions"} to review
        </span>
      </div>

      {wrongCount === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-2xl border border-forest-100/60"
        >
          <div className="text-4xl mb-3">🎯</div>
          <p className="font-display text-xl text-forest-700 mb-2">Perfect Score!</p>
          <p className="text-sm text-ink-400">You got everything right. Impressive!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {wrongQuestions.map((item, i) => (
            <MistakeCard
              key={item.question_id}
              item={item}
              index={i}
              recommendations={recommendations}
              onReviseSlide={onReviseSlide}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const BookIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const AnalysisIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

export default MistakeAnalysis;
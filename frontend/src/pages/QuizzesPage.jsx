import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useProgress         from "../hooks/useProgress";
import useQuiz             from "../hooks/useQuiz";
import HeroRecommendation  from "../components/quizzes/HeroRecommendation";
import LectureCard         from "../components/quizzes/LectureCard";
import RecentResults       from "../components/quizzes/RecentResults";
import Leaderboard         from "../components/quizzes/Leaderboard";
import QuizSetup           from "../components/master/QuizSetup";
import QuizResults         from "../components/master/QuizResults";
import MistakeAnalysis     from "../components/master/MistakeAnalysis";
import ProcessingOverlay   from "../components/ui/ProcessingOverlay";
import { AnimatePresence as AP, motion as m } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

// ─── active quiz view (question by question) ──────────────────────────────────
const ActiveQuizModal = ({ quizData, answers, onAnswer, onSubmit, submitting, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const questions    = quizData?.questions || [];
  const total        = questions.length;
  const current      = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered   = answeredCount === total;

  const isTrueFalse = current?.type === "true_false";
  const options     = isTrueFalse ? ["True", "False"] : current?.options || [];
  const MCQ_LABELS  = ["A", "B", "C", "D"];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0   }}
        exit={{    opacity: 0, scale: 0.95, y: 20  }}
        transition={{ duration: 0.3, ease }}
        className="w-full max-w-xl bg-white rounded-3xl border border-forest-100 shadow-card-lg overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-forest-100/60 shrink-0">
          <div>
            <p className="text-sm font-semibold text-ink-900">Question {currentIndex + 1} of {total}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-32 bg-cream-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-forest-700 rounded-full"
                  animate={{ width: `${(answeredCount / total) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
              <span className="text-2xs text-ink-400">{answeredCount}/{total} answered</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-400 hover:bg-cream-100 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* question */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}>

              {current?.slide_ref && (
                <span className="text-2xs text-ink-400 bg-cream-100 border border-cream-200 px-2.5 py-1 rounded-full mb-4 inline-block">
                  Slide {current.slide_ref}
                </span>
              )}

              <p className="text-base font-semibold text-ink-900 leading-relaxed mb-6">{current?.question}</p>

              <div className="space-y-3">
                {options.map((option, i) => {
                  const label    = isTrueFalse ? option : MCQ_LABELS[i];
                  const value    = isTrueFalse ? option : MCQ_LABELS[i];
                  const selected = answers[current?.id] === value;

                  return (
                    <motion.button key={i} type="button"
                      onClick={() => onAnswer(current.id, value)}
                      whileHover={{ scale: 1.01, x: 2 }} whileTap={{ scale: 0.99 }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-start transition-all duration-200
                        ${selected ? "border-forest-700 bg-forest-700 shadow-md" : "border-forest-100 bg-white hover:border-forest-300 hover:bg-forest-50/40"}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all
                        ${selected ? "bg-white/20 text-white" : "bg-forest-50 text-forest-700"}`}>
                        {label}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${selected ? "text-white" : "text-ink-700"}`}>
                        {option}
                      </span>
                      {selected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="ms-auto w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* navigation */}
        <div className="px-6 py-4 border-t border-forest-100/60 flex items-center justify-between gap-3 shrink-0">
          {/* dot navigation */}
          <div className="flex items-center gap-1 flex-1 flex-wrap">
            {questions.map((q, i) => (
              <motion.button key={i} onClick={() => setCurrentIndex(i)}
                animate={{
                  width: i === currentIndex ? 16 : 7,
                  backgroundColor: answers[q.id] ? "#1a4a47" : i === currentIndex ? "#F5C842" : "#d1d0cc",
                }}
                transition={{ duration: 0.2 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setCurrentIndex(i => Math.max(i-1,0))} disabled={currentIndex===0}
              className="px-4 py-2 rounded-xl text-sm font-medium text-ink-600 border border-forest-200 hover:bg-cream-100 transition-all disabled:opacity-30">
              ←
            </button>
            {currentIndex < total - 1 ? (
              <button onClick={() => setCurrentIndex(i => Math.min(i+1,total-1))}
                className="px-4 py-2 rounded-xl text-sm font-medium text-ink-900 transition-all"
                style={{ backgroundColor: "#F5C842" }}>
                Next →
              </button>
            ) : (
              <motion.button onClick={onSubmit} disabled={!allAnswered || submitting}
                whileHover={{ scale: !allAnswered ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-ink-900 transition-all disabled:opacity-50"
                style={{ backgroundColor: "#F5C842", boxShadow: allAnswered ? "0 2px 8px rgba(245,200,66,0.4)" : "none" }}>
                {submitting ? "Submitting…" : allAnswered ? "Submit ✓" : `${total - answeredCount} left`}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── QuizzesPage ──────────────────────────────────────────────────────────────
const QuizzesPage = () => {
  const {
    dashboard, lectures, lectureProgress, allHistory,
    recommendations, selectedResult, loading,
    loadAll, fetchLectureProgress, fetchRecommendations,
    openResult, closeResult, getLeaderboard,
  } = useProgress();

  // quiz modal state
  const [quizModal,    setQuizModal]    = useState(null);  // "setup" | "active" | "results"
  const [activeLecture, setActiveLecture] = useState(null);

  const quiz = useQuiz(activeLecture?.id);

  // fetch progress for all lectures once loaded
  useEffect(() => {
    lectures.forEach((l) => fetchLectureProgress(l.id));
  }, [lectures]);

  const leaderboard = getLeaderboard();

  const handleStartQuiz = (lecture) => {
    setActiveLecture(lecture);
    quiz.reset();
    setQuizModal("setup");
  };

  const handleGenerate = async (config) => {
    await quiz.generate(config);
    if (!quiz.loading.generate) setQuizModal("active");
  };

  // watch for phase changes from quiz hook
  useEffect(() => {
    if (quiz.phase === "active"  && quizModal !== "active")  setQuizModal("active");
    if (quiz.phase === "results" && quizModal !== "results") setQuizModal("results");
  }, [quiz.phase]);

  const handleCloseModal = () => {
    setQuizModal(null);
    quiz.reset();
    loadAll(); // refresh data
  };

  return (
    <div className="min-h-screen bg-cream-100 pb-16">
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-8">

        {/* hero */}
        <HeroRecommendation
          dashboard={dashboard}
          recommendation={recommendations[lectures[0]?.id]}
          topLecture={lectures.find((l) => lectureProgress[l.id]?.best_score > 0 && lectureProgress[l.id]?.best_score < 90)}
          onStartQuiz={handleStartQuiz}
        />

        {/* pick a lecture */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl text-ink-900">Pick a Lecture</h2>
              <p className="text-sm text-ink-500 mt-0.5">Choose a subject to test your knowledge</p>
            </div>
            {lectures.length > 4 && (
              <button className="text-sm font-semibold text-forest-700 hover:underline underline-offset-2 flex items-center gap-1">
                View All →
              </button>
            )}
          </div>

          {loading.lectures ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-64 bg-white rounded-2xl border border-forest-100/40 animate-pulse" />
              ))}
            </div>
          ) : lectures.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-forest-100/60">
              <p className="text-3xl mb-3">📚</p>
              <p className="font-display text-lg text-ink-700 mb-2">No lectures yet</p>
              <p className="text-sm text-ink-400">Upload a lecture in the AI Tutor to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {lectures.slice(0, 8).map((lecture, i) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  progress={lectureProgress[lecture.id]}
                  index={i}
                  onStartQuiz={handleStartQuiz}
                />
              ))}
            </div>
          )}
        </div>

        {/* recent results + leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <RecentResults
            history={allHistory}
            loading={loading}
            onOpenResult={(sessionId, lectureId) => {
              openResult(sessionId, lectureId);
              fetchRecommendations(lectureId);
            }}
            selectedResult={selectedResult}
            recommendations={recommendations}
            onClose={closeResult}
            resultLoading={loading.result}
          />

          <Leaderboard entries={leaderboard} />
        </div>
      </div>

      {/* ── quiz modals ── */}
      <AnimatePresence>
        {quizModal === "setup" && activeLecture && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease }}
              className="w-full max-w-lg relative"
            >
              <button
                onClick={handleCloseModal}
                className="absolute -top-4 -end-4 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center border border-forest-100 shadow-sm text-ink-500 hover:text-ink-800 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <QuizSetup
                onGenerate={handleGenerate}
                loading={quiz.loading.generate}
                lectureTitle={activeLecture.title}
              />
            </motion.div>
          </motion.div>
        )}

        {quizModal === "active" && quiz.quizData && (
          <ActiveQuizModal
            quizData={quiz.quizData}
            answers={quiz.answers}
            onAnswer={quiz.answerQuestion}
            onSubmit={quiz.submit}
            submitting={quiz.loading.submit}
            onClose={handleCloseModal}
          />
        )}

        {quizModal === "results" && quiz.result && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm px-4 py-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <QuizResults
                result={quiz.result}
                progress={quiz.progress}
                lectureTitle={activeLecture?.title}
                onRetry={() => { quiz.reset(); setQuizModal("setup"); }}
                onViewMistakes={() => setQuizModal("mistakes")}
              />
              <div className="flex justify-center mt-4">
                <button onClick={handleCloseModal} className="text-sm text-ink-400 hover:text-ink-600 underline underline-offset-2 transition-colors">
                  Close & return to Quizzes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {quizModal === "mistakes" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm px-4 py-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-cream-100 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setQuizModal("results")} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-forest-700 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Back to Results
                </button>
                <button onClick={handleCloseModal} className="text-sm text-ink-400 hover:text-ink-600 transition-colors">Close</button>
              </div>
              <MistakeAnalysis
                detailedResult={quiz.detailedResult}
                recommendations={quiz.recommendations}
                loading={quiz.loading}
                onReviseSlide={() => {}}
                onFetchRecommendations={quiz.fetchRecommendations}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* overlays */}
      <ProcessingOverlay visible={quiz.loading.generate} type="quiz"    />
      <ProcessingOverlay visible={quiz.loading.submit}   type="summary" />
    </div>
  );
};

export default QuizzesPage;
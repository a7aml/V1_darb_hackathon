import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useStudy from "../hooks/useStudy";
import SlideViewer  from "../components/study/SlideViewer";
import AIToolsPanel from "../components/study/AIToolsPanel";

const ease = [0.22, 1, 0.36, 1];

// ─── step indicator (reused from UploadPage style) ────────────────────────────
const steps = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Learn"  },
  { number: 3, label: "Master" },
];

const StepIndicator = ({ current = 2 }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {steps.map((step, i) => {
      const done   = step.number < current;
      const active = step.number === current;
      return (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{
                backgroundColor: active || done ? "#1a4a47" : "#e5e7eb",
                scale: active ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="w-9 h-9 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: active || done ? "#1a4a47" : "#e5e7eb" }}
            >
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span className="text-xs font-semibold text-white">{step.number}</span>
              )}
            </motion.div>
            <span className={`text-xs font-medium ${active ? "text-forest-700" : done ? "text-forest-600" : "text-ink-400"}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-24 md:w-32 h-0.5 mb-5 mx-2 rounded-full overflow-hidden bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-forest-700"
                animate={{ width: done ? "100%" : active ? "50%" : "0%" }}
                transition={{ duration: 0.6, ease }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// ─── StudyPage ────────────────────────────────────────────────────────────────
const StudyPage = () => {
  const { lecture_id }  = useParams();
  const location        = useLocation();
  const navigate        = useNavigate();

  // lecture meta passed from UploadPage via router state
  const lectureState = location.state || {};
  const title        = lectureState.title       || "Lecture";
  const totalSlides  = lectureState.total_slides || 1;

  const [currentSlide, setCurrentSlide] = useState(1);

  // build a minimal slides array from total_slides count
  // real content comes from the AI tools (explain slide), not a separate slides API
  const slides = Array.from({ length: totalSlides }, (_, i) => ({
    title:   `Slide ${i + 1}`,
    content: `Use the AI tools on the right to get the summary, explanation, or TL;DR for this slide.`,
  }));

  const {
    summary, explanation, flashcards, mindmap, glossary, tldr,
    loading,
    fetchSummary,
    fetchExplanation,
    fetchFlashcards,
    fetchMindmap,
    fetchGlossary,
    fetchTldr,
    clearTool,
  } = useStudy(lecture_id);

  // when explanation loads, jump to that slide
  useEffect(() => {
    if (explanation?.slide_number) setCurrentSlide(explanation.slide_number);
  }, [explanation]);

  const goNext = () => setCurrentSlide((s) => Math.min(s + 1, totalSlides));
  const goPrev = () => setCurrentSlide((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-cream-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-5 md:px-10">

        {/* back button + lecture title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-forest-700 transition-colors"
          >
            <BackIcon /> Back to Upload
          </button>
          <span className="text-ink-300">/</span>
          <span className="text-sm font-medium text-ink-700 truncate max-w-xs">{title}</span>
        </motion.div>

        {/* step indicator — always on Learn (step 2) */}
        <StepIndicator current={2} />

        {/* main grid — slides left, tools right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6"
          style={{ minHeight: 560 }}
        >
          {/* ── left: slide viewer ── */}
          <div className="auth-card overflow-hidden flex flex-col" style={{ minHeight: 520 }}>
            <SlideViewer
              slides={slides}
              currentSlide={currentSlide}
              onPrev={goPrev}
              onNext={goNext}
              title={title}
              lectureId={lecture_id}
            />
          </div>

          {/* ── right: AI tools ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="flex flex-col"
            style={{ maxHeight: 700 }}
          >
            <AIToolsPanel
              currentSlide={currentSlide}
              loading={loading}
              summary={summary}
              explanation={explanation}
              flashcards={flashcards}
              mindmap={mindmap}
              glossary={glossary}
              tldr={tldr}
              onSummary={fetchSummary}
              onExplain={fetchExplanation}
              onFlashcards={fetchFlashcards}
              onMindmap={fetchMindmap}
              onGlossary={fetchGlossary}
              onTldr={fetchTldr}
              clearTool={clearTool}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

export default StudyPage;
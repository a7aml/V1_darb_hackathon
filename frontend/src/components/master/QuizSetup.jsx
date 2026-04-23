import { useState } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const OptionButton = ({ active, onClick, children }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200
      ${active
        ? "border-forest-700 bg-forest-700 text-white shadow-sm"
        : "border-forest-100 text-ink-600 hover:border-forest-300 bg-white"
      }`}
  >
    {children}
  </motion.button>
);

const QuizSetup = ({ onGenerate, loading, lectureTitle }) => {
  const [type,         setType]         = useState("mcq");
  const [difficulty,   setDifficulty]   = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);

  const handleStart = () => {
    onGenerate({ type, difficulty, num_questions: numQuestions });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.5, ease }}
      className="max-w-lg mx-auto"
    >
      <div className="auth-card p-8">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-forest-200 to-transparent" />

        {/* header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-forest-700 flex items-center justify-center mx-auto mb-4">
            <QuizIcon />
          </div>
          <h2 className="font-display text-2xl text-ink-900 mb-1">Start a Quiz</h2>
          <p className="text-sm text-ink-400 truncate max-w-xs mx-auto">{lectureTitle}</p>
        </div>

        <div className="space-y-6">

          {/* question type */}
          <div>
            <label className="field-label mb-2 block">Question type</label>
            <div className="flex gap-2">
              <OptionButton active={type === "mcq"}        onClick={() => setType("mcq")}>
                🔤 Multiple Choice
              </OptionButton>
              <OptionButton active={type === "true_false"} onClick={() => setType("true_false")}>
                ✓✗ True / False
              </OptionButton>
            </div>
          </div>

          {/* difficulty */}
          <div>
            <label className="field-label mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {[
                { val: "easy",   label: "🌱 Easy"   },
                { val: "medium", label: "🔥 Medium" },
                { val: "hard",   label: "💀 Hard"   },
              ].map((d) => (
                <OptionButton key={d.val} active={difficulty === d.val} onClick={() => setDifficulty(d.val)}>
                  {d.label}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* number of questions */}
          <div>
            <label className="field-label mb-2 block">
              Number of questions
              <span className="ms-2 text-forest-700 font-bold">{numQuestions}</span>
            </label>
            <input
              type="range"
              min={5}
              max={20}
              step={5}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-forest-700 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-ink-300 mt-1">
              <span>5</span><span>10</span><span>15</span><span>20</span>
            </div>
          </div>

          {/* start */}
          <motion.button
            type="button"
            onClick={handleStart}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -1 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Spinner /> Generating quiz…</>
            ) : (
              <><span>Generate Quiz</span><ArrowIcon /></>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const QuizIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

export default QuizSetup;
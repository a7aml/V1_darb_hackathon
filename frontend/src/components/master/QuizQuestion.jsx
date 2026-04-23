import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const MCQ_LABELS = ["A", "B", "C", "D"];

const QuizQuestion = ({ question, index, total, selectedAnswer, onAnswer }) => {
  const isTrueFalse = question.type === "true_false";
  const options     = isTrueFalse ? ["True", "False"] : question.options;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0  }}
      exit={{    opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease }}
      className="w-full"
    >
      {/* question header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl bg-forest-700 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-white">{index + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold tracking-widest uppercase text-forest-500 bg-forest-50 border border-forest-100 px-2.5 py-1 rounded-full">
            {question.difficulty}
          </span>
          {question.slide_ref && (
            <span className="text-2xs text-ink-400 bg-cream-200 border border-cream-300 px-2.5 py-1 rounded-full">
              Slide {question.slide_ref}
            </span>
          )}
        </div>
        <span className="ms-auto text-xs text-ink-400 font-medium">{index + 1} / {total}</span>
      </div>

      {/* question text */}
      <p className="text-base font-semibold text-ink-900 leading-relaxed mb-6 ps-1">
        {question.question}
      </p>

      {/* options */}
      <div className="space-y-3">
        {options.map((option, i) => {
          const label    = isTrueFalse ? option : MCQ_LABELS[i];
          const value    = isTrueFalse ? option : MCQ_LABELS[i];
          const selected = selectedAnswer === value;

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => onAnswer(question.id, value)}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.99 }}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-start
                transition-all duration-200
                ${selected
                  ? "border-forest-700 bg-forest-700 shadow-md"
                  : "border-forest-100 bg-white hover:border-forest-300 hover:bg-forest-50/40"
                }
              `}
            >
              {/* label bubble */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200
                  ${selected ? "bg-white/20 text-white" : "bg-forest-50 text-forest-700"}`}
              >
                {label}
              </div>
              <span className={`text-sm font-medium transition-colors duration-200 ${selected ? "text-white" : "text-ink-700"}`}>
                {isTrueFalse ? option : option}
              </span>

              {/* check indicator */}
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ms-auto w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuizQuestion;
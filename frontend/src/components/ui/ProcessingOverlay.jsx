import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

// ─── config per task type ─────────────────────────────────────────────────────
// Each type has a sequence of animated steps shown while the backend works.
// Steps rotate every ~2.5s so the user always sees something happening.
const TASK_CONFIG = {
  upload: {
    title:    "Processing your lecture…",
    subtitle: "This may take up to a minute depending on file size.",
    color:    "#1a4a47",
    steps: [
      { icon: "📄", text: "Reading your file"              },
      { icon: "✂️", text: "Splitting into slides"          },
      { icon: "🔍", text: "Extracting key content"         },
      { icon: "🤖", text: "Running AI analysis"            },
      { icon: "💾", text: "Saving to your library"         },
      { icon: "✅", text: "Almost there…"                  },
    ],
  },
  summary: {
    title:    "Generating your summary…",
    subtitle: "Reading through all slides and distilling the key ideas.",
    color:    "#b08d00",
    steps: [
      { icon: "📖", text: "Reading all slides"             },
      { icon: "🧠", text: "Identifying main concepts"      },
      { icon: "✍️", text: "Writing your summary"           },
      { icon: "✨", text: "Polishing the output"           },
    ],
  },
  explanation: {
    title:    "Explaining this slide…",
    subtitle: "Breaking down the content into simpler terms.",
    color:    "#1a4a47",
    steps: [
      { icon: "🔎", text: "Analysing slide content"        },
      { icon: "💡", text: "Finding the key ideas"          },
      { icon: "🗣️", text: "Writing a clear explanation"    },
    ],
  },
  flashcards: {
    title:    "Generating flashcards…",
    subtitle: "Creating a personalised study deck from your lecture.",
    color:    "#ef4444",
    steps: [
      { icon: "📚", text: "Scanning all slides"            },
      { icon: "🃏", text: "Identifying testable concepts"  },
      { icon: "✏️", text: "Writing questions & answers"    },
      { icon: "🎴", text: "Building your deck"             },
    ],
  },
  mindmap: {
    title:    "Building your mind map…",
    subtitle: "Mapping out the relationships between key concepts.",
    color:    "#3b82f6",
    steps: [
      { icon: "🗺️", text: "Reading the full lecture"       },
      { icon: "🔗", text: "Finding concept connections"    },
      { icon: "🌳", text: "Building the structure"         },
      { icon: "🎨", text: "Finalising the map"             },
    ],
  },
  glossary: {
    title:    "Extracting key terms…",
    subtitle: "Finding and defining all important terminology.",
    color:    "#a855f7",
    steps: [
      { icon: "🔬", text: "Scanning for key terms"         },
      { icon: "📖", text: "Looking up definitions"         },
      { icon: "💬", text: "Adding examples"                },
      { icon: "📋", text: "Building your glossary"         },
    ],
  },
  tldr: {
    title:    "Writing your TL;DR…",
    subtitle: "Condensing the slide into one clear sentence.",
    color:    "#b08d00",
    steps: [
      { icon: "👀", text: "Reading the slide"              },
      { icon: "💭", text: "Finding the core idea"          },
      { icon: "✍️", text: "Writing one perfect sentence"   },
    ],
  },
};

// ─── animated brain/AI dots ───────────────────────────────────────────────────
const PulsingOrbs = ({ color }) => (
  <div className="relative w-24 h-24 flex items-center justify-center">
    {/* outer rings */}
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border"
        style={{ borderColor: `${color}22` }}
        animate={{ scale: [1, 1.8 + i * 0.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
        initial={{ width: 40, height: 40 }}
      />
    ))}

    {/* centre orb */}
    <motion.div
      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg"
      style={{ backgroundColor: color }}
      animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      🤖
    </motion.div>
  </div>
);

// ─── cycling step display ─────────────────────────────────────────────────────
const CyclingStep = ({ steps }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % steps.length);
    }, 2500);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="h-10 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0  }}
          exit={{    opacity: 0, y: -14 }}
          transition={{ duration: 0.35, ease }}
          className="flex items-center gap-2"
        >
          <span className="text-xl">{steps[index].icon}</span>
          <span className="text-sm font-medium text-ink-600">{steps[index].text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── progress dots ────────────────────────────────────────────────────────────
const BouncingDots = ({ color }) => (
  <div className="flex items-center gap-1.5">
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
      />
    ))}
  </div>
);

// ─── fun facts shown while waiting ───────────────────────────────────────────
const FUN_FACTS = [
  "Students who review notes within 24 hours retain 80% more.",
  "The Feynman Technique: explain a concept simply to truly understand it.",
  "Spaced repetition is 2× more effective than re-reading.",
  "Taking a break every 25 minutes (Pomodoro) boosts focus.",
  "Teaching others is the #1 way to solidify your own understanding.",
  "Handwriting notes improves memory more than typing.",
  "Sleep is when your brain consolidates long-term memories.",
  "Active recall beats passive review every single time.",
];

const FunFact = () => {
  const [fact, setFact] = useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xs text-center"
    >
      <p className="text-2xs font-semibold tracking-widest uppercase text-ink-300 mb-2">
        💡 Did you know?
      </p>
      <p className="text-xs text-ink-400 leading-relaxed">{fact}</p>
    </motion.div>
  );
};

// ─── ProcessingOverlay ────────────────────────────────────────────────────────
// Usage:
//   <ProcessingOverlay visible={loading} type="upload" />
//   <ProcessingOverlay visible={loading} type="summary" />
//
// `type` maps to TASK_CONFIG keys:
//   "upload" | "summary" | "explanation" | "flashcards" | "mindmap" | "glossary" | "tldr"
//
// Renders as a full-screen overlay when visible=true.
// Renders nothing (AnimatePresence exit) when visible=false.

const ProcessingOverlay = ({ visible, type = "upload" }) => {
  const config = TASK_CONFIG[type] || TASK_CONFIG.upload;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "rgba(245,240,232,0.92)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.4, ease }}
            className="flex flex-col items-center gap-6 px-8 py-10 max-w-sm w-full"
          >
            {/* animated orb */}
            <PulsingOrbs color={config.color} />

            {/* title */}
            <div className="text-center">
              <h2 className="font-display text-2xl text-ink-900 mb-1">{config.title}</h2>
              <p className="text-sm text-ink-400 leading-relaxed">{config.subtitle}</p>
            </div>

            {/* cycling step */}
            <div className="w-full bg-white rounded-2xl border border-forest-100 px-5 py-4 flex flex-col items-center gap-3">
              <CyclingStep steps={config.steps} />
              <BouncingDots color={config.color} />
            </div>

            {/* fun fact */}
            <FunFact />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingOverlay;
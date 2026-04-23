import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useUpload from "../hooks/useUpload";
import useStudy  from "../hooks/useStudy";
import SlideViewer  from "../components/study/SlideViewer";
import AIToolsPanel from "../components/study/AIToolsPanel";
import ProcessingOverlay from "../components/ui/ProcessingOverlay";
import MasterPage from "./MasterPage";

const ease = [0.22, 1, 0.36, 1];

// ─── step indicator ───────────────────────────────────────────────────────────
const steps = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Learn"  },
  { number: 3, label: "Master" },
];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {steps.map((step, i) => {
      const done   = step.number < current;
      const active = step.number === current;
      return (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{
                backgroundColor: active && step.number === 3
                  ? "#F5C842"
                  : active || done
                  ? "#1a4a47"
                  : "#e5e7eb",
                scale: active ? 1.12 : 1,
              }}
              transition={{ duration: 0.45, ease }}
              className="w-9 h-9 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: active && step.number === 3
                  ? "#F5C842"
                  : active || done
                  ? "#1a4a47"
                  : "#e5e7eb"
              }}
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </motion.div>
                ) : active && step.number === 1 ? (
                  <motion.div key="upload-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                  </motion.div>
                ) : active && step.number === 2 ? (
                  <motion.div key="learn-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </motion.div>
                ) : active && step.number === 3 ? (
                  <motion.div key="master-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" stroke="white"/>
                    </svg>
                  </motion.div>
                ) : (
                  <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-xs font-semibold text-ink-400">
                    {step.number}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.span
              animate={{ color: active ? "#1a4a47" : done ? "#2d6b66" : "#8a8782" }}
              className="text-xs font-medium"
            >
              {step.label}
            </motion.span>
          </div>

          {i < steps.length - 1 && (
            <div className="w-24 md:w-36 h-0.5 mb-5 mx-2 rounded-full overflow-hidden bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-forest-700"
                animate={{ width: done ? "100%" : "0%" }}
                transition={{ duration: 0.7, ease }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// ─── lecture card in the list ─────────────────────────────────────────────────
const LectureCard = ({ lecture, index, onOpen, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(lecture.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // auto-cancel confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease, delay: index * 0.06 }}
      onClick={onOpen}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-forest-100/60 hover:border-forest-300 hover:shadow-card transition-all duration-200 group cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center shrink-0 group-hover:bg-forest-700 transition-colors duration-200">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-forest-700 group-hover:text-white transition-colors">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900 truncate">{lecture.title}</p>
        <p className="text-xs text-ink-400 mt-0.5">
          {lecture.total_slides} slides · {lecture.language?.toUpperCase()} · {new Date(lecture.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* delete button — shown on hover, two-step confirm */}
      <motion.button
        onClick={handleDeleteClick}
        disabled={false}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`
          shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
          transition-all duration-200 opacity-0 group-hover:opacity-100
          ${confirmDelete
            ? "bg-red-500 text-white opacity-100"
            : "text-ink-400 hover:text-red-500 hover:bg-red-50"
          }
        `}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        {confirmDelete && <span>Confirm</span>}
      </motion.button>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ink-300 group-hover:text-forest-700 transition-colors shrink-0">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </motion.div>
  );
};

// ─── UploadPage ───────────────────────────────────────────────────────────────
const UploadPage = () => {
  // view: "upload" | "study"
  const [view,         setView]         = useState("upload"); // "upload" | "study" | "master"
  const [step,         setStep]         = useState(1);
  const [activeLecture, setActiveLecture] = useState(null); // { id, title, total_slides, language }
  const [currentSlide, setCurrentSlide] = useState(1);
  const [dragOver,     setDragOver]     = useState(false);
  const [file,         setFile]         = useState(null);
  const [pdfFile,      setPdfFile]      = useState(null); // kept in state so SlideViewer can render it
  const [title,        setTitle]        = useState("");
  const [language,     setLanguage]     = useState("en");

  const fileInputRef = useRef(null);

  const { upload, fetchLectures, lectures, uploading, progress, loadingList, removeLecture } = useUpload();
  const study = useStudy(activeLecture?.id);

  useEffect(() => { fetchLectures(); }, []);

  // totalSlides used for navigation only — actual content rendered by PDF.js in SlideViewer
  const totalSlides = activeLecture?.total_slides || 1;

  const openStudyView = (lecture, fileObj = null) => {
    setActiveLecture(lecture);
    setCurrentSlide(1);
    setStep(2);
    setView("study");
    // fileObj is only available for newly uploaded lectures
    if (fileObj) setPdfFile(fileObj);
    else setPdfFile(null); // old lectures from list don't have the file in browser
  };

  const goToMaster = () => {
    setStep(3);
    setView("master");
  };

  const backToStudy = () => {
    setStep(2);
    setView("study");
  };

  const backToUpload = () => {
    setView("upload");
    setStep(1);
    setActiveLecture(null);
    setPdfFile(null);
  };

  const acceptFile = useCallback((incoming) => {
    if (!incoming) return;
    setFile(incoming);
    setPdfFile(incoming); // keep reference for SlideViewer rendering
    setTitle(incoming.name.replace(/\.[^/.]+$/, ""));
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const result = await upload({ file, title, language });
    if (result) {
      setFile(null);
      setTitle("");
      setLanguage("en");
      // flip to study view with the newly uploaded lecture
      openStudyView({
        id:           result.lecture_id,
        title:        result.title,
        total_slides: result.total_slides,
        language:     result.language,
      }, file);  // pass the File object so SlideViewer can render the PDF
    }
  };

  const fileSize = file ? (file.size / (1024 * 1024)).toFixed(1) + " MB" : null;

  return (
    <div className="min-h-screen bg-cream-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 md:px-10">

        {/* heading */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <AnimatePresence mode="wait">
            {view === "upload" ? (
              <motion.div key="upload-heading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <h1 className="font-display text-4xl md:text-5xl text-ink-900 mb-3 leading-tight">
                  Ready for a <span className="italic text-forest-700">breakthrough?</span>
                </h1>
                <p className="text-ink-500 text-base max-w-md mx-auto leading-relaxed">
                  Turn your lecture notes into a personalised learning journey. You're just one upload away.
                </p>
              </motion.div>
            ) : view === "study" ? (
              <motion.div key="study-heading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <h1 className="font-display text-3xl md:text-4xl text-ink-900 mb-2 leading-tight">
                  Now let's <span className="italic text-forest-700">learn.</span>
                </h1>
                <p className="text-ink-500 text-sm max-w-md mx-auto">
                  {activeLecture?.title} · {activeLecture?.total_slides} slides
                </p>
              </motion.div>
            ) : (
              <motion.div key="master-heading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <h1 className="font-display text-3xl md:text-4xl text-ink-900 mb-2 leading-tight">
                  Time to <span className="italic text-forest-700">master it.</span>
                </h1>
                <p className="text-ink-500 text-sm max-w-md mx-auto">
                  Test your knowledge and track your progress.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* step indicator */}
        <StepIndicator current={step} />

        {/* ── main content area — flips between upload and study ── */}
        <AnimatePresence mode="wait">

          {/* ═══ UPLOAD VIEW ═══ */}
          {view === "upload" && (
            <motion.div
              key="upload-view"
              initial={{ opacity: 0, rotateY: -8, scale: 0.97 }}
              animate={{ opacity: 1, rotateY: 0,  scale: 1    }}
              exit={{    opacity: 0, rotateY:  8,  scale: 0.97 }}
              transition={{ duration: 0.45, ease }}
              style={{ transformOrigin: "center center" }}
            >
              <div className="max-w-3xl mx-auto">
                {/* upload card */}
                <div className="auth-card p-8 mb-6">
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-forest-200 to-transparent" />

                  {/* drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                    className={`
                      relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                      flex flex-col items-center justify-center py-12 px-6 text-center mb-6
                      ${dragOver       ? "border-forest-600 bg-forest-50 scale-[1.01]"
                      : file          ? "border-forest-400 bg-forest-50/50 cursor-default"
                      :                 "border-forest-200 hover:border-forest-400 hover:bg-forest-50/40"}
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {file ? (
                        <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-forest-700 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink-900">{file.name}</p>
                            <p className="text-xs text-ink-400 mt-0.5">{fileSize}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setFile(null); setTitle(""); }} className="text-xs text-red-500 hover:text-red-600 underline underline-offset-2 transition-colors">
                            Remove file
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                          <motion.div
                            animate={{ y: dragOver ? -6 : [0, -5, 0] }}
                            transition={dragOver ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: "rgba(245,200,66,0.15)" }}
                          >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a4a47" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                            </svg>
                          </motion.div>
                          <div>
                            <p className="text-base font-semibold text-ink-900 mb-1">{dragOver ? "Drop it here!" : "Upload Your Lecture"}</p>
                            <p className="text-sm text-ink-400">PDFs or Word Documents (Max 50MB)</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-ink-900 transition-all hover:-translate-y-px"
                            style={{ backgroundColor: "#F5C842", boxShadow: "0 2px 8px rgba(245,200,66,0.35)" }}
                          >
                            Browse Files
                          </button>
                          <div className="flex items-center gap-2">
                            {["PDF", "DOCX"].map(f => (
                              <span key={f} className="px-2.5 py-1 text-2xs font-semibold text-ink-500 bg-cream-200 rounded-lg border border-cream-300">{f}</span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={e => acceptFile(e.target.files?.[0])} className="hidden" />

                  {/* metadata + submit */}
                  <AnimatePresence>
                    {file && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{    opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="overflow-hidden space-y-4"
                      >
                        <div>
                          <label className="field-label">Lecture title</label>
                          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 1 — Introduction to AI" className="auth-input" />
                        </div>

                        <div>
                          <label className="field-label">Lecture language</label>
                          <div className="flex gap-3">
                            {[{ code: "en", label: "English 🇬🇧" }, { code: "ar", label: "Arabic 🇸🇦" }].map(l => (
                              <button key={l.code} type="button" onClick={() => setLanguage(l.code)}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all duration-200
                                  ${language === l.code ? "border-forest-700 bg-forest-50 text-forest-700" : "border-forest-100 text-ink-500 hover:border-forest-300"}`}
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {uploading && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-ink-400">
                              <span>Processing your lecture…</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full bg-forest-700" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                            </div>
                          </div>
                        )}

                        <motion.button
                          type="button"
                          onClick={handleUpload}
                          disabled={uploading || !title.trim()}
                          whileHover={{ scale: uploading ? 1 : 1.01, y: uploading ? 0 : -1 }}
                          whileTap={{  scale: uploading ? 1 : 0.98 }}
                          className="btn-primary"
                        >
                          {uploading ? (
                            <span className="flex items-center justify-center gap-2"><SpinnerDark /> Processing lecture…</span>
                          ) : (
                            "Upload & Start Learning →"
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* feature hints */}
                {!file && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4, ease }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {[
                      { icon: "📄", title: "AI Summary",    desc: "Instant, bite-sized notes from long documents." },
                      { icon: "🃏", title: "Practice Quiz", desc: "Smart flashcards generated just for you."        },
                      { icon: "💬", title: "24/7 AI Tutor", desc: "Ask questions and get clear explanations."       },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-forest-100/60">
                        <div className="w-9 h-9 rounded-xl bg-forest-50 flex items-center justify-center shrink-0 text-lg">{item.icon}</div>
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                          <p className="text-xs text-ink-400 leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* previous lectures */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl text-ink-900">Your Lectures</h2>
                    {loadingList && <SpinnerDark />}
                  </div>
                  {!loadingList && lectures.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-forest-100/60">
                      <p className="text-ink-400 text-sm">No lectures yet — upload your first one above!</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                    <div className="space-y-3">
                      {lectures.map((lec, i) => (
                        <LectureCard key={lec.id} lecture={lec} index={i} onOpen={() => openStudyView(lec)} onDelete={removeLecture} />
                      ))}
                    </div>
                  </AnimatePresence>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STUDY VIEW ═══ */}
          {view === "study" && (
            <motion.div
              key="study-view"
              initial={{ opacity: 0, rotateY: 8, scale: 0.97 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1    }}
              exit={{    opacity: 0, rotateY: -8, scale: 0.97 }}
              transition={{ duration: 0.45, ease }}
              style={{ transformOrigin: "center center" }}
            >
              {/* back button */}
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={backToUpload}
                  className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-forest-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Back to Upload
                </button>
                <span className="text-ink-300 text-xs">/</span>
                <span className="text-sm font-medium text-ink-700 truncate max-w-xs">{activeLecture?.title}</span>
              </div>

              {/* slides + AI tools grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6" style={{ height: 580 }}>

                {/* left — slide viewer */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0   }}
                  transition={{ duration: 0.4, ease, delay: 0.15 }}
                  className="auth-card overflow-hidden flex flex-col"
                >
                  <SlideViewer
                    pdfFile={pdfFile}
                    currentSlide={currentSlide}
                    totalSlides={totalSlides}
                    onPrev={() => setCurrentSlide(s => Math.max(s - 1, 1))}
                    onNext={() => setCurrentSlide(s => Math.min(s + 1, totalSlides))}
                    title={activeLecture?.title}
                  />
                </motion.div>

                {/* right — AI tools */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0  }}
                  transition={{ duration: 0.4, ease, delay: 0.2 }}
                  className="flex flex-col overflow-hidden"
                >
                  <AIToolsPanel
                    currentSlide={currentSlide}
                    loading={study.loading}
                    summary={study.summary}
                    explanation={study.explanation}
                    flashcards={study.flashcards}
                    mindmap={study.mindmap}
                    glossary={study.glossary}
                    tldr={study.tldr}
                    onSummary={study.fetchSummary}
                    onExplain={study.fetchExplanation}
                    onFlashcards={study.fetchFlashcards}
                    onMindmap={study.fetchMindmap}
                    onGlossary={study.fetchGlossary}
                    onTldr={study.fetchTldr}
                    clearTool={study.clearTool}
                  />
                </motion.div>
              </div>

              {/* start quiz CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ duration: 0.4, ease, delay: 0.3 }}
                className="flex justify-center mt-6"
              >
                <motion.button
                  onClick={goToMaster}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-ink-900 transition-all"
                  style={{ backgroundColor: "#F5C842", boxShadow: "0 4px 16px rgba(245,200,66,0.40)" }}
                >
                  <span>🎯</span>
                  <span>Start Quiz — Test Your Knowledge</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ MASTER VIEW ═══ */}
          {view === "master" && (
            <motion.div
              key="master-view"
              initial={{ opacity: 0, rotateY: 8, scale: 0.97 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1    }}
              exit={{    opacity: 0, rotateY: -8, scale: 0.97 }}
              transition={{ duration: 0.45, ease }}
              style={{ transformOrigin: "center center" }}
            >
              {/* back button */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={backToStudy}
                  className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-forest-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Back to Study
                </button>
                <span className="text-ink-300 text-xs">/</span>
                <span className="text-sm font-medium text-ink-700 truncate max-w-xs">{activeLecture?.title}</span>
                <span className="text-ink-300 text-xs">/</span>
                <span className="text-sm font-medium text-forest-700">Quiz</span>
              </div>

              <MasterPage
                lecture={activeLecture}
                onReviseSlide={(slideNumber) => {
                  setCurrentSlide(slideNumber);
                  backToStudy();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* overlays — shown during long backend operations */}
      <ProcessingOverlay visible={uploading}                  type="upload"      />
      <ProcessingOverlay visible={study.loading.summary}      type="summary"     />
      <ProcessingOverlay visible={study.loading.explanation}  type="explanation" />
      <ProcessingOverlay visible={study.loading.flashcards}   type="flashcards"  />
      <ProcessingOverlay visible={study.loading.mindmap}      type="mindmap"     />
      <ProcessingOverlay visible={study.loading.glossary}     type="glossary"    />
      <ProcessingOverlay visible={study.loading.tldr}         type="tldr"        />
    </div>
  );
};


const SpinnerDark = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#1a4a47" strokeWidth="4"/>
    <path className="opacity-75" fill="#1a4a47" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

export default UploadPage;
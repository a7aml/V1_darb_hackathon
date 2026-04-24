import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
import TutorMessage from "./TutorMessage";
import AIToolsDropPanel from "./AIToolsDropPanel";
import ProcessingOverlay from "../ui/ProcessingOverlay";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const ease = [0.22, 1, 0.36, 1];

const CAPABILITY_CARDS = [
  { icon: "📄", iconBg: "rgba(26,74,71,0.08)",    title: "Summarize Lecture",    example: "Summarize my entire lecture for me.",                  toolKey: "summary",    needsLecture: true  },
  { icon: "🃏", iconBg: "rgba(239,68,68,0.08)",   title: "Generate Flashcards",  example: "Create flashcards from my lecture.",                   toolKey: "flashcards", needsLecture: true  },
  { icon: "📖", iconBg: "rgba(168,85,247,0.08)",  title: "Key Terms & Glossary", example: "What are the key terms in my lecture?",                toolKey: "glossary",   needsLecture: true  },
  { icon: "🗺️", iconBg: "rgba(59,130,246,0.08)", title: "Mind Map",             example: "Build a mind map of the lecture topics.",              toolKey: "mindmap",    needsLecture: true  },
  { icon: "💡", iconBg: "rgba(245,200,66,0.15)",  title: "Real-World Example",   example: "Give me a real-world example of this concept.",        toolKey: null,         needsLecture: false },
  { icon: "🎯", iconBg: "rgba(26,74,71,0.06)",    title: "Exam Preparation",     example: "What topics are most likely to appear in an exam?",   toolKey: null,         needsLecture: false },
  { icon: "🔗", iconBg: "rgba(59,130,246,0.06)",  title: "Connect the Dots",     example: "How do the concepts in this lecture connect?",         toolKey: null,         needsLecture: false },
  { icon: "⚠️", iconBg: "rgba(239,68,68,0.06)",  title: "Common Mistakes",      example: "What mistakes do students make about this topic?",     toolKey: null,         needsLecture: false },
  { icon: "🧠", iconBg: "rgba(168,85,247,0.06)", title: "Deeper Understanding", example: "Explain this concept like I'm hearing it for the first time.", toolKey: null, needsLecture: false },
];

// ─── PDF page renderer ────────────────────────────────────────────────────────
const PDFPageCanvas = ({ pdfDoc, pageNumber, containerWidth }) => {
  const canvasRef = useRef(null);
  const renderRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!pdfDoc || !containerWidth) return;
    renderRef.current?.cancel();
    setReady(false);
    (async () => {
      try {
        const page     = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const scale    = containerWidth / viewport.width;
        const scaled   = page.getViewport({ scale });
        const canvas   = canvasRef.current;
        if (!canvas) return;
        canvas.width = scaled.width; canvas.height = scaled.height;
        const task = page.render({ canvasContext: canvas.getContext("2d"), viewport: scaled });
        renderRef.current = task;
        await task.promise;
        setReady(true);
      } catch (e) { if (e?.name !== "RenderingCancelledException") console.error(e); }
    })();
    return () => { renderRef.current?.cancel(); };
  }, [pdfDoc, pageNumber, containerWidth]);

  return (
    <div className="relative w-full">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream-50 rounded-xl min-h-24">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-forest-300"
                animate={{ y: [0,-5,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.15 }} />
            ))}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full rounded-xl shadow-sm" style={{ display: ready ? "block" : "none" }} />
    </div>
  );
};

// ─── PDF preview pinned in chat ───────────────────────────────────────────────
const PDFPreview = ({ pdfFile, totalSlides }) => {
  const [pdfDoc, setPdfDoc]         = useState(null);
  const [page, setPage]             = useState(1);
  const [width, setWidth]           = useState(0);
  const [expanded, setExpanded]     = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!pdfFile) return;
    const url  = URL.createObjectURL(pdfFile);
    const task = pdfjsLib.getDocument(url);
    task.promise.then(setPdfDoc).catch(console.error);
    return () => { URL.revokeObjectURL(url); task.destroy?.(); };
  }, [pdfFile]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setWidth(e[0]?.contentRect?.width || 0));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl border border-forest-100/70 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-forest-100/60 bg-forest-50">
        <div className="flex items-center gap-2">
          <span>📑</span>
          <span className="text-xs font-semibold text-forest-700 truncate max-w-[160px]">{pdfFile?.name}</span>
          <span className="text-2xs text-forest-500">· {totalSlides} slides</span>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-xs text-ink-400 hover:text-forest-700 transition-colors px-2 py-1 rounded-lg hover:bg-white">
          {expanded ? "↑" : "↓"}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div ref={containerRef} className="px-4 pt-4">
              {pdfDoc && width > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div key={page} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                    <PDFPageCanvas pdfDoc={pdfDoc} pageNumber={page} containerWidth={width} />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setPage(p => Math.max(p-1,1))} disabled={page<=1}
                className="w-8 h-8 rounded-full border border-forest-200 flex items-center justify-center text-ink-500 hover:border-forest-600 transition-all disabled:opacity-30">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="text-xs text-ink-400 font-medium">{page} / {totalSlides}</span>
              <button onClick={() => setPage(p => Math.min(p+1, totalSlides))} disabled={page>=totalSlides}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30"
                style={{ backgroundColor: page >= totalSlides ? "#c4c2be" : "#F5C842" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── upload modal ─────────────────────────────────────────────────────────────
const UploadModal = ({ file, onConfirm, onCancel, uploading }) => {
  const [title,    setTitle]    = useState(file?.name.replace(/\.[^/.]+$/, "") || "");
  const [language, setLanguage] = useState("en");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm px-4">
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ duration: 0.3, ease }}
        className="w-full max-w-sm bg-white rounded-2xl border border-forest-100 shadow-card-lg p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-lg">📄</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 truncate">{file?.name}</p>
            <p className="text-xs text-ink-400">{(file?.size / (1024*1024)).toFixed(1)} MB</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="field-label">Lecture title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 1 — Intro to AI" className="auth-input" />
          </div>
          <div>
            <label className="field-label">Language</label>
            <div className="flex gap-2">
              {[{ code: "en", label: "English 🇬🇧" }, { code: "ar", label: "Arabic 🇸🇦" }].map(l => (
                <button key={l.code} type="button" onClick={() => setLanguage(l.code)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${language === l.code ? "border-forest-700 bg-forest-50 text-forest-700" : "border-forest-100 text-ink-500 hover:border-forest-300"}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-ink-600 border border-forest-100 hover:bg-cream-100 transition-all">Cancel</button>
            <motion.button onClick={() => onConfirm({ title, language })} disabled={uploading || !title.trim()}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-ink-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#F5C842" }}>
              {uploading ? <><Spinner /> Uploading…</> : "Upload & Process"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── TutorChat ────────────────────────────────────────────────────────────────
const TutorChat = ({
  session, loading, uploading, toolLoading,
  attachedFile, onSend, onCallTool, onAttach, onClearAttachment, onUploadLecture,
}) => {
  const [input,       setInput]       = useState("");
  const [dragOver,    setDragOver]    = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const fileRef   = useRef(null);

  const messages   = session?.messages || [];
  const hasMessages = messages.length > 0;
  const hasLecture  = !!session?.lectureId;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, uploading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text && !attachedFile) return;
    onSend(text || `[Attached: ${attachedFile?.name}]`, session);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      setPendingFile(file);
    } else { onAttach(file); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      setPendingFile(file);
    } else { onAttach(file); }
  };

  const handleCardClick = (card) => {
    if (card.toolKey && hasLecture) {
      onCallTool({ toolKey: card.toolKey, displayQuestion: card.example, session });
    } else {
      setInput(card.example);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-full min-h-0 relative"
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* upload modal */}
      <AnimatePresence>
        {pendingFile && (
          <UploadModal file={pendingFile}
            onConfirm={async (opts) => { const f = pendingFile; setPendingFile(null); await onUploadLecture({ file: f, ...opts }, session); }}
            onCancel={() => setPendingFile(null)}
            uploading={uploading}
          />
        )}
      </AnimatePresence>

      {/* drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-forest-50/90 border-4 border-dashed border-forest-400 rounded-xl pointer-events-none">
            <div className="text-center">
              <p className="text-3xl mb-2">📎</p>
              <p className="text-forest-700 font-semibold text-sm">Drop your lecture here</p>
              <p className="text-forest-500 text-xs mt-1">PDF or DOCX</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── main chat column ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">

        {/* messages / welcome */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!hasMessages ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
              className="flex flex-col items-center px-6 py-10 max-w-3xl mx-auto">
              <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-3xl mb-5 shadow-sm">
                🎓
              </motion.div>
              <h2 className="font-display text-2xl text-ink-900 mb-2 text-center">Hello, what are we learning today?</h2>
              <p className="text-sm text-ink-500 text-center mb-3 max-w-sm leading-relaxed">
                I'm here to help you master any subject with clear explanations, summaries, and quizzes.
              </p>
              <motion.button onClick={() => fileRef.current?.click()}
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-ink-900 mb-10 transition-all"
                style={{ backgroundColor: "#F5C842", boxShadow: "0 2px 8px rgba(245,200,66,0.3)" }}>
                <span>📎</span> Upload a Lecture to Get Started
              </motion.button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                {CAPABILITY_CARDS.map((card, i) => (
                  <motion.button key={i} onClick={() => handleCardClick(card)}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease, delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-start gap-2.5 p-4 bg-white rounded-2xl border border-forest-100/70 hover:border-forest-300 hover:shadow-card transition-all duration-200 text-start">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: card.iconBg }}>{card.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900 leading-tight">{card.title}</p>
                      <p className="text-xs text-ink-400 mt-0.5 leading-snug">"{card.example}"</p>
                    </div>
                    {card.needsLecture && !hasLecture && (
                      <span className="text-2xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Upload a lecture first</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {session?.pdfFile && (
                <div className="pt-4">
                  <PDFPreview pdfFile={session.pdfFile} totalSlides={session.totalSlides || 1} />
                </div>
              )}
              <div className="px-6 pb-6 space-y-5">
                {messages.map(msg => <TutorMessage key={msg.id} msg={msg} />)}

                {/* typing indicator for chat messages — NOT an overlay */}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-forest-700 flex items-center justify-center text-base shrink-0">🎓</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1.5 px-4 py-3 bg-white border border-forest-100/60 rounded-2xl rounded-tl-sm shadow-sm">
                        {[0,1,2].map(i => (
                          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-ink-300"
                            animate={{ y: [0,-5,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.15 }} />
                        ))}
                      </div>
                      <p className="text-2xs text-ink-300 px-1">Writing now…</p>
                    </div>
                  </motion.div>
                )}

                {/* upload in-progress indicator */}
                {uploading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-forest-700 flex items-center justify-center text-base shrink-0">🎓</div>
                    <div className="px-4 py-3 bg-white border border-forest-100/60 rounded-2xl rounded-tl-sm shadow-sm">
                      <div className="flex items-center gap-2">
                        <Spinner dark />
                        <span className="text-xs text-ink-500">Processing your lecture…</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>
          )}
        </div>

        {/* input area */}
        <div className="shrink-0 px-4 pb-4 pt-2 max-w-3xl mx-auto w-full">
          <AnimatePresence>
            {attachedFile && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mb-2 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-forest-100 rounded-2xl">
                  {attachedFile.type === "image" && attachedFile.preview
                    ? <img src={attachedFile.preview} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    : <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center text-lg">📄</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-900 truncate">{attachedFile.name}</p>
                    <p className="text-2xs text-ink-400">{(attachedFile.size/1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={onClearAttachment} className="text-ink-400 hover:text-ink-700 p-1 rounded-lg hover:bg-cream-100 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 bg-white border border-forest-200 rounded-2xl px-3 py-2.5 focus-within:border-forest-600 focus-within:ring-2 focus-within:ring-forest-100 transition-all shadow-sm">
            <button onClick={() => fileRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-ink-400 hover:text-forest-700 hover:bg-cream-100 transition-colors shrink-0 mb-0.5"
              title="Attach file or upload lecture">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.docx,.pptx" />
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              disabled={loading || uploading} placeholder="Ask your Study Buddy anything… or drop a lecture file"
              rows={1} className="flex-1 text-sm text-ink-800 bg-transparent resize-none outline-none placeholder:text-ink-300 disabled:opacity-50 max-h-32 overflow-y-auto leading-relaxed py-1"
              style={{ minHeight: 28 }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px"; }} />
            <motion.button onClick={handleSend} disabled={(!input.trim() && !attachedFile) || loading || uploading}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-0.5"
              style={{ backgroundColor: "#1a4a47" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </motion.button>
          </div>
          <p className="text-center text-2xs text-ink-300 mt-2">
            Drop a PDF or DOCX to upload a lecture · AI can make mistakes — verify important information
          </p>
        </div>
      </div>

      {/* ── right: AI tools drop panel ── */}
      <div className="flex flex-col items-end justify-start pt-4 pe-2 shrink-0 relative">
        <AIToolsDropPanel
          hasLecture={hasLecture}
          onCallTool={onCallTool}
          loading={toolLoading}
          session={session}
        />
      </div>

      {/* overlay ONLY for tool panel clicks */}
      <ProcessingOverlay visible={toolLoading} type="summary" />
    </div>
  );
};

const Spinner = ({ dark }) => (
  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke={dark ? "#1a4a47" : "white"} strokeWidth="4"/>
    <path className="opacity-75" fill={dark ? "#1a4a47" : "white"} d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

export default TutorChat;
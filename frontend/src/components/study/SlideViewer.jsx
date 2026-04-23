import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";

// point the worker at the copy bundled with the package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const ease = [0.22, 1, 0.36, 1];

// ─── single page canvas ───────────────────────────────────────────────────────
const PDFPage = ({ pdfDoc, pageNumber, containerWidth }) => {
  const canvasRef = useRef(null);
  const [rendering, setRendering] = useState(true);
  const renderTaskRef = useRef(null);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerWidth) return;

    // cancel any in-flight render before starting a new one
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setRendering(true);

    try {
      const page     = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });

      // scale so the page fits the container width exactly
      const scale         = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      const canvas  = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width  = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const renderTask = page.render({
        canvasContext: context,
        viewport:      scaledViewport,
      });

      renderTaskRef.current = renderTask;
      await renderTask.promise;
      setRendering(false);
    } catch (err) {
      // RenderingCancelledException is expected when navigating fast — ignore it
      if (err?.name !== "RenderingCancelledException") {
        console.error("PDF render error:", err);
        setRendering(false);
      }
    }
  }, [pdfDoc, pageNumber, containerWidth]);

  useEffect(() => {
    renderPage();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [renderPage]);

  return (
    <div className="relative w-full">
      {/* skeleton shown while rendering */}
      {rendering && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-cream-50 rounded-xl"
          style={{ minHeight: 200 }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-forest-300"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <p className="text-xs text-ink-400">Rendering slide…</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl shadow-sm"
        style={{ display: rendering ? "none" : "block" }}
      />
    </div>
  );
};

// ─── SlideViewer ──────────────────────────────────────────────────────────────
// Props:
//   pdfFile     — the File object from the upload input (passed down from UploadPage)
//   currentSlide — 1-indexed current page number
//   totalSlides  — total number of pages
//   onPrev / onNext — navigation callbacks
//   title       — lecture title for the header
const SlideViewer = ({ pdfFile, currentSlide, totalSlides, onPrev, onNext, title }) => {
  const [pdfDoc,         setPdfDoc]         = useState(null);
  const [loadError,      setLoadError]      = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  const percent = totalSlides > 0 ? Math.round((currentSlide / totalSlides) * 100) : 0;

  // load the PDF from the File object
  useEffect(() => {
    if (!pdfFile) return;
    setLoadError(null);
    setPdfDoc(null);

    const url        = URL.createObjectURL(pdfFile);
    const loadingTask = pdfjsLib.getDocument(url);

    loadingTask.promise
      .then((doc) => setPdfDoc(doc))
      .catch((err) => {
        console.error("PDF load error:", err);
        setLoadError("Could not load this PDF. Make sure it's a valid file.");
      });

    return () => {
      URL.revokeObjectURL(url);
      loadingTask.destroy?.();
    };
  }, [pdfFile]);

  // measure container width for scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) setContainerWidth(width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-forest-100/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <SlideIcon />
          <span className="text-xs font-medium text-ink-700 truncate max-w-[180px]">{title}</span>
        </div>
        <span className="text-xs font-semibold text-ink-400 shrink-0 ms-2">
          Slide {currentSlide} / {totalSlides}
        </span>
      </div>

      {/* progress bar */}
      <div className="h-1 bg-cream-200 shrink-0">
        <motion.div
          className="h-full bg-forest-700"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease }}
        />
      </div>

      {/* PDF canvas area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 bg-stone-100">
        <div ref={containerRef} className="w-full">
          {loadError ? (
            <div className="flex items-center justify-center h-48 text-center px-6">
              <div>
                <p className="text-2xl mb-2">⚠️</p>
                <p className="text-sm text-red-500">{loadError}</p>
              </div>
            </div>
          ) : !pdfDoc ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-forest-400"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <p className="text-xs text-ink-400">Loading PDF…</p>
              </div>
            </div>
          ) : containerWidth > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 16  }}
                animate={{ opacity: 1, x: 0   }}
                exit={{    opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease }}
              >
                <PDFPage
                  pdfDoc={pdfDoc}
                  pageNumber={currentSlide}
                  containerWidth={containerWidth}
                />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>

      {/* navigation */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-forest-100/60 shrink-0 bg-white">
        <motion.button
          onClick={onPrev}
          disabled={currentSlide <= 1}
          whileHover={{ scale: currentSlide <= 1 ? 1 : 1.06 }}
          whileTap={{   scale: currentSlide <= 1 ? 1 : 0.94 }}
          className="w-10 h-10 rounded-full border border-forest-200 flex items-center justify-center text-ink-500 hover:border-forest-600 hover:text-forest-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon />
        </motion.button>

        {/* dot indicators or count */}
        <div className="flex items-center gap-1.5">
          {totalSlides <= 12 ? (
            Array.from({ length: totalSlides }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width:           i + 1 === currentSlide ? 18 : 6,
                  backgroundColor: i + 1 === currentSlide ? "#1a4a47" : "#d1d0cc",
                }}
                transition={{ duration: 0.25 }}
                className="h-1.5 rounded-full"
              />
            ))
          ) : (
            <span className="text-xs text-ink-400 font-medium">
              {currentSlide} / {totalSlides}
            </span>
          )}
        </div>

        <motion.button
          onClick={onNext}
          disabled={currentSlide >= totalSlides}
          whileHover={{ scale: currentSlide >= totalSlides ? 1 : 1.06 }}
          whileTap={{   scale: currentSlide >= totalSlides ? 1 : 0.94 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: currentSlide >= totalSlides ? "#c4c2be" : "#F5C842" }}
        >
          <ChevronRightIcon />
        </motion.button>
      </div>
    </div>
  );
};

// ─── icons ────────────────────────────────────────────────────────────────────
const SlideIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default SlideViewer;
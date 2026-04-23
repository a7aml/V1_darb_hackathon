import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  tutorAsk, tutorSummary, tutorFlashcards,
  tutorGlossary, tutorMindmap, tutorExplain, tutorTldr,
} from "../api/tutor";
import { uploadLecture } from "../api/upload";

const SESSION_KEY = "tutor_sessions";

const loadSessions = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]"); }
  catch { return []; }
};

const saveSessions = (sessions) => {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(sessions.slice(0, 30))); }
  catch {}
};

const makeId = () => Math.random().toString(36).slice(2, 10);

const useTutor = () => {
  const [sessions,      setSessions]      = useState(() => loadSessions());
  const [activeSession, setActiveSession] = useState(null);
  const [loading,       setLoading]       = useState(false);    // chat typing indicator
  const [toolLoading,   setToolLoading]   = useState(false);    // AI tools overlay
  const [uploading,     setUploading]     = useState(false);
  const [attachedFile,  setAttachedFile]  = useState(null);

  // ── session management ───────────────────────────────────────────────────────
  const newSession = useCallback(() => {
    const session = {
      id: makeId(), title: "New Chat",
      lectureId: null, lectureTitle: null,
      pdfFile: null, totalSlides: 0,
      messages: [], createdAt: new Date().toISOString(),
    };
    setActiveSession(session);
    return session;
  }, []);

  const openSession = useCallback((sessionId) => {
    const found = sessions.find(s => s.id === sessionId);
    if (found) setActiveSession({ ...found, pdfFile: null });
  }, [sessions]);

  const deleteSession = useCallback((sessionId) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveSessions(updated);
      return updated;
    });
    if (activeSession?.id === sessionId) setActiveSession(null);
  }, [activeSession]);

  const persistSession = useCallback((session) => {
    const { pdfFile, ...serialisable } = session;
    setSessions(prev => {
      const updated = [serialisable, ...prev.filter(s => s.id !== session.id)];
      saveSessions(updated);
      return updated;
    });
  }, []);

  // ── file attachment ──────────────────────────────────────────────────────────
  const attachFile = useCallback((file) => {
    if (!file) { setAttachedFile(null); return; }
    const isImage = file.type.startsWith("image/");
    setAttachedFile({ file, preview: isImage ? URL.createObjectURL(file) : null, type: isImage ? "image" : "document", name: file.name, size: file.size });
  }, []);

  const clearAttachment = useCallback(() => {
    if (attachedFile?.preview) URL.revokeObjectURL(attachedFile.preview);
    setAttachedFile(null);
  }, [attachedFile]);

  // ── add message ──────────────────────────────────────────────────────────────
  const addMessage = useCallback((session, msg) => {
    const isFirstUser = msg.role === "user" && !session.messages.some(m => m.role === "user");
    const updated = {
      ...session,
      messages: [...session.messages, msg],
      title: isFirstUser && !msg.isUpload
        ? msg.text.replace(/\*\*/g, "").slice(0, 40) + (msg.text.length > 40 ? "…" : "")
        : session.title,
    };
    setActiveSession(updated);
    persistSession(updated);
    return updated;
  }, [persistSession]);

  // ── upload lecture from chat ─────────────────────────────────────────────────
  const uploadLectureFromChat = useCallback(async ({ file, title, language = "en" }, session) => {
    const current = session || activeSession;
    if (!current) return;
    const userMsg = { id: makeId(), role: "user", text: `📎 Uploading: **${title}**`, isUpload: true, timestamp: new Date().toISOString() };
    const afterUser = addMessage(current, userMsg);
    setUploading(true);
    try {
      const data = await uploadLecture({ file, title, language });
      const updated = { ...afterUser, lectureId: data.lecture_id, lectureTitle: title, pdfFile: file, totalSlides: data.total_slides, title: title.slice(0, 40) };
      setActiveSession(updated);
      persistSession(updated);
      addMessage(updated, {
        id: makeId(), role: "assistant",
        text: `✅ **"${title}"** uploaded! I've processed **${data.total_slides} slides** and I'm ready to help you study it.\n\nYou can now ask me to summarise it, generate flashcards, explain specific slides, or anything else.`,
        lectureReady: true, timestamp: new Date().toISOString(),
      });
      toast.success(`"${title}" uploaded!`);
    } catch (err) {
      addMessage(afterUser, { id: makeId(), role: "assistant", text: `❌ Upload failed: ${err.message}`, isError: true, timestamp: new Date().toISOString() });
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }, [activeSession, addMessage]);

  // ── send free-text (shows typing indicator, no overlay) ──────────────────────
  const send = useCallback(async (text, session) => {
    if (!text.trim() || loading) return;
    const current = session || activeSession;
    if (!current) return;
    const userMsg = { id: makeId(), role: "user", text, attachment: attachedFile ? { ...attachedFile, file: undefined } : null, timestamp: new Date().toISOString() };
    clearAttachment();
    const afterUser = addMessage(current, userMsg);
    setLoading(true); // shows "Writing now…" indicator, NOT overlay
    try {
      const data = await tutorAsk({ lecture_id: current.lectureId || null, message: text });
      addMessage(afterUser, { id: makeId(), role: "assistant", text: data.answer, source_slides: data.source_slides || [], confidence: data.confidence, timestamp: new Date().toISOString() });
    } catch (err) {
      addMessage(afterUser, { id: makeId(), role: "assistant", text: "Sorry, something went wrong. Please try again. 🙏", isError: true, timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  }, [loading, activeSession, attachedFile, addMessage, clearAttachment]);

  // ── call AI tool (shows overlay) ─────────────────────────────────────────────
  const callTool = useCallback(async ({ toolKey, slideNumber, displayQuestion, session }) => {
    const current = session || activeSession;
    if (!current) return;
    const lectureId = current.lectureId;
    const userMsg = { id: makeId(), role: "user", text: displayQuestion, toolKey, timestamp: new Date().toISOString() };
    const afterUser = addMessage(current, userMsg);
    setToolLoading(true); // shows ProcessingOverlay
    try {
      let data;
      switch (toolKey) {
        case "summary":    data = await tutorSummary(lectureId); break;
        case "flashcards": data = await tutorFlashcards(lectureId); break;
        case "glossary":   data = await tutorGlossary(lectureId); break;
        case "mindmap":    data = await tutorMindmap(lectureId); break;
        case "explain":    data = await tutorExplain(lectureId, slideNumber); break;
        case "tldr":       data = await tutorTldr(lectureId, slideNumber); break;
        default:           data = await tutorAsk({ lecture_id: lectureId, message: displayQuestion });
      }
      addMessage(afterUser, {
        id: makeId(), role: "assistant",
        text: formatToolResponse(toolKey, data),
        toolKey, toolData: data,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      addMessage(afterUser, { id: makeId(), role: "assistant", text: `Failed to run ${toolKey}. Please try again.`, isError: true, timestamp: new Date().toISOString() });
    } finally {
      setToolLoading(false);
    }
  }, [activeSession, addMessage]);

  return {
    sessions, activeSession, loading, toolLoading, uploading, attachedFile,
    newSession, openSession, deleteSession,
    attachFile, clearAttachment,
    uploadLectureFromChat, send, callTool,
  };
};

const formatToolResponse = (toolKey, data) => {
  switch (toolKey) {
    case "summary":    return `**${data.title || "Summary"}**\n\n${data.summary}`;
    case "flashcards": return `Here are **${data.flashcards?.length || 0} flashcards** for you:`;
    case "glossary":
      if (!data.glossary?.length) return "No terms found.";
      return `**Key Terms:**\n\n` + data.glossary.slice(0, 6).map(t => `**${t.term}** — ${t.definition}`).join("\n\n");
    case "mindmap":    return `Here's your mind map for **${data.mindmap?.central || "the lecture"}**. Click any node to explore branches:`;
    case "explain":    return `**Slide ${data.slide_number} Explanation**\n\n${data.explanation}`;
    case "tldr":       return `**TL;DR — Slide ${data.slide_number}**\n\n"${data.tldr}"`;
    default:           return data.answer || JSON.stringify(data);
  }
};

export default useTutor;
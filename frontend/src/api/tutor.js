import api from "./auth";

// ── Chatbot (RAG-powered Q&A) ──────────────────────────────────────────────────
export const tutorAsk = async ({ lecture_id = null, message }) => {
  try {
    const body = { message };
    if (lecture_id) body.lecture_id = lecture_id;
    const res = await api.post("/chatbot/ask", body);
    return res.data; // { answer, source_slides, confidence }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to get a response.");
  }
};

export const tutorHistory = async (lectureId) => {
  try {
    const res = await api.get(`/chatbot/history/${lectureId}`);
    return res.data; // { messages }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load history.");
  }
};

// ── Study tools called from tutor context ─────────────────────────────────────
export const tutorSummary    = async (lectureId) => (await api.get(`/study/summary/${lectureId}`)).data;
export const tutorFlashcards = async (lectureId) => (await api.get(`/study/flashcards/${lectureId}`)).data;
export const tutorGlossary   = async (lectureId) => (await api.get(`/study/glossary/${lectureId}`)).data;
export const tutorMindmap    = async (lectureId) => (await api.get(`/study/mindmap/${lectureId}`)).data;
export const tutorExplain    = async (lectureId, slide) => (await api.get(`/study/explain/${lectureId}/${slide}`)).data;
export const tutorTldr       = async (lectureId, slide) => (await api.get(`/study/tldr/${lectureId}/${slide}`)).data;
import api from "./auth";

// GET /study/summary/<lecture_id>
export const getSummary = async (lectureId) => {
  try {
    const res = await api.get(`/study/summary/${lectureId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load summary.");
  }
};

// GET /study/explain/<lecture_id>/<slide_number>
export const explainSlide = async (lectureId, slideNumber) => {
  try {
    const res = await api.get(`/study/explain/${lectureId}/${slideNumber}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to explain slide.");
  }
};

// GET /study/flashcards/<lecture_id>
export const getFlashcards = async (lectureId) => {
  try {
    const res = await api.get(`/study/flashcards/${lectureId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load flashcards.");
  }
};

// GET /study/mindmap/<lecture_id>
export const getMindmap = async (lectureId) => {
  try {
    const res = await api.get(`/study/mindmap/${lectureId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load mind map.");
  }
};

// GET /study/glossary/<lecture_id>
export const getGlossary = async (lectureId) => {
  try {
    const res = await api.get(`/study/glossary/${lectureId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load glossary.");
  }
};

// GET /study/tldr/<lecture_id>/<slide_number>
export const getTldr = async (lectureId, slideNumber) => {
  try {
    const res = await api.get(`/study/tldr/${lectureId}/${slideNumber}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load TL;DR.");
  }
};
import api from "./auth";

// GET /assessment/dashboard — overall progress across all lectures
export const getAssessmentDashboard = async () => {
  try {
    const res = await api.get("/assessment/dashboard");
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load dashboard.");
  }
};

// GET /assessment/progress/<lecture_id>
export const getLectureProgress = async (lectureId) => {
  try {
    const res = await api.get(`/assessment/progress/${lectureId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load lecture progress.");
  }
};

// GET /upload/lectures — all uploaded lectures (for Pick a Lecture grid)
export const getAllLectures = async () => {
  try {
    const res = await api.get("/upload/lectures");
    return res.data; // { lectures: [...] }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load lectures.");
  }
};

// GET /quiz/history/<lecture_id>
export const getQuizHistory = async (lectureId) => {
  try {
    const res = await api.get(`/quiz/history/${lectureId}`);
    return res.data; // { attempts: [...] }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load quiz history.");
  }
};

// GET /quiz/session/<session_id> — detailed session with all Q&A
export const getQuizSession = async (sessionId) => {
  try {
    const res = await api.get(`/quiz/session/${sessionId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load quiz session.");
  }
};

// GET /assessment/result/<session_id>
export const getAssessmentResult = async (sessionId) => {
  try {
    const res = await api.get(`/assessment/result/${sessionId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load result.");
  }
};

// GET /recommendation/<lecture_id>
export const getRecommendations = async (lectureId) => {
  try {
    const res = await api.get(`/recommendation/${lectureId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load recommendations.");
  }
};

// DELETE /upload/lecture/<lecture_id>
export const deleteLecture = async (lectureId) => {
  try {
    const res = await api.delete(`/upload/lecture/${lectureId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to delete lecture.");
  }
};
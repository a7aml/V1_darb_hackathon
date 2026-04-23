import api from "./auth";

// ── Quiz ──────────────────────────────────────────────────────────────────────

// POST /quiz/generate
export const generateQuiz = async ({ lecture_id, type, difficulty, num_questions, slide_number = null }) => {
  try {
    const res = await api.post("/quiz/generate", {
      lecture_id, type, difficulty, num_questions, slide_number,
    });
    return res.data; // { quiz_id, questions }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to generate quiz.");
  }
};

// POST /quiz/submit
export const submitQuiz = async ({ quiz_id, lecture_id, time_taken, answers }) => {
  try {
    const res = await api.post("/quiz/submit", {
      quiz_id, lecture_id, time_taken, answers,
    });
    return res.data; // { session_id, score, total, correct, wrong, xp_earned }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to submit quiz.");
  }
};

// GET /quiz/history/<lecture_id>
export const getQuizHistory = async (lectureId) => {
  try {
    const res = await api.get(`/quiz/history/${lectureId}`);
    return res.data; // { attempts }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load quiz history.");
  }
};

// ── Assessment ────────────────────────────────────────────────────────────────

// GET /assessment/result/<session_id>
export const getAssessmentResult = async (sessionId) => {
  try {
    const res = await api.get(`/assessment/result/${sessionId}`);
    return res.data; // { session_id, score, xp_earned, questions }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load results.");
  }
};

// GET /assessment/progress/<lecture_id>
export const getProgress = async (lectureId) => {
  try {
    const res = await api.get(`/assessment/progress/${lectureId}`);
    return res.data; // { lecture_id, total_sessions, average_score, best_score, total_xp, weak_slides }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load progress.");
  }
};

// ── Recommendation ────────────────────────────────────────────────────────────

// GET /recommendation/<lecture_id>
export const getRecommendations = async (lectureId) => {
  try {
    const res = await api.get(`/recommendation/${lectureId}`);
    return res.data; // { lecture_id, weak_topics, general_advice }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load recommendations.");
  }
};
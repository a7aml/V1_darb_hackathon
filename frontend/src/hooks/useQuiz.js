import { useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  generateQuiz,
  submitQuiz,
  getQuizHistory,
  getAssessmentResult,
  getProgress,
  getRecommendations,
} from "../api/quiz";

// quiz flow states: "setup" → "active" → "submitting" → "results"
const useQuiz = (lectureId) => {
  const [phase,           setPhase]           = useState("setup");
  const [quizData,        setQuizData]        = useState(null);   // { quiz_id, questions }
  const [answers,         setAnswers]         = useState({});     // { question_id: answer }
  const [result,          setResult]          = useState(null);   // submit response
  const [detailedResult,  setDetailedResult]  = useState(null);   // assessment/result
  const [progress,        setProgress]        = useState(null);   // assessment/progress
  const [recommendations, setRecommendations] = useState(null);
  const [history,         setHistory]         = useState([]);
  const [loading, setLoading] = useState({
    generate:  false,
    submit:    false,
    result:    false,
    progress:  false,
    recommend: false,
    history:   false,
  });

  const startTime = useRef(null); // track time spent on quiz

  const setLoad = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  // ── generate ────────────────────────────────────────────────────────────────
  const generate = useCallback(async (config) => {
    setLoad("generate", true);
    try {
      const data = await generateQuiz({ lecture_id: lectureId, ...config });
      setQuizData(data);
      setAnswers({});
      startTime.current = Date.now();
      setPhase("active");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("generate", false);
    }
  }, [lectureId]);

  // ── answer a question ────────────────────────────────────────────────────────
  const answerQuestion = useCallback((questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  // ── submit ───────────────────────────────────────────────────────────────────
 // ── submit ───────────────────────────────────────────────────────────────────
const submit = useCallback(async () => {
  if (!quizData) return;
  const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
  const answerList = Object.entries(answers).map(([question_id, answer]) => ({
    question_id,  // ✅ Keep as string (UUID)
    answer,
  }));

  setLoad("submit", true);
  try {
    const data = await submitQuiz({
      quiz_id:    quizData.quiz_id,
      lecture_id: lectureId,
      time_taken: timeTaken,
      answers:    answerList,
    });
    setResult(data);
    setPhase("results");

    // fetch detailed result + progress in parallel
    await Promise.all([
      fetchDetailedResult(data.session_id),
      fetchProgress(),
    ]);
  } catch (err) {
    toast.error(err.message);
  } finally {
    setLoad("submit", false);
  }
}, [quizData, answers, lectureId]);

  // ── fetch detailed result ────────────────────────────────────────────────────
  const fetchDetailedResult = useCallback(async (sessionId) => {
    setLoad("result", true);
    try {
      const data = await getAssessmentResult(sessionId);
      setDetailedResult(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("result", false);
    }
  }, []);

  // ── fetch progress ───────────────────────────────────────────────────────────
  const fetchProgress = useCallback(async () => {
    setLoad("progress", true);
    try {
      const data = await getProgress(lectureId);
      setProgress(data);
    } catch (err) {
      // non-critical — don't toast
    } finally {
      setLoad("progress", false);
    }
  }, [lectureId]);

  // ── fetch recommendations ────────────────────────────────────────────────────
  const fetchRecommendations = useCallback(async () => {
    setLoad("recommend", true);
    try {
      const data = await getRecommendations(lectureId);
      setRecommendations(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("recommend", false);
    }
  }, [lectureId]);

  // ── fetch history ─────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setLoad("history", true);
    try {
      const data = await getQuizHistory(lectureId);
      setHistory(data.attempts || []);
    } catch (err) {
      // non-critical
    } finally {
      setLoad("history", false);
    }
  }, [lectureId]);

  // ── reset to setup ────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setPhase("setup");
    setQuizData(null);
    setAnswers({});
    setResult(null);
    setDetailedResult(null);
  }, []);

  const answeredCount  = Object.keys(answers).length;
  const totalQuestions = quizData?.questions?.length || 0;
  const allAnswered    = answeredCount === totalQuestions && totalQuestions > 0;

  return {
    phase, quizData, answers, result, detailedResult,
    progress, recommendations, history,
    loading, answeredCount, totalQuestions, allAnswered,
    generate, answerQuestion, submit, reset,
    fetchProgress, fetchRecommendations, fetchHistory,
  };
};

export default useQuiz;
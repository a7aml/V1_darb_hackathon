import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getAssessmentDashboard,
  getLectureProgress,
  getAllLectures,
  getQuizHistory,
  getAssessmentResult,
  getRecommendations,
} from "../api/progress";

const useProgress = () => {
  const [dashboard,       setDashboard]       = useState(null);
  const [lectures,        setLectures]        = useState([]);
  const [lectureProgress, setLectureProgress] = useState({}); // keyed by lecture_id
  const [allHistory,      setAllHistory]      = useState([]); // flat list across all lectures
  const [recommendations, setRecommendations] = useState({}); // keyed by lecture_id
  const [selectedResult,  setSelectedResult]  = useState(null);

  const [loading, setLoading] = useState({
    dashboard: false,
    lectures:  false,
    history:   false,
    result:    false,
  });

  const setLoad = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  // ── initial load ─────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoad("dashboard", true);
    setLoad("lectures",  true);

    try {
      const [dashData, lectureData] = await Promise.all([
        getAssessmentDashboard(),
        getAllLectures(),
      ]);

      setDashboard(dashData);
      const lectureList = lectureData.lectures || [];
      setLectures(lectureList);

      // fetch quiz history for each lecture in parallel (up to 5)
      if (lectureList.length > 0) {
        setLoad("history", true);
        const historyResults = await Promise.allSettled(
          lectureList.slice(0, 10).map((l) =>
            getQuizHistory(l.id).then((d) =>
              (d.attempts || []).map((a) => ({ ...a, lectureId: l.id, lectureTitle: l.title }))
            )
          )
        );
        const flat = historyResults
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => r.value);
        // sort by date descending
        flat.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllHistory(flat);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("dashboard", false);
      setLoad("lectures",  false);
      setLoad("history",   false);
    }
  }, []);

  useEffect(() => { loadAll(); }, []);

  // ── fetch progress for a specific lecture ────────────────────────────────────
  const fetchLectureProgress = useCallback(async (lectureId) => {
    if (lectureProgress[lectureId]) return; // already loaded
    try {
      const data = await getLectureProgress(lectureId);
      setLectureProgress((prev) => ({ ...prev, [lectureId]: data }));
    } catch {
      // non-critical
    }
  }, [lectureProgress]);

  // ── fetch recommendations for a lecture ──────────────────────────────────────
  const fetchRecommendations = useCallback(async (lectureId) => {
    if (recommendations[lectureId]) return;
    try {
      const data = await getRecommendations(lectureId);
      setRecommendations((prev) => ({ ...prev, [lectureId]: data }));
    } catch {
      // non-critical
    }
  }, [recommendations]);

  // ── open a specific result ────────────────────────────────────────────────────
  const openResult = useCallback(async (sessionId, lectureId) => {
    setLoad("result", true);
    try {
      const [resultData, recData] = await Promise.all([
        getAssessmentResult(sessionId),
        lectureId ? getRecommendations(lectureId).catch(() => null) : Promise.resolve(null),
      ]);
      setSelectedResult({ ...resultData, lectureId });
      if (recData && lectureId) {
        setRecommendations((prev) => ({ ...prev, [lectureId]: recData }));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("result", false);
    }
  }, []);

  const closeResult = () => setSelectedResult(null);

  // ── build leaderboard from dashboard data ────────────────────────────────────
  // For now: rank the current user. When friends are added, this expands.
  // We use local storage to simulate a leaderboard so it persists across sessions.
  const getLeaderboard = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("leaderboard") || "[]");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const totalXp = dashboard?.total_xp || 0;

      // upsert current user
      const existing = stored.find((e) => e.id === user.id);
      if (!existing && user.id) {
        stored.push({ id: user.id, name: user.full_name || "You", xp: totalXp, isYou: true });
        localStorage.setItem("leaderboard", JSON.stringify(stored));
      } else if (existing) {
        existing.xp = Math.max(existing.xp, totalXp);
        existing.isYou = true;
        localStorage.setItem("leaderboard", JSON.stringify(stored));
      }

      // sort by XP descending
      return stored.sort((a, b) => b.xp - a.xp);
    } catch { return []; }
  }, [dashboard]);

  return {
    dashboard, lectures, lectureProgress, allHistory,
    recommendations, selectedResult,
    loading,
    loadAll, fetchLectureProgress, fetchRecommendations,
    openResult, closeResult,
    getLeaderboard,
  };
};

export default useProgress;
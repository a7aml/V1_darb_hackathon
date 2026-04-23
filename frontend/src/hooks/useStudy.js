import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getSummary,
  explainSlide,
  getFlashcards,
  getMindmap,
  getGlossary,
  getTldr,
} from "../api/study";

// each tool has its own loading + result state to allow parallel usage
const useStudy = (lectureId) => {
  const [summary,    setSummary]    = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [mindmap,    setMindmap]    = useState(null);
  const [glossary,   setGlossary]   = useState(null);
  const [tldr,       setTldr]       = useState(null);

  const [loading, setLoading] = useState({
    summary:     false,
    explanation: false,
    flashcards:  false,
    mindmap:     false,
    glossary:    false,
    tldr:        false,
  });

  const setLoad = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  const fetchSummary = useCallback(async () => {
    setLoad("summary", true);
    try {
      const data = await getSummary(lectureId);
      setSummary(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("summary", false);
    }
  }, [lectureId]);

  const fetchExplanation = useCallback(async (slideNumber) => {
    setLoad("explanation", true);
    try {
      const data = await explainSlide(lectureId, slideNumber);
      setExplanation(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("explanation", false);
    }
  }, [lectureId]);

  const fetchFlashcards = useCallback(async () => {
    setLoad("flashcards", true);
    try {
      const data = await getFlashcards(lectureId);
      setFlashcards(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("flashcards", false);
    }
  }, [lectureId]);

  const fetchMindmap = useCallback(async () => {
    setLoad("mindmap", true);
    try {
      const data = await getMindmap(lectureId);
      setMindmap(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("mindmap", false);
    }
  }, [lectureId]);

  const fetchGlossary = useCallback(async () => {
    setLoad("glossary", true);
    try {
      const data = await getGlossary(lectureId);
      setGlossary(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("glossary", false);
    }
  }, [lectureId]);

  const fetchTldr = useCallback(async (slideNumber) => {
    setLoad("tldr", true);
    try {
      const data = await getTldr(lectureId, slideNumber);
      setTldr(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad("tldr", false);
    }
  }, [lectureId]);

  const clearTool = (key) => {
    const map = {
      summary:     () => setSummary(null),
      explanation: () => setExplanation(null),
      flashcards:  () => setFlashcards(null),
      mindmap:     () => setMindmap(null),
      glossary:    () => setGlossary(null),
      tldr:        () => setTldr(null),
    };
    map[key]?.();
  };

  return {
    summary, explanation, flashcards, mindmap, glossary, tldr,
    loading,
    fetchSummary,
    fetchExplanation,
    fetchFlashcards,
    fetchMindmap,
    fetchGlossary,
    fetchTldr,
    clearTool,
  };
};

export default useStudy;
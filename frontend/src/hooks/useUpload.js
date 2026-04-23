import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { uploadLecture, getLectures } from "../api/upload";

const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};

const MAX_SIZE_MB    = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const useUpload = () => {
  const [lectures,    setLectures]    = useState([]);
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [loadingList, setLoadingList] = useState(false);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES[file.type]) {
      toast.error("Only PDF and DOCX files are supported.");
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const fetchLectures = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await getLectures();
      setLectures(data.lectures || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const upload = useCallback(async ({ file, title, language }) => {
    if (!validateFile(file)) return null;
    if (!title.trim()) { toast.error("Please enter a lecture title."); return null; }

    setUploading(true);
    setProgress(0);

    const ticker = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 300);

    try {
      const data = await uploadLecture({ file, title, language });
      clearInterval(ticker);
      setProgress(100);
      toast.success(`"${title}" uploaded successfully!`);
      await fetchLectures();
      return { ...data, title, language };
    } catch (err) {
      clearInterval(ticker);
      toast.error(err.message);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }, [fetchLectures]);

  // frontend-only removal — no API call, just filters local state
  const removeLecture = useCallback((lectureId) => {
    setLectures((prev) => prev.filter((l) => l.id !== lectureId));
    toast.success("Lecture removed.");
  }, []);

  return {
    lectures,
    uploading,
    progress,
    loadingList,
    upload,
    fetchLectures,
    removeLecture,
    validateFile,
    ACCEPTED_TYPES,
  };
};

export default useUpload;
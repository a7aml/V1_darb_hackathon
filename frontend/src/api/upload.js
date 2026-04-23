import api from "./auth";

// POST /upload/lecture
// multipart/form-data — file, title, language
export const uploadLecture = async ({ file, title, language }) => {
  try {
    const formData = new FormData();
    formData.append("file",     file);
    formData.append("title",    title);
    formData.append("language", language);

    const res = await api.post("/upload/lecture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // track upload progress — caller can pass onUploadProgress via config
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Upload failed. Please try again.");
  }
};

// GET /upload/lectures
// Returns all lectures uploaded by the logged-in student
export const getLectures = async () => {
  try {
    const res = await api.get("/upload/lectures");
    return res.data; // { lectures: [...] }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load lectures.");
  }
};
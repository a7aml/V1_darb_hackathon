import axios from "axios";

// Flask → port 5000  |  Vite dev server → port 5173
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  // no timeout — AI processing (summarize, flashcards, mindmap etc.) can take
  // 30-120 seconds depending on lecture size. A hard timeout kills those requests.
});

// attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// global 401 handler — expired/invalid token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const signupUser = async ({ email, password, full_name }) => {
  try {
    const res = await api.post("/auth/signup", { email, password, full_name });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Signup failed. Please try again.");
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Invalid email or password.");
  }
};

export const googleAuth = async (google_token) => {
  try {
    const res = await api.post("/auth/google", { google_token });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Google login failed. Please try again.");
  }
};

export default api;
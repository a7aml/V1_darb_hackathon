// src/api/voice.js
import api from "./auth";

// ── Voice API ─────────────────────────────────────────────────────────────────

// POST /voice/transcribe - AUTO-DETECT LANGUAGE
export const transcribeAudio = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    // NO language parameter - let Whisper auto-detect
    
    const res = await api.post("/voice/transcribe", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to transcribe audio");
  }
};

// POST /voice/synthesize
export const synthesizeSpeech = async ({ text, voice = 'nova', format = 'mp3' }) => {
  try {
    const res = await api.post("/voice/synthesize", { text, voice, format }, {
      responseType: 'blob'
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to generate speech");
  }
};

// GET /voice/dialects
export const getDialects = async () => {
  try {
    const res = await api.get("/voice/dialects");
    return res.data;
  } catch (err) {
    throw new Error("Failed to load dialects");
  }
};

// GET /voice/voices
export const getVoices = async () => {
  try {
    const res = await api.get("/voice/voices");
    return res.data;
  } catch (err) {
    throw new Error("Failed to load voices");
  }
};
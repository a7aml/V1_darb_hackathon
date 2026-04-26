// src/hooks/useVoiceConversation.js - FIXED AUDIO URL
import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { transcribeAudio } from '../api/voice';
import api from '../api/auth';

const useVoiceConversation = ({ lectureId, onConversationUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVoice, setCurrentVoice] = useState('nova');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const isStartingRef = useRef(false);

  // Auto-start listening when conversation becomes active
  useEffect(() => {
    if (isActive && !isListening && !isSpeaking && !isProcessing && !isStartingRef.current) {
      console.log('🎤 Auto-starting listening...');
      const timer = setTimeout(() => {
        startListening();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, isListening, isSpeaking, isProcessing]);

  // Start voice conversation mode
  const startConversation = useCallback(async () => {
    try {
      console.log('🎙️ Starting voice conversation mode');
      setIsActive(true);
      toast.success('🎤 Voice mode activated - Start speaking!');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start voice mode');
    }
  }, []);

  // End voice conversation mode
  const endConversation = useCallback(() => {
    console.log('👋 Ending voice conversation');
    
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    isStartingRef.current = false;
    
    toast.success('👋 Voice mode ended');
  }, []);

  // Start listening for user input
  const startListening = useCallback(async () => {
    if (!isActive) {
      console.log('❌ Not active, skipping listen');
      return;
    }
    
    if (isStartingRef.current) {
      console.log('⏳ Already starting, skipping');
      return;
    }
    
    isStartingRef.current = true;
    
    try {
      console.log('🎤 Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('✅ Microphone access granted');
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      
      setIsListening(true);
      isStartingRef.current = false;
      
      console.log('🔴 Recording started');
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('⏹️ Recording stopped');
        
        const duration = (Date.now() - startTimeRef.current) / 1000;
        
        if (duration < 0.5) {
          console.log('⚠️ Recording too short, restarting...');
          // Too short - restart listening
          if (isActive) {
            setTimeout(() => startListening(), 500);
          }
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        console.log(`📦 Audio recorded: ${duration.toFixed(1)}s, ${(audioBlob.size / 1024).toFixed(1)}KB`);
        
        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setIsListening(false);
        
        // Process the audio
        await processUserSpeech(audioBlob);
      };
      
      mediaRecorder.start();
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('⏰ Auto-stopping after 10s');
          mediaRecorderRef.current.stop();
        }
      }, 10000);
      
    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      isStartingRef.current = false;
      setIsListening(false);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error('Could not access microphone: ' + error.message);
      }
    }
  }, [isActive]);

  // Stop listening manually
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('⏹️ Manually stopping recording');
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Process user speech
  const processUserSpeech = useCallback(async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Transcribing audio...');
      
      // Transcribe audio
      const transcriptionResult = await transcribeAudio(audioBlob);
      const userMessage = transcriptionResult.transcription;
      
      console.log('✅ User said:', userMessage);
      
      // Update conversation UI
      if (onConversationUpdate) {
        onConversationUpdate({
          type: 'user',
          text: userMessage,
          language: transcriptionResult.language
        });
      }
      
      // Get AI response with voice
      await getAIResponse(userMessage);
      
    } catch (error) {
      console.error('❌ Error processing speech:', error);
      toast.error('Failed to process your speech: ' + (error.message || 'Unknown error'));
      setIsProcessing(false);
      
      // Restart listening
      if (isActive) {
        setTimeout(() => startListening(), 1000);
      }
    }
  }, [isActive, onConversationUpdate]);

  // Get AI response (text + audio)
  const getAIResponse = useCallback(async (userMessage) => {
    try {
      console.log('🤖 Getting AI response...');
      
      const response = await api.post('/chatbot/ask-voice', {
        lecture_id: lectureId,
        message: userMessage,
        voice: currentVoice,
        language: 'en'
      });
      
      const { answer, audio_url, sources } = response.data;
      
      console.log('✅ AI response received');
      console.log('📝 Answer:', answer);
      console.log('🔗 Audio URL:', audio_url);
      
      // Update conversation UI
      if (onConversationUpdate) {
        onConversationUpdate({
          type: 'ai',
          text: answer,
          sources: sources
        });
      }
      
      setIsProcessing(false);
      
      // Play audio response
      if (audio_url) {
        await playAudioResponse(audio_url);
      } else {
        console.log('⚠️ No audio URL, restarting listening');
        // No audio, just restart listening
        if (isActive) {
          setTimeout(() => startListening(), 500);
        }
      }
      
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      toast.error('Failed to get response: ' + (error.response?.data?.error || error.message));
      setIsProcessing(false);
      
      // Restart listening
      if (isActive) {
        setTimeout(() => startListening(), 1000);
      }
    }
  }, [isActive, lectureId, currentVoice, onConversationUpdate]);

  // Play AI audio response
  const playAudioResponse = useCallback(async (audioUrl) => {
    return new Promise((resolve, reject) => {
      setIsSpeaking(true);
      
      console.log('🔊 Playing audio response...');
      
      // FIX: Construct proper URL
      // audioUrl comes as: "/api/voice/audio/tts_123.mp3"
      // We need: "http://localhost:5000/api/voice/audio/tts_123.mp3"
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Remove /api prefix from baseUrl if it exists
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      
      // Construct full URL
      // If audioUrl starts with /api, use it as is
      // If not, prepend /api
      let fullUrl;
      if (audioUrl.startsWith('http')) {
        fullUrl = audioUrl;
      } else if (audioUrl.startsWith('/api/')) {
        fullUrl = `${cleanBaseUrl}${audioUrl}`;
      } else {
        fullUrl = `${cleanBaseUrl}/api${audioUrl}`;
      }
      
      console.log('🎵 Audio URL:', fullUrl);
      
      const audio = new Audio(fullUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        console.log('✅ Audio playback ended');
        setIsSpeaking(false);
        audioRef.current = null;
        
        // Restart listening for next question
        if (isActive) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
        
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        console.error('Failed URL:', fullUrl);
        setIsSpeaking(false);
        audioRef.current = null;
        
        toast.error('Audio playback failed');
        
        // Restart listening even on error
        if (isActive) {
          setTimeout(() => startListening(), 1000);
        }
        
        reject(error);
      };
      
      audio.play().catch(error => {
        console.error('❌ Play error:', error);
        setIsSpeaking(false);
        toast.error('Could not play audio');
        reject(error);
      });
    });
  }, [isActive]);

  return {
    // State
    isActive,
    isListening,
    isSpeaking,
    isProcessing,
    currentVoice,
    
    // Actions
    startConversation,
    endConversation,
    stopListening,
    setCurrentVoice
  };
};

export default useVoiceConversation;
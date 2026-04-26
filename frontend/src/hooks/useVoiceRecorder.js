// src/hooks/useVoiceRecorder.js
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { transcribeAudio } from '../api/voice';

const useVoiceRecorder = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      streamRef.current = stream;
      
      // Create media recorder - let browser choose best format
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        // Check recording duration
        const duration = (Date.now() - startTimeRef.current) / 1000;
        
        if (duration < 0.5) {
          toast.error('Recording too short. Please hold the button longer.');
          streamRef.current?.getTracks().forEach(track => track.stop());
          streamRef.current = null;
          return;
        }
        
        // Create blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        
        console.log('Audio recorded:', {
          duration: duration.toFixed(1) + 's',
          size: (audioBlob.size / 1024).toFixed(1) + 'KB',
          type: audioBlob.type
        });
        
        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        // Process the audio
        await processAudio(audioBlob);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error('Could not access microphone');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      // Send to backend for transcription - NO language parameter (auto-detect)
      const result = await transcribeAudio(audioBlob);
      
      // Call the callback with transcribed text
      if (onTranscription) {
        onTranscription({
          text: result.transcription,
          dialect: result.dialect,
          dialectName: result.dialect_name,
          detectedLanguage: result.language  // Show what language was detected
        });
      }
      
      // Show success with detected language
      const languageEmoji = result.language === 'ar' ? '🇸🇦' : '🇬🇧';
      toast.success(`${languageEmoji} ${result.dialect_name || result.language.toUpperCase()}`);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error(error.message || 'Failed to process voice');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording
  };
};

export default useVoiceRecorder;
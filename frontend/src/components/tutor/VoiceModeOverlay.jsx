// src/components/tutor/VoiceModeOverlay.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TalkingAvatar from './TalkingAvatar';
import useVoiceConversation from '../../hooks/useVoiceConversation';

const VoiceModeOverlay = ({ isOpen, onClose, lectureId }) => {
  const [conversation, setConversation] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    isActive,
    isListening,
    isSpeaking,
    isProcessing,
    currentVoice,
    startConversation,
    endConversation,
    stopListening,
    setCurrentVoice
  } = useVoiceConversation({
    lectureId,
    onConversationUpdate: (message) => {
      setConversation(prev => [...prev, message]);
    }
  });
  
  // Auto-start conversation when opened
  useEffect(() => {
    if (isOpen && !isActive) {
      startConversation();
    }
  }, [isOpen]);
  
  // Handle close
  const handleClose = () => {
    endConversation();
    onClose();
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyPress = (e) => {
      // Escape to exit
      if (e.key === 'Escape') {
        handleClose();
      }
      // Space to stop/start listening
      else if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        if (isListening) {
          stopListening();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isListening]);
  
  // Voice options
  const voices = [
    { id: 'nova', name: 'Nova', emoji: '👩', description: 'Friendly female voice' },
    { id: 'alloy', name: 'Alloy', emoji: '🤖', description: 'Neutral voice' },
    { id: 'echo', name: 'Echo', emoji: '👨', description: 'Male voice' },
    { id: 'fable', name: 'Fable', emoji: '🎭', description: 'British accent' },
    { id: 'onyx', name: 'Onyx', emoji: '🗣️', description: 'Deep voice' },
    { id: 'shimmer', name: 'Shimmer', emoji: '✨', description: 'Soft voice' },
  ];
  
  const handleVoiceChange = (voiceId) => {
    setSelectedVoice(voiceId);
    setCurrentVoice(voiceId);
    setShowSettings(false);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40"
            style={{
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}
            onClick={handleClose}
          />
          
          {/* Main overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-full max-w-2xl mx-4 pointer-events-auto">
              {/* Glassmorphism card */}
              <div
                className="rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-forest-700 flex items-center justify-center text-white text-xl">
                      🎙️
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Voice Conversation</h3>
                      <p className="text-xs text-gray-500">Speak naturally - I'll understand</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Settings button */}
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                      title="Voice settings"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                      </svg>
                    </button>
                    
                    {/* Close button */}
                    <button
                      onClick={handleClose}
                      className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                      title="Close (Esc)"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Voice settings panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-gray-200/50"
                    >
                      <div className="px-6 py-4 bg-gray-50/50">
                        <p className="text-sm font-medium text-gray-700 mb-3">Select Voice</p>
                        <div className="grid grid-cols-3 gap-2">
                          {voices.map((voice) => (
                            <button
                              key={voice.id}
                              onClick={() => handleVoiceChange(voice.id)}
                              className={`p-3 rounded-xl border-2 transition-all ${
                                selectedVoice === voice.id
                                  ? 'border-forest-600 bg-forest-50'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="text-2xl mb-1">{voice.emoji}</div>
                              <div className="text-xs font-medium text-gray-900">{voice.name}</div>
                              <div className="text-2xs text-gray-500">{voice.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Main content */}
                <div className="px-6 py-4">
                  {/* Avatar */}
                  <TalkingAvatar
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    isProcessing={isProcessing}
                  />
                  
                  {/* Conversation history */}
                  <div className="mt-6 max-h-48 overflow-y-auto space-y-3">
                    {conversation.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                            msg.type === 'user'
                              ? 'bg-forest-700 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Footer actions */}
                <div className="px-6 py-4 border-t border-gray-200/50 bg-gray-50/30">
                  <div className="flex items-center justify-between">
                    {/* Tips */}
                    <div className="text-xs text-gray-500">
                      {isListening && (
                        <span>💡 Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 text-2xs font-mono">Space</kbd> to stop</span>
                      )}
                      {!isListening && !isSpeaking && !isProcessing && (
                        <span>💡 Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 text-2xs font-mono">Esc</kbd> to exit</span>
                      )}
                    </div>
                    
                    {/* End conversation button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <span>🔴</span>
                      <span>End Voice Mode</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VoiceModeOverlay;
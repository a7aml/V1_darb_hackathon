// src/components/tutor/TalkingAvatar.jsx
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TalkingAvatar = ({ isListening, isSpeaking, isProcessing }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Waveform animation when speaking
  useEffect(() => {
    if (!isSpeaking || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    let bars = 32;
    let barHeights = Array(bars).fill(0).map(() => Math.random() * 0.5 + 0.5);
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = width / bars;
      
      barHeights = barHeights.map((h, i) => {
        // Smooth animation
        const target = Math.random() * 0.7 + 0.3;
        return h + (target - h) * 0.1;
      });
      
      barHeights.forEach((h, i) => {
        const x = i * barWidth;
        const barH = h * height * 0.6;
        const y = (height - barH) / 2;
        
        ctx.fillStyle = '#1a4a47';
        ctx.fillRect(x + 2, y, barWidth - 4, barH);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking]);
  
  // Get status text
  const getStatusText = () => {
    if (isProcessing) return 'Thinking...';
    if (isSpeaking) return 'Speaking...';
    if (isListening) return 'Listening...';
    return 'Ready';
  };
  
  // Get status color
  const getStatusColor = () => {
    if (isProcessing) return '#F5C842';
    if (isSpeaking) return '#10b981';
    if (isListening) return '#ef4444';
    return '#6b7280';
  };
  
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Avatar Circle */}
      <div className="relative">
        {/* Outer pulse rings */}
        <AnimatePresence>
          {(isListening || isSpeaking) && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4"
                style={{ borderColor: getStatusColor() }}
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="absolute inset-0 rounded-full border-4"
                style={{ borderColor: getStatusColor() }}
              />
            </>
          )}
        </AnimatePresence>
        
        {/* Main avatar circle */}
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.05, 1] : 1,
            boxShadow: isSpeaking 
              ? ['0 0 0 0 rgba(26,74,71,0.4)', '0 0 0 20px rgba(26,74,71,0)', '0 0 0 0 rgba(26,74,71,0)']
              : '0 10px 40px rgba(0,0,0,0.1)'
          }}
          transition={{
            scale: { duration: 0.8, repeat: isSpeaking ? Infinity : 0 },
            boxShadow: { duration: 1.5, repeat: isSpeaking ? Infinity : 0 }
          }}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center relative overflow-hidden"
        >
          {/* Microphone icon when listening */}
          {isListening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-white text-6xl"
            >
              🎤
            </motion.div>
          )}
          
          {/* AI icon when speaking or processing */}
          {(isSpeaking || isProcessing) && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: isProcessing ? 360 : 0
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                rotate: { duration: 2, repeat: isProcessing ? Infinity : 0, ease: 'linear' }
              }}
              className="text-white text-6xl"
            >
              🤖
            </motion.div>
          )}
          
          {/* Idle state */}
          {!isListening && !isSpeaking && !isProcessing && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white text-6xl"
            >
              🎓
            </motion.div>
          )}
          
          {/* Waveform overlay when speaking */}
          {isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={192}
                height={192}
                className="opacity-20"
              />
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Status text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.p
          key={getStatusText()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-semibold mb-2"
          style={{ color: getStatusColor() }}
        >
          {getStatusText()}
        </motion.p>
        
        {isListening && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500"
          >
            Speak naturally in any language
          </motion.p>
        )}
        
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1 justify-center mt-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  height: [8, 16, 8],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                className="w-1.5 rounded-full bg-green-500"
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TalkingAvatar;
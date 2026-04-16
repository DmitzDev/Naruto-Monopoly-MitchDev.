import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dice2D({ result }: { result: [number, number] | null }) {
  const [rolling, setRolling] = useState(false);
  const [frame1, setFrame1] = useState(1);
  const [frame2, setFrame2] = useState(1);
  const [displayResult, setDisplayResult] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (result) {
      setRolling(true);
      
      // Fast frame-by-frame rolling animation
      const interval = setInterval(() => {
        setFrame1(Math.floor(Math.random() * 6) + 1);
        setFrame2(Math.floor(Math.random() * 6) + 1);
      }, 60); // Faster frame rate for smoother "blur"

      const timer = setTimeout(() => {
        clearInterval(interval);
        setRolling(false);
        setDisplayResult(result);
        setFrame1(result[0]);
        setFrame2(result[1]);
      }, 1000); 

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else {
      setDisplayResult(null);
      setRolling(false);
    }
  }, [JSON.stringify(result)]);

  if (!result && !rolling) return null;

  const Die = ({ value, isRolling }: { value: number; isRolling: boolean }) => (
    <motion.div
      initial={{ scale: 0, rotate: -720 }}
      animate={{ 
        scale: isRolling ? [1, 1.2, 1] : 1.2, 
        rotate: isRolling ? [0, 90, 180, 270, 360, 450, 540, 630, 720] : 0,
        y: isRolling ? [0, -40, 0, -20, 0] : 0,
        filter: isRolling ? "blur(2px)" : "blur(0px)"
      }}
      transition={{ 
        duration: isRolling ? 0.6 : 0.4, 
        repeat: isRolling ? Infinity : 0, 
        ease: isRolling ? "linear" : "backOut" 
      }}
      className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center overflow-visible drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
    >
      <img 
        src={`/img/dice/${value}.png?v=2`} 
        alt={`Dice ${value}`} 
        className="w-full h-full object-contain pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
      />
    </motion.div>
  );

  return (
    <div className="flex gap-4 sm:gap-8 justify-center items-center py-6 bg-transparent px-8 relative">
       {/* Particle effects on success */}
       <AnimatePresence>
        {!rolling && result && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 pointer-events-none z-[-1]"
           >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 300, 
                    y: (Math.random() - 0.5) * 300, 
                    opacity: 0, 
                    scale: 0 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: ['#fb923c', '#f59e0b', '#10b981', '#ef4444'][i % 4] }}
                />
              ))}
           </motion.div>
        )}
       </AnimatePresence>

      <Die value={frame1} isRolling={rolling} />
      <Die value={frame2} isRolling={rolling} />
    </div>
  );
}

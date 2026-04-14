import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Trailer() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSkip, setShowSkip] = useState(false);
  const [isBlocked, setIsBlocked] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        await video.play();
        setIsBlocked(false);
      } catch (err) {
        console.log("Autoplay blocked, user interaction required.");
        setIsBlocked(true);
      }
    };

    attemptPlay();

    const handleTimeUpdate = () => {
      // Show skip button after 10s as requested
      if (video.currentTime >= 10) {
          setShowSkip(true);
      } else {
          setShowSkip(false);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [navigate]);

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsBlocked(false))
        .catch(err => console.error("Manual play failed:", err));
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('trailerSeen', 'true');
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black z-[500] flex items-center justify-center overflow-hidden touch-none select-none">
      <AnimatePresence mode="wait">
        {isBlocked && (
           <motion.div 
             key="blocked-overlay"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 z-[510] flex flex-col items-center justify-center cursor-pointer bg-black/80 backdrop-blur-xl transition-all"
             onClick={handleManualPlay}
           >
              <div className="relative flex items-center justify-center">
                 <div className="absolute w-32 h-32 rounded-full border-2 border-orange-500/20 animate-ping" />
                 <div className="w-24 h-24 rounded-full border-4 border-orange-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(251,146,60,0.3)]">
                    <div className="w-0 h-0 border-l-[20px] border-l-orange-500 border-y-[15px] border-y-transparent ml-2" />
                 </div>
              </div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-12 text-center"
              >
                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter italic mb-2 drop-shadow-md">Leaf Arena</h1>
                <p className="text-orange-500 font-bold uppercase tracking-[0.4em] text-[10px] sm:text-xs animate-pulse opacity-75">Tap to Initialize Mission</p>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video 
          ref={videoRef}
          src="/video/GameSoundBG.mp4"
          className="w-full h-full object-cover"
          playsInline
          webkit-playsinline="true"
          autoPlay
          loop
          muted={false}
        />
        
        {/* Cinematic Vignettes */}
        <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-b from-black/95 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-black/95 to-transparent pointer-events-none" />

        {/* Phase 1: Branding Overlay (0-50s) */}
        {!isBlocked && (
          <AnimatePresence>
            <motion.div 
              key="branding-overlay"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.95, 1, 1, 0.98]
              }}
              transition={{ 
                duration: 50,
                times: [0, 0.05, 0.95, 1],
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none z-[60]"
            >
              {/* Sequential Lightning Beam - Shoots from Left to Right */}
              <motion.div 
                initial={{ left: "-100%", opacity: 0 }}
                animate={{ left: ["-100%", "50%", "200%"], opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, delay: 0.2, times: [0, 0.4, 1], ease: "anticipate" }}
                className="absolute top-1/2 -translate-y-1/2 w-[80vw] h-1.5 bg-sky-300 blur-md z-[61] shadow-[0_0_40px_#7dd3fc]"
              />
              <motion.div 
                initial={{ left: "-100%", opacity: 0 }}
                animate={{ left: ["-100%", "50%", "200%"], opacity: [0, 1, 0] }}
                transition={{ duration: 0.6, delay: 0.1, times: [0, 0.4, 1] }}
                className="absolute top-1/2 -translate-y-1/2 w-[60vw] h-1 bg-white z-[62] shadow-[0_0_20px_#fff]"
              />
              <div className="flex flex-col items-center gap-6 drop-shadow-[0_0_50px_rgba(251,146,60,0.6)]">
                 <div className="relative p-1.5 rounded-full border-4 border-orange-500 shadow-[0_0_30px_rgba(251,146,60,0.6)] bg-[#f2e2ba]">
                    <img 
                      src="/img/MDLogo.png" 
                      alt="MD" 
                      className="w-16 h-16 sm:w-28 sm:h-28 object-cover rounded-full" 
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-[#8b5e3c]/20" />
                 </div>

                  <div className="flex flex-col items-center text-center px-4 w-full">
                    <motion.h2 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[4.5vw] sm:text-4xl font-black text-white uppercase italic tracking-[0.05em] flex items-center justify-center whitespace-nowrap mb-1"
                    >
                      <span>Mitch<span className="text-sky-400">Dev.</span></span>
                      <span className="text-orange-500 mx-2 sm:mx-4">|</span> 
                      <span>Monopoly</span>
                    </motion.h2>
                    
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "100%", opacity: 1 }}
                      transition={{ delay: 0.8, duration: 2 }}
                      className="flex flex-col items-center w-full"
                    >
                       <div className="h-[1.5px] w-[60%] max-w-[250px] bg-gradient-to-r from-transparent via-orange-500 to-transparent mb-2" />
                       <span className="text-[2.5vw] sm:text-xl font-bold tracking-[0.2em] sm:tracking-[0.5em] uppercase text-orange-400 italic drop-shadow-lg">
                          Naruto Shippuden
                       </span>
                    </motion.div>
                  </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Phase 2: Welcome Overlay (50s-60s) */}
        {!isBlocked && (
          <AnimatePresence>
            <motion.div
              key="welcome-overlay"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: [30, 0, 0, -30]
              }}
              transition={{
                delay: 50,
                duration: 10,
                times: [0, 0.1, 0.9, 1],
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none z-[65]"
            >
               <div className="flex flex-col items-center gap-4">
                  <h1 className="text-[10vw] sm:text-8xl font-black text-white uppercase tracking-[0.1em] sm:tracking-[0.4em] drop-shadow-[0_0_40px_rgba(251,146,60,0.8)] animate-pulse">
                     Welcome
                  </h1>
                  <div className="h-1.5 w-32 bg-orange-600 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.6)]" />
               </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Phase 3: Skip Button (>= 60s) */}
        <AnimatePresence>
          {showSkip && !isBlocked && (
            <motion.div
              key="skip-btn-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 z-[100] w-full flex justify-center"
            >
              <button
                onClick={handleSkip}
                className="group relative flex flex-col items-center gap-3 transition-transform active:scale-95"
              >
                  {/* Entrance Lightning Flash for the button - Toned down slightly */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: [0, 1, 0.6, 0], scale: [2.5, 1, 1.05, 1.1] }}
                    transition={{ duration: 0.5, times: [0, 0.2, 0.4, 1] }}
                    className="absolute -inset-16 bg-sky-200/50 blur-[60px] pointer-events-none z-[-1]"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 0.35 }}
                    className="fixed inset-0 bg-sky-100/30 pointer-events-none z-[200]"
                  />
                  <div className="absolute -inset-8 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-400/20 transition-all duration-500" />
                  <span className="relative text-white font-black uppercase tracking-[0.6em] text-[10px] sm:text-xs hover:text-sky-300 drop-shadow-[0_0_10px_rgba(125,211,252,0.4)] transition-all">
                    Tap to continue
                  </span>
                  <div className="relative w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_15px_#7dd3fc] animate-bounce" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Lightning Effects Overlay */}
        {!isBlocked && <LightningEffect />}
      </div>
    </div>
  );
}

const LightningEffect = () => {
  const [flashes, setFlashes] = useState<{ id: number; top: string; left: string; rotate: number; scale: number }[]>([]);

  useEffect(() => {
    const triggerFlash = () => {
      const id = Date.now() + Math.random();
      setFlashes(prev => [...prev, {
        id,
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        rotate: Math.random() * 360,
        scale: Math.random() * 2 + 0.5
      }]);
      setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== id)), 200);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.6) triggerFlash();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[75] overflow-hidden">
      <AnimatePresence>
        {flashes.map(flash => (
          <motion.div
            key={flash.id}
            initial={{ opacity: 0, scale: flash.scale * 0.8 }}
            animate={{ 
              opacity: [0, 0.8, 0.4, 0.7, 0],
              scale: [flash.scale, flash.scale * 1.1] 
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute w-64 h-64 sm:w-96 sm:h-96"
            style={{ top: flash.top, left: flash.left, transform: `rotate(${flash.rotate}deg)` }}
          >
             {/* Lightning Bolt Visuals */}
             <div className="absolute inset-0 bg-sky-400/20 blur-[60px]" />
             <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-sky-200 shadow-[0_0_20px_#7dd3fc] rotate-45" />
             <div className="absolute top-1/2 left-0 right-0 h-1 bg-white shadow-[0_0_30px_#fff] -rotate-12" />
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div 
        animate={{ opacity: [0, 0.1, 0] }}
        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
        className="absolute inset-0 bg-sky-100 mix-blend-overlay"
      />
    </div>
  );
};

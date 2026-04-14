import React, { memo, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const FloatingShuriken = ({ delay = 0, style = {} }: any) => (
  <motion.div
    initial={{ opacity: 0, rotate: 0, x: -50 }}
    animate={{ 
      opacity: [0, 0.4, 0], 
      rotate: 360, 
      x: [0, 1000],
      y: [Math.random() * 50, Math.random() * -50]
    }}
    transition={{ 
      duration: 3 + Math.random() * 2, 
      repeat: Infinity, 
      delay, 
      ease: "linear" 
    }}
    className="absolute pointer-events-none z-0"
    style={style}
  >
    <div className="w-4 h-4 sm:w-6 sm:h-6 text-black/5">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
      </svg>
    </div>
  </motion.div>
);

export const SakuraPetal = memo(({ delay = 0 }: any) => {
  const [style, setStyle] = useState<any>(null);

  useEffect(() => {
    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 10;
    const size = 8 + Math.random() * 8;
    
    setStyle({
      left: `${left}vw`,
      top: '-20px',
      width: `${size}px`,
      height: `${size}px`,
      animation: `petal-fall ${duration}s linear ${delay}s infinite`,
      position: 'fixed' as const,
      pointerEvents: 'none' as const,
      zIndex: 0,
      opacity: 0,
      borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
      backgroundColor: 'rgba(255, 182, 193, 0.4)',
      filter: 'blur(1px)'
    });
  }, [delay]);

  if (!style) return null;
  return <div style={style} />;
});

export const RealisticBackground = memo(() => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
       <style dangerouslySetInnerHTML={{ __html: `
         @keyframes petal-fall {
           0% { transform: translateY(0) rotate(0deg); opacity: 0; }
           10% { opacity: 1; }
           90% { opacity: 1; }
           100% { transform: translateY(110vh) translateX(100px) rotate(360deg); opacity: 0; }
         }
       `}} />
       <div className="absolute inset-0 bg-black/5" />
       <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]" />
       {[...Array(isMobile ? 2 : 4)].map((_, i) => (
         <SakuraPetal key={i} delay={i * 3} />
       ))}
    </div>
  );
});

export const ThreeDCard = ({ children, className = "", style = {} }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile('ontouchstart' in window || window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  function handleMouse(event: React.MouseEvent) {
    if (isMobile) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - (rect.left + rect.width / 2)) / 10);
    y.set((event.clientY - (rect.top + rect.height / 2)) / 10);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`perspective-1000 ${className}`}
    >
      <div style={{ transform: isMobile ? "none" : "translateZ(20px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

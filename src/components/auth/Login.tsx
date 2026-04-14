import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { ref, get, set } from 'firebase/database';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, UserCheck, Loader2, Camera, Sparkles, Zap, Shield, Key, ScrollText, UserPlus } from 'lucide-react';
import Footer from '../layout/Footer';

// Reuse high-fidelity background components
const FloatingShuriken = ({ delay = 0, style = {} }) => (
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
    <div className="w-6 h-6 sm:w-8 sm:h-8 text-black/10">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
      </svg>
    </div>
  </motion.div>
);

const SakuraPetal = ({ delay = 0 }) => (
  <motion.div
    initial={{ y: -20, x: (Math.random() * 100) + 'vw', opacity: 0, rotate: 0 }}
    animate={{ 
      y: '110vh', 
      x: ((Math.random() * 400) - 200) + 'vw', 
      opacity: [0, 1, 1, 0],
      rotate: 360 
    }}
    transition={{ 
      duration: 10 + Math.random() * 10, 
      repeat: Infinity, 
      delay, 
      ease: "linear" 
    }}
    className="fixed pointer-events-none z-0"
  >
    <div className="w-3 h-3 bg-pink-200/40 rounded-full blur-[1px]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
  </motion.div>
);

const RealisticBackground = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
       <div className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${isMobile ? 'bg-[url("/img/Mobile/NarutoBG.png")]' : 'bg-[url("/img/NarutoBG.png")]'}`} />
       <div className="absolute inset-0 bg-black/30" />
       <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]" />
       
       {[...Array(3)].map((_, i) => (
         <FloatingShuriken key={i} delay={i * 2} style={{ top: `${10 + (i * 30)}%` }} />
       ))}
       {[...Array(15)].map((_, i) => (
         <SakuraPetal key={i} delay={i * 1.5} />
       ))}
    </div>
  );
};

const ThreeDCard = ({ children, className = "", style = {} }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  function handleMouse(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`perspective-1000 ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

// CHARACTER DATA FOR ANIMATION
const CHARACTER_CONFIG = [
  { name: 'Naruto', frames: 5, prefix: 'NARUTO' },
  { name: 'Sasuke', frames: 4, prefix: 'SASUKE' },
  { name: 'Sakura', frames: 2, prefix: 'SAKURA' },
  { name: 'Kakashi', frames: 2, prefix: 'KAKASHI' },
  { name: 'Itachi', frames: 2, prefix: 'ITACHI' }
];

const ShinobiWalk = () => {
  const [activeShinobi, setActiveShinobi] = useState<any[]>([]);

  useEffect(() => {
    const spawn = CHARACTER_CONFIG.map((char, index) => ({
      ...char,
      id: Math.random(),
      x: -150 - (index * 250),
      frame: 1,
      speed: 2 + Math.random() * 2
    }));
    setActiveShinobi(spawn);

    const interval = setInterval(() => {
      setActiveShinobi(prev => prev.map(s => {
        let newX = s.x + s.speed;
        let newFrame = s.frame >= s.frames ? 1 : s.frame + 1;
        if (newX > window.innerWidth + 100) newX = -150;
        return { ...s, x: newX, frame: newFrame };
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-11 sm:bottom-[46px] left-0 right-0 h-24 pointer-events-none overflow-hidden z-[25]">
      {activeShinobi.map((s) => (
        <motion.div key={s.id} className="absolute bottom-0 w-16 h-16 sm:w-20 sm:h-20" style={{ x: s.x }}>
          <img 
            src={`/img/characters/${s.name}/${s.prefix}${s.frame === 1 ? '' : s.frame}.png`} 
            alt={s.name}
            className="w-full h-full object-contain filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
            onError={(e) => { (e.target as HTMLImageElement).src = `/img/characters/${s.name}/${s.prefix}.png`; }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const snapshot = await get(ref(db, `users/${user.uid}`));
      if (snapshot.exists()) {
        setProfile(snapshot.val());
        setUser(user);
        navigate('/lobby');
      } else {
        setError('Shinobi profile not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        const newProfile = {
          username: user.displayName || user.email?.split('@')[0] || 'Ninja',
          email: user.email || '', photoURL: user.photoURL || '', createdAt: Date.now(),
          wins: 0, losses: 0, coins: 1500, ownedSkins: ['default'], selectedToken: 'default',
          selectedDice: 'default', lastDailyClaim: 0, achievements: []
        };
        await set(userRef, newProfile);
        setProfile(newProfile);
      } else {
        setProfile(snapshot.val());
      }
      setUser(user);
      navigate('/lobby');
    } catch (err: any) {
      setError('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col font-serif overflow-hidden relative selection:bg-orange-500/30">
      <RealisticBackground />
      
      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <ThreeDCard className="w-full max-w-[380px] sm:max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 30, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, type: "spring", damping: 20 }}
            className="p-6 sm:p-10 bg-[#f4e4bc]/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-x-[8px] border-[#8b4513] relative overflow-hidden group/card"
            style={{ 
              backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`,
              borderColor: '#8b4513'
            }}
          >
            {/* Elegant Smoke Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none group-hover/card:opacity-[0.08] transition-opacity duration-1000">
               <ScrollText size={240} className="rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="relative inline-block group cursor-pointer mb-3">
                  <div className="relative w-16 h-16 rounded-full border-2 border-[#8b4513] overflow-hidden shadow-xl bg-[#ea580c] transform transition-transform group-hover:scale-110 duration-500">
                    <img src="/img/MDLogo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full border border-white shadow-lg animate-bounce">
                    <Sparkles size={10} />
                  </div>
                </div>
                
                <h2 className="text-[#3b2a1a] font-black text-2xl tracking-tighter uppercase italic leading-none mb-1">
                  Shinobi Entry
                </h2>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#8b4513]/40 italic block">Academy Access Terminal</span>
              </div>

              {error && (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  className="mb-6 p-3 bg-red-900/10 border-l-2 border-red-700/50 rounded-lg flex items-center gap-3 backdrop-blur-sm"
                >
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <p className="text-[9px] font-black text-red-900 uppercase tracking-tight italic leading-tight">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5 group">
                  <label className="flex items-center gap-2 text-[8px] font-black text-[#8b4513]/60 uppercase tracking-[0.2em] pl-1 group-focus-within:text-orange-700 transition-colors">
                    <Mail className="w-3 h-3" />
                    Secret Scroll Address
                  </label>
                  <div className="relative">
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/40 border-b-2 border-transparent border-[#8b4513]/10 text-[#2C1810] rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#fb923c] focus:bg-white/80 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-xs shadow-sm placeholder:text-[#8b4513]/30"
                      placeholder="Summoning Mail"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <label className="flex items-center gap-2 text-[8px] font-black text-[#8b4513]/60 uppercase tracking-[0.2em] pl-1 group-focus-within:text-orange-700 transition-colors">
                    <Key className="w-3 h-3" />
                    Chakra Seal Key
                  </label>
                  <div className="relative">
                    <input
                      type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/40 border-b-2 border-transparent border-[#8b4513]/10 text-[#2C1810] rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#fb923c] focus:bg-white/80 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-xs shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-[#ea580c] hover:bg-[#ff8c00] text-white font-black rounded-[1.5rem] py-4 transition-all active:translate-y-1 active:shadow-none shadow-[0_6px_0_#9a3412] border-2 border-[#9a3412] flex items-center justify-center gap-3 relative overflow-hidden group outline-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-white/20 to-orange-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                        <span className="uppercase tracking-[0.2em] text-[13px] italic font-black">Summon Entrance</span>
                      </>
                    )}
                  </button>

                  <button
                     type="button" onClick={handleGoogleLogin}
                     className="w-full bg-white/60 hover:bg-white text-[#2C1810] font-black rounded-2xl py-3 transition-all active:translate-y-0.5 active:shadow-none shadow-[0_3px_0_#8b4513]/30 flex items-center justify-center gap-3 border border-[#8b4513]/20 text-[10px] hover:border-orange-500/50"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                    SIGN WITH GOOGLE
                  </button>

                  <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[#8b4513]/10">
                    <Link to="/register" className="text-red-900 font-bold text-[10px] tracking-widest hover:text-[#ea580c] transition-colors flex items-center gap-2 hover:scale-105 group">
                      <UserPlus className="w-4 h-4" />
                      NEW ENROLLMENT
                    </Link>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8b4513]/10" />
                    <span className="text-[8px] font-black text-[#8b4513]/30 uppercase tracking-widest italic leading-none pt-0.5">VILLAGE GATE</span>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </ThreeDCard>
      </div>

      <ShinobiWalk />

      {/* Modern Low-Profile Footer */}
      <div className="absolute bottom-0 left-0 right-0 w-full bg-black/50 backdrop-blur-md z-40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-1">
           <Footer className="!mt-0 !bg-transparent !border-t-0 !px-4 !opacity-60 hover:!opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

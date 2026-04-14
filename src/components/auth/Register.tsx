import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { ref, set } from 'firebase/database';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, ScrollText, UserCheck, LogIn, Loader2, Sparkles, Zap, Shield, Key } from 'lucide-react';
import Footer from '../layout/Footer';

// Use same background components for consistency
const FloatingShuriken = ({ delay = 0, style = {} }) => (
  <motion.div
    initial={{ opacity: 0, rotate: 0, x: -50 }}
    animate={{ 
      opacity: [0, 0.4, 0], 
      rotate: 360, 
      x: [0, 1000],
      y: [Math.random() * 50, Math.random() * -50]
    }}
    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay, ease: "linear" }}
    className="absolute pointer-events-none z-0"
    style={style}
  >
    <div className="w-6 h-6 sm:w-8 sm:h-8 text-black/10">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" /></svg>
    </div>
  </motion.div>
);

const SakuraPetal = ({ delay = 0 }) => (
  <motion.div
    initial={{ y: -20, x: (Math.random() * 100) + 'vw', opacity: 0, rotate: 0 }}
    animate={{ y: '110vh', x: ((Math.random() * 400) - 200) + 'vw', opacity: [0, 1, 1, 0], rotate: 360 }}
    transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay, ease: "linear" }}
    className="fixed pointer-events-none z-0"
  >
    <div className="w-3 h-3 bg-pink-200/40 rounded-full blur-[1px]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
  </motion.div>
);

const RealisticBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
     <div className="absolute inset-0 bg-[url('/img/NarutoBG.png')] bg-cover bg-center" />
     <div className="absolute inset-0 bg-black/30" />
     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]" />
     {[...Array(3)].map((_, i) => <FloatingShuriken key={i} delay={i * 2} style={{ top: `${10 + (i * 30)}%` }} />)}
     {[...Array(15)].map((_, i) => <SakuraPetal key={i} delay={i * 1.5} />)}
  </div>
);

const ThreeDCard = ({ children, className = "", style = {} }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  function handleMouse(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - (rect.left + rect.width / 2));
    y.set(event.clientY - (rect.top + rect.height / 2));
  }
  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ ...style, rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`perspective-1000 ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">{children}</div>
    </motion.div>
  );
};

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const newProfile = {
        username,
        email,
        photoURL: '',
        createdAt: Date.now(),
        wins: 0,
        losses: 0,
        coins: 1500,
        ownedSkins: ['default'],
        selectedToken: 'default',
        selectedDice: 'default',
        lastDailyClaim: 0,
        totalPlayTime: 0,
        achievements: []
      };

      await set(ref(db, `users/${user.uid}`), newProfile);

      // Sign out immediately so they have to log in
      await signOut(auth);

      setSuccess(true);
      // Optional delay before navigation or just navigate
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to register');
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
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8 }}
            className="p-6 sm:p-10 bg-[#f4e4bc]/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-x-[8px] border-[#8b4513] relative overflow-hidden group"
            style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }}
          >
            {/* Shield Aura Decoration */}
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
            <div className="absolute -bottom-10 -left-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-1000">
               <Shield size={240} className="-rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-3">
                  <div className="relative w-14 h-14 rounded-full border-2 border-[#8b4513] overflow-hidden shadow-xl bg-[#ea580c]">
                    <img src="/img/MDLogo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border border-white shadow-lg animate-bounce">
                    <UserPlus size={10} />
                  </div>
                </div>
                <h2 className="text-[#3b2a1a] font-black text-2xl tracking-tighter uppercase italic mb-1">
                  Enrollment
                </h2>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#8b4513]/40 italic block">Shinobi Academy Registry</span>
              </div>

              {error && (
                <motion.div 
                   initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                   className="mb-4 p-3 bg-red-900/10 border-l-2 border-red-700/50 rounded-lg flex items-center gap-3 backdrop-blur-sm"
                >
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <p className="text-[9px] font-black text-red-900 uppercase italic tracking-tight">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="mb-4 p-3 bg-green-900/10 border-l-2 border-green-700/50 rounded-lg flex items-center gap-3 backdrop-blur-sm"
                >
                  <UserCheck className="w-5 h-5 text-green-700" />
                  <p className="text-[9px] font-black text-green-900 uppercase italic tracking-widest leading-tight">Registry Signed. Awaiting Deployment...</p>
                </motion.div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5 group">
                  <label className="flex items-center gap-2 text-[8px] font-black text-[#8b4513]/60 uppercase tracking-[0.2em] pl-1 group-focus-within:text-orange-700">
                    <User className="w-3 h-3" />
                    Shinobi Identity
                  </label>
                  <input
                    type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/40 border-b-2 border-transparent border-[#8b4513]/10 text-[#2C1810] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#fb923c] focus:bg-white/80 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-xs shadow-sm"
                    placeholder="Master Name"
                  />
                </div>

                <div className="space-y-1.5 group">
                  <label className="flex items-center gap-2 text-[8px] font-black text-[#8b4513]/60 uppercase tracking-[0.2em] pl-1 group-focus-within:text-orange-700">
                    <Mail className="w-3 h-3" />
                    Secret Scroll Address
                  </label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/40 border-b-2 border-transparent border-[#8b4513]/10 text-[#2C1810] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#fb923c] focus:bg-white/80 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-xs shadow-sm"
                    placeholder="Summoning Mail"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 group">
                    <label className="flex items-center gap-2 text-[8px] font-black text-[#8b4513]/60 uppercase tracking-[0.2em] pl-1 group-focus-within:text-red-700">
                      <Key className="w-3 h-3" />
                      Seal
                    </label>
                    <input
                      type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/40 border-b-2 border-transparent border-[#8b4513]/10 text-[#2C1810] rounded-2xl px-4 py-3 focus:outline-none focus:border-red-600 focus:bg-white/80 transition-all font-bold text-xs shadow-sm"
                      placeholder="••••"
                    />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="flex items-center gap-2 text-[8px] font-black text-[#8b4513]/60 uppercase tracking-[0.2em] pl-1 group-focus-within:text-red-700">
                      <UserCheck className="w-3 h-3" />
                      Verify
                    </label>
                    <input
                      type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/40 border-b-2 border-transparent border-[#8b4513]/10 text-[#2C1810] rounded-2xl px-4 py-3 focus:outline-none focus:border-red-600 focus:bg-white/80 transition-all font-bold text-xs shadow-sm"
                      placeholder="••••"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-3">
                  <button
                    type="submit" disabled={loading || success}
                    className="w-full bg-[#ea580c] hover:bg-[#ff8c00] text-white font-black rounded-[1.5rem] py-4 transition-all active:translate-y-1 active:shadow-none shadow-[0_6px_0_#9a3412] border-2 border-[#9a3412] flex items-center justify-center gap-3 relative overflow-hidden group outline-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-white/20 to-orange-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="uppercase tracking-[0.2em] text-[13px] italic font-black">Sign Registry</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#8b4513]/10">
                    <Link to="/login" className="text-red-900 font-bold text-[10px] tracking-widest hover:text-[#ea580c] transition-colors flex items-center gap-2 hover:scale-105 group">
                      <LogIn className="w-4 h-4" />
                      ALREADY ENROLLED?
                    </Link>
                    <div className="w-1 h-1 rounded-full bg-[#8b4513]/10" />
                    <span className="text-[8px] font-black text-[#8b4513]/30 uppercase tracking-widest italic leading-none pt-0.5">VILLAGE GATE</span>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </ThreeDCard>
      </div>
      
      {/* Modern Low-Profile Footer */}
      <div className="absolute bottom-0 left-0 right-0 w-full bg-black/50 backdrop-blur-md z-40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-1">
           <Footer className="!mt-0 !bg-transparent !border-t-0 !px-4 !opacity-60 hover:!opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

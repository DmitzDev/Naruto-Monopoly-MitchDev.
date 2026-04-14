import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase/config';
import { ref, get } from 'firebase/database';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { useUIStore } from './store/useUIStore';

const Login = React.lazy(() => import('./components/auth/Login'));
const Register = React.lazy(() => import('./components/auth/Register'));
const Lobby = React.lazy(() => import('./components/lobby/Lobby'));
const Game = React.lazy(() => import('./components/game/Game'));
import GlobalSidebar from './components/layout/GlobalSidebar';
import { Loader2 } from 'lucide-react';
import BackgroundMusic from './components/common/BackgroundMusic';
import AchievementToast from './components/common/AchievementToast';

import Trailer from './components/common/Trailer';
import TermsModal from './components/common/TermsModal';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const [isTrailerSeen, setIsTrailerSeen] = useState(!!sessionStorage.getItem('trailerSeen'));
  const [isTermsAccepted, setIsTermsAccepted] = useState(!!sessionStorage.getItem('termsAccepted'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setProfile(snapshot.val());
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading]);

  const handleTermsAccept = () => {
    sessionStorage.setItem('termsAccepted', 'true');
    setIsTermsAccepted(true);
  };

  useEffect(() => {
    const checkTrailer = setInterval(() => {
      const seen = !!sessionStorage.getItem('trailerSeen');
      if (seen !== isTrailerSeen) setIsTrailerSeen(seen);
    }, 500);
    return () => clearInterval(checkTrailer);
  }, [isTrailerSeen]);

  return (
    <Router>
      <BackgroundMusic />
      <GlobalSidebar />
      <React.Suspense fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-orange-950 border-l-transparent animate-spin" />
          <p className="text-orange-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Summoning Assets...</p>
        </div>
      }>
        <Routes>
          <Route path="/" element={isTrailerSeen ? <Navigate to="/login" replace /> : <Trailer />} />
          <Route 
            path="/login" 
            element={
              !isTrailerSeen ? <Navigate to="/" replace /> :
              !isTermsAccepted ? <TermsModal onAccept={handleTermsAccept} /> :
              <Login />
            } 
          />
          <Route path="/register" element={<Register />} />
          <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
          <Route path="/game/:roomId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

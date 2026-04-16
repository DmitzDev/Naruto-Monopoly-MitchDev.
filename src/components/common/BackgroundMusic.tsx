import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export default function BackgroundMusic() {
  const location = useLocation();
  const { isTrailerPlaying } = useUIStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const isTrailer = location.pathname === '/';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isTrailer || isTrailerPlaying) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    // Attempt to autoplay on first user interaction
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Autoplay blocked, waiting for more interaction:", err);
        });
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isPlaying, isTrailer]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/video/naruto_theme.mp4"
        loop
        preload="auto"
      />
      
      {/* Floating Music Control */}
      {!isTrailer && (
        <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 scale-75 sm:scale-100">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full border-2 border-[#8b5e3c] shadow-2xl transition-all active:scale-95 group ${
              isMuted ? 'bg-red-500/20 text-[#8b5e3c]' : 'bg-[#f2e2ba] text-[#fb923c]'
            }`}
            title={isMuted ? "Unmute Theme" : "Mute Theme"}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <div className="relative">
                <Volume2 className="w-6 h-6 animate-pulse" />
                {!isMuted && isPlaying && (
                  <Music className="absolute -top-4 -right-2 w-4 h-4 text-[#8b5e3c] animate-bounce" />
                )}
              </div>
            )}
          </button>
        </div>
      )}
    </>
  );
}

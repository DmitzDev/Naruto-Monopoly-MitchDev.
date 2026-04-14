import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { motion } from 'framer-motion';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const { colors } = useThemeStore();
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;
    
    // Start scanning
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10, // Lower FPS significantly reduces CPU usage and lag
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      },
      (decodedText) => {
        // Success callback
        let cleaned = decodedText.trim();
        // Extract room ID if it's a full URL
        if (cleaned.toUpperCase().includes('/GAME/')) {
          const parts = cleaned.toUpperCase().split('/GAME/');
          cleaned = parts[parts.length - 1].split(/[?#]/)[0];
        }
        cleaned = cleaned.replace(/[^A-Z0-9]/g, ''); // Standardize
        
        // Stop scanning before notifying parent to avoid overlaps
        html5QrCode.stop().then(() => {
          onScanRef.current(cleaned);
        }).catch(err => {
          console.error("Stop error", err);
          onScanRef.current(cleaned); // Still call it even if stop fails
        });
      },
      (errorMessage) => {
        // Parse error, ignore
      }
    ).catch((err) => {
      setError("Camera access denied or device not found.");
      console.error("QR scanner error: ", err);
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []); // Only initialize once on mount

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
         onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-2xl overflow-hidden border-2 shadow-2xl relative flex flex-col"
        style={{ backgroundColor: colors.bgPrimary, borderColor: colors.borderAccent }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b-2"
             style={{ borderColor: `${colors.borderPrimary}50`, backgroundColor: colors.headerBg }}>
          <h2 className="text-xl font-black uppercase tracking-widest italic flex items-center gap-2"
              style={{ color: colors.textPrimary }}>
            <Camera className="w-5 h-5 text-emerald-500" /> Scanner View
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="p-4 relative">
          <p className="text-[10px] font-bold uppercase text-center mb-4 tracking-tighter"
             style={{ color: colors.textMuted }}>
            Scan a fellow Shinobi's Mission Scroll Code to intercept their lobby instantly.
          </p>
          
          <div className="relative rounded-xl overflow-hidden border-4 bg-black/50 aspect-square"
               style={{ borderColor: colors.borderSecondary }}>
            {/* Scanning Animation Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
               <motion.div 
                 initial={{ top: '0%' }}
                 animate={{ top: '100%' }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_#10b981]"
               />
               <div className="absolute inset-0 border-[40px] border-black/20" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-emerald-500/30 rounded-lg" />
            </div>

            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-red-500 font-bold text-xs bg-black/80 z-30">
                {error}
              </div>
            )}
            {/* The video scanner relies on an element with this specific ID */}
            <div id="reader" className="w-full h-full min-h-[300px] flex items-center justify-center bg-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, CheckCircle, ShieldAlert } from 'lucide-react';

interface TermsModalProps {
  onAccept: () => void;
}

export default function TermsModal({ onAccept }: TermsModalProps) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black p-4 sm:p-8 overflow-hidden">
      {/* Dynamic Naruto Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 scale-105 animate-pulse"
        style={{ backgroundImage: 'url("/img/NarutoBG.png")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 backdrop-blur-[2px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-[#0f172a]/90 border-4 border-[#8b5e3c]/50 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
        style={{ 
          boxShadow: 'inset 0 0 50px rgba(139, 94, 60, 0.1)',
        }}
      >
        {/* Header - Scroll Top Finisher */}
        <div className="p-6 border-b border-[#8b5e3c]/20 flex flex-col items-center shrink-0 bg-gradient-to-b from-[#1e293b] to-transparent">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] rotate-3 overflow-hidden border-2 border-[#8b5e3c]">
             <img src="/img/MDLogo.png" alt="MD" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg">Shinobi Rules of Engagement</h2>
          <div className="flex items-center gap-4 mt-2">
             <div className="h-[1px] w-8 bg-orange-500" />
             <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Village Terms & Privacy Policy</p>
             <div className="h-[1px] w-8 bg-orange-500" />
          </div>
        </div>

        {/* Content Scroll Area - Parchment Aesthetic */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 scrollbar-thin scrollbar-thumb-orange-500/30 scrollbar-track-transparent">
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <ScrollText className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight italic">Terms of the Shinobi Code</h3>
            </div>
            
            <div className="text-sm text-slate-300 leading-relaxed font-medium space-y-5">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="font-black text-orange-400 uppercase tracking-tighter">MitchDev Monopoly Game - Effective: 3/28/2026</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <h4 className="text-white font-black uppercase text-xs tracking-wider border-b border-white/5 pb-1">1. Mission Introduction</h4>
                <p className="text-slate-400 text-xs">These Terms and Conditions (“Terms”) govern your access to and use of the Naruto-Themed Monopoly Game (the “Game”), operated by <span className="text-orange-400">MitchDev</span>. By accessing or using the Game, you agree to be legally bound by these Terms.</p>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-white font-black uppercase text-xs tracking-wider border-b border-white/5 pb-1">2. Rank & Eligibility</h4>
                <p className="text-slate-400 text-xs">You must be at least 13 years old (or the minimum legal age in your jurisdiction) to use the Game. By using the Game, you represent that you meet this requirement. Any academy student below this age must have chunin authorization.</p>
              </div>

              <div className="flex flex-col gap-1 italic border-l-4 border-orange-600 pl-4 bg-orange-600/5 py-4 rounded-r-2xl">
                <h4 className="text-orange-500 font-black uppercase text-xs tracking-wider mb-2">6. Intellectual Property & Fan Mission</h4>
                <p className="text-[10px] text-orange-200/60 leading-tight">
                  This Game is a fan-made project inspired by the Naruto franchise. All characters, names, and related intellectual property belong to their respective owners. We do not claim ownership of any third-party intellectual property and are not affiliated with or endorsed by the official rights holders. This is a non-commercial shinobi training simulation.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-white font-black uppercase text-xs tracking-wider border-b border-white/5 pb-1">10. Disclaimer and Jutsu Limits</h4>
                <p className="text-slate-400 text-xs">The Game is provided on an “as is” basis without warranties of any kind. MitchDev shall not be liable for any chakra exhaustion, loss of progress, or digital accidents arising from your use of the Game.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight italic">Privacy Protocol</h3>
            </div>
            
            <div className="text-sm text-slate-300 leading-relaxed font-medium space-y-5">
              <p className="text-xs text-slate-400">Your privacy is paramount in the Hidden Leaf. We only collect the necessary intel to maintain your mission progress.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <h4 className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-2">Intel Tracked</h4>
                   <ul className="space-y-1 text-[10px] text-slate-500">
                     <li>• Username & Auth via Firebase</li>
                     <li>• Mission Achievements</li>
                     <li>• Technical Device Signal</li>
                   </ul>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <h4 className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-2">Jutsu Secrecy</h4>
                   <p className="text-[10px] text-slate-500 leading-tight">We do not sell your data. Information is used exclusively to provide the game services and prevent rogue shinobi activity.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20">
                <ShieldAlert className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                <p className="text-[10px] text-emerald-200/60 leading-relaxed">By continuing, you acknowledge that your data will be stored securely using Firebase infrastructure and used solely for the Leaf Arena experience. All records are protected by village encryption jutsu.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions - Scroll Bottom Finisher */}
        <div className="p-8 shrink-0 bg-gradient-to-t from-[#1e293b] to-[#0f172a] border-t border-[#8b5e3c]/30 flex flex-col gap-5">
          <label className="flex items-start gap-4 cursor-pointer group px-2">
            <div className="relative mt-1">
              <input type="checkbox" className="peer w-5 h-5 rounded border-[#8b5e3c] bg-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0 transition-all checked:bg-orange-600" required />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
              I have read the Terms and Conditions and the Privacy Policy. I confirm that I am a Shinobi of age and ready to begin my mission in the Leaf Arena.
            </p>
          </label>
          <button 
            onClick={onAccept}
            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black rounded-2xl uppercase tracking-[0.3em] shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-b-4 border-emerald-950 active:translate-y-1 transition-all text-xs"
          >
            I Accept the Shinobi Code
          </button>
        </div>
      </motion.div>
    </div>
  );
}

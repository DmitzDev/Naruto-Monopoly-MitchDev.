import React from 'react';

interface FooterProps {
  className?: string;
  hideStyling?: boolean;
}

export default function Footer({ className = "", hideStyling = false }: FooterProps) {
  return (
    <footer className={`w-full ${hideStyling ? '' : 'bg-[#f2e2ba] border-t-2 border-[#8b5e3c] mt-auto'} py-2 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#8b5e3c] overflow-hidden shadow-md bg-[#fb923c]">
            <img 
              src="/img/MDLogo.png" 
              alt="MitchDev Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[#5b3e2b] uppercase tracking-tighter text-sm leading-none">MitchDev.</span>
            <span className="text-[8px] font-bold text-[#8b5e3c] uppercase tracking-[0.2em]">Ninja Empire</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-0">
          <p className="text-[#5b3e2b] font-black text-[9px] uppercase tracking-widest">
            © {new Date().getFullYear()} Hidden Leaf Monopoly
          </p>
          <p className="text-[#8b5e3c] text-[8px] font-bold uppercase tracking-[0.1em] italic">
            Developed by MitchDev Special Forces
          </p>
        </div>
      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import { Smartphone, Monitor, Maximize2, Minimize2 } from 'lucide-react';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({ children }) => {
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      
      {/* Desktop Mode Toggle Floating Bar */}
      <div className="hidden lg:flex fixed top-3 right-6 z-50 items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-full px-3 py-1.5 shadow-xl">
        <span className="text-[11px] font-bold text-slate-300 mr-1">Mode:</span>
        <button
          onClick={() => setIsMobileFrame(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            !isMobileFrame
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" /> Web View
        </button>
        <button
          onClick={() => setIsMobileFrame(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            isMobileFrame
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Mobile App View
        </button>
      </div>

      {/* Main Container */}
      {isMobileFrame ? (
        <div className="py-8 px-4 w-full flex justify-center items-center my-auto">
          {/* Smartphone Frame Bezel */}
          <div className="relative w-full max-w-[420px] h-[860px] bg-slate-900 rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            {/* Dynamic Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800/80 mr-2" />
              <div className="w-2 h-2 rounded-full bg-slate-800/80" />
            </div>

            {/* Inner Mobile Screen Content */}
            <div className="w-full h-full overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>

            {/* Bottom Home Indicator Line */}
            <div className="bg-slate-950 py-1 flex justify-center items-center shrink-0 border-t border-slate-900 z-50">
              <div className="w-32 h-1 bg-slate-600/70 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full min-h-screen">
          {children}
        </div>
      )}
    </div>
  );
};

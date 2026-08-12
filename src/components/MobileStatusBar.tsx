import React, { useState, useEffect } from 'react';
import { Wifi, BatteryCharging, Signal, Download, Smartphone } from 'lucide-react';

interface MobileStatusBarProps {
  onOpenInstallModal: () => void;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ onOpenInstallModal }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950/90 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 select-none">
      {/* Time & App Brand */}
      <div className="flex items-center gap-2">
        <span className="font-semibold font-mono text-emerald-400 text-[11px] tracking-tight">{timeStr || '09:41'}</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
          <Smartphone className="w-2.5 h-2.5 text-emerald-400" /> Mobile App
        </span>
      </div>

      {/* Center Install Button Badge */}
      <button
        onClick={onOpenInstallModal}
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
      >
        <Download className="w-3 h-3 animate-bounce" /> Install Mobile App
      </button>

      {/* Signal, Wifi, Battery */}
      <div className="flex items-center gap-2 text-slate-400">
        <Signal className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-[9px] font-mono font-bold text-slate-400">5G</span>
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-mono font-bold text-emerald-400">100%</span>
          <BatteryCharging className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

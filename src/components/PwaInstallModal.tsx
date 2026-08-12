import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, CheckCircle2, X, ShieldCheck, Sparkles } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose, deferredPrompt: initialDeferredPrompt }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(initialDeferredPrompt || null);

  useEffect(() => {
    if (initialDeferredPrompt) {
      setDeferredPrompt(initialDeferredPrompt);
    }
  }, [initialDeferredPrompt]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      onClose();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-100 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <Smartphone className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Shyira InvestPro Kuri Telefoni</h2>
          <p className="text-xs text-slate-400">
            Hindura uru rubuga rubiwe nk'i <strong>Mobile App</strong> ku telefoni yawe ya Android cyangwa iPhone ngo uhite uyifungura vuba utarinze gushakisha mu mushakashatsi!
          </p>
        </div>

        {deferredPrompt ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-3 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4 animate-spin" /> Native App Install Discovered!
            </div>
            <p className="text-xs text-slate-300">
              Kanda ku butoni yo hasi ngo uyishyire kuri telefoni yawe aka kanya unyuze muri Chrome Browser!
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" /> Download / Install Mobile App Now
            </button>
          </div>
        ) : (
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4" /> Uburyo bwo kuyishyiraho (Step-by-Step)
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <span className="font-bold text-white">Kuri Android (Chrome):</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Kanda kuri <strong>akamenyetso k'utudomo tutatu (⋮)</strong> hejuru ku buryo bw'iburyo, ubundi uhitemo <strong>"Install app"</strong> cyangwa <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <span className="font-bold text-white">Kuri iPhone / iOS (Safari):</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1 flex-wrap">
                    Kanda ku kimenyetso cyo gusangira <Share className="w-3.5 h-3.5 text-blue-400 inline" /> ubundi uzamuke uhitemo <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-1">
          <button
            onClick={handleInstallClick}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" /> {deferredPrompt ? 'Shyiraho App Aka Kanya' : 'Yego, Mbyumvise Neza!'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-full font-medium transition-all shadow-sm flex-shrink-0 whitespace-nowrap ${
          compact
            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-[11px] sm:text-xs'
            : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 px-3 py-1.5 text-xs font-semibold'
        }`}
        title="Install Dcoine App on device"
      >
        <Download className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden text-[10px]">Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-2 py-1 text-[11px] sm:text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap`}
          title="Install on iOS"
        >
          <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Install iOS</span>
          <span className="sm:hidden text-[10px]">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Dcoine" className="w-7 h-7 rounded-full" />
                  <h3 className="text-base font-bold text-amber-400">Install Dcoine on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">1</span>
                  <p>Tap the <strong className="text-white">Share</strong> icon at the bottom of your Safari browser.</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">2</span>
                  <p>Scroll down in the action sheet and tap <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">3</span>
                  <p>Confirm by tapping <strong className="text-amber-400">Add</strong> in the top-right corner to get the full native app experience.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

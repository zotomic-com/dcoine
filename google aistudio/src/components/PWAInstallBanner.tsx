import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, Tablet, X, Check, Sparkles, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'desktop' | 'ios' | 'android'>('desktop');

  // Check session dismissal
  useEffect(() => {
    const dismissed = sessionStorage.getItem('dcoine_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // If already installed on the device (or running in standalone mode), hide automatically
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dcoine_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setIsDismissed(true);
      }
      return;
    }

    if (isIOS) {
      setGuidePlatform('ios');
      setShowGuideModal(true);
      return;
    }

    // Desktop or other mobile where beforeinstallprompt didn't trigger yet
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    setGuidePlatform(isMobile ? 'android' : 'desktop');
    setShowGuideModal(true);
  };

  return (
    <>
      {/* Sub-header PWA Banner across all pages & devices */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-3 sm:px-4 py-2 text-slate-100 shadow-md relative z-30 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <Download className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate block">
                Install Dcoine App
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-bold tracking-tight shadow-md hover:shadow-amber-500/20 transition transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Install App</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cross-Device PWA Installation Instructions Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Dcoine Logo" className="w-8 h-8 rounded-xl object-contain bg-amber-500/10 p-1 border border-amber-500/30" />
                <div>
                  <h3 className="text-base font-bold text-white">Install Dcoine App</h3>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                    {guidePlatform === 'ios' ? 'iOS Safari Guide' : guidePlatform === 'android' ? 'Android / Mobile Guide' : 'Desktop PC & Mac Guide'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {guidePlatform === 'ios' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <p>Tap the <strong className="text-white">Share</strong> icon at the bottom of your Safari screen.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <p>Scroll down the options list and tap <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <p>Tap <strong className="text-amber-400">Add</strong> in top-right. Dcoine will appear on your Home Screen as a native app!</p>
                </div>
              </div>
            )}

            {guidePlatform === 'desktop' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <p>Look at your browser address bar (top right in Chrome, Edge, Brave, or Opera).</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <p>Click the <strong className="text-white">Install App</strong> icon (or browser Menu &gt; &quot;Install Dcoine...&quot;).</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <p>Click <strong className="text-amber-400">Install</strong>. Dcoine will launch in its own standalone window with taskbar/dock integration!</p>
                </div>
              </div>
            )}

            {guidePlatform === 'android' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <p>Tap the <strong>three dots menu (⋮)</strong> in your Chrome / mobile browser.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <p>Select <strong className="text-white">Install app</strong> or <strong className="text-white">Add to Home screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <p>Confirm by clicking <strong className="text-amber-400">Install</strong>.</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

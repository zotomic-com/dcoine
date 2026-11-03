import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, AlertTriangle, ArrowRight, X, Play, Pause, BellRing } from 'lucide-react';
import { AnnouncementItem, AnnouncementSettings } from '../types';
import { StorageService } from '../services/storage';

interface AnnouncementTickerProps {
  onNavigateTab?: (tab: string) => void;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ onNavigateTab }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    StorageService.getAnnouncements()
  );
  const [settings, setSettings] = useState<AnnouncementSettings>(() =>
    StorageService.getAnnouncementSettings()
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Sync state with storage and real-time broadcast channel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('dcoine_announcements_bus');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'ANNOUNCEMENTS_UPDATED') {
            setAnnouncements(payload || StorageService.getAnnouncements());
          } else if (type === 'ANNOUNCEMENT_SETTINGS_UPDATED') {
            setSettings(payload || StorageService.getAnnouncementSettings());
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes('announcements_list')) {
        setAnnouncements(StorageService.getAnnouncements());
      } else if (e.key?.includes('announcement_settings')) {
        setSettings(StorageService.getAnnouncementSettings());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Filter only active announcements
  const activeAnnouncements = announcements.filter((a) => a.isActive);

  // If admin has hidden/unpublished the ticker bar, or no active announcements exist, or dismissed
  if (!settings.isPublished || activeAnnouncements.length === 0 || isDismissed) {
    return null;
  }

  const getTypeBadge = (type: AnnouncementItem['type']) => {
    switch (type) {
      case 'urgent':
        return { label: 'URGENT', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'reward':
        return { label: 'REWARD', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'event':
        return { label: 'EVENT', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'update':
        return { label: 'UPDATE', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      default:
        return { label: 'INFO', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div
      className="bg-slate-950/95 border-b border-slate-800 text-slate-200 text-xs py-1.5 px-2.5 sm:px-4 shadow-sm relative z-20 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {/* Static Prefix Tag */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold text-[10px] tracking-wider uppercase shrink-0">
          <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span className="hidden sm:inline">ANNOUNCEMENT</span>
          <span className="sm:hidden">NEWS</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className={`flex items-center gap-8 whitespace-nowrap transition-transform ${
              isPaused ? '' : 'animate-marquee'
            }`}
            style={{
              animationDuration: `${Math.max(30, settings.speedSeconds || 55)}s`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {/* Duplicated list to create infinite seamless loop effect */}
            {[...activeAnnouncements, ...activeAnnouncements].map((item, idx) => {
              const badge = getTypeBadge(item.type);
              return (
                <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-2 shrink-0">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-slate-200 text-[11px] sm:text-xs font-medium">
                    {item.text}
                  </span>
                  {item.linkText && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab && item.linkUrl && onNavigateTab(item.linkUrl)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer shrink-0"
                    >
                      <span>{item.linkText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <span className="text-slate-700 px-1 font-bold">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls: Pause / Play & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition cursor-pointer"
            title={isPaused ? 'Resume ticker scroll' : 'Pause ticker scroll'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          {settings.allowDismiss && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer"
              title="Hide announcement ticker"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

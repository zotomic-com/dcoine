import React from 'react';
import {
  LayoutDashboard,
  Pickaxe,
  WalletCards,
  ArrowLeftRight,
  Repeat2,
  Compass,
  Newspaper,
  ShieldCheck,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'mining' | 'wallet' | 'p2p' | 'swap' | 'news' | 'explorer' | 'admin';

interface BottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  isMiningActive: boolean;
  isAdminMode: boolean;
}

interface TabItem {
  id: NavTab;
  label: string;
  icon: any;
  hasPulse?: boolean;
  badgeText?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  isMiningActive,
  isAdminMode,
}) => {
  const baseTabs: TabItem[] = [
    {
      id: 'dashboard' as NavTab,
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'mining' as NavTab,
      label: 'Mining',
      icon: Pickaxe,
      hasPulse: isMiningActive,
      badgeText: isMiningActive ? '24H' : undefined,
    },
    {
      id: 'wallet' as NavTab,
      label: 'Wallet',
      icon: WalletCards,
    },
    {
      id: 'p2p' as NavTab,
      label: 'P2P',
      icon: ArrowLeftRight,
    },
    {
      id: 'swap' as NavTab,
      label: 'Swap',
      icon: Repeat2,
    },
    {
      id: 'news' as NavTab,
      label: 'News',
      icon: Newspaper,
    },
    {
      id: 'explorer' as NavTab,
      label: 'Explorer',
      icon: Compass,
    },
  ];

  // Admin tab is STRICTLY disclosed only if user is logged in as Admin
  const tabs = isAdminMode
    ? [
        ...baseTabs,
        {
          id: 'admin' as NavTab,
          label: 'Admin',
          icon: ShieldCheck,
          badgeText: 'PANEL',
        },
      ]
    : baseTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-1 py-1 pb-[calc(env(safe-area-inset-bottom,0px)+4px)] transition-all">
      <div className="max-w-md mx-auto grid grid-flow-col auto-cols-fr items-center justify-around gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`}
                />
                {tab.hasPulse && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}
                {tab.badgeText && !tab.hasPulse && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 leading-none">
                    {tab.badgeText}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 truncate ${isActive ? 'text-amber-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-amber-400 rounded-full mt-0.5 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

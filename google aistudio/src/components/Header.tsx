import React, { useState } from 'react';
import {
  ChevronDown,
  Copy,
  Check,
  Bell,
  LogIn,
  User,
} from 'lucide-react';
import { BlockchainNetwork, UserProfile, UserWallet } from '../types';
import { NETWORKS } from '../services/storage';
import { shortenAddress } from '../utils/crypto';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  user: UserProfile | null;
  activeWallet: UserWallet;
  activeNetwork: BlockchainNetwork;
  onSelectNetwork: (network: BlockchainNetwork) => void;
  onOpenWalletModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onToggleAdmin: () => void;
  onOpenAdminSidebar?: () => void;
  onToggleAdminSidebar?: () => void;
  isSidePanelOpen?: boolean;
  isAdminMode: boolean;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeWallet,
  activeNetwork,
  onSelectNetwork,
  onOpenWalletModal,
  onOpenAuthModal,
  onOpenProfile,
  onLogout,
  onToggleAdmin,
  onOpenAdminSidebar,
  onToggleAdminSidebar,
  isSidePanelOpen = false,
  isAdminMode,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}) => {
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (activeWallet?.address) {
      navigator.clipboard.writeText(activeWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 py-2 sm:py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Header Left Corner: Side Panel Toggle Button + Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Side Panel Toggle Button (Open / Close) - ONLY shown when user is logged in / signed in */}
          {user && (
            <button
              type="button"
              onClick={onToggleAdminSidebar || onOpenAdminSidebar}
              className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all cursor-pointer flex-shrink-0 group ${
                isSidePanelOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800 hover:border-slate-700'
              }`}
              title={isSidePanelOpen ? 'Close Side Menu' : 'Open Side Menu'}
              aria-label={isSidePanelOpen ? 'Close Side Menu' : 'Open Side Menu'}
            >
              <svg
                viewBox="-0.5 -0.5 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-200 ${
                  isSidePanelOpen
                    ? 'text-amber-400 scale-105'
                    : 'text-slate-400 group-hover:text-amber-300'
                }`}
              >
                <path
                  d="M12.7769375 14.284625H2.2230625c-0.8326875 0 -1.5076875 -0.675 -1.5076875 -1.5076875l0 -10.553875c0 -0.8326875 0.675 -1.5076875 1.5076875 -1.5076875h10.553875c0.8326875 0 1.5076875 0.675 1.5076875 1.5076875v10.553875c0 0.8326875 -0.675 1.5076875 -1.5076875 1.5076875Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.15"
                />
                <path
                  d={
                    isSidePanelOpen
                      ? "M3.91925 5.9923125 2.6 7.5l1.31925 1.5076875"
                      : "M2.6 5.9923125 3.91925 7.5 2.6 9.0076875"
                  }
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.15"
                />
                <path
                  d="M5.615375 14.284625V0.715375"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.15"
                />
              </svg>
            </button>
          )}

          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer flex-shrink-0 select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
              <img
                src="/logo.png"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    '/assets/aistudio/WhatsApp_Image_2026-10-29_at_22.31.08-removebg-preview_89173f9b.png';
                }}
                alt="Dcoine Logo"
                className="w-full h-full object-contain block drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] transform hover:scale-105 transition"
                loading="eager"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
              </span>
            </div>

            <div className="hidden sm:block flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Dcoine
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ECOSYSTEM
                </span>
              </div>
              <p className="text-[9px] text-slate-400 hidden sm:block -mt-0.5 font-medium">Decentralized Coin</p>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink min-w-0 justify-end">
          {/* PWA Install */}
          <PWAInstallButton compact={true} />

          {/* Network Switcher Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowNetworkMenu(!showNetworkMenu)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] sm:text-xs text-slate-200 transition flex-shrink-0 whitespace-nowrap cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  activeNetwork.id === 'dcoine' ? 'bg-amber-400 animate-pulse' : 'bg-indigo-400'
                }`}
              />
              <span className="sm:hidden font-bold text-[10px]">{activeNetwork.symbol}</span>
              <span className="hidden sm:inline font-medium max-w-[85px] truncate">{activeNetwork.name}</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {showNetworkMenu && (
              <div className="absolute right-auto sm:right-0 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 mt-2 w-52 sm:w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Blockchain
                </div>
                <div className="space-y-0.5">
                  {NETWORKS.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => {
                        onSelectNetwork(network);
                        setShowNetworkMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                        activeNetwork.id === network.id
                          ? 'bg-amber-500/15 text-amber-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            network.id === 'dcoine' ? 'bg-amber-400' : 'bg-slate-500'
                          }`}
                        />
                        <span>{network.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{network.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wallet Address Badge */}
          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-[11px] sm:text-xs font-mono text-amber-300 transition shadow-sm flex-shrink-0 whitespace-nowrap cursor-pointer"
            title="Click to view wallet details"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
            <span className="sm:hidden">{shortenAddress(activeWallet?.address || '0x0000', 2)}</span>
            <span className="hidden sm:inline">{shortenAddress(activeWallet?.address || '0x0000', 4)}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="p-0.5 hover:text-white text-slate-400 flex-shrink-0 transition"
              title="Copy Address"
              role="button"
              tabIndex={0}
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </span>
          </button>

          {/* Notification Center Trigger */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition flex-shrink-0 cursor-pointer"
              title="Notification Center"
              aria-label="Open notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* PROFILE ICON / BUTTON:
              - If NOT logged in: Clicking shows login/signup modal
              - If logged in: Clicking shows their profile page
          */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex-shrink-0"
              title={`Logged in as ${user.username} (View Profile)`}
            >
              <div className="w-6 h-6 rounded-full border border-amber-500/50 flex items-center justify-center bg-slate-800 text-amber-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-200 max-w-[80px] truncate">
                {user.username}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm cursor-pointer flex-shrink-0 group"
              title="Sign in or create account"
              aria-label="Sign In"
            >
              <LogIn className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

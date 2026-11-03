/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { MiningView } from './components/MiningView';
import { WalletView } from './components/WalletView';
import { P2PView } from './components/P2PView';
import { SwapView } from './components/SwapView';
import { NewsView } from './components/NewsView';
import { ExplorerView } from './components/ExplorerView';
import { DashboardView } from './components/DashboardView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { NotificationModal } from './components/NotificationModal';
import { AppNotification, BlockchainNetwork, MiningSession, TokenItem, UserProfile, UserWallet } from './types';
import { StorageService } from './services/storage';

export default function App() {
  // Core Application State
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUser());
  const [wallets, setWallets] = useState<UserWallet[]>(() => StorageService.getWallets());
  const [activeWallet, setActiveWallet] = useState<UserWallet>(() => wallets[0] || StorageService.getWallets()[0]);
  const [activeNetwork, setActiveNetwork] = useState<BlockchainNetwork>(() => StorageService.getActiveNetwork());
  const [tokens, setTokens] = useState<TokenItem[]>(() => StorageService.getTokens());
  const [miningSession, setMiningSession] = useState<MiningSession>(() => StorageService.getMiningSession());

  // UI state
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup' | 'admin_login'>('login');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Sync notifications across tabs & broadcasts
  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(StorageService.getNotifications());
    };
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('dcoine_notifications_bus') : null;
    if (channel) {
      channel.onmessage = handleUpdate;
    }
    window.addEventListener('storage', handleUpdate);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Compute unread count for the current role
  const unreadNotificationsCount = notifications.filter((n) => {
    const applies = n.recipientRole === 'all' || (isAdminMode ? n.recipientRole === 'admin' : n.recipientRole === 'user');
    return applies && !n.isRead;
  }).length;

  // Connectivity Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check URL query parameters for referral link on initial load e.g. ?ref=DCOIN-ABCD
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        setAuthModalInitialMode('signup');
        setAuthModalOpen(true);
      }
    }
  }, []);

  // Ensure admin dashboard opens when admin mode is active
  useEffect(() => {
    if (isAdminMode) {
      setCurrentTab('admin');
    }
  }, [isAdminMode]);
  const handleSelectNetwork = (network: BlockchainNetwork) => {
    setActiveNetwork(network);
    StorageService.setActiveNetwork(network.id);
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAdminMode(false);
    setCurrentTab('dashboard');
    const defaultUser = StorageService.getUser();
    // reset to a fresh default by clearing stored user
    localStorage.removeItem('dcoine_app_user_profile');
    setUser(StorageService.getUser());
    setAuthModalInitialMode('login');
  };
  const handleToggleAdmin = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setCurrentTab('dashboard');
    } else {
      setAuthModalInitialMode('admin_login');
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-amber-600/95 text-slate-950 text-xs font-bold text-center py-1.5 px-3 flex items-center justify-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Offline Mode — Cached blockchain states and offline mining are active.</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        user={user}
        activeWallet={activeWallet}
        activeNetwork={activeNetwork}
        onSelectNetwork={handleSelectNetwork}
        onOpenWalletModal={() => setCurrentTab('wallet')}
        onOpenAuthModal={() => {
          setAuthModalInitialMode('login');
          setAuthModalOpen(true);
        }}
        onToggleAdmin={handleToggleAdmin}
        onLogout={handleLogout}
        isAdminMode={isAdminMode}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setNotificationModalOpen(true)}
      />

      {/* Install App Banner (All Pages, PC / Tablet / Mobile - Auto Hides When Installed) */}
      <PWAInstallBanner />

      {/* Live Announcement Ticker Bar (Under Header across all pages/devices, managed by Admin) */}
      <AnnouncementTicker onNavigateTab={(tab) => setCurrentTab(tab as any)} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-5 pb-24 sm:pb-28">
        {currentTab === 'dashboard' && (
          <DashboardView
            user={user}
            tokens={tokens}
            wallets={wallets}
            activeWallet={activeWallet}
            miningSession={miningSession}
            onUpdateUser={setUser}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'mining' && (
          <MiningView
            user={user}
            miningSession={miningSession}
            onUpdateSession={setMiningSession}
            onOpenAuthModal={() => {
              setAuthModalInitialMode('signup');
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentTab === 'wallet' && (
          <WalletView
            wallets={wallets}
            activeWallet={activeWallet}
            activeNetwork={activeNetwork}
            tokens={tokens}
            onSelectWallet={setActiveWallet}
            onUpdateWallets={setWallets}
            onUpdateTokens={setTokens}
            onSelectNetwork={handleSelectNetwork}
          />
        )}

        {currentTab === 'p2p' && (
          <P2PView
            user={user}
            tokens={tokens}
            onUpdateTokens={setTokens}
            onUpdateUser={setUser}
          />
        )}

        {currentTab === 'swap' && (
          <SwapView
            tokens={tokens}
            activeNetwork={activeNetwork}
            onSelectNetwork={handleSelectNetwork}
            onUpdateTokens={setTokens}
            onOpenAdmin={() => {
              setIsAdminMode(true);
              setCurrentTab('admin');
            }}
          />
        )}

        {currentTab === 'news' && <NewsView user={user} />}

        {currentTab === 'explorer' && <ExplorerView />}

        {currentTab === 'admin' && (
          <AdminView
            onExitAdmin={() => {
              setIsAdminMode(false);
              setCurrentTab('dashboard');
            }}
            tokens={tokens}
            onUpdateTokens={setTokens}
          />
        )}
      </main>

      {/* Bottom Footer Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => {
          if (tab === 'admin') {
            setIsAdminMode(true);
          }
          setCurrentTab(tab);
        }}
        isMiningActive={miningSession.isActive}
        isAdminMode={isAdminMode}
      />

      {/* Authentication & 2FA Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onLoginSuccess={(updatedUser, isAdmin) => {
          setUser(updatedUser);
          if (isAdmin) {
            setIsAdminMode(true);
            setCurrentTab('admin');
          }
        }}
        initialMode={authModalInitialMode}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          setNotifications(StorageService.getNotifications());
        }}
        user={user}
        isAdmin={isAdminMode}
        onNavigateTab={(tab) => {
          if (tab === 'admin') {
            setIsAdminMode(true);
            setCurrentTab('admin');
          } else {
            setCurrentTab(tab as any);
          }
        }}
      />
    </div>
  );
}

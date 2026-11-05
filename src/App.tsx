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
import { GuestHomeView } from './components/GuestHomeView';
import { AdminView } from './components/AdminView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminSidebar } from './components/AdminSidebar';
import { UserSidebar } from './components/UserSidebar';
import { AuthModal } from './components/AuthModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { NotificationModal } from './components/NotificationModal';
import { AppNotification, BlockchainNetwork, MiningSession, TokenItem, UserProfile, UserWallet } from './types';
import { NETWORKS, StorageService } from './services/storage';

const DEFAULT_VAULT: UserWallet = {
  id: 'w-primary',
  name: 'Main Dcoine Vault',
  address: '0x9fa4b2e817c6e0018a99cde3194a02be9761e05a8d90',
  network: 'dcoine',
  isNative: true,
  lockedBalance: 0.0,
  createdAt: Date.now(),
};

export default function App() {
  // Core Application State
  const [user, setUser] = useState<UserProfile | null>(() => StorageService.getUser());
  const [wallets, setWallets] = useState<UserWallet[]>(() => {
    const list = StorageService.getWallets();
    return list && list.length > 0 ? list : [DEFAULT_VAULT];
  });
  const [activeWallet, setActiveWallet] = useState<UserWallet>(() => wallets[0] || DEFAULT_VAULT);
  const [activeNetwork, setActiveNetwork] = useState<BlockchainNetwork>(() => StorageService.getActiveNetwork() || NETWORKS[0]);
  const [tokens, setTokens] = useState<TokenItem[]>(() => StorageService.getTokens());
  const [miningSession, setMiningSession] = useState<MiningSession>(() => StorageService.getMiningSession());

  // Role-Based Navigation & Mode
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup' | 'admin_login'>('login');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    const active = StorageService.getUser();
    return active?.role === 'admin';
  });
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [adminSection, setAdminSection] = useState('dashboard');

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Sync notifications & cross-tab session state in real-time
  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(StorageService.getNotifications());
      const activeUser = StorageService.getUser();
      setUser(activeUser);
      if (activeUser?.role === 'admin') {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
    };

    let notifChannel: BroadcastChannel | null = null;
    let sessionChannel: BroadcastChannel | null = null;

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        notifChannel = new BroadcastChannel('dcoine_notifications_bus');
        notifChannel.onmessage = handleUpdate;

        sessionChannel = new BroadcastChannel('dcoine_session_bus');
        sessionChannel.onmessage = (event) => {
          if (event.data?.type === 'USER_LOGGED_IN') {
            setUser(event.data.user);
            if (event.data.user?.role === 'admin') {
              setIsAdminMode(true);
              setCurrentTab('admin');
            } else {
              setIsAdminMode(false);
            }
          } else if (event.data?.type === 'USER_LOGGED_OUT') {
            setUser(null);
            setIsAdminMode(false);
            setCurrentTab('dashboard');
          }
        };
      }
    } catch {}

    window.addEventListener('storage', handleUpdate);
    return () => {
      if (notifChannel) notifChannel.close();
      if (sessionChannel) sessionChannel.close();
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Compute unread count for current role
  const unreadNotificationsCount = notifications.filter((n) => {
    const applies =
      n.recipientRole === 'all' ||
      (isAdminMode ? n.recipientRole === 'admin' : n.recipientRole === 'user');
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

  // Auto-detect referral code in URL query string: ?ref=DCOIN-ABCD
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam && !user) {
        setAuthModalInitialMode('signup');
        setAuthModalOpen(true);
      }
    }
  }, [user]);

  // Handle Network Change
  const handleSelectNetwork = (network: BlockchainNetwork) => {
    setActiveNetwork(network);
    StorageService.setActiveNetwork(network.id);
  };

  // Handle Admin Toggle (Strictly restricted to users with role === 'admin')
  const handleToggleAdmin = () => {
    if (!user || user.role !== 'admin') {
      return;
    }
    if (isAdminMode) {
      setIsAdminMode(false);
      setCurrentTab('dashboard');
    } else {
      setIsAdminMode(true);
      setCurrentTab('admin');
    }
  };

  // Handle User Logout (Clears session, resets to guest mode)
  const handleLogout = () => {
    StorageService.logoutUser();
    setUser(null);
    setIsAdminMode(false);
    setIsAdminSidebarOpen(false);
    setIsUserSidebarOpen(false);
    setCurrentTab('dashboard');
  };

  // Safe tab change: prevent non-admins from viewing admin tab
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'admin') {
      if (!user || user.role !== 'admin') {
        setCurrentTab('dashboard');
        return;
      }
      setIsAdminMode(true);
      setCurrentTab('admin');
      return;
    }
    setCurrentTab(tab);
  };

  // Handle successful login or registration
  const handleLoginSuccess = (authenticatedUser: UserProfile, asAdmin: boolean) => {
    setUser(authenticatedUser);
    if (asAdmin || authenticatedUser.role === 'admin') {
      setIsAdminMode(true);
      setCurrentTab('admin');
    } else {
      setIsAdminMode(false);
      setCurrentTab('dashboard');
    }
    // Update live tokens and wallets for this user
    setWallets(StorageService.getWallets());
    setTokens(StorageService.getTokens());
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
        onOpenProfile={() => {
          setCurrentTab('dashboard');
        }}
        onLogout={handleLogout}
        onToggleAdmin={handleToggleAdmin}
        onOpenAdminSidebar={() => {
          if (isAdminMode && user?.role === 'admin') {
            setIsAdminSidebarOpen(true);
          } else if (user) {
            setIsUserSidebarOpen(true);
          }
        }}
        onToggleAdminSidebar={() => {
          if (isAdminMode && user?.role === 'admin') {
            setIsAdminSidebarOpen((prev) => !prev);
          } else if (user) {
            setIsUserSidebarOpen((prev) => !prev);
          }
        }}
        isSidePanelOpen={isAdminMode ? isAdminSidebarOpen : isUserSidebarOpen}
        isAdminMode={isAdminMode}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setNotificationModalOpen(true)}
      />

      {/* Install App Banner (All Pages, PC / Tablet / Mobile) */}
      <PWAInstallBanner />

      {/* Live Announcement Ticker Bar */}
      <AnnouncementTicker onNavigateTab={(tab) => handleTabChange(tab as any)} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-5 pb-24 sm:pb-28">
        {/* REQUIREMENT 5: SEPARATE HOME PAGE FOR LOGGED IN & NON-LOGGED IN USER */}
        {currentTab === 'dashboard' && (
          user ? (
            /* Logged-In User Home (Dashboard) */
            <DashboardView
              user={user}
              tokens={tokens}
              wallets={wallets}
              activeWallet={activeWallet}
              miningSession={miningSession}
              onUpdateUser={setUser}
              onNavigateTab={handleTabChange}
              onLogout={handleLogout}
            />
          ) : (
            /* Non-Logged-In Guest Home (High-Converting Landing Showcase) */
            <GuestHomeView
              tokens={tokens}
              activeNetwork={activeNetwork}
              onOpenAuthModal={(mode) => {
                setAuthModalInitialMode(mode);
                setAuthModalOpen(true);
              }}
              onNavigateTab={(tab) => handleTabChange(tab as any)}
            />
          )
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
            user={user || {
              id: 'guest',
              username: 'Guest Trader',
              email: 'guest@dcoine.network',
              referralCode: 'DCOIN-GUEST',
              role: 'user',
              twoFactorEnabled: false,
              isMerchant: false,
              merchantSecurityPledge: 0,
              kycStatus: 'unverified',
              avatarUrl: '',
              createdAt: Date.now(),
              lockedMinedBalance: 0,
            }}
            tokens={tokens}
            onUpdateTokens={setTokens}
            onUpdateUser={(updated) => {
              if (user) {
                setUser(updated);
                StorageService.saveUser(updated);
              }
            }}
          />
        )}

        {currentTab === 'swap' && (
          <SwapView
            tokens={tokens}
            activeNetwork={activeNetwork}
            onSelectNetwork={handleSelectNetwork}
            onUpdateTokens={setTokens}
            onOpenAdmin={() => {
              if (user?.role === 'admin') {
                setIsAdminMode(true);
                setCurrentTab('admin');
              } else {
                setAuthModalInitialMode('admin_login');
                setAuthModalOpen(true);
              }
            }}
          />
        )}

        {currentTab === 'news' && (
          <NewsView
            user={user || {
              id: 'guest',
              username: 'Guest Reader',
              email: 'guest@dcoine.network',
              referralCode: 'DCOIN-GUEST',
              role: 'user',
              twoFactorEnabled: false,
              isMerchant: false,
              merchantSecurityPledge: 0,
              kycStatus: 'unverified',
              avatarUrl: '',
              createdAt: Date.now(),
              lockedMinedBalance: 0,
            }}
          />
        )}

        {currentTab === 'explorer' && <ExplorerView />}

        {/* ADMIN VIEW - STRICTLY DISCLOSED ONLY TO AUTHENTICATED ADMINS */}
        {currentTab === 'admin' && user?.role === 'admin' && (
          <AdminView
            currentSection={adminSection}
            onNavigateSection={(section) => setAdminSection(section)}
            onExitAdmin={() => {
              setIsAdminMode(false);
              setCurrentTab('dashboard');
            }}
            onLogout={() => {
              StorageService.saveUser(null);
              setUser(null);
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
        onChangeTab={handleTabChange}
        isMiningActive={Boolean(user && miningSession.isActive)}
        isAdminMode={Boolean(user?.role === 'admin' && isAdminMode)}
      />

      {/* Authentication & 2FA Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalInitialMode}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          setNotifications(StorageService.getNotifications());
        }}
        user={user || {
          id: 'guest',
          username: 'Guest',
          email: 'guest@dcoine.network',
          referralCode: 'DCOIN-GUEST',
          role: 'user',
          twoFactorEnabled: false,
          isMerchant: false,
          merchantSecurityPledge: 0,
          kycStatus: 'unverified',
          avatarUrl: '',
          createdAt: Date.now(),
          lockedMinedBalance: 0,
        }}
        isAdmin={Boolean(user?.role === 'admin' && isAdminMode)}
        onNavigateTab={(tab) => {
          handleTabChange(tab as any);
        }}
      />
      {/* Platform User Sidebar - Separate from Admin */}
      {user && !isAdminMode && (
        <UserSidebar
          open={isUserSidebarOpen}
          onClose={() => setIsUserSidebarOpen(false)}
          onNavigateTab={(tab) => {
            handleTabChange(tab);
            setIsUserSidebarOpen(false);
          }}
          onLogout={handleLogout}
          user={user}
          currentTab={currentTab}
        />
      )}

      {/* Admin Sidebar */}
      {isAdminMode && (
        <AdminSidebar
          open={isAdminSidebarOpen}
          onClose={() => setIsAdminSidebarOpen(false)}
          onNavigate={(section) => {
            setAdminSection(section);
            setIsAdminSidebarOpen(false);
            if (currentTab !== 'admin') {
              setCurrentTab('admin');
            }
          }}
          onLogout={() => {
            StorageService.saveUser(null);
            setUser(null);
            setIsAdminMode(false);
            setIsAdminSidebarOpen(false);
            setCurrentTab('dashboard');
          }}
          activeSection={adminSection}
          onViewLiveSite={() => {
            setIsAdminMode(false);
            setCurrentTab('dashboard');
          }}
        />
      )}
    </div>
  );
}

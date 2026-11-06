import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Megaphone,
  Receipt,
  Settings,
  Plug,
  User,
  LogOut,
  Shield,
  Menu,
  ExternalLink,
  X,
  FileText,
  Users2,
  Edit2,
  Trash2,
  Plus,
  Check,
  Image as ImageIcon,
  Coins,
} from 'lucide-react';
import { TokenItem, P2POrder, TransactionRecord, UserProfile, RevenueRecord } from '../types';
import { StorageService } from '../services/storage';

// Modular Tab Views
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminEarningsTab } from './admin/AdminEarningsTab';
import { AdminP2PAdsTab } from './admin/AdminP2PAdsTab';
import { AdminTransactionsTab } from './admin/AdminTransactionsTab';
import { AdminCoinTab } from './admin/AdminCoinTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';
import { AdminIntegrationsTab } from './admin/AdminIntegrationsTab';
import { AdminProfileTab } from './admin/AdminProfileTab';
import { AdminCMSTab } from './admin/AdminCMSTab';
import { AdminStaffTab } from './admin/AdminStaffTab';

// Modals
import { P2PAdDetailModal } from './admin/P2PAdDetailModal';
import { TransactionDetailModal } from './admin/TransactionDetailModal';

interface AdminViewProps {
  onExitAdmin: () => void;
  onLogout?: () => void;
  currentSection?: string;
  onNavigateSection?: (section: string) => void;
  tokens?: TokenItem[];
  onUpdateTokens?: (tokens: TokenItem[]) => void;
}

export const ADMIN_SECTIONS = [
  { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard, badge: 'Live' },
  { id: 'users', label: '2. Users', icon: Users, badge: 'Manage' },
  { id: 'earnings', label: '3. Earnings/Revenue', icon: DollarSign, badge: 'USD' },
  { id: 'p2pads', label: '4. P2P Ads', icon: Megaphone, badge: 'P2P' },
  { id: 'transactions', label: '5. Transactions', icon: Receipt, badge: 'Chains' },
  { id: 'coin', label: '6. Coin (DC Native)', icon: Coins, badge: 'Native' },
  { id: 'cms', label: '7. CMS Management', icon: FileText, badge: 'Live' },
  { id: 'staff', label: '8. Staff & Team', icon: Users2, badge: 'Roles' },
  { id: 'settings', label: '9. Settings', icon: Settings, badge: 'Full' },
  { id: 'integrations', label: '10. Integrations', icon: Plug, badge: 'API' },
  { id: 'profile', label: '11. Profile', icon: User, badge: '2FA' },
];

export const AdminView: React.FC<AdminViewProps> = ({
  onExitAdmin,
  onLogout,
  currentSection: propSection,
  onNavigateSection: propNavigate,
}) => {
  // Local section fallback if prop not provided
  const [internalSection, setInternalSection] = useState('dashboard');
  const [sectionFilter, setSectionFilter] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Active section resolution
  const activeSection = propSection || internalSection;
  const navigateTo = (sec: string, filter?: string) => {
    setSectionFilter(filter);
    if (propNavigate) {
      propNavigate(sec);
    } else {
      setInternalSection(sec);
    }
    setIsMobileSidebarOpen(false);
  };

  // Live Storage Collections State
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsersRegistry());
  const [p2pOrders, setP2pOrders] = useState<P2POrder[]>(() => StorageService.getP2POrders());
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() =>
    StorageService.getTransactions()
  );
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>(() =>
    StorageService.getRevenueRecords()
  );

  // Modals for click-through inspections
  const [selectedAd, setSelectedAd] = useState<P2POrder | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  // Admin profile info for sidebar with image management
  const [adminProfile, setAdminProfile] = useState(() => StorageService.getAdminProfileSettings());
  const [showImageManager, setShowImageManager] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [managerNotice, setManagerNotice] = useState<string | null>(null);

  // Sync profile when section changes or on storage update
  useEffect(() => {
    const current = StorageService.getAdminProfileSettings();
    setAdminProfile(current);
    setImageUrlInput(current.avatarUrl || '');
  }, [activeSection]);

  const presets = StorageService.getAdminAvatarPresets();

  const handleSaveAdminImage = (newUrl: string) => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    const updated = { ...adminProfile, avatarUrl: trimmed };
    StorageService.saveAdminProfileSettings(updated);

    const currentUser = StorageService.getUser();
    if (currentUser && currentUser.role === 'admin') {
      currentUser.avatarUrl = trimmed;
      StorageService.saveUser(currentUser);
      StorageService.updateUser(currentUser);
    }

    setAdminProfile(updated);
    setImageUrlInput(trimmed);
    setManagerNotice('✓ Admin image updated successfully!');
    setTimeout(() => setManagerNotice(null), 2500);
  };

  const handleDeleteAdminImage = () => {
    const updated = { ...adminProfile, avatarUrl: '' };
    StorageService.saveAdminProfileSettings(updated);

    const currentUser = StorageService.getUser();
    if (currentUser && currentUser.role === 'admin') {
      currentUser.avatarUrl = '';
      StorageService.saveUser(currentUser);
      StorageService.updateUser(currentUser);
    }

    setAdminProfile(updated);
    setImageUrlInput('');
    setManagerNotice('✓ Admin image removed / deleted.');
    setTimeout(() => setManagerNotice(null), 2500);
  };

  // Handlers for user mutations
  const handleAddUser = (user: UserProfile) => {
    StorageService.addUser(user);
    setUsers(StorageService.getUsersRegistry());
  };

  const handleUpdateUser = (user: UserProfile) => {
    StorageService.updateUser(user);
    setUsers(StorageService.getUsersRegistry());
  };

  const handleDeleteUser = (userId: string) => {
    StorageService.deleteUser(userId);
    setUsers(StorageService.getUsersRegistry());
  };

  // Handlers for P2P ad mutations
  const handleAddAd = (order: P2POrder) => {
    StorageService.addP2POrder(order);
    setP2pOrders(StorageService.getP2POrders());
  };

  const handleUpdateAdStatus = (orderId: string, status: P2POrder['status']) => {
    const list = StorageService.getP2POrders();
    const item = list.find((o) => o.id === orderId);
    if (item) {
      item.status = status;
      StorageService.saveP2POrders(list);
      setP2pOrders([...list]);
      if (selectedAd && selectedAd.id === orderId) {
        setSelectedAd({ ...item });
      }
    }
  };

  const handleDeleteAd = (orderId: string) => {
    StorageService.deleteP2POrder(orderId);
    setP2pOrders(StorageService.getP2POrders());
    setSelectedAd(null);
  };

  const handleAdminLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      StorageService.saveUser(null);
      onExitAdmin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* ========================================================================= */}
      {/* DESKTOP FIXED SIDEBAR */}
      {/* ========================================================================= */}
      {isDesktopSidebarOpen && (
        <aside className="hidden lg:flex w-64 bg-slate-950 border-r border-slate-800/80 p-4 flex-col gap-2 flex-shrink-0 min-h-screen sticky top-0 h-screen transition-all">
          {/* Header Branding & Collapse Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="font-bold text-white text-sm tracking-wide flex items-center gap-1.5">
                  Dcoine Admin
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Root
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Master Control Console</div>
              </div>
            </div>

            {/* Collapse Sidebar Button */}
            <button
              onClick={() => setIsDesktopSidebarOpen(false)}
              title="Close Side Panel"
              aria-label="Close Side Panel"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              <svg
                viewBox="-0.5 -0.5 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4.5 h-4.5 text-slate-400 hover:text-amber-400"
              >
                <path
                  d="M12.7769375 14.284625H2.2230625c-0.8326875 0 -1.5076875 -0.675 -1.5076875 -1.5076875l0 -10.553875c0 -0.8326875 0.675 -1.5076875 1.5076875 -1.5076875h10.553875c0.8326875 0 1.5076875 0.675 1.5076875 1.5076875v10.553875c0 0.8326875 -0.675 1.5076875 -1.5076875 1.5076875Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.15"
                />
                <path
                  d="M3.91925 5.9923125 2.6 7.5l1.31925 1.5076875"
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
          </div>

        {/* Live Frontend User App Link */}
        <button
          onClick={onExitAdmin}
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-amber-400 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800/80 transition my-1"
        >
          <span className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            View Frontend App
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Live</span>
        </button>

        {/* Navigation Items (1 - 8) */}
        <nav className="flex-1 overflow-y-auto space-y-1 py-1 pr-1 custom-scrollbar">
          {ADMIN_SECTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10 font-bold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer with Admin Avatar & ITEM 9: LOG OUT (ONLY ICON) */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
          {/* Main User Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0 pr-2">
              <div className="relative shrink-0">
                {adminProfile.avatarUrl ? (
                  <img
                    src={adminProfile.avatarUrl}
                    alt={adminProfile.name}
                    onClick={() => setShowImageManager((prev) => !prev)}
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/40 group-hover:border-amber-400 transition cursor-pointer hover:scale-105"
                    title="Click to Add, Edit, or Delete Admin Image"
                  />
                ) : (
                  <div
                    onClick={() => setShowImageManager((prev) => !prev)}
                    className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 cursor-pointer hover:border-amber-400 transition"
                    title="Click to Add Admin Image"
                  >
                    <Shield className="w-4 h-4" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageManager((prev) => !prev);
                  }}
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-md transition"
                  title="Image Controls (Add, Edit, Delete)"
                >
                  <Edit2 className="w-2 h-2" />
                </button>
              </div>
              <div
                onClick={() => navigateTo('profile')}
                className="min-w-0 flex-1"
                title="Go to Admin Profile"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate transition">
                  {adminProfile.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{adminProfile.email}</div>
              </div>
            </div>

            {/* ITEM 9: LOG OUT (FOR LOG OUT USE ONLY ICON) */}
            <button
              onClick={handleAdminLogout}
              title="Log Out"
              aria-label="Log out"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition flex-shrink-0 shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add / Edit / Delete Action Buttons Row */}
          <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setShowImageManager(true);
                setImageUrlInput('');
              }}
              className="flex-1 py-1 px-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold flex items-center justify-center gap-1 transition cursor-pointer text-[10px]"
              title="Add a new image"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImageManager(true);
                setImageUrlInput(adminProfile.avatarUrl || '');
              }}
              className="flex-1 py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 font-semibold flex items-center justify-center gap-1 transition cursor-pointer text-[10px]"
              title="Edit image URL"
            >
              <Edit2 className="w-2.5 h-2.5" />
              <span>Edit</span>
            </button>
            {adminProfile.avatarUrl && (
              <button
                type="button"
                onClick={handleDeleteAdminImage}
                className="py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold flex items-center justify-center gap-1 transition cursor-pointer text-[10px]"
                title="Delete admin photo"
              >
                <Trash2 className="w-2.5 h-2.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Expandable Image Manager Popover */}
          {showImageManager && (
            <div className="mt-1 p-2.5 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-white">
                  <ImageIcon className="w-3 h-3 text-amber-400" />
                  <span>Admin Image Manager</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImageManager(false)}
                  className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {managerNotice && (
                <div className="text-[10px] p-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
                  {managerNotice}
                </div>
              )}

              {/* Add / Edit Input Field */}
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-slate-300 block">
                  {adminProfile.avatarUrl ? 'Edit / Enter Image URL:' : 'Add New Image URL:'}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="https://... image URL"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-[10px] focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveAdminImage(imageUrlInput)}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] transition flex items-center gap-0.5 shrink-0"
                  >
                    <Check className="w-2.5 h-2.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets Gallery */}
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Presets:</span>
                  {adminProfile.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteAdminImage}
                      className="text-rose-400 hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-2 h-2" /> Delete
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {presets.slice(0, 4).map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt={`preset-${idx}`}
                      onClick={() => handleSaveAdminImage(preset)}
                      className={`w-full aspect-square rounded-md object-cover cursor-pointer border transition hover:scale-105 ${
                        adminProfile.avatarUrl === preset
                          ? 'border-amber-400 ring-1 ring-amber-400'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                      title="Click to apply"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    )}

      {/* ========================================================================= */}
      {/* MOBILE HEADER & SLIDE-OUT DRAWER */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
            title={isMobileSidebarOpen ? "Close Admin Side Panel" : "Open Admin Side Panel"}
            aria-label={isMobileSidebarOpen ? "Close Admin Side Panel" : "Open Admin Side Panel"}
          >
            <svg
              viewBox="-0.5 -0.5 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-slate-400 hover:text-amber-400"
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
                  isMobileSidebarOpen
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
          <div className="font-bold text-white text-sm flex items-center gap-1.5">
            <span>Dcoine Admin</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Root
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExitAdmin}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Site</span>
          </button>

          {/* ITEM 9: LOG OUT (ONLY ICON) */}
          <button
            onClick={handleAdminLogout}
            title="Log Out"
            aria-label="Log out"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn">
          <div className="w-72 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-2 shadow-2xl z-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm">Admin Navigation</span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 py-2">
              {ADMIN_SECTIONS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Item 9: Log Out (Only Icon) in mobile drawer footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 truncate">{adminProfile.email}</div>
              <button
                onClick={handleAdminLogout}
                title="Log Out"
                aria-label="Log out"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTENT */}
      {/* ========================================================================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        {/* Current Section Breadcrumb Navigation */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-400">
            {/* Desktop Expand Button if Sidebar is Collapsed */}
            {!isDesktopSidebarOpen && (
              <button
                onClick={() => setIsDesktopSidebarOpen(true)}
                title="Open Side Panel"
                aria-label="Open Side Panel"
                className="hidden lg:flex items-center justify-center p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition"
              >
                <svg
                  viewBox="-0.5 -0.5 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4.5 h-4.5"
                >
                  <path
                    d="M12.7769375 14.284625H2.2230625c-0.8326875 0 -1.5076875 -0.675 -1.5076875 -1.5076875l0 -10.553875c0 -0.8326875 0.675 -1.5076875 1.5076875 -1.5076875h10.553875c0.8326875 0 1.5076875 0.675 1.5076875 1.5076875v10.553875c0 0.8326875 -0.675 1.5076875 -1.5076875 1.5076875Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.15"
                  />
                  <path
                    d="M2.6 5.9923125 3.91925 7.5 2.6 9.0076875"
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
            <span>Admin Console</span>
            <span className="text-slate-600">/</span>
            <span className="font-bold text-amber-400 uppercase tracking-wider">
              {ADMIN_SECTIONS.find((s) => s.id === activeSection)?.label || activeSection}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {ADMIN_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => navigateTo(sec.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                  activeSection === sec.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sec.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Dashboard */}
        {activeSection === 'dashboard' && (
          <AdminDashboardTab
            users={users}
            p2pOrders={p2pOrders}
            transactions={transactions}
            revenueRecords={revenueRecords}
            onNavigateSection={navigateTo}
            onInspectAd={(ad) => setSelectedAd(ad)}
            onInspectTx={(tx) => setSelectedTx(tx)}
          />
        )}

        {/* Section 2: Users */}
        {activeSection === 'users' && (
          <AdminUsersTab
            users={users}
            initialFilter={sectionFilter || 'all'}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {/* Section 3: Earnings/Revenue */}
        {activeSection === 'earnings' && (
          <AdminEarningsTab
            revenueRecords={revenueRecords}
            initialFilter={sectionFilter || 'all'}
            onUpdateCommissionRates={() => {
              // refresh records or state if needed
            }}
          />
        )}

        {/* Section 4: P2P Ads */}
        {activeSection === 'p2pads' && (
          <AdminP2PAdsTab
            orders={p2pOrders}
            onInspectAd={(ad) => setSelectedAd(ad)}
            onAddOrder={handleAddAd}
            onUpdateStatus={handleUpdateAdStatus}
            onDeleteOrder={handleDeleteAd}
          />
        )}

        {/* Section 5: Transactions */}
        {activeSection === 'transactions' && (
          <AdminTransactionsTab
            transactions={transactions}
            onInspectTx={(tx) => setSelectedTx(tx)}
          />
        )}

        {/* Section 6: Native Coin Management */}
        {activeSection === 'coin' && <AdminCoinTab />}

        {/* Section 7: CMS */}
        {activeSection === 'cms' && <AdminCMSTab />}

        {/* Section 8: Staff */}
        {activeSection === 'staff' && <AdminStaffTab />}

        {/* Section 9: Settings */}
        {activeSection === 'settings' && <AdminSettingsTab />}

        {/* Section 10: Integrations */}
        {activeSection === 'integrations' && <AdminIntegrationsTab />}

        {/* Section 11: Profile */}
        {activeSection === 'profile' && <AdminProfileTab />}
      </main>

      {/* Global Modals for P2P Ad and Transaction Inspection */}
      <P2PAdDetailModal
        order={selectedAd}
        onClose={() => setSelectedAd(null)}
        onUpdateStatus={handleUpdateAdStatus}
        onDeleteOrder={handleDeleteAd}
      />

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};

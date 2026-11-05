import React, { useState, useEffect } from 'react';
import {
  X,
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
  ExternalLink,
  FileText,
  Users2,
  Edit2,
  Trash2,
  Plus,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  activeSection?: string;
  adminName?: string;
  adminEmail?: string;
  adminAvatar?: string;
  onViewLiveSite?: () => void;
}

export const ADMIN_MENU_ITEMS = [
  { id: 'dashboard', label: '1. Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
  { id: 'users', label: '2. Users', shortLabel: 'Users', icon: Users, badge: 'Manage' },
  { id: 'earnings', label: '3. Earnings/Revenue', shortLabel: 'Earnings', icon: DollarSign, badge: 'USD' },
  { id: 'p2pads', label: '4. P2P Ads', shortLabel: 'P2P Ads', icon: Megaphone, badge: 'Escrow' },
  { id: 'transactions', label: '5. Transactions', shortLabel: 'Transactions', icon: Receipt, badge: 'Chains' },
  { id: 'cms', label: '6. CMS (Content)', shortLabel: 'CMS', icon: FileText, badge: 'Live' },
  { id: 'staff', label: '7. Staff & Team', shortLabel: 'Staff', icon: Users2, badge: 'Roles' },
  { id: 'settings', label: '8. Settings', shortLabel: 'Settings', icon: Settings, badge: 'Site' },
  { id: 'integrations', label: '9. Integrations', shortLabel: 'Integrations', icon: Plug, badge: 'API' },
  { id: 'profile', label: '10. Profile', shortLabel: 'Profile', icon: User, badge: '2FA' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  open,
  onClose,
  onNavigate,
  onLogout,
  activeSection = 'dashboard',
  adminName = 'Chief Administrator',
  adminEmail = 'dcoiner.com@gmail.com',
  adminAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  onViewLiveSite,
}) => {
  const [adminProfile, setAdminProfile] = useState(() => StorageService.getAdminProfileSettings());
  const [showImageManager, setShowImageManager] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [managerNotice, setManagerNotice] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const current = StorageService.getAdminProfileSettings();
      setAdminProfile(current);
      setImageUrlInput(current.avatarUrl || '');
    }
  }, [open]);

  if (!open) return null;

  const currentAvatar = adminProfile.avatarUrl || adminAvatar;
  const presets = StorageService.getAdminAvatarPresets();

  const handleSaveImage = (url: string) => {
    const trimmed = url.trim();
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

  const handleDeleteImage = () => {
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

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Sidebar Drawer */}
      <div className="w-72 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-2 shadow-2xl z-20">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-wide flex items-center gap-1.5">
                Dcoine Admin
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Root
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Master Control Console</div>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close sidebar"
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <svg
              viewBox="-0.5 -0.5 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4.5 h-4.5 text-slate-400 hover:text-amber-400 transition"
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

        {/* Live Site Quick Exit link */}
        {onViewLiveSite && (
          <button
            onClick={() => {
              onClose();
              onViewLiveSite();
            }}
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-amber-400 bg-slate-900/60 hover:bg-slate-900 rounded-lg border border-slate-800/80 transition"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              View Frontend User App
            </span>
            <span className="text-[10px] text-slate-500">Live</span>
          </button>
        )}

        {/* Navigation Items (1 - 8) */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-2 pr-1 custom-scrollbar">
          {ADMIN_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
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
                    isActive
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer with Admin Info & 9. LOG OUT (ONLY ICON) */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
          {/* Main User Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0 pr-2">
              <div className="relative shrink-0">
                <img
                  src={currentAvatar}
                  alt={adminProfile.name || adminName}
                  onClick={() => setShowImageManager((prev) => !prev)}
                  className="w-9 h-9 rounded-full object-cover border border-amber-500/40 group-hover:border-amber-400 transition cursor-pointer hover:scale-105"
                  title="Click to Add, Edit, or Delete Admin Image"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageManager((prev) => !prev);
                  }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-md transition"
                  title="Image Controls (Add, Edit, Delete)"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
              </div>

              <div
                onClick={() => {
                  onNavigate('profile');
                  onClose();
                }}
                className="min-w-0 flex-1"
                title="Go to Admin Profile"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate transition">
                  {adminProfile.name || adminName}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{adminProfile.email || adminEmail}</div>
              </div>
            </div>

            {/* ITEM 9: LOG OUT (FOR LOG OUT USE ONLY ICON) */}
            <button
              onClick={onLogout}
              title="Log Out"
              aria-label="Log out"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition flex-shrink-0 shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add / Edit / Delete Action Buttons Row */}
          <div className="flex items-center gap-1.5 pt-1 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setShowImageManager(true);
                setImageUrlInput('');
              }}
              className="flex-1 py-1 px-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              title="Add a new image"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImageManager(true);
                setImageUrlInput(adminProfile.avatarUrl || '');
              }}
              className="flex-1 py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              title="Edit image URL"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            {adminProfile.avatarUrl && (
              <button
                type="button"
                onClick={handleDeleteImage}
                className="py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                title="Delete admin photo"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Expandable Image Manager Popover */}
          {showImageManager && (
            <div className="mt-1 p-3 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Image Manager</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImageManager(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {managerNotice && (
                <div className="text-[11px] p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
                  {managerNotice}
                </div>
              )}

              {/* Add / Edit Input Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300 block">
                  {adminProfile.avatarUrl ? 'Edit / Enter Custom Image URL:' : 'Add New Image URL:'}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="https://... or any image link"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveImage(imageUrlInput)}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] transition flex items-center gap-1 shrink-0"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Avatars to Apply */}
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Quick Presets:</span>
                  {adminProfile.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="text-rose-400 hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Delete Photo
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {presets.slice(0, 4).map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt={`preset-${idx}`}
                      onClick={() => handleSaveImage(preset)}
                      className={`w-full aspect-square rounded-lg object-cover cursor-pointer border transition hover:scale-105 ${
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
      </div>

      {/* Backdrop */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    </div>
  );
};
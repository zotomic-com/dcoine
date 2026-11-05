import React from 'react';
import { X, LayoutDashboard, Users, DollarSign, Megaphone, Receipt, Settings, Plug, User, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose, onNavigate, onLogout }) => {
  if (!open) return null;
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'earnings', label: 'Earnings/Revenue', icon: DollarSign },
    { id: 'p2pads', label: 'P2P Ads', icon: Megaphone },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-white">Admin Panel</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => onNavigate(it.id)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm">
              <Icon className="w-4 h-4" />
              {it.label}
            </button>
          );
        })}
        <button onClick={onLogout} className="mt-auto flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      <div className="flex-1 bg-black/60" onClick={onClose} />
    </div>
  );
};
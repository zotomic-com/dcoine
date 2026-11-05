import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Sparkles,
  ShieldAlert,
  Pickaxe,
  Repeat2,
  AlertTriangle,
  Send,
  Plus,
  Clock,
  ArrowRight,
  Filter,
  Eye,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Layers,
  UserCheck,
} from 'lucide-react';
import { AppNotification, UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isAdmin: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  user,
  isAdmin,
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    StorageService.getNotifications()
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'user' | 'admin'>('all');
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  // Broadcast form state (for Admin)
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newRole, setNewRole] = useState<'all' | 'user' | 'admin'>('all');
  const [newType, setNewType] = useState<AppNotification['type']>('info');
  const [newLinkTab, setNewLinkTab] = useState('');

  // Sync notifications across tabs in real-time
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('dcoine_notifications_bus');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'NOTIFICATIONS_UPDATED') {
            setNotifications(payload || StorageService.getNotifications());
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes('notifications_list')) {
        setNotifications(StorageService.getNotifications());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!isOpen) return null;

  // Filter notifications visible to current viewer
  const visibleNotifications = notifications.filter((n) => {
    // If not admin, hide admin-only notifications
    if (!isAdmin && n.recipientRole === 'admin') return false;

    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'admin') return n.recipientRole === 'admin';
    if (activeFilter === 'user') return n.recipientRole === 'user' || n.recipientRole === 'all';
    return true;
  });

  const unreadCount = notifications.filter(
    (n) => !n.isRead && (isAdmin || n.recipientRole !== 'admin')
  ).length;

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification({ ...selectedNotification, isRead: true });
    }
  };

  const handleToggleReadStatus = (id: string) => {
    const updated = notifications.map((n) => {
      if (n.id === id) {
        return { ...n, isRead: !n.isRead };
      }
      return n;
    });
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification({ ...selectedNotification, isRead: !selectedNotification.isRead });
    }
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    if (selectedNotification) {
      setSelectedNotification({ ...selectedNotification, isRead: true });
    }
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(null);
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
    StorageService.saveNotifications([]);
    setSelectedNotification(null);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    StorageService.addNotification({
      recipientRole: newRole,
      title: newTitle.trim(),
      message: newMessage.trim(),
      type: newType,
      linkTab: newLinkTab.trim() || undefined,
      isRead: false,
    });

    setNotifications(StorageService.getNotifications());
    setNewTitle('');
    setNewMessage('');
    setShowBroadcastForm(false);
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'mining':
        return <Pickaxe className="w-4 h-4 text-amber-400" />;
      case 'trade':
        return <Repeat2 className="w-4 h-4 text-emerald-400" />;
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success':
        return <Check className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getNotificationBadge = (type: AppNotification['type']) => {
    switch (type) {
      case 'mining':
        return { label: 'Cloud Mining', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'trade':
        return { label: 'P2P Escrow', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'alert':
        return { label: 'Security Alert', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      case 'warning':
        return { label: 'System Notice', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' };
      case 'success':
        return { label: 'Achievement', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' };
      default:
        return { label: 'General Info', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
    }
  };

  const getTabInfo = (notif: AppNotification) => {
    const tab = notif.linkTab || (
      notif.type === 'mining' ? 'mining' :
      notif.type === 'trade' ? 'p2p' :
      notif.type === 'alert' && isAdmin ? 'admin' :
      'dashboard'
    );
    const labels: Record<string, string> = {
      dashboard: 'Main Dashboard',
      mining: 'Cloud Mining View',
      wallet: 'Wallets & Assets',
      p2p: 'P2P Escrow Market',
      swap: 'DEX Swap',
      news: 'Crypto News',
      explorer: 'Web3 Explorer',
      admin: 'Admin Console',
    };
    return {
      tab,
      label: labels[tab] || 'Ecosystem',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            {selectedNotification ? (
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition cursor-pointer"
                title="Back to all notifications"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{selectedNotification ? 'Notification Details' : 'Notifications & Alerts'}</span>
                {!selectedNotification && unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {selectedNotification
                  ? 'Complete notification message body, status and actions'
                  : 'Platform updates, cloud mining notices & escrow security'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && !selectedNotification && (
              <button
                type="button"
                onClick={() => setShowBroadcastForm(!showBroadcastForm)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Broadcast</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW FULL DETAILS SCREEN (Dedicated view when user clicks View Full Details) */}
        {/* ========================================================================= */}
        {selectedNotification ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Category, Date & Status Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                      getNotificationBadge(selectedNotification.type).color
                    }`}
                  >
                    {getNotificationBadge(selectedNotification.type).label}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>
                      {new Date(selectedNotification.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(selectedNotification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  selectedNotification.isRead
                    ? 'bg-slate-800/60 text-slate-400 border-slate-700'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {selectedNotification.isRead ? '● Read' : '● Unread'}
              </span>
            </div>

            {/* Notification Title */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {selectedNotification.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                <span className="uppercase text-slate-500">Target Role:</span>
                <span className="text-amber-400 font-semibold">{selectedNotification.recipientRole}</span>
              </div>
            </div>

            {/* Full Message Body */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" /> Message Details
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                {selectedNotification.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Primary Direct Navigation Action Button */}
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    const { tab } = getTabInfo(selectedNotification);
                    onNavigateTab(tab);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open {getTabInfo(selectedNotification).label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Utility actions: Toggle Read/Unread, Delete, Back */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleToggleReadStatus(selectedNotification.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedNotification.isRead ? 'Mark as Unread' : 'Mark as Read'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(selectedNotification.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Admin Broadcast Form Drawer */}
            {showBroadcastForm && isAdmin && (
              <form
                onSubmit={handleSendBroadcast}
                className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Broadcast Alert to Users
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBroadcastForm(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Target Audience</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                    >
                      <option value="all">All Users &amp; Admins</option>
                      <option value="user">Standard Users Only</option>
                      <option value="admin">Administrators Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Alert Category</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                    >
                      <option value="info">Information (Blue)</option>
                      <option value="success">Success / Reward (Green)</option>
                      <option value="warning">Warning (Yellow)</option>
                      <option value="alert">Security Alert (Red)</option>
                      <option value="mining">Mining Update (Amber)</option>
                      <option value="trade">P2P Trade (Emerald)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Notification Title (e.g. 50% Staking Bonus)"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Notification detailed message body..."
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Send Notification
                  </button>
                </div>
              </form>
            )}

            {/* Filter Toolbar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                {(['all', 'unread', 'user', ...(isAdmin ? ['admin'] : [])] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter as any)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition cursor-pointer text-[11px] ${
                      activeFilter === filter
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    title="Clear all notifications"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {visibleNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs">No notifications to display.</p>
                </div>
              ) : (
                visibleNotifications.map((n) => {
                  const badge = getNotificationBadge(n.type);
                  const tabInfo = getTabInfo(n);
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        handleMarkAsRead(n.id);
                        setSelectedNotification(n);
                      }}
                      className={`p-3.5 rounded-2xl border transition relative flex items-start gap-3 cursor-pointer group ${
                        n.isRead
                          ? 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700 opacity-85'
                          : 'bg-slate-950 border-amber-500/30 shadow-md hover:border-amber-500/50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {getNotificationIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                            )}
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">
                              {n.title}
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span className="text-slate-500 uppercase font-mono">
                              {n.recipientRole}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Prominent "View Full Details" Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(n.id);
                                setSelectedNotification(n);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-[10px] font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View full details</span>
                            </button>

                            {/* Direct Action Link if navigation available */}
                            {onNavigateTab && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(n.id);
                                  onNavigateTab(tabInfo.tab);
                                  onClose();
                                }}
                                className="text-slate-400 hover:text-amber-400 flex items-center gap-0.5 font-semibold cursor-pointer text-[10px] transition"
                                title={`Navigate to ${tabInfo.label}`}
                              >
                                <span>Open</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(n.id);
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1 shrink-0 transition cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

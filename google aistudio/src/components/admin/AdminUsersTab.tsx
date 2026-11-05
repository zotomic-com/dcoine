import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Lock,
  DollarSign,
  X,
  Pickaxe,
  User,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminUsersTabProps {
  users: UserProfile[];
  initialFilter?: string;
  onAddUser: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  initialFilter = 'all',
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [filterTab, setFilterTab] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as 'user' | 'admin' | 'merchant',
    country: 'United States',
    walletBalance: 1000,
    kycStatus: 'verified' as 'verified' | 'pending' | 'unverified',
    status: 'active' as 'active' | 'suspended',
  });

  // Calculate user counts
  const oneDayMs = 24 * 3600 * 1000;
  const newSignupsCount = users.filter((u) => Date.now() - u.createdAt < oneDayMs).length;
  const loggedInCount = users.filter((u) => u.isLoggedIn).length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const verifiedCount = users.filter((u) => u.kycStatus === 'verified').length;

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Tab filter
    if (filterTab === 'new' && Date.now() - user.createdAt >= oneDayMs) return false;
    if (filterTab === 'loggedin' && !user.isLoggedIn) return false;
    if (filterTab === 'active' && user.status !== 'active') return false;
    if (filterTab === 'suspended' && user.status !== 'suspended') return false;
    if (filterTab === 'verified' && user.kycStatus !== 'verified') return false;

    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;

    // KYC filter
    if (kycFilter !== 'all' && user.kycStatus !== kycFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.username.toLowerCase().includes(q);
      const matchEmail = user.email.toLowerCase().includes(q);
      const matchPhone = (user.phone || '').toLowerCase().includes(q);
      const matchRef = (user.referralCode || '').toLowerCase().includes(q);
      const matchCountry = (user.country || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchRef && !matchCountry) {
        return false;
      }
    }

    return true;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.username.trim() || !newUserForm.email.trim()) return;

    const user: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: newUserForm.username.trim(),
      email: newUserForm.email.trim().toLowerCase(),
      phone: newUserForm.phone.trim() || '+1 (555) 0192',
      password: newUserForm.password || 'Dcoine2026!',
      referralCode: `DCOIN-${newUserForm.username.substring(0, 4).toUpperCase()}`,
      role: newUserForm.role,
      country: newUserForm.country,
      walletBalance: Number(newUserForm.walletBalance) || 0,
      lockedMinedBalance: 0,
      kycStatus: newUserForm.kycStatus,
      status: newUserForm.status,
      isMerchant: newUserForm.role === 'merchant',
      merchantSecurityPledge: newUserForm.role === 'merchant' ? 1000 : 0,
      twoFactorEnabled: false,
      avatarUrl: newUserForm.role === 'admin' ? `https://images.unsplash.com/photo-${1500000000000 + (users.length % 5) * 10000}?auto=format&fit=crop&w=200&q=80` : '',
      createdAt: Date.now(),
      isLoggedIn: false,
      lastLogin: Date.now(),
      preferredCurrency: 'USD',
    };

    onAddUser(user);
    setIsAddModalOpen(false);
    setNewUserForm({
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'user',
      country: 'United States',
      walletBalance: 1000,
      kycStatus: 'verified',
      status: 'active',
    });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            2. User Management Console
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full user accounts oversight: add new users, edit permissions, manage KYC and account status
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/25"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* User Counts Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        <button
          onClick={() => setFilterTab('all')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'all'
              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Total Users</div>
          <div className="text-xl font-mono font-bold text-white mt-0.5">{users.length}</div>
        </button>

        <button
          onClick={() => setFilterTab('new')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'new'
              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">New (24h)</div>
          <div className="text-xl font-mono font-bold text-blue-400 mt-0.5">{newSignupsCount}</div>
        </button>

        <button
          onClick={() => setFilterTab('loggedin')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'loggedin'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Logged In</div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{loggedInCount}</div>
        </button>

        <button
          onClick={() => setFilterTab('active')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'active'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Active</div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{activeCount}</div>
        </button>

        <button
          onClick={() => setFilterTab('verified')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'verified'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">KYC Verified</div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{verifiedCount}</div>
        </button>

        <button
          onClick={() => setFilterTab('suspended')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'suspended'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Suspended</div>
          <div className="text-xl font-mono font-bold text-rose-400 mt-0.5">{suspendedCount}</div>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, referral code, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="merchant">Merchant</option>
            <option value="admin">Admin</option>
          </select>

          {/* KYC Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All KYC</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">User Profile</th>
                <th className="py-3 px-4">Role & KYC</th>
                <th className="py-3 px-4">Contact Info (Mail / Phone)</th>
                <th className="py-3 px-4">Balances (Wallet / Mined)</th>
                <th className="py-3 px-4">Status & Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isNew = Date.now() - user.createdAt < oneDayMs;
                  const isRootAdmin = user.role === 'admin';

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition">
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.role === 'admin' && user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-8 h-8 rounded-full object-cover border border-amber-500/50 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {user.username}
                              {isNew && (
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-rose-400" />
                              <span>{user.country || 'Global'}</span>
                              <span className="text-slate-600">•</span>
                              <span className="font-mono text-[10px]">{user.referralCode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & KYC */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${
                              user.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : user.role === 'merchant'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`text-[10px] font-semibold flex items-center gap-1 ${
                              user.kycStatus === 'verified'
                                ? 'text-emerald-400'
                                : user.kycStatus === 'pending'
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            KYC {user.kycStatus}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-mono text-[11px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone || '+1 (555) 0192'}</span>
                        </div>
                      </td>

                      {/* Balances */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-emerald-400 text-xs">
                          ${(user.walletBalance || 0).toLocaleString()} USD
                        </div>
                        <div className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1 mt-0.5">
                          <Pickaxe className="w-3 h-3" />
                          <span>{(user.lockedMinedBalance || 0).toFixed(2)} DCN</span>
                        </div>
                      </td>

                      {/* Status & Login */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${
                              user.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : 'bg-rose-500/10 text-rose-300'
                            }`}
                          >
                            {user.status || 'active'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {user.isLoggedIn ? (
                              <span className="text-emerald-400 font-medium">● Online Now</span>
                            ) : (
                              <span>Offline</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User Button */}
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Toggle Status */}
                          {!isRootAdmin && (
                            <button
                              onClick={() => {
                                const newStatus = user.status === 'active' ? 'suspended' : 'active';
                                onUpdateUser({ ...user, status: newStatus });
                              }}
                              className={`p-1.5 rounded-lg transition ${
                                user.status === 'active'
                                  ? 'text-rose-400 hover:bg-rose-500/10'
                                  : 'text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                            >
                              {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Delete User */}
                          {!isRootAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete user "${user.username}"?`)) {
                                  onDeleteUser(user.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW USER */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" /> Add New Platform User
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Username / Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satoshi Nakamoto"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 0192"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Account Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="merchant">Merchant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">KYC Verification</label>
                  <select
                    value={newUserForm.kycStatus}
                    onChange={(e) => setNewUserForm({ ...newUserForm, kycStatus: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Initial Balance ($)</label>
                  <input
                    type="number"
                    value={newUserForm.walletBalance}
                    onChange={(e) => setNewUserForm({ ...newUserForm, walletBalance: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/25"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER DETAILS */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" /> Edit User: {editingUser.username}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Username</label>
                <input
                  type="text"
                  required
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="merchant">Merchant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Account Status</label>
                  <select
                    value={editingUser.status || 'active'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">KYC Status</label>
                  <select
                    value={editingUser.kycStatus}
                    onChange={(e) => setEditingUser({ ...editingUser, kycStatus: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Wallet Balance (USD)</label>
                  <input
                    type="number"
                    value={editingUser.walletBalance || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, walletBalance: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Mined DC Locked Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingUser.lockedMinedBalance || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, lockedMinedBalance: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-500/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

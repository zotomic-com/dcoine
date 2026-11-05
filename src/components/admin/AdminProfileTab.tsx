import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Lock,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Copy,
  Check,
  QrCode,
  Save,
  Laptop,
  Smartphone,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  RotateCcw,
  X,
} from 'lucide-react';
import { AdminProfileSettings } from '../../types';
import { StorageService } from '../../services/storage';

export const AdminProfileTab: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfileSettings>(() =>
    StorageService.getAdminProfileSettings()
  );

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [avatarPresets, setAvatarPresets] = useState<string[]>(() =>
    StorageService.getAdminAvatarPresets()
  );
  const [newPresetUrl, setNewPresetUrl] = useState('');
  const [showAddPresetInput, setShowAddPresetInput] = useState(false);
  const [editingPresetIndex, setEditingPresetIndex] = useState<number | null>(null);
  const [editingPresetUrl, setEditingPresetUrl] = useState('');
  const [imageNotice, setImageNotice] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setImageNotice(msg);
    setTimeout(() => setImageNotice(null), 3000);
  };

  const handleAddPreset = () => {
    const trimmed = newPresetUrl.trim();
    if (!trimmed) {
      showFeedback('Please enter a valid image URL to add.');
      return;
    }
    const updated = [...avatarPresets, trimmed];
    setAvatarPresets(updated);
    StorageService.saveAdminAvatarPresets(updated);
    // Also set as active avatar
    setProfile((prev) => ({ ...prev, avatarUrl: trimmed }));
    setNewPresetUrl('');
    setShowAddPresetInput(false);
    showFeedback('✓ New avatar image added and selected!');
  };

  const handleStartEditPreset = (index: number) => {
    setEditingPresetIndex(index);
    setEditingPresetUrl(avatarPresets[index]);
  };

  const handleSaveEditPreset = () => {
    if (editingPresetIndex === null) return;
    const trimmed = editingPresetUrl.trim();
    if (!trimmed) {
      showFeedback('Image URL cannot be empty.');
      return;
    }
    const oldUrl = avatarPresets[editingPresetIndex];
    const updated = [...avatarPresets];
    updated[editingPresetIndex] = trimmed;
    setAvatarPresets(updated);
    StorageService.saveAdminAvatarPresets(updated);

    // If current profile was using the edited URL, update profile as well
    if (profile.avatarUrl === oldUrl) {
      setProfile((prev) => ({ ...prev, avatarUrl: trimmed }));
    }

    setEditingPresetIndex(null);
    setEditingPresetUrl('');
    showFeedback('✓ Avatar image URL updated successfully!');
  };

  const handleDeletePreset = (index: number) => {
    const targetUrl = avatarPresets[index];
    const updated = avatarPresets.filter((_, i) => i !== index);
    setAvatarPresets(updated);
    StorageService.saveAdminAvatarPresets(updated);

    // If current profile was using this deleted preset, fall back or clear
    if (profile.avatarUrl === targetUrl) {
      setProfile((prev) => ({
        ...prev,
        avatarUrl: updated.length > 0 ? updated[0] : '',
      }));
    }

    if (editingPresetIndex === index) {
      setEditingPresetIndex(null);
    }
    showFeedback('✓ Avatar preset image deleted from gallery.');
  };

  const handleResetPresets = () => {
    const defaults = StorageService.DEFAULT_ADMIN_AVATAR_PRESETS;
    setAvatarPresets(defaults);
    StorageService.saveAdminAvatarPresets(defaults);
    showFeedback('✓ Avatar presets reset to platform defaults.');
  };

  const handleDeleteCurrentAvatar = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: '' }));
    showFeedback('✓ Active admin profile photo removed.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveAdminProfileSettings(profile);

    // Also sync with active user session if current active user is admin
    const currentUser = StorageService.getUser();
    if (currentUser && currentUser.role === 'admin') {
      currentUser.username = profile.name;
      currentUser.email = profile.email;
      currentUser.phone = profile.phone;
      currentUser.avatarUrl = profile.avatarUrl;
      currentUser.twoFactorEnabled = profile.twoFactorEnabled;
      StorageService.saveUser(currentUser);
      StorageService.updateUser(currentUser);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New passwords do not match. Please verify.');
      return;
    }

    setPasswordMessage('✓ Password updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordMessage(null), 3000);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(profile.twoFactorSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            8. Administrator Profile & Frontend Identity Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your admin credentials, personal identity, image assets, two-factor authentication, and security audit log
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/25"
        >
          {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Profile Saved!' : 'Save Admin Profile'}</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Admin profile frontend settings updated and synchronized across all admin sessions.</span>
        </div>
      )}

      {imageNotice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-300 flex items-center justify-between gap-2">
          <span>{imageNotice}</span>
          <button onClick={() => setImageNotice(null)} className="text-amber-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Card & Avatar */}
      <form onSubmit={handleSaveProfile} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-5 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl bg-slate-950"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center text-amber-400 shadow-xl">
                  <Shield className="w-8 h-8 opacity-70" />
                  <span className="text-[9px] font-bold text-slate-400 mt-1">No Image</span>
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 p-1 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-400">
                <Shield className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {profile.roleTitle}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{profile.email}</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Root Access & Privileges Active
              </div>
            </div>
          </div>

          {/* Active Photo Controls: Delete Photo / Clear */}
          <div className="flex items-center gap-2">
            {profile.avatarUrl ? (
              <button
                type="button"
                onClick={handleDeleteCurrentAvatar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                title="Remove current admin avatar image"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddPresetInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Profile Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Avatar Preset & Image Management: Add, Edit, Delete */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Admin Avatar Presets & Gallery ({avatarPresets.length} images)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any image to select it as your admin avatar. Use the edit and delete buttons to manage the images gallery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddPresetInput(!showAddPresetInput)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Image</span>
              </button>
              <button
                type="button"
                onClick={handleResetPresets}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs transition"
                title="Reset presets to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add Image Input Bar */}
          {showAddPresetInput && (
            <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-200">Add New Image to Presets Gallery:</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or any image URL"
                  value={newPresetUrl}
                  onChange={(e) => setNewPresetUrl(e.target.value)}
                  className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddPreset}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPresetInput(false);
                    setNewPresetUrl('');
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                >
                  Cancel
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="text-slate-500 font-medium">Quick sample suggestions:</span>
                <button
                  type="button"
                  onClick={() => setNewPresetUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80')}
                  className="text-amber-400 hover:underline"
                >
                  Tech Lead
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setNewPresetUrl('https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80')}
                  className="text-amber-400 hover:underline"
                >
                  Security Officer
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setNewPresetUrl('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80')}
                  className="text-amber-400 hover:underline"
                >
                  Operations Exec
                </button>
              </div>
            </div>
          )}

          {/* Edit Single Preset Modal / Row */}
          {editingPresetIndex !== null && (
            <div className="p-3 bg-slate-900 border border-blue-500/40 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editing Preset Image #{editingPresetIndex + 1}:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingPresetUrl}
                  onChange={(e) => setEditingPresetUrl(e.target.value)}
                  className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={handleSaveEditPreset}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg text-xs transition flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPresetIndex(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Preset Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {avatarPresets.map((preset, idx) => {
              const isSelected = profile.avatarUrl === preset;
              return (
                <div
                  key={idx}
                  className={`group relative rounded-xl border p-1.5 bg-slate-900/90 transition-all ${
                    isSelected
                      ? 'border-amber-400 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => setProfile({ ...profile, avatarUrl: preset })}
                    className="cursor-pointer relative overflow-hidden rounded-lg aspect-square bg-slate-950"
                  >
                    <img
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    {isSelected && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase shadow">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Actions for this preset: Edit, Delete */}
                  <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleStartEditPreset(idx)}
                      className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition text-[11px]"
                      title="Edit Image URL"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-[11px]"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Custom Image URL Input */}
          <div className="pt-2 border-t border-slate-800/60">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Direct Admin Image URL (Edit or custom input):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Or paste any custom image URL directly..."
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentAvatar}
                  className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs transition"
                  title="Clear image URL"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Identity Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="text-slate-400 font-medium">Display Name / Title</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Admin Username</label>
            <input
              type="text"
              required
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Administrator Email Address</label>
            <input
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Admin Emergency Phone Number</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Country / Jurisdiction</label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Authority Role Title</label>
            <input
              type="text"
              value={profile.roleTitle}
              onChange={(e) => setProfile({ ...profile, roleTitle: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition"
          >
            Update Identity Fields
          </button>
        </div>
      </form>

      {/* Two-Factor Authentication (2FA) */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Key className="w-4 h-4 text-emerald-400" />
          Two-Factor Authentication (TOTP 2FA)
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Google Authenticator / Authy Protection</span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                  profile.twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {profile.twoFactorEnabled ? 'Active & Enforced' : 'Disabled'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 max-w-md">
              Requires a 6-digit one-time code generated from your authenticator app for admin sign-ins and sensitive changes.
            </div>
          </div>

          <button
            onClick={() => {
              const updated = { ...profile, twoFactorEnabled: !profile.twoFactorEnabled };
              setProfile(updated);
              StorageService.saveAdminProfileSettings(updated);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              profile.twoFactorEnabled
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {profile.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
          </button>
        </div>

        {profile.twoFactorEnabled && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center gap-6">
            <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center flex-shrink-0">
              <QrCode className="w-20 h-20 text-slate-900" />
            </div>

            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <span className="text-xs font-semibold text-slate-300">Manual Setup Secret Key:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-amber-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  {profile.twoFactorSecret}
                </span>
                <button
                  type="button"
                  onClick={copySecret}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy Secret"
                >
                  {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Scan this simulated QR code or paste the 16-character secret key into Google Authenticator.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Password Management */}
      <form onSubmit={handleUpdatePassword} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Lock className="w-4 h-4 text-amber-400" />
          Change Admin Master Password
        </h3>

        {passwordMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold ${
              passwordMessage.startsWith('✓')
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {passwordMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Current Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">New Password (8+ characters)</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPassword ? 'Hide Passwords' : 'Show Passwords'}
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
          >
            Update Master Password
          </button>
        </div>
      </form>

      {/* Security Sessions Audit Log */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Shield className="w-4 h-4 text-purple-400" />
          Active Login Sessions & Security Audit Log
        </h3>

        <div className="space-y-2.5 text-xs">
          {/* Current Session */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  Current Session (Chrome on macOS)
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  IP: 127.0.0.1 • San Francisco, USA • Active Now
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              THIS DEVICE
            </span>
          </div>

          {/* Past Session */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-white">
                  Mobile Session (Safari on iPhone 16)
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  IP: 84.115.22.10 • Berlin, Germany • 2 days ago
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Signed Out
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

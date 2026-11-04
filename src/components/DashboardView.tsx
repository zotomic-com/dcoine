import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  User,
  ShieldCheck,
  ShieldAlert,
  Lock,
  QrCode,
  Check,
  Copy,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Pickaxe,
  Repeat2,
  WalletCards,
  Sparkles,
  Edit3,
  X,
  FileCheck,
  Globe,
  Coins,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { MiningSession, TokenItem, TransactionRecord, UserProfile, UserWallet } from '../types';
import { StorageService } from '../services/storage';
import { shortenAddress, verifyTwoFactorCode } from '../utils/crypto';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  user: UserProfile;
  tokens: TokenItem[];
  wallets: UserWallet[];
  activeWallet: UserWallet;
  miningSession: MiningSession;
  onUpdateUser: (user: UserProfile) => void;
  onNavigateTab: (tab: any) => void;
  onLogout?: () => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY' },
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'AED', name: 'Emirati Dirham', symbol: 'د.إ' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  tokens,
  wallets,
  activeWallet,
  miningSession,
  onUpdateUser,
  onNavigateTab,
  onLogout,
}) => {
  // Chart timeframe state
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');
  // Profile edit modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editEmail, setEditEmail] = useState(user.email);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'password'>('profile');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Country and Currency state
  const [selectedCountry, setSelectedCountry] = useState(user.country || 'United States');
  const [selectedCurrency, setSelectedCurrency] = useState(user.preferredCurrency || 'USD');
  const [preferencesSaved, setPreferencesSaved] = useState<string | null>(null);

  // 2FA Google Authenticator setup modal
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpInputCode, setTotpInputCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpCopied, setTotpCopied] = useState(false);

  // Calculate total fiat balance
  const totalBalanceUsd = tokens.reduce((sum, token) => sum + token.balance * token.priceUsd, 0);
  const dcoinToken = tokens.find((t) => t.id === 'dcoin') || tokens[0];

  const transactions = StorageService.getTransactions().slice(0, 5);

  // Chart data simulation points based on timeframe
  const chartPointsMap: Record<'1D' | '1W' | '1M' | '1Y', number[]> = {
    '1D': [42, 45, 44, 49, 52, 50, 55, 58, 62, 60, 65],
    '1W': [35, 38, 42, 40, 48, 52, 50, 58, 62, 65],
    '1M': [20, 24, 28, 32, 38, 45, 50, 58, 62, 68, 74],
    '1Y': [8, 12, 18, 22, 30, 42, 54, 60, 68, 76, 85],
  };

  const currentChartPoints = chartPointsMap[timeframe];
  const maxPoint = Math.max(...currentChartPoints);
  const minPoint = Math.min(...currentChartPoints);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      username: editUsername.trim() || user.username,
      email: editEmail.trim() || user.email,
      country: selectedCountry,
      preferredCurrency: selectedCurrency,
    };
    onUpdateUser(updated);
    StorageService.saveUser(updated);
    setShowEditProfileModal(false);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Not set', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 66, text: 'Moderate', color: 'bg-amber-500' };
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (!currentPassword.trim()) {
      setPasswordChangeError('Please enter your current account password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError('New password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New password and confirmation do not match.');
      return;
    }

    setPasswordChangeSuccess('Your password has been changed securely!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    confetti({ particleCount: 40, spread: 60 });
    setTimeout(() => setPasswordChangeSuccess(null), 4000);
  };

  const handleUpdatePreferences = (country: string, currency: string) => {
    setSelectedCountry(country);
    setSelectedCurrency(currency);
    const updated: UserProfile = {
      ...user,
      country,
      preferredCurrency: currency,
    };
    onUpdateUser(updated);
    StorageService.saveUser(updated);
    setPreferencesSaved('Country & Currency preferences saved!');
    setTimeout(() => setPreferencesSaved(null), 2500);
  };

  const handleVerify2FACode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTwoFactorCode(totpInputCode, user.twoFactorSecret)) {
      setTotpError('Invalid 6-digit code. Please enter 6 numeric digits (e.g. 123456).');
      return;
    }

    const updated: UserProfile = {
      ...user,
      twoFactorEnabled: !user.twoFactorEnabled,
    };

    onUpdateUser(updated);
    StorageService.saveUser(updated);
    setShow2FAModal(false);
    setTotpInputCode('');
    setTotpError('');

    confetti({
      particleCount: 50,
      spread: 60,
    });
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-4">
      {/* Portfolio Card with Live Balance & 24h Yield */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/60" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white">{user.username}</h1>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Verified Tier-2
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">UID: {user.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setProfileModalTab('password');
                setShowEditProfileModal(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-xs text-amber-300 font-medium transition cursor-pointer"
              title="Change Account Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Password</span>
            </button>
            <button
              onClick={() => {
                setProfileModalTab('profile');
                setShowEditProfileModal(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Edit Profile</span>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/40 text-xs text-rose-400 font-medium transition cursor-pointer"
                title="Log Out of Account"
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Portfolio Balance */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Net Worth</span>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                ${totalBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="inline-flex items-center justify-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap leading-none tracking-normal">
                +14.8% This Month
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono flex-wrap">
              <span>≈ {(totalBalanceUsd / (dcoinToken.priceUsd || 1.48)).toFixed(2)} DCOIN</span>
              <span>•</span>
              <span className="text-amber-400">1 DCOIN = ${dcoinToken.priceUsd.toFixed(2)}</span>
              {dcoinToken.lockedBalance && dcoinToken.lockedBalance > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold inline-flex items-center gap-1" title="Mined DC locked in native platform wallet">
                    <Lock className="w-3 h-3 text-amber-400 inline" />
                    {dcoinToken.lockedBalance.toFixed(2)} Mined Locked
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Mining Quick status pill */}
          <div
            onClick={() => onNavigateTab('mining')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition w-full sm:w-auto"
          >
            <div className={`p-1.5 rounded-xl ${miningSession.isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              <Pickaxe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Cloud Mining</span>
              <span className="text-xs font-bold text-amber-300">
                {miningSession.isActive ? 'Active 24H Session' : 'Start Mining'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
          </div>
        </div>

        {/* Quick Action Dock */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => onNavigateTab('wallet')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition"
          >
            <WalletCards className="w-4 h-4 mb-1 text-amber-400" />
            <span>Wallet</span>
          </button>
          <button
            onClick={() => onNavigateTab('mining')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition"
          >
            <Pickaxe className="w-4 h-4 mb-1 text-yellow-400" />
            <span>Mining</span>
          </button>
          <button
            onClick={() => onNavigateTab('p2p')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition"
          >
            <ArrowUpRight className="w-4 h-4 mb-1 text-emerald-400" />
            <span>P2P Trade</span>
          </button>
          <button
            onClick={() => onNavigateTab('swap')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition"
          >
            <Repeat2 className="w-4 h-4 mb-1 text-blue-400" />
            <span>DEX Swap</span>
          </button>
        </div>
      </div>

      {/* Interactive Price & Portfolio Valuation Graph */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Ecosystem Performance Graph</h2>
            <p className="text-xs text-slate-400">DCOIN valuation & aggregated portfolio index</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
            {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  timeframe === tf ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Sparkline Graph */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          <div className="h-44 w-full relative flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area */}
              <polygon
                points={`0,150 ${currentChartPoints
                  .map((val, idx) => {
                    const x = (idx / (currentChartPoints.length - 1)) * 500;
                    const y = 150 - ((val - minPoint) / (maxPoint - minPoint || 1)) * 120 - 15;
                    return `${x},${y}`;
                  })
                  .join(' ')} 500,150`}
                fill="url(#chartGradient)"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={currentChartPoints
                  .map((val, idx) => {
                    const x = (idx / (currentChartPoints.length - 1)) * 500;
                    const y = 150 - ((val - minPoint) / (maxPoint - minPoint || 1)) * 120 - 15;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>Low: ${(minPoint * 25).toFixed(2)}</span>
            <span className="text-emerald-400 font-semibold">Trend: Bullish (+24.2%)</span>
            <span>High: ${(maxPoint * 25).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Security & 2-Step Verification Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Security & 2-Step Verification</h2>
              <p className="text-xs text-slate-400">Google Authenticator (TOTP) protection</p>
            </div>
          </div>

          <button
            onClick={() => setShow2FAModal(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
              user.twoFactorEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {user.twoFactorEnabled ? '2FA Enabled ✓' : 'Enable 2FA'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">KYC Level:</span>
            <span className="text-emerald-400 font-bold">Level 2 Verified (Passport)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Active Multi-Sig Wallets:</span>
            <span className="text-white font-mono font-bold">{wallets.length} Connected</span>
          </div>
        </div>
      </div>

      {/* Account Security & Password Change Box */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Password & Account Security</h2>
              <p className="text-xs text-slate-400">Change your master login password & safeguard your vault</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
            SSL 256-Bit Encrypted
          </span>
        </div>

        {passwordChangeSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{passwordChangeSuccess}</span>
          </div>
        )}

        {passwordChangeError && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{passwordChangeError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current account password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-slate-300">New Password</label>
                {newPassword && (
                  <span className={`text-[10px] font-bold ${
                    getPasswordStrength(newPassword).text === 'Strong'
                      ? 'text-emerald-400'
                      : getPasswordStrength(newPassword).text === 'Moderate'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {getPasswordStrength(newPassword).text}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {newPassword && (
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                    style={{ width: `${getPasswordStrength(newPassword).score}%` }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Update Account Password</span>
          </button>
        </form>
      </div>

      {/* Regional & Currency Preferences Box */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Country & Base Currency Preference</h2>
              <p className="text-xs text-slate-400">Customize your localization and display currency for all valuations</p>
            </div>
          </div>

          {preferencesSaved && (
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold animate-in fade-in">
              {preferencesSaved}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Country Selector */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Country / Jurisdiction</span>
            </label>
            <p className="text-[10px] text-slate-400">Used for local P2P fiat market matching and regulatory compliance</p>
            <select
              value={selectedCountry}
              onChange={(e) => {
                const newC = e.target.value;
                const match = COUNTRIES.find((c) => c.name === newC);
                const suggestedCurrency = match?.currency || selectedCurrency;
                handleUpdatePreferences(newC, suggestedCurrency);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </select>
          </div>

          {/* Currency Selector */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Base Fiat Currency</span>
            </label>
            <p className="text-[10px] text-slate-400">Determines default pricing display across portfolio and marketplace</p>
            <select
              value={selectedCurrency}
              onChange={(e) => handleUpdatePreferences(selectedCountry, e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} — {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Ledger Transactions</h2>
          <button
            onClick={() => onNavigateTab('wallet')}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            View All
          </button>
        </div>

        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 text-amber-400">
                  {tx.type === 'mine' && <Pickaxe className="w-4 h-4" />}
                  {tx.type === 'swap' && <Repeat2 className="w-4 h-4 text-blue-400" />}
                  {tx.type === 'deposit' && <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                  {tx.type === 'withdraw' && <ArrowUpRight className="w-4 h-4 text-rose-400" />}
                  {tx.type === 'p2p_buy' && <WalletCards className="w-4 h-4 text-purple-400" />}
                  {tx.type === 'referral' && <Sparkles className="w-4 h-4 text-yellow-400" />}
                </div>
                <div>
                  <span className="font-bold text-white capitalize">{tx.type.replace('_', ' ')}</span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    {shortenAddress(tx.hash, 5)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-white">
                  {tx.type === 'withdraw' ? '-' : '+'}
                  {tx.amount} {tx.symbol}
                </span>
                <span className="block text-[10px] text-slate-500">
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {profileModalTab === 'password' ? (
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <h3 className="text-base font-bold text-white">
                  {profileModalTab === 'password' ? 'Change Account Password' : 'Edit Profile & Preferences'}
                </h3>
              </div>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setProfileModalTab('profile')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  profileModalTab === 'profile'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile & Region</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileModalTab('password')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  profileModalTab === 'password'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            </div>

            {/* TAB 1: Profile & Localization (Country & Currency) */}
            {profileModalTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Country Selector in Modal */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Country / Jurisdiction</span>
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      const newC = e.target.value;
                      setSelectedCountry(newC);
                      const match = COUNTRIES.find((c) => c.name === newC);
                      if (match) setSelectedCurrency(match.currency);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency Selector in Modal */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Base Display Currency</span>
                  </label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} — {curr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition mt-2"
                >
                  Save Profile & Preferences
                </button>
              </form>
            )}

            {/* TAB 2: Change Password Box in Modal */}
            {profileModalTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-3.5 pt-1">
                {passwordChangeSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{passwordChangeSuccess}</span>
                  </div>
                )}

                {passwordChangeError && (
                  <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{passwordChangeError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-semibold text-slate-300">New Password</label>
                    {newPassword && (
                      <span className={`text-[10px] font-bold ${
                        getPasswordStrength(newPassword).text === 'Strong'
                          ? 'text-emerald-400'
                          : getPasswordStrength(newPassword).text === 'Moderate'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {getPasswordStrength(newPassword).text}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                        style={{ width: `${getPasswordStrength(newPassword).score}%` }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 mt-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Account Password</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2-STEP GOOGLE AUTHENTICATOR MODAL */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Google Authenticator (TOTP) 2FA</h3>
              <button onClick={() => setShow2FAModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Scan this QR code in Google Authenticator or enter the secret key manually to activate 2-step verification.
            </p>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto">
              <div className="w-36 h-36 flex flex-col items-center justify-center relative">
                <div className="grid grid-cols-6 gap-1 w-32 h-32 p-1">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 3 === 0 || i % 5 === 0 || i < 6 || i > 30) ? 'bg-slate-950' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Secret Key */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Manual 16-Digit Secret Key</span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300">
                <span>{user.twoFactorSecret || 'JBSWY3DPEHPK3PXP'}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(user.twoFactorSecret || 'JBSWY3DPEHPK3PXP');
                    setTotpCopied(true);
                    setTimeout(() => setTotpCopied(false), 2000);
                  }}
                  className="hover:text-white p-1"
                >
                  {totpCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 6-Digit Verification Code Input */}
            <form onSubmit={handleVerify2FACode} className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Enter 6-Digit Authenticator Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={totpInputCode}
                  onChange={(e) => {
                    setTotpInputCode(e.target.value);
                    setTotpError('');
                  }}
                  placeholder="e.g. 123456"
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-lg tracking-widest text-white focus:outline-none focus:border-amber-500"
                />
                {totpError && <p className="text-xs text-rose-400 mt-1">{totpError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                {user.twoFactorEnabled ? 'Disable 2-Step Verification' : 'Verify & Activate 2FA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

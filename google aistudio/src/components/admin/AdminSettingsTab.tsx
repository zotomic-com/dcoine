import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Shield,
  Pickaxe,
  DollarSign,
  AlertTriangle,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { FullSiteSettings } from '../../types';
import { StorageService } from '../../services/storage';

export const AdminSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<FullSiteSettings>(() => StorageService.getSiteSettings());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSiteSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset all site settings to factory default configurations?')) {
      localStorage.removeItem('dcoine_app_full_site_settings');
      const reset = StorageService.getSiteSettings();
      setSettings(reset);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            6. Global Platform Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure full site operational parameters, mining difficulty, trading limits, fees, and security compliance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/25"
          >
            {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Settings Saved!' : 'Save Site Settings'}</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Platform site settings successfully updated and saved across all clients.</span>
        </div>
      )}

      {/* 1. General Branding & Operational Mode */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Globe className="w-4 h-4 text-amber-400" />
          1. General Branding & Operational Mode
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Platform Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Canonical Platform URL</label>
            <input
              type="text"
              value={settings.siteUrl}
              onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Official Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Official Support Telegram / WhatsApp</label>
            <input
              type="text"
              value={settings.supportTelegram}
              onChange={(e) => setSettings({ ...settings, supportTelegram: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Maintenance Mode Toggle */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Maintenance Mode Kill-Switch
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              When activated, retail trading & swaps pause with a custom user broadcast banner.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {settings.maintenanceMode && (
          <div>
            <label className="text-slate-400 font-medium text-xs">Public Maintenance Notice Message</label>
            <textarea
              rows={2}
              value={settings.maintenanceNotice}
              onChange={(e) => setSettings({ ...settings, maintenanceNotice: e.target.value })}
              className="w-full mt-1.5 p-2 bg-slate-950 border border-amber-500/40 rounded-lg text-amber-200 text-xs focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 2. Mining Engine Parameters */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Pickaxe className="w-4 h-4 text-amber-400" />
          2. Cloud Mining Engine Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Base Mining Rate (DCN/hr)</label>
            <input
              type="number"
              step="0.01"
              value={settings.baseMiningRate}
              onChange={(e) => setSettings({ ...settings, baseMiningRate: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Session Duration (Hours)</label>
            <input
              type="number"
              value={settings.sessionDurationHours}
              onChange={(e) => setSettings({ ...settings, sessionDurationHours: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Min Withdrawal (DCN)</label>
            <input
              type="number"
              value={settings.minWithdrawalDcoin}
              onChange={(e) => setSettings({ ...settings, minWithdrawalDcoin: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Referral Hashrate Bonus (%)</label>
            <input
              type="number"
              value={settings.referralMiningBonusPercent}
              onChange={(e) => setSettings({ ...settings, referralMiningBonusPercent: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Trading & Financial Limits */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          3. Financial Limits & Treasury Allocation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Min Deposit (USD)</label>
            <input
              type="number"
              value={settings.minDepositUsd}
              onChange={(e) => setSettings({ ...settings, minDepositUsd: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Max Deposit (USD)</label>
            <input
              type="number"
              value={settings.maxDepositUsd}
              onChange={(e) => setSettings({ ...settings, maxDepositUsd: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Min Withdrawal (USD)</label>
            <input
              type="number"
              value={settings.minWithdrawalUsd}
              onChange={(e) => setSettings({ ...settings, minWithdrawalUsd: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Daily Withdrawal Ceiling (USD)</label>
            <input
              type="number"
              value={settings.dailyWithdrawalLimitUsd}
              onChange={(e) => setSettings({ ...settings, dailyWithdrawalLimitUsd: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div>
            <label className="text-slate-400 font-medium">Swap DEX Commission (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.swapFeePercent}
              onChange={(e) => setSettings({ ...settings, swapFeePercent: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">P2P Escrow Sell Fee (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.p2pSellFeePercent}
              onChange={(e) => setSettings({ ...settings, p2pSellFeePercent: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Gas Multiplier (x)</label>
            <input
              type="number"
              step="0.05"
              value={settings.gasMultiplier}
              onChange={(e) => setSettings({ ...settings, gasMultiplier: Number(e.target.value) })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-400 font-medium text-xs">Treasury Revenue Fee Collector Wallet</label>
          <input
            type="text"
            value={settings.treasuryWalletAddress}
            onChange={(e) => setSettings({ ...settings, treasuryWalletAddress: e.target.value })}
            className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Security & Compliance Toggles */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Shield className="w-4 h-4 text-blue-400" />
          4. Security & Anti-Fraud Compliance Rules
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Enforce Two-Factor Authentication (2FA) for Withdrawals</div>
              <div className="text-[11px] text-slate-400">Users cannot withdraw on-chain crypto without a verified TOTP code</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enforce2FaWithdrawals}
              onChange={(e) => setSettings({ ...settings, enforce2FaWithdrawals: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Enforce KYC Verification for P2P Escrow Trading</div>
              <div className="text-[11px] text-slate-400">Merchants and retail peers must complete identity review before publishing ads</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enforceKycP2P}
              onChange={(e) => setSettings({ ...settings, enforceKycP2P: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Automatic Circuit Breaker (Freeze Suspicious Accounts)</div>
              <div className="text-[11px] text-slate-400">Instantly suspend accounts triggering 3+ dispute complaints in 24 hours</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoFreezeSuspicious}
              onChange={(e) => setSettings({ ...settings, autoFreezeSuspicious: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900"
            />
          </label>
        </div>
      </div>
    </form>
  );
};

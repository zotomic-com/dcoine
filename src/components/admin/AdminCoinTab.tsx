import React, { useState, useEffect } from 'react';
import {
  Coins,
  Activity,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Key,
  Copy,
  Percent,
  Zap,
  BarChart3,
  Database,
  Users,
  Check,
  Sliders,
  FileCheck2,
  UserCheck,
  UserX,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import {
  CoinTokenomicsConfig,
  CoinMigrationPolicy,
  UserMigrationStatus,
  CoinReserveAllocation,
  AccountLockRule,
  CoinTransferRequest,
  LiveMinerTelemetry,
  ReserveCategory,
} from '../../types';

export const AdminCoinTab: React.FC = () => {
  // Navigation sub-tabs
  type SubTabId = 'mining' | 'migration' | 'tokenomics' | 'reserves' | 'locks' | 'transfers';
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('mining');

  // Core state from StorageService
  const [config, setConfig] = useState<CoinTokenomicsConfig>(() => StorageService.getCoinTokenomicsConfig());
  const [policies, setPolicies] = useState<CoinMigrationPolicy[]>(() => StorageService.getMigrationPolicies());
  const [userMigrations, setUserMigrations] = useState<UserMigrationStatus[]>(() =>
    StorageService.getUserMigrations()
  );
  const [reserves, setReserves] = useState<CoinReserveAllocation[]>(() => StorageService.getReserveAllocations());
  const [locks, setLocks] = useState<AccountLockRule[]>(() => StorageService.getAccountLockRules());
  const [transfers, setTransfers] = useState<CoinTransferRequest[]>(() => StorageService.getCoinTransferRequests());
  const [miners, setMiners] = useState<LiveMinerTelemetry[]>(() => StorageService.getLiveMiners());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [transferFilter, setTransferFilter] = useState<'all' | 'pending_admin_review' | 'auto_rejected' | 'approved' | 'rejected'>('all');
  const [reserveFilter, setReserveFilter] = useState<'all' | ReserveCategory>('all');

  // Modals state
  const [showAddReserveModal, setShowAddReserveModal] = useState(false);
  const [editingReserve, setEditingReserve] = useState<CoinReserveAllocation | null>(null);

  const [showAddLockModal, setShowAddLockModal] = useState(false);
  const [editingLock, setEditingLock] = useState<AccountLockRule | null>(null);

  const [inspectTransfer, setInspectTransfer] = useState<CoinTransferRequest | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const [showUserOverrideModal, setShowUserOverrideModal] = useState<UserMigrationStatus | null>(null);
  const [overridePercentageInput, setOverridePercentageInput] = useState<number>(60);

  // Additional editable sections for admin
  const [showEditMiningModal, setShowEditMiningModal] = useState(false);
  const [showAddMinerModal, setShowAddMinerModal] = useState(false);
  const [editingMiner, setEditingMiner] = useState<LiveMinerTelemetry | null>(null);
  const [showEditPolicyModal, setShowEditPolicyModal] = useState(false);
  const [showEditTokenomicsModal, setShowEditTokenomicsModal] = useState(false);

  // Success / notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live Mining Countdown & Real-time block simulation
  const [countdownSeconds, setCountdownSeconds] = useState(15);
  const [minedCoinTicker, setMinedCoinTicker] = useState(config.minedSupply);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          // Block discovered! Increment ticker
          setMinedCoinTicker((c) => {
            const next = c + config.miningRewardPerBlock;
            // update in storage config
            const updatedConfig = {
              ...config,
              minedSupply: next,
              currentBlockHeight: config.currentBlockHeight + 1,
            };
            StorageService.saveCoinTokenomicsConfig(updatedConfig);
            return next;
          });
          return config.blockTimeSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  // 24H Mining Rates & Growth Calculations
  const calculated24hMined =
    config.mining24hMined ?? Math.round((86400 / (config.blockTimeSeconds || 15)) * (config.miningRewardPerBlock || 5));
  const calculatedPrevious24hMined =
    config.previous24hMined ?? Math.round(calculated24hMined * 0.875);
  const rateDifference = calculated24hMined - calculatedPrevious24hMined;
  const growthPercent =
    calculatedPrevious24hMined > 0 ? (rateDifference / calculatedPrevious24hMined) * 100 : 0;
  const isGrowing = growthPercent >= 0;

  // Current active migration policy
  const activePolicy = policies.find((p) => p.isActive) || policies[0];

  // =========================================================================
  // HANDLERS: Circuit Breaker & Config
  // =========================================================================

  const handleToggleTransferCircuitBreaker = () => {
    const nextState = !config.transfersGloballyEnabled;
    const updated = { ...config, transfersGloballyEnabled: nextState, updatedAt: Date.now() };
    setConfig(updated);
    StorageService.saveCoinTokenomicsConfig(updated);
    if (nextState) {
      showToast('⚠️ Transfer System ACTIVATED: Transfers subject to 2FA and Admin Verification.');
    } else {
      showToast('🔒 Circuit Breaker ENGAGED: All DC Coin transfers AUTO-REJECTED.');
    }
  };

  const handleToggleStrictKycMigration = () => {
    const nextState = !config.strictKycEnforcedForMigration;
    const updated = { ...config, strictKycEnforcedForMigration: nextState, updatedAt: Date.now() };
    setConfig(updated);
    StorageService.saveCoinTokenomicsConfig(updated);
    showToast(
      nextState
        ? '✓ Strict KYC Auto-Hold Active: Unverified miners cannot migrate coins.'
        : '⚠️ Caution: KYC auto-hold disabled.'
    );
  };

  // =========================================================================
  // HANDLERS: Migration Quotas
  // =========================================================================

  const handleUpdateGlobalReleasePercentage = (newPercentage: number) => {
    const clamped = Math.max(0, Math.min(100, newPercentage));
    const locked = 100 - clamped;
    const updatedPolicies = policies.map((p) => {
      if (p.id === activePolicy.id) {
        const authorized = (p.totalMinedAggregate * clamped) / 100;
        const retainLocked = p.totalMinedAggregate - authorized;
        return {
          ...p,
          globalReleasePercentage: clamped,
          globalLockedPercentage: locked,
          totalAuthorizedForRelease: authorized,
          totalRetainedInLockup: retainLocked,
          updatedAt: Date.now(),
        };
      }
      return p;
    });

    setPolicies(updatedPolicies);
    StorageService.saveMigrationPolicies(updatedPolicies);

    // Recompute users
    const updatedUsers = userMigrations.map((u) => {
      const isVerified = u.kycStatus === 'verified';
      const pct = u.customOverridePercentage ?? clamped;
      const unlocked = isVerified ? (u.totalMined * pct) / 100 : 0;
      const remLocked = u.totalMined - unlocked;
      return {
        ...u,
        unlockedMigratableAmount: unlocked,
        lockedReserveAmount: remLocked,
        lastUpdated: Date.now(),
      };
    });
    setUserMigrations(updatedUsers);
    StorageService.saveUserMigrations(updatedUsers);

    showToast(`✓ Migration Quota Updated: ${clamped}% Unlocked / ${locked}% Locked in Custody.`);
  };

  const handleUpdateUserKyc = (userId: string, status: 'verified' | 'unverified' | 'pending' | 'rejected') => {
    StorageService.updateUserKycMigrationStatus(userId, status);
    setUserMigrations(StorageService.getUserMigrations());
    showToast(`✓ User KYC updated to "${status.toUpperCase()}". Migration hold updated.`);
  };

  const handleSaveUserOverride = (userId: string, overridePct: number) => {
    const updatedUsers = userMigrations.map((u) => {
      if (u.userId === userId) {
        const pct = Math.max(0, Math.min(100, overridePct));
        const isVerified = u.kycStatus === 'verified';
        const unlocked = isVerified ? (u.totalMined * pct) / 100 : 0;
        const remLocked = u.totalMined - unlocked;
        return {
          ...u,
          customOverridePercentage: pct,
          unlockedMigratableAmount: unlocked,
          lockedReserveAmount: remLocked,
          lastUpdated: Date.now(),
        };
      }
      return u;
    });
    setUserMigrations(updatedUsers);
    StorageService.saveUserMigrations(updatedUsers);
    setShowUserOverrideModal(null);
    showToast(`✓ Custom migration quota (${overridePct}%) saved for user.`);
  };

  // =========================================================================
  // HANDLERS: Mining Config & Miner Nodes CRUD
  // =========================================================================

  const handleSaveMiningConfig = (cfgData: Partial<CoinTokenomicsConfig>) => {
    const updated = {
      ...config,
      ...cfgData,
      updatedAt: Date.now(),
    };
    setConfig(updated);
    if (cfgData.minedSupply !== undefined) {
      setMinedCoinTicker(Number(cfgData.minedSupply));
    }
    StorageService.saveCoinTokenomicsConfig(updated);
    setShowEditMiningModal(false);
    showToast('✓ Mining parameters updated and saved to database.');
  };

  const handleSaveMiner = (minerData: Partial<LiveMinerTelemetry>) => {
    if (editingMiner) {
      const updated = miners.map((m) => (m.minerId === editingMiner.minerId ? { ...m, ...minerData } : m));
      setMiners(updated);
      StorageService.saveLiveMiners(updated);
      showToast('✓ Miner node updated successfully.');
    } else {
      const newMiner: LiveMinerTelemetry = {
        minerId: `miner-node-${Date.now().toString().slice(-4)}`,
        userAddress: minerData.userAddress || '0x000...000',
        userName: minerData.userName || 'Custom Miner Node',
        hashRateMHs: Number(minerData.hashRateMHs) || 100,
        validShares: Number(minerData.validShares) || 1000,
        activeWorkers: Number(minerData.activeWorkers) || 4,
        lastHeartbeat: Date.now(),
        estDailyYieldDC: Number(minerData.estDailyYieldDC) || 50,
        status: minerData.status || 'mining',
      };
      const updated = [newMiner, ...miners];
      setMiners(updated);
      StorageService.saveLiveMiners(updated);
      showToast('✓ New miner node connected and added.');
    }
    setShowAddMinerModal(false);
    setEditingMiner(null);
  };

  const handleDeleteMiner = (minerId: string) => {
    if (window.confirm('Are you sure you want to delete / disconnect this miner node?')) {
      const updated = miners.filter((m) => m.minerId !== minerId);
      setMiners(updated);
      StorageService.saveLiveMiners(updated);
      showToast('✓ Miner node removed.');
    }
  };

  const handleSavePolicySettings = (policyData: Partial<CoinMigrationPolicy>) => {
    const updated = policies.map((p) => {
      if (p.id === activePolicy.id) {
        return {
          ...p,
          ...policyData,
          updatedAt: Date.now(),
        };
      }
      return p;
    });
    setPolicies(updated);
    StorageService.saveMigrationPolicies(updated);
    setShowEditPolicyModal(false);
    showToast('✓ Migration policy parameters updated.');
  };

  const handleSaveTokenomicsSupplies = (supplies: Partial<CoinTokenomicsConfig>) => {
    const updated = {
      ...config,
      ...supplies,
      updatedAt: Date.now(),
    };
    setConfig(updated);
    StorageService.saveCoinTokenomicsConfig(updated);
    setShowEditTokenomicsModal(false);
    showToast('✓ Tokenomics supplies and hard caps updated.');
  };

  // =========================================================================
  // HANDLERS: Reserves & Presale CRUD
  // =========================================================================

  const handleSaveReserve = (resData: Partial<CoinReserveAllocation>) => {
    if (editingReserve) {
      // Edit existing
      const updated = reserves.map((r) => (r.id === editingReserve.id ? { ...r, ...resData } : r));
      setReserves(updated);
      StorageService.saveReserveAllocations(updated);
      showToast('✓ Reserve allocation updated successfully.');
    } else {
      // Add new
      const newAllocation: CoinReserveAllocation = {
        id: `res-${Date.now()}`,
        category: resData.category || 'custom',
        beneficiaryName: resData.beneficiaryName || 'Beneficiary',
        walletAddress: resData.walletAddress || '0x0000...0000',
        allocatedAmount: Number(resData.allocatedAmount) || 0,
        releasedAmount: Number(resData.releasedAmount) || 0,
        releaseDate: resData.releaseDate || '2026-12-31',
        status: resData.status || 'locked',
        notes: resData.notes || '',
        vestingMonths: Number(resData.vestingMonths) || 24,
        cliffMonths: Number(resData.cliffMonths) || 6,
        createdAt: Date.now(),
      };
      const updated = [newAllocation, ...reserves];
      setReserves(updated);
      StorageService.saveReserveAllocations(updated);
      showToast('✓ New reserve / presale allocation created.');
    }
    setShowAddReserveModal(false);
    setEditingReserve(null);
  };

  const handleDeleteReserve = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reserve allocation?')) {
      const updated = reserves.filter((r) => r.id !== id);
      setReserves(updated);
      StorageService.saveReserveAllocations(updated);
      showToast('✓ Reserve allocation deleted.');
    }
  };

  // =========================================================================
  // HANDLERS: Account Locks CRUD
  // =========================================================================

  const handleSaveLockRule = (lockData: Partial<AccountLockRule>) => {
    if (editingLock) {
      const updated = locks.map((l) => (l.id === editingLock.id ? { ...l, ...lockData } : l));
      setLocks(updated);
      StorageService.saveAccountLockRules(updated);
      showToast('✓ Account lock rule updated.');
    } else {
      const newLock: AccountLockRule = {
        id: `lock-${Date.now()}`,
        accountAddress: lockData.accountAddress || '',
        accountName: lockData.accountName || 'Target User',
        accountEmail: lockData.accountEmail || '',
        lockedAmount: Number(lockData.lockedAmount) || 0,
        isFullBalanceLock: !!lockData.isFullBalanceLock,
        lockReason: lockData.lockReason || 'Administrative lock',
        autoUnlockDate: lockData.autoUnlockDate || 'indefinite',
        status: 'active',
        createdBy: 'Admin Console',
        createdAt: Date.now(),
      };
      const updated = [newLock, ...locks];
      setLocks(updated);
      StorageService.saveAccountLockRules(updated);
      showToast('✓ Account lock rule created and applied.');
    }
    setShowAddLockModal(false);
    setEditingLock(null);
  };

  const handleUnlockAccount = (id: string) => {
    if (window.confirm('Are you sure you want to release / unlock this account balance?')) {
      const updated = locks.map((l) => (l.id === id ? { ...l, status: 'unlocked' as const } : l));
      setLocks(updated);
      StorageService.saveAccountLockRules(updated);
      showToast('✓ Account unlocked successfully.');
    }
  };

  const handleDeleteLockRule = (id: string) => {
    if (window.confirm('Delete this lock rule permanently?')) {
      const updated = locks.filter((l) => l.id !== id);
      setLocks(updated);
      StorageService.saveAccountLockRules(updated);
      showToast('✓ Lock rule deleted.');
    }
  };

  // =========================================================================
  // HANDLERS: Transfers Queue
  // =========================================================================

  const handleApproveTransfer = (txId: string) => {
    const updated = transfers.map((t) => {
      if (t.id === txId) {
        return {
          ...t,
          status: 'approved' as const,
          reviewedAt: Date.now(),
          reviewedBy: 'Admin (Master Console)',
          adminNotes: adminNoteInput || 'Approved following cryptographic ledger verification.',
        };
      }
      return t;
    });
    setTransfers(updated);
    StorageService.saveCoinTransferRequests(updated);
    setInspectTransfer(null);
    setAdminNoteInput('');
    showToast('✓ Transfer APPROVED and broadcast to verifiable ledger.');
  };

  const handleRejectTransfer = (txId: string, reason?: string) => {
    const updated = transfers.map((t) => {
      if (t.id === txId) {
        return {
          ...t,
          status: 'rejected' as const,
          reviewedAt: Date.now(),
          reviewedBy: 'Admin (Master Console)',
          rejectionReason: reason || adminNoteInput || 'Rejected by platform compliance policy.',
        };
      }
      return t;
    });
    setTransfers(updated);
    StorageService.saveCoinTransferRequests(updated);
    setInspectTransfer(null);
    setAdminNoteInput('');
    showToast('⚠️ Transfer REJECTED.');
  };

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================

  const filteredTransfers = transfers.filter((t) => {
    if (transferFilter !== 'all' && t.status !== transferFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.senderName.toLowerCase().includes(q) ||
        t.senderAddress.toLowerCase().includes(q) ||
        t.recipientAddress.toLowerCase().includes(q) ||
        t.ledgerHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredReserves = reserves.filter((r) => {
    if (reserveFilter !== 'all' && r.category !== reserveFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.beneficiaryName.toLowerCase().includes(q) ||
        r.walletAddress.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredLocks = locks.filter((l) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.accountName.toLowerCase().includes(q) ||
        l.accountAddress.toLowerCase().includes(q) ||
        l.lockReason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUsers = userMigrations.filter((u) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.userName.toLowerCase().includes(q) ||
        u.walletAddress.toLowerCase().includes(q) ||
        u.userEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-slate-900 border border-amber-500/50 text-white rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slideDown">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner with Real-Time 24H Mining Telemetry, Total Mined & Growth Rate */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">DC Native Coin Management Console</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono uppercase tracking-wider font-bold">
                  Mainnet Verifiable
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time mining metrics, 60% migration release quota, account lock & unlock engine, and 2FA circuit breaker.
              </p>
            </div>
          </div>

          {/* Master Circuit Breaker Indicator */}
          <div className="flex items-center gap-3">
            <div
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 transition-all ${
                config.transfersGloballyEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
              }`}
            >
              {config.transfersGloballyEnabled ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider leading-none">
                  Transfer Circuit Breaker
                </div>
                <div className="text-xs font-black mt-0.5">
                  {config.transfersGloballyEnabled ? 'ACTIVE (2FA GATED)' : 'AUTO-REJECT ACTIVE'}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleTransferCircuitBreaker}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                config.transfersGloballyEnabled
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{config.transfersGloballyEnabled ? 'Disengage / Auto-Reject' : 'Engage Transfers'}</span>
            </button>
          </div>
        </div>

        {/* 24H Coin Mining Telemetry, Total Mined & Rate Velocity Growth Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          {/* Card 1: Total Lifetime Mined */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/30 transition">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Total Lifetime Mined</span>
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-1 tracking-tight">
              {minedCoinTicker.toLocaleString()} <span className="text-xs text-amber-400 font-sans">DC</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{((minedCoinTicker / config.totalSupply) * 100).toFixed(2)}%</span>
              <span>of 100,000,000 DC Cap</span>
            </div>
          </div>

          {/* Card 2: 24h Mined Amount */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-blue-500/30 transition">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Mined in Last 24H</span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 font-mono mt-1 tracking-tight">
              +{calculated24hMined.toLocaleString()} <span className="text-xs text-slate-400 font-sans">DC</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Velocity: ≈ {(calculated24hMined / 24).toFixed(1)} DC / hour
            </div>
          </div>

          {/* Card 3: Previous 24h Mining Rate */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-purple-500/30 transition">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Previous 24H Baseline</span>
              <Activity className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-300 font-mono mt-1 tracking-tight">
              {calculatedPrevious24hMined.toLocaleString()} <span className="text-xs text-slate-400 font-sans">DC</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Prior Velocity: {(calculatedPrevious24hMined / 24).toFixed(1)} DC / hr
            </div>
          </div>

          {/* Card 4: Mining Rate Growth / Decline with Percentage */}
          <div className={`p-3.5 rounded-xl border transition ${
            isGrowing
              ? 'bg-emerald-500/10 border-emerald-500/40'
              : 'bg-rose-500/10 border-rose-500/40'
          }`}>
            <div className="text-[10px] uppercase tracking-wider font-semibold flex items-center justify-between">
              <span className={isGrowing ? 'text-emerald-400' : 'text-rose-400'}>
                Mining Rate Velocity
              </span>
              {isGrowing ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className={`text-lg sm:text-xl font-black font-mono tracking-tight ${
                isGrowing ? 'text-emerald-300' : 'text-rose-300'
              }`}>
                {isGrowing ? '+' : ''}{growthPercent.toFixed(2)}%
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isGrowing
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {isGrowing ? 'Growing ▲' : 'Declining ▼'}
              </span>
            </div>
            <div className={`text-[10px] font-semibold mt-1 ${
              isGrowing ? 'text-emerald-400/90' : 'text-rose-400/90'
            }`}>
              {isGrowing
                ? `+${rateDifference.toLocaleString()} DC net expansion`
                : `-${Math.abs(rateDifference).toLocaleString()} DC contraction`}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'mining', label: '1. Live Mining & Telemetry', icon: Activity, badge: 'Real-Time' },
          { id: 'migration', label: '2. Migration Quota (60% / KYC)', icon: Sliders, badge: 'Crucial' },
          { id: 'tokenomics', label: '3. Tokenomics & Vesting', icon: BarChart3, badge: '100M Cap' },
          { id: 'reserves', label: '4. Reserves & Presale CRUD', icon: Database, badge: reserves.length.toString() },
          { id: 'locks', label: '5. Account Lock / Unlock', icon: Lock, badge: locks.length.toString() },
          { id: 'transfers', label: '6. Transfer Queue & 2FA', icon: ShieldCheck, badge: transfers.filter(t => t.status === 'pending_admin_review').length.toString() },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as SubTabId);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: LIVE MINING & REAL-TIME COUNTDOWN */}
      {/* ========================================================================= */}
      {activeSubTab === 'mining' && (
        <div className="space-y-6">
          {/* Action Header for Mining Parameters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Real-Time Mining Engine Parameters
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Emitting {config.miningRewardPerBlock} DC every {config.blockTimeSeconds}s • Current Block #{config.currentBlockHeight.toLocaleString()} • Halving at #{config.nextHalvingBlock.toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEditMiningModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Mining Parameters</span>
            </button>
          </div>

          {/* Top Real-Time Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Live Block Countdown */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Next Block Discovery</span>
                <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                  00:{countdownSeconds < 10 ? `0${countdownSeconds}` : countdownSeconds}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Emitting {config.miningRewardPerBlock} DC every {config.blockTimeSeconds}s</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((config.blockTimeSeconds - countdownSeconds) / config.blockTimeSeconds) * 100}%` }}
                />
              </div>
            </div>

            {/* Total Mined Counter */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Coins Mined</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                  {minedCoinTicker.toLocaleString()} <span className="text-xs text-amber-400 font-sans">DC</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Block Height: #{config.currentBlockHeight.toLocaleString()}
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verifiable on Dcoine Native Ledger
              </div>
            </div>

            {/* Total Active Miners */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Miner Fleet</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                  {miners.length} Nodes <span className="text-xs text-slate-400">/ 124 Wallets</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Workers: {miners.reduce((acc, m) => acc + m.activeWorkers, 0)} Compute Threads
                </div>
              </div>
              <div className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3" /> 100% Network Uptime (Last 24h)
              </div>
            </div>

            {/* Aggregate Hash Rate */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Network Hash Rate</span>
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
                  {miners.reduce((acc, m) => acc + m.hashRateMHs, 0).toFixed(1)} <span className="text-xs text-slate-400 font-sans">MH/s</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Difficulty: 4.821 TH • Halving at #{config.nextHalvingBlock.toLocaleString()}
                </div>
              </div>
              <div className="text-[10px] text-purple-400 font-semibold flex items-center gap-1">
                <BarChart3 className="w-3 h-3" /> Consensus: Proof-of-Engagement
              </div>
            </div>
          </div>

          {/* Connected Miners Table with Full Add/Edit/Delete Controls */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Connected Mining Nodes Telemetry & Fleet Management
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time compute contributions, valid cryptographic share submissions, and projected daily DC yield.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMiner(null);
                    setShowAddMinerModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Miner Node</span>
                </button>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Socket Stream
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Node / Miner</th>
                    <th className="py-2.5 px-3">Wallet Address</th>
                    <th className="py-2.5 px-3">Hash Rate</th>
                    <th className="py-2.5 px-3">Workers</th>
                    <th className="py-2.5 px-3">Accepted Shares</th>
                    <th className="py-2.5 px-3">Est. 24h Yield</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {miners.map((m) => (
                    <tr key={m.minerId} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-sans font-bold text-white">
                        {m.userName}
                        <div className="text-[10px] text-slate-500 font-mono">{m.minerId}</div>
                      </td>
                      <td className="py-3 px-3 text-amber-300/90">{m.userAddress}</td>
                      <td className="py-3 px-3 font-bold text-purple-400">{m.hashRateMHs} MH/s</td>
                      <td className="py-3 px-3 text-slate-300">{m.activeWorkers} threads</td>
                      <td className="py-3 px-3 text-emerald-400">{m.validShares.toLocaleString()}</td>
                      <td className="py-3 px-3 font-bold text-amber-400">+{m.estDailyYieldDC} DC</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMiner(m);
                            setShowAddMinerModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Edit Miner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMiner(m.minerId)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Delete / Disconnect Miner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MIGRATION & RELEASE QUOTA (USER-REQUESTED 60% / KYC HOLD) */}
      {/* ========================================================================= */}
      {activeSubTab === 'migration' && (
        <div className="space-y-6">
          {/* Top Migration Controller Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white tracking-tight">
                    Native Coin Migration & Release Quota Engine
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowEditPolicyModal(true)}
                    className="ml-2 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Policy</span>
                  </button>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                    Phase 1 Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Authorizes the exact percentage of mined coins eligible for withdrawal or P2P transfer (e.g. 60% unlocked, 40% retained in admin custody). 
                  Non-KYC accounts are automatically placed on <strong>Auto-Hold</strong> until identity verification is approved.
                </p>
              </div>

              {/* Strict KYC Toggle */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                    <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                    Strict KYC Verification
                  </div>
                  <div className="text-[10px] text-slate-400">Non-KYC placed on Auto-Hold</div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleStrictKycMigration}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    config.strictKycEnforcedForMigration ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      config.strictKycEnforcedForMigration ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Slider Control for Quota */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-400" />
                    Global Authorized Release Percentage:
                  </span>
                  <span className="font-mono text-base font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                    {activePolicy.globalReleasePercentage}% Unlocked
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={activePolicy.globalReleasePercentage}
                  onChange={(e) => handleUpdateGlobalReleasePercentage(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>0% (Full Lockup)</span>
                  <span className="text-amber-400 font-bold">Standard 60% Genesis Quota</span>
                  <span>100% (Unrestricted Mainnet)</span>
                </div>
              </div>

              {/* Retained in Custody Metric */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Mandatory Lockup Remainder</div>
                <div className="text-2xl font-black text-slate-300 font-mono">
                  {activePolicy.globalLockedPercentage}%
                </div>
                <div className="text-[10px] text-amber-400 font-semibold">Locked in Platform Custody</div>
              </div>
            </div>

            {/* Aggregate Simulation Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Aggregate Mined</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activePolicy.totalMinedAggregate.toLocaleString()} DC
                </div>
                <div className="text-[10px] text-slate-500">Across {activePolicy.totalEligibleUsers} Active Miners</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-[10px] text-emerald-400 uppercase font-semibold">Authorized for Release ({activePolicy.globalReleasePercentage}%)</div>
                <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">
                  {activePolicy.totalAuthorizedForRelease.toLocaleString()} DC
                </div>
                <div className="text-[10px] text-emerald-400/80">Only for KYC Verified Accounts</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Retained in Lockup ({activePolicy.globalLockedPercentage}%)</div>
                <div className="text-lg font-black text-slate-300 font-mono mt-0.5">
                  {activePolicy.totalRetainedInLockup.toLocaleString()} DC
                </div>
                <div className="text-[10px] text-slate-500">Custody Release Epoch #2</div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <div className="text-[10px] text-rose-400 uppercase font-semibold">Non-KYC Auto-Hold Pool</div>
                <div className="text-lg font-black text-rose-300 font-mono mt-0.5">
                  {activePolicy.totalKycAutoHeld.toLocaleString()} DC
                </div>
                <div className="text-[10px] text-rose-400/80">Frozen Until KYC Approval</div>
              </div>
            </div>
          </div>

          {/* User Migration Accounts & KYC Roster */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Miner Migration & KYC Compliance Registry
                </h3>
                <p className="text-xs text-slate-400">
                  Individual miner allocations, KYC verification status, and one-click KYC overrides.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search miner or wallet..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 w-48 sm:w-64"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Miner Account</th>
                    <th className="py-2.5 px-3">Total Mined</th>
                    <th className="py-2.5 px-3">KYC Verification</th>
                    <th className="py-2.5 px-3">Unlocked (60%)</th>
                    <th className="py-2.5 px-3">Locked (40%)</th>
                    <th className="py-2.5 px-3">Migration Hold State</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredUsers.map((u) => {
                    const isKyc = u.kycStatus === 'verified';
                    return (
                      <tr key={u.userId} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-sans">
                          <div className="font-bold text-white">{u.userName}</div>
                          <div className="text-[10px] text-amber-300 font-mono">{u.walletAddress}</div>
                          <div className="text-[10px] text-slate-500 font-sans">{u.userEmail}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {u.totalMined.toLocaleString()} DC
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              u.kycStatus === 'verified'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : u.kycStatus === 'pending'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {u.kycStatus === 'verified' && <UserCheck className="w-2.5 h-2.5" />}
                            {u.kycStatus === 'unverified' && <UserX className="w-2.5 h-2.5" />}
                            {u.kycStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-400">
                          {isKyc ? `${u.unlockedMigratableAmount.toLocaleString()} DC` : '0 DC (Hold)'}
                          {u.customOverridePercentage && (
                            <span className="ml-1 text-[10px] text-amber-400">({u.customOverridePercentage}%)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {u.lockedReserveAmount.toLocaleString()} DC
                        </td>
                        <td className="py-3 px-3">
                          {isKyc ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-sans font-bold">
                              ✓ Ready to Migrate
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-sans font-bold">
                              ⛔ AUTO-HOLD (Non-KYC)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 font-sans">
                          {u.kycStatus !== 'verified' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateUserKyc(u.userId, 'verified')}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer"
                              title="Approve KYC and unlock 60% migration quota"
                            >
                              Approve KYC
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateUserKyc(u.userId, 'unverified')}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-rose-400 text-[11px] transition cursor-pointer"
                              title="Place back on KYC Auto-Hold"
                            >
                              Revoke KYC
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setShowUserOverrideModal(u);
                              setOverridePercentageInput(u.customOverridePercentage ?? activePolicy.globalReleasePercentage);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer"
                            title="Set custom migration release percentage"
                          >
                            <Sliders className="w-3 h-3 inline mr-1" />
                            Override
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: TOKENOMICS & AUTOMATED SMART VESTING */}
      {/* ========================================================================= */}
      {activeSubTab === 'tokenomics' && (
        <div className="space-y-6">
          {/* Header Action to Edit Supplies & Hard Cap */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Tokenomics Supply & Hard Cap Allocations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Cap: {config.totalSupply.toLocaleString()} DC • Mined: {config.minedSupply.toLocaleString()} DC • Reserves: {config.reserveSupply.toLocaleString()} DC • Presale: {config.presaleSupply.toLocaleString()} DC
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEditTokenomicsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Supplies & Caps</span>
            </button>
          </div>

          {/* Supply Distribution Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Max Cap</div>
              <div className="text-xl font-black text-amber-400 font-mono">
                {config.totalSupply.toLocaleString()} <span className="text-xs">DC</span>
              </div>
              <div className="text-[10px] text-slate-500">Hard Cap • Immutable</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Mined Supply</div>
              <div className="text-xl font-black text-white font-mono">
                {minedCoinTicker.toLocaleString()} <span className="text-xs">DC</span>
              </div>
              <div className="text-[10px] text-emerald-400">
                {((minedCoinTicker / config.totalSupply) * 100).toFixed(2)}% of cap
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Platform Reserves</div>
              <div className="text-xl font-black text-white font-mono">
                {config.reserveSupply.toLocaleString()} <span className="text-xs">DC</span>
              </div>
              <div className="text-[10px] text-purple-400">Time-Locked Multi-Sig</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Strategic Presale</div>
              <div className="text-xl font-black text-white font-mono">
                {config.presaleSupply.toLocaleString()} <span className="text-xs">DC</span>
              </div>
              <div className="text-[10px] text-blue-400">Subject to 12m cliff</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">True Circulating</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {config.circulatingSupply.toLocaleString()} <span className="text-xs">DC</span>
              </div>
              <div className="text-[10px] text-slate-500">Liquid Market Supply</div>
            </div>
          </div>

          {/* Smart Vesting Milestone Schedule */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Automated Smart Vesting Release Schedule
                </h3>
                <p className="text-xs text-slate-400">
                  Cryptographic smart contract milestone unlocks for early backers, core engineers, and ecosystem growth.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Next Epoch Unlock: 2026-12-31
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Tranche A: Core Team Vesting</span>
                  <span className="text-amber-400 font-mono">25% Disbursed</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '25%' }} />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>1,000,000 / 4,000,000 DC</span>
                  <span>48 Months Linear</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Tranche B: Strategic Angels</span>
                  <span className="text-blue-400 font-mono">40% Disbursed</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: '40%' }} />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>4,200,000 / 10,500,000 DC</span>
                  <span>18 Months Tranche</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Tranche C: Treasury Reserve</span>
                  <span className="text-purple-400 font-mono">0% (Locked)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: '0%' }} />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>0 / 15,000,000 DC</span>
                  <span>Cliff ends Jan 2027</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: RESERVES & PRESALE ALLOCATION (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeSubTab === 'reserves' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  Platform Reserve & Presale Allocation Manager
                </h3>
                <p className="text-xs text-slate-400">
                  Control who receives reserve or presale tokens, vesting duration, and unlock conditions with full CRUD capabilities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingReserve(null);
                    setShowAddReserveModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Allocation</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['all', 'treasury', 'team', 'ecosystem', 'presale', 'liquidity', 'custom'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setReserveFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                      reserveFilter === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter beneficiary or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 w-48 sm:w-64"
                />
              </div>
            </div>

            {/* Allocation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Beneficiary</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Wallet Address</th>
                    <th className="py-2.5 px-3">Allocated Amount</th>
                    <th className="py-2.5 px-3">Released</th>
                    <th className="py-2.5 px-3">Release Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredReserves.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-white">{r.beneficiaryName}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{r.notes}</div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] uppercase font-bold">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono">
                        {r.walletAddress.substring(0, 8)}...{r.walletAddress.substring(r.walletAddress.length - 6)}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {r.allocatedAmount.toLocaleString()} DC
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">
                        {r.releasedAmount.toLocaleString()} DC
                      </td>
                      <td className="py-3 px-3 text-slate-400">{r.releaseDate}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.status === 'fully_unlocked'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : r.status === 'partially_unlocked'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReserve(r);
                            setShowAddReserveModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Edit Allocation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReserve(r.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Delete / Revoke Allocation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: ACCOUNT LOCK & UNLOCK ENGINE (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeSubTab === 'locks' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Targeted Account Lock & Unlock Security Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Restrict or release coin movements for specific accounts with exact amounts, compliance flags, or time-locked schedules.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLock(null);
                    setShowAddLockModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lock Rule</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-400">
                Active Restrictions: <span className="text-amber-400 font-bold">{locks.filter(l => l.status === 'active').length}</span> Accounts
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter account or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 w-48 sm:w-64"
                />
              </div>
            </div>

            {/* Lock Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Target Account</th>
                    <th className="py-2.5 px-3">Wallet Address</th>
                    <th className="py-2.5 px-3">Locked Amount</th>
                    <th className="py-2.5 px-3">Lock Reason</th>
                    <th className="py-2.5 px-3">Auto Unlock Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLocks.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-white">{l.accountName}</div>
                        <div className="text-[10px] text-slate-500">{l.accountEmail}</div>
                      </td>
                      <td className="py-3 px-3 text-amber-300 font-mono">{l.accountAddress}</td>
                      <td className="py-3 px-3 font-bold text-rose-400">
                        {l.isFullBalanceLock ? '100% Full Balance' : `${l.lockedAmount.toLocaleString()} DC`}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-300 max-w-xs">{l.lockReason}</td>
                      <td className="py-3 px-3 text-slate-400">{l.autoUnlockDate}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            l.status === 'active'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1 font-sans">
                        {l.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleUnlockAccount(l.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer"
                            title="Unlock account balance"
                          >
                            <Unlock className="w-3 h-3 inline mr-1" />
                            Unlock
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLock(l);
                            setShowAddLockModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Edit Lock Rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLockRule(l.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: TRANSFER QUEUE & CIRCUIT BREAKER SECURITY */}
      {/* ========================================================================= */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-6">
          {/* Circuit Breaker Warning / Status Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              config.transfersGloballyEnabled
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  config.transfersGloballyEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {config.transfersGloballyEnabled ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {config.transfersGloballyEnabled ? (
                    <span>Transfer Gate: Online with 2FA & Admin Multi-Sign</span>
                  ) : (
                    <span>AUTO-REJECT MODE ACTIVE (Master Circuit Breaker Engaged)</span>
                  )}
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {config.transfersGloballyEnabled
                    ? 'All DC Coin transfers and withdrawals are actively intercepted. Users must supply 2FA authentication, and transfers queue for manual administrative review.'
                    : 'Every DC Coin transfer, withdrawal, or send attempt by any user is automatically rejected by default until you manually switch this system online.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleTransferCircuitBreaker}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 cursor-pointer shadow-lg ${
                config.transfersGloballyEnabled
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {config.transfersGloballyEnabled ? 'Engage Auto-Reject Mode' : 'Activate Transfer System'}
            </button>
          </div>

          {/* Transfers Table with Review Buttons */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  DC Coin Transfer Approval Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Review pending withdrawals and verify SHA-256 cryptographic signatures. No coin can be minted or forged outside the platform.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  Pending Review: <strong className="text-amber-400">{transfers.filter(t => t.status === 'pending_admin_review').length}</strong>
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['all', 'pending_admin_review', 'auto_rejected', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTransferFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                      transferFilter === st
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter sender, recipient or TX hash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 w-48 sm:w-64"
                />
              </div>
            </div>

            {/* Transfer Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Sender</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">2FA & KYC</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredTransfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {t.id}
                        <div className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-white">{t.senderName}</div>
                        <div className="text-[10px] text-amber-300 font-mono">{t.senderAddress}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{t.recipientAddress}</td>
                      <td className="py-3 px-3 font-bold text-amber-400 text-sm">
                        {t.amount.toLocaleString()} DC
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              t.twoFactorVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            2FA: {t.twoFactorVerified ? 'OK' : 'NO'}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              t.kycVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            KYC: {t.kycVerified ? 'OK' : 'NO'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : t.status === 'pending_admin_review'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => setInspectTransfer(t)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          Inspect
                        </button>

                        {t.status === 'pending_admin_review' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveTransfer(t.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectTransfer(t.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT RESERVE ALLOCATION */}
      {/* ========================================================================= */}
      {showAddReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                {editingReserve ? 'Edit Reserve Allocation' : 'Add New Reserve Allocation'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddReserveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveReserve({
                  beneficiaryName: formData.get('beneficiaryName') as string,
                  category: formData.get('category') as ReserveCategory,
                  walletAddress: formData.get('walletAddress') as string,
                  allocatedAmount: Number(formData.get('allocatedAmount')),
                  releasedAmount: Number(formData.get('releasedAmount') || 0),
                  releaseDate: formData.get('releaseDate') as string,
                  status: formData.get('status') as 'locked' | 'partially_unlocked' | 'fully_unlocked',
                  notes: formData.get('notes') as string,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Beneficiary Name</label>
                <input
                  name="beneficiaryName"
                  defaultValue={editingReserve?.beneficiaryName || ''}
                  required
                  placeholder="e.g. Protocol Core Reserve"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingReserve?.category || 'treasury'}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                  >
                    <option value="treasury">Treasury</option>
                    <option value="team">Team & Engineers</option>
                    <option value="presale">Strategic Presale</option>
                    <option value="liquidity">DEX Liquidity</option>
                    <option value="ecosystem">Community Ecosystem</option>
                    <option value="custom">Custom Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingReserve?.status || 'locked'}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                  >
                    <option value="locked">Locked</option>
                    <option value="partially_unlocked">Partially Unlocked</option>
                    <option value="fully_unlocked">Fully Unlocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Wallet Address</label>
                <input
                  name="walletAddress"
                  defaultValue={editingReserve?.walletAddress || '0x'}
                  required
                  placeholder="0x..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Allocated DC Amount</label>
                  <input
                    name="allocatedAmount"
                    type="number"
                    step="any"
                    defaultValue={editingReserve?.allocatedAmount || 1000000}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Release Date</label>
                  <input
                    name="releaseDate"
                    type="date"
                    defaultValue={editingReserve?.releaseDate || '2027-01-01'}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Notes / Terms</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingReserve?.notes || ''}
                  placeholder="Vesting milestones, governance approvals..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddReserveModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT ACCOUNT LOCK RULE */}
      {/* ========================================================================= */}
      {showAddLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                {editingLock ? 'Edit Account Lock Rule' : 'Add Account Lock Rule'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLockModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveLockRule({
                  accountName: formData.get('accountName') as string,
                  accountAddress: formData.get('accountAddress') as string,
                  accountEmail: formData.get('accountEmail') as string,
                  lockedAmount: Number(formData.get('lockedAmount')),
                  isFullBalanceLock: formData.get('isFullBalanceLock') === 'on',
                  lockReason: formData.get('lockReason') as string,
                  autoUnlockDate: formData.get('autoUnlockDate') as string,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">User Name</label>
                  <input
                    name="accountName"
                    defaultValue={editingLock?.accountName || ''}
                    required
                    placeholder="e.g. Liam O'Connor"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Email</label>
                  <input
                    name="accountEmail"
                    defaultValue={editingLock?.accountEmail || ''}
                    placeholder="user@example.com"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Wallet Address</label>
                <input
                  name="accountAddress"
                  defaultValue={editingLock?.accountAddress || '0x'}
                  required
                  placeholder="0x..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Locked Amount (DC)</label>
                  <input
                    name="lockedAmount"
                    type="number"
                    step="any"
                    defaultValue={editingLock?.lockedAmount || 50000}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Auto Unlock Date</label>
                  <input
                    name="autoUnlockDate"
                    type="text"
                    defaultValue={editingLock?.autoUnlockDate || '2026-12-31'}
                    placeholder="YYYY-MM-DD or indefinite"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Lock</label>
                <input
                  name="lockReason"
                  defaultValue={editingLock?.lockReason || ''}
                  required
                  placeholder="e.g. Migration 40% Custody, Collateral, Compliance review"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLockModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Lock Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: USER CUSTOM MIGRATION OVERRIDE */}
      {/* ========================================================================= */}
      {showUserOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Custom Migration Quota Override
              </h3>
              <button
                type="button"
                onClick={() => setShowUserOverrideModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-white font-bold">{showUserOverrideModal.userName}</div>
                <div className="text-slate-400 font-mono text-[11px]">{showUserOverrideModal.walletAddress}</div>
                <div className="text-amber-400 font-mono">
                  Total Mined: {showUserOverrideModal.totalMined.toLocaleString()} DC
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-white">
                  <span>Custom Release Percentage:</span>
                  <span className="text-amber-400 font-mono text-sm">{overridePercentageInput}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={overridePercentageInput}
                  onChange={(e) => setOverridePercentageInput(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="text-[11px] text-slate-400">
                  Calculated Unlocked: <strong className="text-emerald-400 font-mono">{((showUserOverrideModal.totalMined * overridePercentageInput) / 100).toLocaleString()} DC</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserOverrideModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveUserOverride(showUserOverrideModal.userId, overridePercentageInput)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Apply Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INSPECT TRANSFER & CRYPTOGRAPHIC LEDGER HASH */}
      {/* ========================================================================= */}
      {inspectTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Transfer Request Details & Ledger Hash
              </h3>
              <button
                type="button"
                onClick={() => setInspectTransfer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Request ID:</span>
                  <span className="text-white font-mono">{inspectTransfer.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender:</span>
                  <span className="text-white font-mono">{inspectTransfer.senderAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="text-white font-mono">{inspectTransfer.recipientAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-amber-400 font-bold text-sm font-mono">{inspectTransfer.amount.toLocaleString()} DC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2FA Verified:</span>
                  <span className={inspectTransfer.twoFactorVerified ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {inspectTransfer.twoFactorVerified ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">KYC Status:</span>
                  <span className={inspectTransfer.kycVerified ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {inspectTransfer.kycVerified ? 'VERIFIED' : 'UNVERIFIED (AUTO-HOLD)'}
                  </span>
                </div>
              </div>

              {/* SHA-256 Ledger Hash */}
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1">
                <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Verifiable SHA-256 Cryptographic Hash
                </div>
                <div className="text-[11px] font-mono text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                  {inspectTransfer.ledgerHash}
                </div>
              </div>

              {inspectTransfer.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                  <strong>Rejection Note:</strong> {inspectTransfer.rejectionReason}
                </div>
              )}

              {/* Admin note input for approval/rejection */}
              {inspectTransfer.status === 'pending_admin_review' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Administrative Audit Note</label>
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Enter compliance or audit confirmation notes..."
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setInspectTransfer(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Close
                </button>

                {inspectTransfer.status === 'pending_admin_review' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRejectTransfer(inspectTransfer.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveTransfer(inspectTransfer.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Approve & Release
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT MINING PARAMETERS */}
      {/* ========================================================================= */}
      {showEditMiningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Edit Mining Parameters & Block Emissions
              </h3>
              <button
                type="button"
                onClick={() => setShowEditMiningModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveMiningConfig({
                  miningRewardPerBlock: Number(formData.get('miningRewardPerBlock')),
                  blockTimeSeconds: Number(formData.get('blockTimeSeconds')),
                  currentBlockHeight: Number(formData.get('currentBlockHeight')),
                  nextHalvingBlock: Number(formData.get('nextHalvingBlock')),
                  minedSupply: Number(formData.get('minedSupply')),
                });
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Block Reward (DC / Block)</label>
                  <input
                    name="miningRewardPerBlock"
                    type="number"
                    step="0.1"
                    defaultValue={config.miningRewardPerBlock}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Block Interval (Seconds)</label>
                  <input
                    name="blockTimeSeconds"
                    type="number"
                    step="1"
                    defaultValue={config.blockTimeSeconds}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Block Height</label>
                  <input
                    name="currentBlockHeight"
                    type="number"
                    step="1"
                    defaultValue={config.currentBlockHeight}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Next Halving Target Block</label>
                  <input
                    name="nextHalvingBlock"
                    type="number"
                    step="1"
                    defaultValue={config.nextHalvingBlock}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mined in Last 24H (DC)</label>
                  <input
                    name="mining24hMined"
                    type="number"
                    step="any"
                    defaultValue={config.mining24hMined ?? 28800}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Previous 24H Rate (DC)</label>
                  <input
                    name="previous24hMined"
                    type="number"
                    step="any"
                    defaultValue={config.previous24hMined ?? 25200}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Mined Supply Override (DC)</label>
                <input
                  name="minedSupply"
                  type="number"
                  step="any"
                  defaultValue={config.minedSupply}
                  required
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditMiningModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD / EDIT MINER NODE */}
      {/* ========================================================================= */}
      {showAddMinerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                {editingMiner ? 'Edit Miner Node' : 'Add New Miner Node'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMinerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveMiner({
                  userName: formData.get('userName') as string,
                  userAddress: formData.get('userAddress') as string,
                  hashRateMHs: Number(formData.get('hashRateMHs')),
                  activeWorkers: Number(formData.get('activeWorkers')),
                  validShares: Number(formData.get('validShares')),
                  estDailyYieldDC: Number(formData.get('estDailyYieldDC')),
                  status: formData.get('status') as 'mining' | 'online' | 'idle' | 'suspended',
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Miner Name / Fleet Label</label>
                <input
                  name="userName"
                  defaultValue={editingMiner?.userName || ''}
                  required
                  placeholder="e.g. Genesis Mining Cluster #4"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Wallet Address</label>
                <input
                  name="userAddress"
                  defaultValue={editingMiner?.userAddress || '0x'}
                  required
                  placeholder="0x..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hash Rate (MH/s)</label>
                  <input
                    name="hashRateMHs"
                    type="number"
                    step="0.1"
                    defaultValue={editingMiner?.hashRateMHs || 120.0}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Active Compute Workers</label>
                  <input
                    name="activeWorkers"
                    type="number"
                    step="1"
                    defaultValue={editingMiner?.activeWorkers || 4}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Accepted Valid Shares</label>
                  <input
                    name="validShares"
                    type="number"
                    step="1"
                    defaultValue={editingMiner?.validShares || 25000}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Est. 24h Yield (DC)</label>
                  <input
                    name="estDailyYieldDC"
                    type="number"
                    step="0.1"
                    defaultValue={editingMiner?.estDailyYieldDC || 80.0}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Node Status</label>
                <select
                  name="status"
                  defaultValue={editingMiner?.status || 'mining'}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                >
                  <option value="mining">Mining (Active)</option>
                  <option value="online">Online</option>
                  <option value="idle">Idle</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMinerModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: EDIT MIGRATION POLICY SETTINGS */}
      {/* ========================================================================= */}
      {showEditPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Edit Migration Policy Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowEditPolicyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSavePolicySettings({
                  phaseName: formData.get('phaseName') as string,
                  maxTransferCapPerUser: Number(formData.get('maxTransferCapPerUser')),
                  minMinedThreshold: Number(formData.get('minMinedThreshold')),
                  totalMinedAggregate: Number(formData.get('totalMinedAggregate')),
                  totalEligibleUsers: Number(formData.get('totalEligibleUsers')),
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phase / Epoch Label</label>
                <input
                  name="phaseName"
                  defaultValue={activePolicy.phaseName}
                  required
                  placeholder="e.g. Phase 1: Genesis Mainnet Migration"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Cap Per User (DC)</label>
                  <input
                    name="maxTransferCapPerUser"
                    type="number"
                    step="any"
                    defaultValue={activePolicy.maxTransferCapPerUser}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Mined Threshold (DC)</label>
                  <input
                    name="minMinedThreshold"
                    type="number"
                    step="any"
                    defaultValue={activePolicy.minMinedThreshold}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Mined Aggregate (DC)</label>
                  <input
                    name="totalMinedAggregate"
                    type="number"
                    step="any"
                    defaultValue={activePolicy.totalMinedAggregate}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Eligible Miners</label>
                  <input
                    name="totalEligibleUsers"
                    type="number"
                    step="1"
                    defaultValue={activePolicy.totalEligibleUsers}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditPolicyModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: EDIT TOKENOMICS SUPPLIES & CAPS */}
      {/* ========================================================================= */}
      {showEditTokenomicsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Edit Tokenomics Supplies & Caps
              </h3>
              <button
                type="button"
                onClick={() => setShowEditTokenomicsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveTokenomicsSupplies({
                  totalSupply: Number(formData.get('totalSupply')),
                  circulatingSupply: Number(formData.get('circulatingSupply')),
                  reserveSupply: Number(formData.get('reserveSupply')),
                  presaleSupply: Number(formData.get('presaleSupply')),
                });
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Max Cap (DC)</label>
                  <input
                    name="totalSupply"
                    type="number"
                    step="any"
                    defaultValue={config.totalSupply}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">True Circulating Supply</label>
                  <input
                    name="circulatingSupply"
                    type="number"
                    step="any"
                    defaultValue={config.circulatingSupply}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Platform Reserve Supply</label>
                  <input
                    name="reserveSupply"
                    type="number"
                    step="any"
                    defaultValue={config.reserveSupply}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Strategic Presale Supply</label>
                  <input
                    name="presaleSupply"
                    type="number"
                    step="any"
                    defaultValue={config.presaleSupply}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditTokenomicsModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Supplies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

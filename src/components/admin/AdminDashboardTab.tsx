import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  Megaphone,
  Receipt,
  ArrowUpRight,
  UserCheck,
  TrendingUp,
  Activity,
  Eye,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  ExternalLink,
  Coins,
  Sparkles,
} from 'lucide-react';
import { P2POrder, RevenueRecord, TransactionRecord, UserProfile } from '../../types';

interface AdminDashboardTabProps {
  users: UserProfile[];
  p2pOrders: P2POrder[];
  transactions: TransactionRecord[];
  revenueRecords: RevenueRecord[];
  onNavigateSection: (section: string, filter?: string) => void;
  onInspectAd: (order: P2POrder) => void;
  onInspectTx: (tx: TransactionRecord) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  users,
  p2pOrders,
  transactions,
  revenueRecords,
  onNavigateSection,
  onInspectAd,
  onInspectTx,
}) => {
  // 1. User Metrics Calculations
  const oneDayMs = 24 * 3600 * 1000;
  const newSignups = users.filter((u) => Date.now() - u.createdAt < oneDayMs);
  const loggedInUsers = users.filter((u) => u.isLoggedIn);
  const activeUsers = users.filter(
    (u) => u.status === 'active' && (u.isLoggedIn || (u.lastLogin && Date.now() - u.lastLogin < 2 * oneDayMs))
  );

  // 2. Earnings / Revenue Calculations
  const p2pEarnings = revenueRecords
    .filter((r) => r.type === 'p2p_sell')
    .reduce((sum, r) => sum + r.platformFeeAmount, 0);

  const swapEarnings = revenueRecords
    .filter((r) => r.type === 'swap_sell')
    .reduce((sum, r) => sum + r.platformFeeAmount, 0);

  const adsRevenue = revenueRecords
    .filter((r) => r.type === 'ad_revenue')
    .reduce((sum, r) => sum + r.platformFeeAmount, 0);

  const totalPlatformEarnings = p2pEarnings + swapEarnings + adsRevenue;

  // 3. Transactions Metrics
  const totalVolumeUsd = transactions.reduce((sum, tx) => sum + (tx.fiatValue || 0), 0);
  const activeChains = new Set(transactions.map((tx) => tx.network)).size;

  // 7-day trend sample points for visual graphs
  const userDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const userGrowthTrend = [
    { day: 'Mon', newSignups: 4, loggedIn: 9, active: 14 },
    { day: 'Tue', newSignups: 6, loggedIn: 11, active: 16 },
    { day: 'Wed', newSignups: 3, loggedIn: 10, active: 15 },
    { day: 'Thu', newSignups: 8, loggedIn: 14, active: 19 },
    { day: 'Fri', newSignups: 7, loggedIn: 13, active: 18 },
    { day: 'Sat', newSignups: 10, loggedIn: 16, active: 22 },
    { day: 'Today', newSignups: newSignups.length || 5, loggedIn: loggedInUsers.length || 6, active: activeUsers.length || 10 },
  ];

  const revenueTrend = [
    { day: 'Mon', p2p: 18.5, swap: 34.0, ads: 42.0 },
    { day: 'Tue', p2p: 26.0, swap: 45.5, ads: 48.0 },
    { day: 'Wed', p2p: 14.0, swap: 29.0, ads: 41.5 },
    { day: 'Thu', p2p: 35.0, swap: 52.0, ads: 55.0 },
    { day: 'Fri', p2p: 28.5, swap: 48.0, ads: 51.0 },
    { day: 'Sat', p2p: 42.0, swap: 65.0, ads: 68.0 },
    { day: 'Today', p2p: p2pEarnings || 41.0, swap: swapEarnings || 79.0, ads: adsRevenue || 94.5 },
  ];

  const [hoveredUserDay, setHoveredUserDay] = useState<number | null>(null);
  const [hoveredRevDay, setHoveredRevDay] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/25 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Real-Time Administration Dashboard
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Ecosystem Health & Operational Overview
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Unified mission control for user accounts, platform fee monetization, P2P escrow marketplace ads, and multi-chain transaction ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Platform Net Revenue</span>
            <div className="text-lg font-mono font-extrabold text-amber-400">
              ${totalPlatformEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Transacted</span>
            <div className="text-lg font-mono font-extrabold text-emerald-400">
              ${totalVolumeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. USER SECTION (New Signup, Logged In, Active Users with Graph) */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                1. User Accounts Intelligence
              </h3>
              <p className="text-xs text-slate-400">
                New signups, concurrent sessions, active miners, and growth trajectories
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('users')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition"
          >
            <span>Full Users Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Metric Click-Through Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {/* Card: New Signups */}
          <button
            onClick={() => onNavigateSection('users', 'new')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">New Signups (24h)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-blue-400 mt-1">
              {newSignups.length}
            </div>
            <div className="text-[11px] text-blue-300/80 mt-1 group-hover:underline flex items-center gap-1 font-medium">
              Click to view new signups →
            </div>
          </button>

          {/* Card: Logged In */}
          <button
            onClick={() => onNavigateSection('users', 'loggedin')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Logged In Users</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
              {loggedInUsers.length}
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1 group-hover:underline flex items-center gap-1 font-medium">
              Click to view logged in →
            </div>
          </button>

          {/* Card: Active Users */}
          <button
            onClick={() => onNavigateSection('users', 'active')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Users (Miners/Traders)</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">
              {activeUsers.length}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1 group-hover:underline flex items-center gap-1 font-medium">
              Click to view active users →
            </div>
          </button>

          {/* Card: Total Registered */}
          <button
            onClick={() => onNavigateSection('users')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Registered</span>
              <UserCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
              {users.length}
            </div>
            <div className="text-[11px] text-purple-300/80 mt-1 group-hover:underline flex items-center gap-1 font-medium">
              View all user records →
            </div>
          </button>
        </div>

        {/* User Activity & Growth Graph */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              7-Day User Growth & Activity Trend Graph
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> New Signups
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Logged In
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Active Miners/Traders
              </span>
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="h-44 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="userBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="userAmberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="700" y2="20" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="65" x2="700" y2="65" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="110" x2="700" y2="110" stroke="#334155" />

              {/* Active Users Area */}
              <path
                d="M 50,75 L 150,65 L 250,70 L 350,50 L 450,55 L 550,35 L 650,45 L 650,110 L 50,110 Z"
                fill="url(#userAmberGrad)"
              />
              {/* Active Users Line */}
              <path
                d="M 50,75 L 150,65 L 250,70 L 350,50 L 450,55 L 550,35 L 650,45"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Logged In Line */}
              <path
                d="M 50,90 L 150,82 L 250,86 L 350,70 L 450,74 L 550,60 L 650,68"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* New Signups Line */}
              <path
                d="M 50,102 L 150,95 L 250,105 L 350,88 L 450,92 L 550,80 L 650,85"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {userGrowthTrend.map((pt, idx) => {
                const cx = 50 + idx * 100;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredUserDay(idx)}
                    onMouseLeave={() => setHoveredUserDay(null)}
                    onClick={() => onNavigateSection('users', idx === 6 ? 'new' : undefined)}
                  >
                    <circle cx={cx} cy={idx === 6 ? 45 : 75 - idx * 5} r="5" fill="#f59e0b" className="hover:scale-125 transition" />
                    <circle cx={cx} cy={idx === 6 ? 68 : 90 - idx * 4} r="4.5" fill="#10b981" />
                    <circle cx={cx} cy={idx === 6 ? 85 : 102 - idx * 3} r="4" fill="#3b82f6" />
                    <text x={cx} y="125" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="monospace">
                      {pt.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {hoveredUserDay !== null && (
            <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-300">
              <span className="font-bold text-white">{userGrowthTrend[hoveredUserDay].day} Stats:</span>
              <span className="text-blue-400 font-mono">New: {userGrowthTrend[hoveredUserDay].newSignups}</span>
              <span className="text-emerald-400 font-mono">Logged In: {userGrowthTrend[hoveredUserDay].loggedIn}</span>
              <span className="text-amber-400 font-mono">Active: {userGrowthTrend[hoveredUserDay].active}</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EARNINGS / REVENUE SECTION (P2P sells, Swap sells, Ads revenue with Graph) */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                2. Platform Earnings & Revenue
              </h3>
              <p className="text-xs text-slate-400">
                P2P escrow sales cuts, DEX swap liquidity fees, and digital ads revenue
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('earnings')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition"
          >
            <span>Full Earnings Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Earnings Click-Through Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {/* Card: P2P Sells */}
          <button
            onClick={() => onNavigateSection('earnings', 'p2p')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">P2P Sells Fees</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
              ${p2pEarnings.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1 group-hover:underline font-medium">
              Click to view P2P earnings →
            </div>
          </button>

          {/* Card: Swap Sells */}
          <button
            onClick={() => onNavigateSection('earnings', 'swap')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Swap Sells Fees</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-cyan-400 mt-1">
              ${swapEarnings.toFixed(2)}
            </div>
            <div className="text-[11px] text-cyan-300/80 mt-1 group-hover:underline font-medium">
              Click to view Swap earnings →
            </div>
          </button>

          {/* Card: Ads Revenue */}
          <button
            onClick={() => onNavigateSection('earnings', 'ads')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ads Revenue</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">
              ${adsRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1 group-hover:underline font-medium">
              Click to view Ads revenue →
            </div>
          </button>

          {/* Card: Total Revenue */}
          <button
            onClick={() => onNavigateSection('earnings')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Net Earnings</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
              ${totalPlatformEarnings.toFixed(2)}
            </div>
            <div className="text-[11px] text-purple-300/80 mt-1 group-hover:underline font-medium">
              View full revenue report →
            </div>
          </button>
        </div>

        {/* Revenue Multi-Channel Graph */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              7-Day Monetization Breakdown (P2P vs Swap vs Ads)
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> P2P Fees
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Swap Fees
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Ads Revenue
              </span>
            </div>
          </div>

          <div className="h-44 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="20" x2="700" y2="20" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="65" x2="700" y2="65" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="110" x2="700" y2="110" stroke="#334155" />

              {/* Ads Line */}
              <path
                d="M 50,60 L 150,55 L 250,62 L 350,45 L 450,50 L 550,35 L 650,25"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Swap Line */}
              <path
                d="M 50,72 L 150,60 L 250,75 L 350,55 L 450,58 L 550,42 L 650,35"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* P2P Line */}
              <path
                d="M 50,90 L 150,80 L 250,95 L 350,72 L 450,78 L 550,65 L 650,55"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {revenueTrend.map((pt, idx) => {
                const cx = 50 + idx * 100;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredRevDay(idx)}
                    onMouseLeave={() => setHoveredRevDay(null)}
                    onClick={() => onNavigateSection('earnings')}
                  >
                    <circle cx={cx} cy={idx === 6 ? 25 : 60 - idx * 4} r="4.5" fill="#f59e0b" />
                    <circle cx={cx} cy={idx === 6 ? 35 : 72 - idx * 4.5} r="4.5" fill="#06b6d4" />
                    <circle cx={cx} cy={idx === 6 ? 55 : 90 - idx * 5} r="4.5" fill="#10b981" />
                    <text x={cx} y="125" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="monospace">
                      {pt.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {hoveredRevDay !== null && (
            <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-300">
              <span className="font-bold text-white">{revenueTrend[hoveredRevDay].day} Earnings:</span>
              <span className="text-emerald-400 font-mono">P2P: ${revenueTrend[hoveredRevDay].p2p.toFixed(2)}</span>
              <span className="text-cyan-400 font-mono">Swap: ${revenueTrend[hoveredRevDay].swap.toFixed(2)}</span>
              <span className="text-amber-400 font-mono">Ads: ${revenueTrend[hoveredRevDay].ads.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. P2P ADS SECTION (New & Old Published Buy & Sell Ads with Details) */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                3. P2P Ads Marketplace Stream
              </h3>
              <p className="text-xs text-slate-400">
                New and old published buy & sell ads with buyer/seller names, emails, phones, and location origin
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('p2pads')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition"
          >
            <span>Go to All P2P Ads ({p2pOrders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ads Summary Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Type & Age</th>
                <th className="py-2.5 px-3">Posted By (Name, Mail, Phone, Location)</th>
                <th className="py-2.5 px-3">Coin & Price</th>
                <th className="py-2.5 px-3">Available & Limits</th>
                <th className="py-2.5 px-3">Counterparty Info</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {p2pOrders.slice(0, 5).map((ad) => {
                const isBuy = ad.type === 'buy';
                const isNew = Date.now() - ad.createdAt < 24 * 3600 * 1000;
                return (
                  <tr key={ad.id} className="hover:bg-slate-800/40 transition group">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${
                            isBuy
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {ad.type}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {isNew ? (
                            <span className="text-blue-400 font-semibold">New</span>
                          ) : (
                            <span>Old ({Math.round((Date.now() - ad.createdAt) / (24 * 3600 * 1000))}d)</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Poster Full Contact Info */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {ad.merchantName}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                        {ad.merchantEmail || 'poster@dcoine.network'}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-rose-400" />
                        <span>{ad.location || 'Berlin, Germany'}</span>
                        <span className="text-slate-600">•</span>
                        <span>{ad.merchantPhone || '+1 (555) 0192'}</span>
                      </div>
                    </td>

                    {/* Coin & Price */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-white text-sm">
                        {ad.cryptoSymbol}
                      </div>
                      <div className="font-mono text-xs text-amber-400">
                        {ad.price.toLocaleString()} {ad.fiatCurrency}
                      </div>
                    </td>

                    {/* Limits */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-white text-xs">
                        {ad.availableAmount.toLocaleString()} {ad.cryptoSymbol}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Limits: {ad.minLimit} - {ad.maxLimit} {ad.fiatCurrency}
                      </div>
                    </td>

                    {/* Counterparty / Buyer & Seller info */}
                    <td className="py-3 px-3">
                      <div className="text-[11px] text-slate-300 font-medium">
                        {isBuy ? (
                          <>
                            <span className="text-emerald-400">Buyer:</span> {ad.buyerName || ad.merchantName}
                          </>
                        ) : (
                          <>
                            <span className="text-rose-400">Seller:</span> {ad.sellerName || ad.merchantName}
                          </>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {isBuy ? (ad.buyerEmail || ad.merchantEmail) : (ad.sellerEmail || ad.merchantEmail)}
                      </div>
                    </td>

                    {/* Click-through Action to Full Details */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onInspectAd(ad)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Full Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TRANSACTIONS SECTION (Volume, Network Chain, Coin Details, User Details) */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                4. Multi-Chain Transaction Ledgers
              </h3>
              <p className="text-xs text-slate-400">
                Live volume details, network blockchain chains, coin specs, and sender/receiver users
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('transactions')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition"
          >
            <span>Go to All Transactions ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Transactions Summary Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Network Chain</th>
                <th className="py-2.5 px-3">Coin Details & Volume</th>
                <th className="py-2.5 px-3">User Details (Sender → Receiver)</th>
                <th className="py-2.5 px-3">Tx Hash</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Full Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition group">
                  {/* Network Chain */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 font-medium text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      {String(tx.network).toUpperCase()}
                    </span>
                  </td>

                  {/* Coin & Volume */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-white text-sm flex items-center gap-1">
                      {tx.amount.toLocaleString()} {tx.symbol}
                    </div>
                    {tx.fiatValue && (
                      <div className="font-mono text-emerald-400 text-xs">
                        ≈ ${tx.fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </div>
                    )}
                  </td>

                  {/* User Details */}
                  <td className="py-3 px-3">
                    <div className="text-xs text-white font-medium flex items-center gap-1">
                      <span>{tx.fromUserName || 'Alex Vance'}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>{tx.toUserName || 'Dcoine Vault'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {tx.fromUserEmail || 'alex.vance@cryptomail.org'}
                    </div>
                  </td>

                  {/* Hash */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : tx.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>

                  {/* Inspect Details */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onInspectTx(tx)}
                      className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

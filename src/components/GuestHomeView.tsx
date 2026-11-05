import React from 'react';
import {
  Pickaxe,
  WalletCards,
  ArrowLeftRight,
  Repeat2,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Lock,
  Globe,
  Coins,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { BlockchainNetwork, TokenItem } from '../types';
import { StorageService } from '../services/storage';

interface GuestHomeViewProps {
  tokens: TokenItem[];
  activeNetwork: BlockchainNetwork;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onNavigateTab: (tab: string) => void;
}

export const GuestHomeView: React.FC<GuestHomeViewProps> = ({
  tokens,
  activeNetwork,
  onOpenAuthModal,
  onNavigateTab,
}) => {
  const [heroContent, setHeroContent] = React.useState(() => StorageService.getHeroContent());

  React.useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('dcoine_cms_bus');
        bc.onmessage = (e) => {
          if (e.data?.type === 'HERO_UPDATED') {
            setHeroContent(e.data.payload);
          }
        };
      }
    } catch {}

    const handleStorage = () => {
      setHeroContent(StorageService.getHeroContent());
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto px-3 sm:px-4">
      {/* 0. PROMO BANNER (IF ACTIVE IN CMS) */}
      {heroContent.isBannerActive && heroContent.promoBannerText && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>{heroContent.promoBannerText}</span>
          </div>
          <button
            onClick={() => onOpenAuthModal('signup')}
            className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] whitespace-nowrap hover:bg-amber-400 transition"
          >
            Claim Now
          </button>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl text-center sm:text-left">
        {/* Glow Halos */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4 leading-none">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5" />
            <span>{heroContent.badgeText || 'Next-Generation Decentralized Coin Ecosystem'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-none">
            {heroContent.headline || 'Sovereign Web3 Wealth,'}{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              {heroContent.highlightWord || '24H Cloud Mining'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
            {heroContent.subheadline || 'Mine native DCOIN daily with zero battery drain via Proof-of-Engagement.'}
          </p>

          {/* High-Converting Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onOpenAuthModal('signup')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-sm tracking-wide shadow-xl shadow-amber-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Pickaxe className="w-4 h-4 fill-slate-950" />
              <span>Start Cloud Mining (Free)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuthModal('login')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Account</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Non-Custodial Vaults</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Zero Battery Drain</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Smart Escrow Protected</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME PROTOCOL TELEMETRY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 text-center shadow-lg">
          <span className="text-[11px] text-slate-400 font-medium block">Daily Mining Yield</span>
          <span className="text-lg sm:text-2xl font-extrabold font-mono text-amber-400 mt-0.5 block">
            1.00 DCOIN / 24H
          </span>
          <span className="text-[10px] text-slate-500">Base rate + referral boosts</span>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 text-center shadow-lg">
          <span className="text-[11px] text-slate-400 font-medium block">Supported Blockchains</span>
          <span className="text-lg sm:text-2xl font-extrabold font-mono text-white mt-0.5 block">
            7 Networks
          </span>
          <span className="text-[10px] text-slate-500">EVM, Solana &amp; L2 Rollups</span>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 text-center shadow-lg">
          <span className="text-[11px] text-slate-400 font-medium block">P2P Escrow Guarantee</span>
          <span className="text-lg sm:text-2xl font-extrabold font-mono text-emerald-400 mt-0.5 block">
            0% Counterparty Risk
          </span>
          <span className="text-[10px] text-slate-500">Multi-sig time-lock contracts</span>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 text-center shadow-lg">
          <span className="text-[11px] text-slate-400 font-medium block">Active Network Uptime</span>
          <span className="text-lg sm:text-2xl font-extrabold font-mono text-cyan-400 mt-0.5 block">
            99.98%
          </span>
          <span className="text-[10px] text-slate-500">Decentralized validator mesh</span>
        </div>
      </div>

      {/* 3. FOUR CORE PILLARS OF THE ECOSYSTEM */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">The Four Ecosystem Pillars</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A comprehensive Web3 portal engineered for sovereign self-custody and real daily utility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pillar 1: 24H Cloud Mining */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Pickaxe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">24-Hour Proof-of-Engagement Mining</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Activate a 24-hour cloud mining session with a single click. Every active user receives 1 DC every 24 hours. Invite peers with your mandatory referral code to boost emissions by +0.1 DC/24h per active invitee.
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono">
                10 Active Referrals = +1.00 DC / 24H Bonus
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuthModal('signup')}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Join Mining Pool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2: Multi-Chain Non-Custodial Vault */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                <WalletCards className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Non-Custodial Multi-Chain Vault</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete self-sovereignty. Generate standard 12-word BIP-39 mnemonic seed phrases and 256-bit private keys, or authorize real EIP-1193 Web3 providers (MetaMask, Trust Wallet, Rabby, Coinbase, Phantom, and Ledger).
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono">
                23+ Web3 &amp; Hardware Wallet Integrations
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('wallet')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explore Multi-Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3: Audited P2P Escrow Market */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Decentralized P2P Escrow Marketplace</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Buy and sell cryptocurrencies directly for fiat currency (USD, EUR, GBP, INR, BDT, CAD). Automated smart contracts lock seller crypto before transactions begin, guaranteeing complete buyer and merchant safety.
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono">
                Real-Time Trade Chat &amp; Arbitration Desk
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('p2p')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View P2P Market</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 4: Multi-Hop DEX Liquidity Swap */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
                <Repeat2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Hop DEX Liquidity Swap</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Exchange tokens with deep routing across EVM and Solana liquidity pools. Features configurable slippage tolerance, gas estimation guards, price impact protection, and custom token contract imports.
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono">
                Fast Automated Routing &amp; Minimal Gas Fees
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('swap')}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Launch DEX Swap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. THREE EASY STEPS TO GET STARTED */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="text-center max-w-md mx-auto space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Simple Onboarding</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">How to Start in Under 60 Seconds</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Create Account</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Register using your inviter's referral code to instantly unlock 24-hour mining access and a 10% hashrate boost.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Activate 24H Mining</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tap &quot;Start 24H Mining Session&quot;. Your device is not burdened with battery or CPU strain—rewards calculate on-chain.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Trade &amp; Swap</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deposit crypto to your non-custodial vault, swap across 7 chains on DEX, or sell via P2P escrow for local fiat.
            </p>
          </div>
        </div>
      </div>

      {/* 5. HIGH-CONVERSION BOTTOM CALL TO ACTION BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-6 sm:p-8 text-slate-950 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 bg-slate-950/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Zero Barriers to Entry
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Ready to Begin Earning DCOIN Today?
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-900/90 mt-1 max-w-lg">
            Join thousands of decentralized pioneers worldwide mining Dcoine, trading securely on P2P escrow, and managing non-custodial vaults.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onOpenAuthModal('signup')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-950 text-white hover:bg-slate-900 font-extrabold text-xs sm:text-sm tracking-wide shadow-xl transition transform active:scale-95 cursor-pointer"
          >
            Create Free Mining Account
          </button>
          <button
            type="button"
            onClick={() => onOpenAuthModal('login')}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-950/10 hover:bg-slate-950/20 border border-slate-950/25 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

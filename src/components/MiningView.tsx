import React, { useState, useEffect } from 'react';
import {
  Pickaxe,
  Zap,
  Clock,
  Users,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MiningSession, Referee, UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface MiningViewProps {
  user: UserProfile;
  miningSession: MiningSession;
  onUpdateSession: (session: MiningSession) => void;
  onOpenAuthModal: () => void;
}

export const MiningView: React.FC<MiningViewProps> = ({
  user,
  miningSession,
  onUpdateSession,
  onOpenAuthModal,
}) => {
  const [referees, setReferees] = useState<Referee[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; progress: number }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
    progress: 0,
  });
  const [currentSessionMined, setCurrentSessionMined] = useState<number>(miningSession.currentSessionMined);

  useEffect(() => {
    setReferees(StorageService.getReferees());
  }, []);

  // Mining rate formulas:
  // 1. Every active user mines exactly 1 DC every 24 hours (base rate = 1/24 DC/hr ≈ 0.041667 DC/hr)
  // 2. Every 10 active referrals mining generate 1 DC / 24h (1 active referral = 0.1 DC / 24h = 0.1/24 DC/hr)
  const activeRefereesCount = referees.filter((r) => r.status === 'active').length;
  const baseReward24h = 1.0; // 1 DC per 24h
  const referralBonus24h = activeRefereesCount * 0.1; // 0.1 DC per active referral / 24h (10 refs = 1 DC)
  const total24hYield = baseReward24h + referralBonus24h; // Total DC per 24 hours
  const hourlyMiningRate = total24hYield / 24; // Effective hourly hashrate
  const referralBonusRate = activeRefereesCount * 0.1; // Multiplier representation (+10% per active ref)

  // 24-hour timer tick
  useEffect(() => {
    const updateCountdown = () => {
      if (!miningSession.isActive || !miningSession.startTime || !miningSession.endTime) {
        setTimeLeft({ hours: 24, minutes: 0, seconds: 0, progress: 0 });
        return;
      }

      const now = Date.now();
      const totalDuration = 24 * 3600 * 1000;
      const remainingMs = miningSession.endTime - now;

      if (remainingMs <= 0) {
        // Session finished, ready to claim exact full yield
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, progress: 100 });
        setCurrentSessionMined(parseFloat(total24hYield.toFixed(4)));
        return;
      }

      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      const elapsed = totalDuration - remainingMs;
      const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      const minedSoFar = (elapsed / (1000 * 3600)) * hourlyMiningRate;

      setTimeLeft({ hours, minutes, seconds, progress });
      setCurrentSessionMined(parseFloat(minedSoFar.toFixed(4)));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [miningSession, hourlyMiningRate, total24hYield]);

  const referralLink = `${window.location.origin}/?ref=${user.referralCode}`;

  const handleStartMining = () => {
    if (!user.referredBy && !user.id) {
      onOpenAuthModal();
      return;
    }

    const now = Date.now();
    const updated: MiningSession = {
      ...miningSession,
      isActive: true,
      startTime: now,
      endTime: now + 24 * 3600 * 1000,
      baseRatePerHour: parseFloat((1 / 24).toFixed(6)),
      boostMultiplier: parseFloat((total24hYield / baseReward24h).toFixed(4)),
      referralRatePerActiveRef: parseFloat((0.1 / 24).toFixed(6)),
      currentSessionMined: 0,
    };

    onUpdateSession(updated);
    StorageService.saveMiningSession(updated);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a'],
    });
  };

  const handleClaim = () => {
    const claimed = currentSessionMined > 0 ? currentSessionMined : parseFloat(total24hYield.toFixed(4));
    const updated: MiningSession = {
      ...miningSession,
      isActive: false,
      startTime: null,
      endTime: null,
      currentSessionMined: 0,
      totalMinedLifetime: parseFloat((miningSession.totalMinedLifetime + claimed).toFixed(4)),
      lastClaimTime: Date.now(),
      consecutiveDays: miningSession.consecutiveDays + 1,
      lockedMinedBalance: parseFloat(((miningSession.lockedMinedBalance || 0) + claimed).toFixed(4)),
    };

    // Credit to tokens - strictly locked in native platform DC wallet
    const tokens = StorageService.getTokens();
    const dcoinIndex = tokens.findIndex((t) => t.id === 'dcoin');
    if (dcoinIndex !== -1) {
      tokens[dcoinIndex].balance = parseFloat((tokens[dcoinIndex].balance + claimed).toFixed(4));
      tokens[dcoinIndex].lockedBalance = parseFloat(((tokens[dcoinIndex].lockedBalance || 0) + claimed).toFixed(4));
      StorageService.saveTokens(tokens);
    }

    // Credit to native wallet locked balance
    const wallets = StorageService.getWallets();
    const nativeWallet = wallets.find((w) => w.network === 'dcoine' || w.isNative) || wallets[0];
    if (nativeWallet) {
      nativeWallet.lockedBalance = parseFloat(((nativeWallet.lockedBalance || 0) + claimed).toFixed(4));
      StorageService.saveWallets(wallets);
    }

    // Credit to user profile lockedMinedBalance
    const currentUser = StorageService.getUser();
    currentUser.lockedMinedBalance = parseFloat(((currentUser.lockedMinedBalance || 0) + claimed).toFixed(4));
    StorageService.saveUser(currentUser);

    StorageService.addTransaction({
      id: `tx-claim-${Date.now()}`,
      type: 'mine',
      symbol: 'DCOIN',
      amount: claimed,
      network: 'dcoine',
      hash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(20)), (b) => b.toString(16).padStart(2, '0')).join('')}`,
      status: 'completed',
      timestamp: Date.now(),
    });

    onUpdateSession(updated);
    StorageService.saveMiningSession(updated);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#eab308', '#22c55e', '#3b82f6'],
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Dcoine Ecosystem Mining',
          text: `Join Dcoine decentralized cloud mining using my exclusive referral code ${user.referralCode} and get a 10% hashrate boost!`,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const isSessionFinished = miningSession.isActive && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className="space-y-5 pb-24 max-w-3xl mx-auto px-3 sm:px-4">
      {/* Top Banner & Title */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2.5 leading-none">
              <Zap className="w-3.5 h-3.5 fill-amber-400 flex-shrink-0" />
              <span className="inline-block leading-normal">Layer-1 Proof of Engagement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              24-Hour Cloud Mining
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
              Start one session every 24 hours. No battery drain, zero hardware overhead. Earn native <span className="text-amber-400 font-bold">DCOIN</span> tokens continuously.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
            <span className="text-xs text-slate-400">Total Lifetime Mined</span>
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-2xl border border-slate-800">
              <img src="/logo.png" alt="DCOIN" className="w-5 h-5 rounded-full" />
              <span className="text-base sm:text-lg font-mono font-bold text-amber-300">
                {miningSession.totalMinedLifetime.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">DCOIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mining Reactor Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center">
          {/* Animated Reactor Core with Progress Ring */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-3">
            {/* Outer spinning ring */}
            <div
              className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-1000 ${
                miningSession.isActive
                  ? 'border-amber-400/40 animate-[spin_18s_linear_infinite]'
                  : 'border-slate-800'
              }`}
            />

            {/* Glowing background halo */}
            <div
              className={`absolute w-36 h-36 rounded-full blur-xl transition-all duration-700 ${
                miningSession.isActive ? 'bg-amber-500/25 animate-pulse' : 'bg-slate-800/20'
              }`}
            />

            {/* Central Coin & Button */}
            <div className="relative z-10 flex flex-col items-center justify-center p-4">
              <img
                src="/logo.png"
                alt="Dcoine Logo"
                className={`w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-transform duration-500 ${
                  miningSession.isActive ? 'scale-105 animate-[bounce_4s_ease-in-out_infinite]' : 'opacity-85'
                }`}
              />

              <div className="mt-2 text-center">
                <span className="text-xs text-slate-400 font-medium">Session Yield</span>
                <div className="text-lg sm:text-xl font-bold font-mono text-amber-300">
                  +{currentSessionMined.toFixed(4)} <span className="text-xs text-amber-400">DCOIN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown & Status */}
          <div className="w-full max-w-sm mt-3 space-y-3">
            {miningSession.isActive ? (
              <>
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Mining Active (24H Cycle)
                  </span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    style={{ width: `${timeLeft.progress}%` }}
                  />
                </div>

                {isSessionFinished ? (
                  <button
                    onClick={handleClaim}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition transform active:scale-98 inline-flex items-center justify-center gap-2.5 text-center cursor-pointer"
                  >
                    <Award className="w-5 h-5 flex-shrink-0" />
                    <span>Claim {currentSessionMined.toFixed(2)} DCOIN Reward</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 inline-flex items-center justify-center gap-2 text-center w-full">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Session resets automatically when 24 hours conclude.</span>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleStartMining}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/30 transition transform active:scale-98 inline-flex items-center justify-center gap-2.5 text-center cursor-pointer"
              >
                <Pickaxe className="w-5 h-5 fill-slate-950 flex-shrink-0" />
                <span>START 24H MINING SESSION</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Hashrate & Mining Power Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Base Rate</span>
            <span className="text-sm font-bold text-slate-100 font-mono mt-0.5 block">
              1.00 DC
            </span>
            <span className="text-[10px] text-slate-500">24h = 1 DC ({(1/24).toFixed(4)}/h)</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Referral Boost</span>
            <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">
              +{referralBonus24h.toFixed(2)} DC
            </span>
            <span className="text-[10px] text-amber-500/80">10 Refs = 1 DC ({activeRefereesCount} Active)</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Total 24H Yield</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
              {total24hYield.toFixed(2)} DC
            </span>
            <span className="text-[10px] text-emerald-500/80">{hourlyMiningRate.toFixed(4)} DC/h</span>
          </div>
        </div>

        {/* Native Platform Wallet Lock Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200/90 text-left">
          <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-400">Locked in Native Platform Wallet: </span>
            All mined DC rewards are securely credited and locked in your native platform DC wallet. Mined coins cannot be moved or transferred to other external wallets.
          </div>
        </div>
      </div>

      {/* Mandatory Referral & Team Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">First-Layer Referral System</h2>
              <p className="text-xs text-slate-400">
                10 active referrals = +1 DC/24h (+0.1 DC/24h per active miner). Mined DC is locked in native wallet.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-xs font-semibold leading-none tracking-wide whitespace-nowrap shadow-sm text-center">
            {referees.length} Referees
          </span>
        </div>

        {/* Shareable Link Generator */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 overflow-hidden">
              <span className="truncate">{referralLink}</span>
              <button
                onClick={handleCopyLink}
                className="ml-2 text-amber-400 hover:text-amber-300 p-1 flex-shrink-0"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-amber-400 font-semibold"
              >
                <span>Code: {user.referralCode}</span>
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Anyone clicking your link auto-fills your code during registration!</span>
          </div>
        </div>

        {/* Referees List */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Your Mining Team ({referees.length})
          </h3>
          <div className="space-y-2">
            {referees.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-amber-400">
                    {ref.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">{ref.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                          ref.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ref.status === 'active' ? 'Mining Now' : 'Idle'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{ref.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    +{ref.dcoinEarnedBonus.toFixed(1)} DCOIN
                  </span>
                  <span className="block text-[10px] text-slate-500">Tier-1 Bonus</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

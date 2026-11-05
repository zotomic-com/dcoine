import React, { useState, useEffect } from 'react';
import {
  Repeat2,
  ArrowDownUp,
  Settings,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BlockchainNetwork, NetworkId, PlatformCommissionConfig, SwapConfig, TokenItem } from '../types';
import { NETWORKS, StorageService } from '../services/storage';
import { generateTxHash } from '../utils/crypto';

interface SwapViewProps {
  tokens: TokenItem[];
  activeNetwork: BlockchainNetwork;
  onSelectNetwork: (network: BlockchainNetwork) => void;
  onUpdateTokens: (tokens: TokenItem[]) => void;
  onOpenAdmin?: () => void;
}

export const SwapView: React.FC<SwapViewProps> = ({
  tokens,
  activeNetwork,
  onSelectNetwork,
  onUpdateTokens,
  onOpenAdmin,
}) => {
  // Live admin swap configuration
  const [swapConfig, setSwapConfig] = useState<SwapConfig>(() => StorageService.getSwapConfig());
  const [commissionConfig, setCommissionConfig] = useState<PlatformCommissionConfig>(() =>
    StorageService.getCommissionConfig()
  );

  // Listen for storage changes or update on mount
  useEffect(() => {
    setSwapConfig(StorageService.getSwapConfig());
    setCommissionConfig(StorageService.getCommissionConfig());

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('dcoine_commissions_bus');
        bc.onmessage = (event) => {
          if (event.data?.type === 'COMMISSIONS_UPDATED') {
            setCommissionConfig(event.data.payload || StorageService.getCommissionConfig());
          }
        };
      }
    } catch {}

    const handleStorage = () => {
      setSwapConfig(StorageService.getSwapConfig());
      setCommissionConfig(StorageService.getCommissionConfig());
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Filter tokens strictly based on Admin configuration: enabledInSwap !== false
  const activeSwapTokens = tokens.filter((t) => t.enabledInSwap !== false);
  const availableTokens = activeSwapTokens.length > 0 ? activeSwapTokens : tokens;

  const [fromTokenSymbol, setFromTokenSymbol] = useState<string>(() => {
    const defaultFrom = swapConfig.defaultFromToken || 'DCOIN';
    return availableTokens.some((t) => t.symbol === defaultFrom)
      ? defaultFrom
      : availableTokens[0]?.symbol || 'DCOIN';
  });

  const [toTokenSymbol, setToTokenSymbol] = useState<string>(() => {
    const defaultTo = swapConfig.defaultToToken || 'USDT';
    return availableTokens.some((t) => t.symbol === defaultTo)
      ? defaultTo
      : availableTokens[1]?.symbol || availableTokens[0]?.symbol || 'USDT';
  });

  const [fromAmount, setFromAmount] = useState<string>('50');
  const [slippage, setSlippage] = useState<number>(swapConfig.defaultSlippage || 0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Custom token import modal for swap
  const [showImportModal, setShowImportModal] = useState(false);
  const [importContract, setImportContract] = useState('');
  const [importSymbol, setImportSymbol] = useState('');
  const [importName, setImportName] = useState('');
  const [importNetwork, setImportNetwork] = useState<NetworkId>(activeNetwork.id);

  const fromToken = availableTokens.find((t) => t.symbol === fromTokenSymbol) || availableTokens[0] || tokens[0];
  const toToken = availableTokens.find((t) => t.symbol === toTokenSymbol) || availableTokens[1] || availableTokens[0] || tokens[0];

  const parsedFrom = parseFloat(fromAmount) || 0;

  // Commission & fee calculation from admin commissionConfig
  const baseCommissionRate = commissionConfig.swapBuyRatePercent ?? swapConfig.protocolFeePercent ?? 0.15;
  const isDcoinPayer = fromToken.symbol === 'DCOIN';
  const effectiveFeePercent = isDcoinPayer && commissionConfig.discountPercent
    ? baseCommissionRate * (1 - commissionConfig.discountPercent / 100)
    : baseCommissionRate;
  const protocolFeeAmount = (parsedFrom * effectiveFeePercent) / 100;
  const netFromAmount = Math.max(0, parsedFrom - protocolFeeAmount);

  // Exchange rate calculation
  const exchangeRate = fromToken.priceUsd / (toToken.priceUsd || 1);
  const calculatedToAmount = (netFromAmount * exchangeRate).toFixed(4);

  // Trade volume in USD
  const tradeVolumeUsd = parsedFrom * fromToken.priceUsd;

  // Filter networks supported in swap according to admin config
  const swapSupportedNetworks = NETWORKS.filter((n) =>
    swapConfig.supportedNetworks ? swapConfig.supportedNetworks.includes(n.id) : true
  );

  const handleInvert = () => {
    setFromTokenSymbol(toTokenSymbol);
    setToTokenSymbol(fromTokenSymbol);
    setSwapError(null);
  };

  const handleExecuteSwap = () => {
    setSwapError(null);

    if (!swapConfig.enabled) {
      setSwapError(swapConfig.maintenanceMessage || 'DEX Swap is currently paused for maintenance.');
      return;
    }

    if (parsedFrom <= 0) return;

    if (tradeVolumeUsd < (swapConfig.minSwapAmountUsd || 1)) {
      setSwapError(`Minimum trade size is $${swapConfig.minSwapAmountUsd || 1} USD.`);
      return;
    }

    if (tradeVolumeUsd > (swapConfig.maxSwapAmountUsd || 50000)) {
      setSwapError(`Maximum trade size is $${swapConfig.maxSwapAmountUsd.toLocaleString()} USD.`);
      return;
    }

    const lockedMined = fromToken.symbol === 'DCOIN' ? (fromToken.lockedBalance || 0) : 0;
    const availableSwap = Math.max(0, fromToken.balance - lockedMined);

    if (parsedFrom > availableSwap) {
      setSwapError(`Cannot swap locked mined DCOIN. Mined rewards (${lockedMined.toFixed(2)} DCOIN) are locked in your native platform DC wallet. Available to swap: ${availableSwap.toFixed(4)} ${fromToken.symbol}.`);
      return;
    }

    if (parsedFrom > fromToken.balance) {
      setSwapError(`Insufficient ${fromToken.symbol} balance (${fromToken.balance.toFixed(4)} available).`);
      return;
    }

    setIsSwapping(true);

    setTimeout(() => {
      const outputNum = parseFloat(calculatedToAmount);

      const updated = tokens.map((t) => {
        if (t.symbol === fromToken.symbol) {
          return { ...t, balance: parseFloat((t.balance - parsedFrom).toFixed(4)) };
        }
        if (t.symbol === toToken.symbol) {
          return { ...t, balance: parseFloat((t.balance + outputNum).toFixed(4)) };
        }
        return t;
      });

      onUpdateTokens(updated);
      StorageService.saveTokens(updated);

      StorageService.addTransaction({
        id: `tx-swp-${Date.now()}`,
        type: 'swap',
        symbol: `${fromToken.symbol}➔${toToken.symbol}`,
        amount: parsedFrom,
        fiatValue: parsedFrom * fromToken.priceUsd,
        network: activeNetwork.id,
        hash: generateTxHash(),
        status: 'completed',
        timestamp: Date.now(),
        fee: protocolFeeAmount,
      });

      setIsSwapping(false);
      setFromAmount('');

      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981'],
      });
    }, 1500);
  };

  const handleImportContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importContract.trim() || !importSymbol.trim()) return;

    const imported: TokenItem = {
      id: `token-${importSymbol.toLowerCase()}-${Date.now()}`,
      symbol: importSymbol.trim().toUpperCase(),
      name: importName.trim() || importSymbol.trim().toUpperCase(),
      network: importNetwork,
      contractAddress: importContract.trim(),
      decimals: 18,
      balance: 500,
      priceUsd: 0.85,
      change24h: 4.2,
      isCustom: true,
      enabledInSwap: true,
    };

    const updated = [...tokens, imported];
    onUpdateTokens(updated);
    StorageService.saveTokens(updated);
    setToTokenSymbol(imported.symbol);
    setShowImportModal(false);
    setImportContract('');
    setImportSymbol('');
    setImportName('');
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-3 sm:px-4">
      {/* Swap Container Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl relative">
        {/* Header: Title, Network, Admin Quick Edit & Settings (1st div child) */}
        <div className="border-b border-slate-800 pb-4 mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Repeat2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">DEX Liquidity Swap</h1>
                  {onOpenAdmin && (
                    <button
                      type="button"
                      onClick={onOpenAdmin}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[11px] font-semibold text-center leading-none tracking-normal transition cursor-pointer whitespace-nowrap shadow-sm"
                      title="Edit swap functionality, dropdown tokens, and dev parameters in Admin"
                    >
                      <Sliders className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Admin Dev Control</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Powered by {swapConfig.routerName || 'Dcoine Multi-Hop Auto Router'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 relative z-10">
              {/* Network Selector inside Swap (Configured via Admin) */}
              <select
                value={activeNetwork.id}
                onChange={(e) => {
                  const found = NETWORKS.find((n) => n.id === e.target.value);
                  if (found) onSelectNetwork(found);
                }}
                className="relative z-10 w-full sm:w-auto max-w-full sm:max-w-[210px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer truncate shadow-sm transition"
              >
                {swapSupportedNetworks.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl bg-slate-950 border transition cursor-pointer ${
                  showSettings
                    ? 'border-amber-500 text-amber-400'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Slippage & Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin Announcement Banner */}
          {swapConfig.announcementBanner && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium text-[11px]">{swapConfig.announcementBanner}</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 shrink-0">Official</span>
            </div>
          )}

          {/* Official Platform Commission Rates Banner (When Published by Admin) */}
          {commissionConfig.isPublished && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-amber-500/10 border border-amber-500/25 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                  %
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-[11px]">Platform Commission Rates</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Buy Fee: <strong className="text-amber-400 font-mono">{commissionConfig.swapBuyRatePercent}%</strong> • Sell Fee: <strong className="text-amber-400 font-mono">{commissionConfig.swapSellRatePercent}%</strong>
                    {commissionConfig.discountPercent > 0 && (
                      <span className="ml-1 text-emerald-300 font-medium">({commissionConfig.discountPercent}% off with DCOIN)</span>
                    )}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0 hidden sm:inline">
                Verified DEX
              </span>
            </div>
          )}

          {/* Emergency Circuit Breaker Maintenance Notice */}
          {!swapConfig.enabled && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{swapConfig.maintenanceMessage}</span>
            </div>
          )}

          {/* Slippage Settings Drawer (Nested inside header div to strictly maintain selector index order) */}
          {showSettings && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Slippage Tolerance</span>
                <span className="text-[11px] text-amber-400 font-mono font-bold">{slippage}%</span>
              </div>
              <div className="flex items-center gap-2">
                {(swapConfig.slippagePresets || [0.1, 0.5, 1.0, 2.5]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSlippage(val)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      slippage === val
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Protocol Fee: <strong className="text-white">{swapConfig.protocolFeePercent}%</strong></span>
                <span>Gas Limit: <strong className="font-mono text-white">{swapConfig.gasLimit?.toLocaleString()}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Pay Box: From Token (2nd div child - Houses CSS Selector 1) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>You Pay</span>
            <span>
              Balance: <strong className="text-white font-mono">{fromToken.balance.toFixed(4)}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              step="any"
              value={fromAmount}
              onChange={(e) => {
                setFromAmount(e.target.value);
                setSwapError(null);
              }}
              placeholder="0.0"
              className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold font-mono text-white focus:outline-none placeholder-slate-600"
            />

            {/* CSS Selector 1: Targeted by Focus Mode & Managed from Admin Dashboard */}
            <select
              value={fromTokenSymbol}
              onChange={(e) => {
                setFromTokenSymbol(e.target.value);
                setSwapError(null);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-500 max-w-[150px] sm:max-w-[200px] cursor-pointer"
            >
              <optgroup label="In Your Wallet">
                {availableTokens
                  .filter((t) => t.balance > 0)
                  .map((t) => (
                    <option key={t.id} value={t.symbol}>
                      {t.symbol} — {t.name} (Bal: {t.balance.toLocaleString()})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="All Supported Coins">
                {availableTokens
                  .filter((t) => !t.balance || t.balance <= 0)
                  .map((t) => (
                    <option key={t.id} value={t.symbol}>
                      {t.symbol} — {t.name} (Bal: 0)
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>≈ ${(parsedFrom * fromToken.priceUsd).toFixed(2)} USD</span>
            <button
              type="button"
              onClick={() => setFromAmount(fromToken.balance.toString())}
              className="text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Invert Button (3rd div child) */}
        <div className="flex justify-center -my-2.5 relative z-10">
          <button
            type="button"
            onClick={handleInvert}
            className="p-2.5 rounded-full bg-slate-900 border-2 border-slate-800 hover:border-amber-400 text-amber-400 hover:bg-slate-800 shadow-md transition transform active:scale-95 cursor-pointer"
            title="Invert tokens"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* Receive Box: To Token (4th div child - Houses CSS Selector 2) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2 mt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>You Receive</span>
            <span>
              Balance: <strong className="text-white font-mono">{toToken.balance.toFixed(4)}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              readOnly
              value={calculatedToAmount}
              className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 focus:outline-none"
            />

            <div className="flex items-center gap-1.5">
              {/* CSS Selector 2: Targeted by Focus Mode & Managed from Admin Dashboard */}
              <select
                value={toTokenSymbol}
                onChange={(e) => {
                  setToTokenSymbol(e.target.value);
                  setSwapError(null);
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-500 max-w-[150px] sm:max-w-[200px] cursor-pointer"
              >
                <optgroup label="In Your Wallet">
                  {availableTokens
                    .filter((t) => t.balance > 0)
                    .map((t) => (
                      <option key={t.id} value={t.symbol}>
                        {t.symbol} — {t.name} (Bal: {t.balance.toLocaleString()})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="All Supported Coins">
                  {availableTokens
                    .filter((t) => !t.balance || t.balance <= 0)
                    .map((t) => (
                      <option key={t.id} value={t.symbol}>
                        {t.symbol} — {t.name} (Bal: 0)
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>≈ ${(parseFloat(calculatedToAmount) * toToken.priceUsd || 0).toFixed(2)} USD</span>
            {swapConfig.allowCustomTokens && (
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Import Token</span>
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {swapError && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{swapError}</span>
          </div>
        )}

        {/* Swap Details Info (Dev & Protocol Parameters) */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Exchange Rate</span>
            <span className="font-mono text-slate-200">
              1 {fromToken.symbol} = {exchangeRate.toFixed(4)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Slippage Tolerance</span>
            <span className="font-mono text-amber-400">{slippage}%</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Platform Commission</span>
            <span className="font-mono text-slate-200">
              {commissionConfig.isPublished
                ? `${effectiveFeePercent.toFixed(2)}% (${protocolFeeAmount.toFixed(4)} ${fromToken.symbol})`
                : `${swapConfig.protocolFeePercent}% (${protocolFeeAmount.toFixed(4)} ${fromToken.symbol})`}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Estimated Gas Fee</span>
            <span className="font-mono text-emerald-400">{swapConfig.estimatedGasFee || '< $0.05'}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Liquidity Routing</span>
            <span className="text-slate-300">{swapConfig.routerName || 'Dcoine Multi-Hop Auto Router'}</span>
          </div>
          <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Router Contract</span>
            <span className="font-mono text-[10px] text-slate-400">
              {swapConfig.routerContractAddress
                ? `${swapConfig.routerContractAddress.slice(0, 8)}...${swapConfig.routerContractAddress.slice(-6)}`
                : '0x7a25...488D'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleExecuteSwap}
          disabled={isSwapping || parsedFrom <= 0 || !swapConfig.enabled}
          className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition disabled:opacity-50 inline-flex items-center justify-center gap-2 text-center cursor-pointer active:scale-[0.99]"
        >
          {isSwapping ? (
            <>
              <Repeat2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Executing Smart Contract Swap...</span>
            </>
          ) : !swapConfig.enabled ? (
            <span>Swap Temporarily Paused by Admin</span>
          ) : (
            <span>Confirm Swap</span>
          )}
        </button>
      </div>

      {/* Custom Token Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Import Custom Token</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportContract} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Contract Address *</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={importContract}
                  onChange={(e) => setImportContract(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PEPE"
                    value={importSymbol}
                    onChange={(e) => setImportSymbol(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Token Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Pepe"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Network</label>
                <select
                  value={importNetwork}
                  onChange={(e) => setImportNetwork(e.target.value as NetworkId)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {NETWORKS.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Anyone can create a token. Verifying the contract on-chain before trading is advised.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Import &amp; Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

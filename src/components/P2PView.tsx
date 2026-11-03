import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ThumbsUp,
  AlertCircle,
  Plus,
  X,
  Send,
  Lock,
  Unlock,
  Coins,
  ArrowRight,
  RefreshCw,
  Award,
  DollarSign,
  TrendingUp,
  Wallet,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { P2POrder, P2PTrade, PlatformCommissionConfig, TokenItem, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { generateTxHash } from '../utils/crypto';

interface P2PViewProps {
  user: UserProfile;
  tokens: TokenItem[];
  onUpdateTokens: (tokens: TokenItem[]) => void;
  onUpdateUser: (user: UserProfile) => void;
}

export const P2PView: React.FC<P2PViewProps> = ({
  user,
  tokens,
  onUpdateTokens,
  onUpdateUser,
}) => {
  // Navigation within P2P
  const [subTab, setSubTab] = useState<'market' | 'orders' | 'wallet' | 'merchant' | 'profile'>('market');
  const [commissionConfig, setCommissionConfig] = useState<PlatformCommissionConfig>(() =>
    StorageService.getCommissionConfig()
  );
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('USDT');
  const [selectedFiat, setSelectedFiat] = useState<'USD' | 'EUR' | 'GBP' | 'INR' | 'BDT' | 'CAD'>('USD');
  const [sortFilter, setSortFilter] = useState<'best_price' | 'fastest' | 'success_rate' | 'liquidity'>('best_price');
  const [searchQuery, setSearchQuery] = useState('');

  // Orders State
  const [orders, setOrders] = useState<P2POrder[]>(() => StorageService.getP2POrders());
  const [trades, setTrades] = useState<P2PTrade[]>(() => StorageService.getP2PTrades());

  // Active Trade / Escrow Execution Modal
  const [activeTrade, setActiveTrade] = useState<P2PTrade | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeInputFiat, setTradeInputFiat] = useState<string>('100');
  const [targetOrderForTrade, setTargetOrderForTrade] = useState<P2POrder | null>(null);
  const [tradeChatMessage, setTradeChatMessage] = useState('');
  const [escrowTimeLeft, setEscrowTimeLeft] = useState(900); // 15 mins in sec

  // Create / Edit Ad Order Modal - initialized with user's top wallet token
  const defaultTokenSymbol = tokens[0]?.symbol || 'USDT';
  const defaultTokenPrice = tokens[0]?.priceUsd ? tokens[0].priceUsd.toString() : '1.00';

  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [adForm, setAdForm] = useState({
    type: 'sell' as 'buy' | 'sell',
    crypto: defaultTokenSymbol,
    fiat: 'USD' as 'USD' | 'EUR' | 'GBP' | 'INR' | 'BDT' | 'CAD',
    price: defaultTokenPrice,
    minLimit: '50',
    maxLimit: '2000',
    availableAmount: '100',
    paymentMethods: 'Bank Transfer, Wise',
    terms: 'Instant release once payment is reflected. Please upload screenshot.',
  });

  // P2P Wallet transfer state
  const [transferToken, setTransferToken] = useState<string>('USDT');
  const [p2pBalance, setP2PBalance] = useState<Record<string, number>>(() => ({
    USDT: 350.0,
    DCOIN: 120.0,
    BTC: 0.05,
    ETH: 0.8,
  }));
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDirection, setTransferDirection] = useState<'to_p2p' | 'to_spot'>('to_p2p');

  // Token collections connected directly to active user wallet
  const tokensWithBalance = tokens.filter((t) => t.balance > 0);
  const otherTokens = tokens.filter((t) => !t.balance || t.balance <= 0);

  // Selected token details for the ad form
  const selectedAdToken = tokens.find(
    (t) => t.symbol.toUpperCase() === adForm.crypto.toUpperCase()
  ) || {
    id: 'custom-token',
    symbol: adForm.crypto,
    name: adForm.crypto,
    network: 'dcoine' as const,
    decimals: 18,
    balance: 0,
    priceUsd: 1.0,
    change24h: 0,
  };

  // Available cryptos for market filtering (including all user wallet tokens & custom coins)
  const availableMarketCryptos = Array.from(
    new Set([
      'USDT',
      'DCOIN',
      'BTC',
      'ETH',
      ...tokens.map((t) => t.symbol),
      ...orders.map((o) => o.cryptoSymbol),
    ])
  );

  // Merchant Application
  const [showMerchantApplyModal, setShowMerchantApplyModal] = useState(false);

  // Helper to broadcast P2P updates across browser tabs and live client sessions
  const broadcastP2PUpdate = (type: 'ORDERS_UPDATED' | 'TRADE_UPDATED', payload: any) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('dcoine_p2p_bus');
        channel.postMessage({ type, payload });
        setTimeout(() => channel.close(), 100);
      }
    } catch {
      // BroadcastChannel fallback
    }
  };

  // Real-time synchronization across browser tabs and live sessions
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('dcoine_p2p_bus');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'ORDERS_UPDATED') {
            setOrders(payload || StorageService.getP2POrders());
          } else if (type === 'TRADE_UPDATED') {
            const updatedTrades: P2PTrade[] = StorageService.getP2PTrades();
            setTrades(updatedTrades);
            if (activeTrade && payload?.id === activeTrade.id) {
              setActiveTrade(payload);
            }
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    let commChannel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        commChannel = new BroadcastChannel('dcoine_commissions_bus');
        commChannel.onmessage = (event) => {
          if (event.data?.type === 'COMMISSIONS_UPDATED') {
            setCommissionConfig(event.data.payload || StorageService.getCommissionConfig());
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes('p2p_orders')) {
        setOrders(StorageService.getP2POrders());
      } else if (e.key?.includes('p2p_trades')) {
        const updatedTrades = StorageService.getP2PTrades();
        setTrades(updatedTrades);
        if (activeTrade) {
          const found = updatedTrades.find((t) => t.id === activeTrade.id);
          if (found) setActiveTrade(found);
        }
      } else if (e.key?.includes('commission_config')) {
        setCommissionConfig(StorageService.getCommissionConfig());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (channel) channel.close();
      if (commChannel) commChannel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [activeTrade]);

  // Escrow countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTrade && (activeTrade.status === 'waiting_payment' || activeTrade.status === 'paid_escrow_locked')) {
      timer = setInterval(() => {
        setEscrowTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTrade]);

  // Filter & sort market orders
  const filteredOrders = orders
    .filter((o) => {
      if (o.status !== 'active') return false;
      if (o.type !== tradeType) return false;
      if (o.cryptoSymbol !== selectedCrypto) return false;
      if (o.fiatCurrency !== selectedFiat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          o.merchantName.toLowerCase().includes(q) ||
          o.paymentMethods.some((pm) => pm.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortFilter === 'best_price') {
        return tradeType === 'buy' ? a.price - b.price : b.price - a.price;
      }
      if (sortFilter === 'fastest') {
        return a.avgReleaseTimeMinutes - b.avgReleaseTimeMinutes;
      }
      if (sortFilter === 'success_rate') {
        return b.merchantRating - a.merchantRating;
      }
      if (sortFilter === 'liquidity') {
        return b.availableAmount - a.availableAmount;
      }
      return 0;
    });

  // Start Trade / Escrow initiation
  const handleInitiateTrade = (order: P2POrder) => {
    setTargetOrderForTrade(order);
    setTradeInputFiat(order.minLimit.toString());
    setTradeModalOpen(true);
  };

  const handleConfirmLockEscrow = () => {
    if (!targetOrderForTrade) return;
    const fiatAmt = parseFloat(tradeInputFiat) || targetOrderForTrade.minLimit;
    const commissionRate = tradeType === 'buy' ? commissionConfig.p2pBuyRatePercent : commissionConfig.p2pSellRatePercent;
    const grossCrypto = targetOrderForTrade.price > 0 ? fiatAmt / targetOrderForTrade.price : 0;
    const feeCrypto = (grossCrypto * commissionRate) / 100;
    const netCrypto = parseFloat(Math.max(0, grossCrypto - feeCrypto).toFixed(4));
    const cryptoAmt = netCrypto;

    const newTrade: P2PTrade = {
      id: `escrow-${Date.now()}`,
      orderId: targetOrderForTrade.id,
      type: targetOrderForTrade.type === 'sell' ? 'buy' : 'sell',
      buyerId: user.id,
      buyerName: user.username,
      sellerId: targetOrderForTrade.userId,
      sellerName: targetOrderForTrade.merchantName,
      cryptoSymbol: targetOrderForTrade.cryptoSymbol,
      cryptoAmount: cryptoAmt,
      fiatCurrency: targetOrderForTrade.fiatCurrency,
      fiatAmount: fiatAmt,
      paymentMethod: targetOrderForTrade.paymentMethods[0] || 'Bank Transfer',
      status: 'waiting_payment',
      escrowLockedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      escrowTxHash: generateTxHash(),
      messages: [
        {
          id: 'msg-sys-1',
          sender: 'Dcoine Escrow Protocol',
          text: `Smart contract has securely locked ${grossCrypto.toFixed(4)} ${targetOrderForTrade.cryptoSymbol} in escrow (${commissionRate}% platform commission applied: ${feeCrypto.toFixed(4)} ${targetOrderForTrade.cryptoSymbol}). Buyer please transfer ${fiatAmt} ${targetOrderForTrade.fiatCurrency}.`,
          timestamp: Date.now(),
          isSystem: true,
        },
        {
          id: 'msg-merch-1',
          sender: targetOrderForTrade.merchantName,
          text: `Hello! I am online. Please make payment via ${targetOrderForTrade.paymentMethods[0]} and click 'Transferred, Notify Seller'.`,
          timestamp: Date.now() + 500,
        },
      ],
    };

    const existingTrades = StorageService.getP2PTrades();
    const updatedTrades = [newTrade, ...existingTrades];
    StorageService.saveP2PTrades(updatedTrades);
    setTrades(updatedTrades);
    setActiveTrade(newTrade);
    setEscrowTimeLeft(900);
    broadcastP2PUpdate('TRADE_UPDATED', newTrade);
  };

  const handleMarkPaymentDone = () => {
    if (!activeTrade) return;
    const updated: P2PTrade = {
      ...activeTrade,
      status: 'paid_escrow_locked',
      messages: [
        ...activeTrade.messages,
        {
          id: `msg-${Date.now()}`,
          sender: user.username,
          text: `Payment of ${activeTrade.fiatAmount} ${activeTrade.fiatCurrency} completed! Proof submitted. Please release escrow.`,
          timestamp: Date.now(),
        },
        {
          id: `msg-sys-2`,
          sender: 'Dcoine Escrow Protocol',
          text: 'Buyer marked payment as complete. Seller has 10 minutes to verify and release.',
          timestamp: Date.now() + 500,
          isSystem: true,
        },
      ],
    };
    setActiveTrade(updated);
    const existingTrades = StorageService.getP2PTrades();
    const updatedTrades = existingTrades.map((t) => (t.id === updated.id ? updated : t));
    StorageService.saveP2PTrades(updatedTrades);
    setTrades(updatedTrades);
    broadcastP2PUpdate('TRADE_UPDATED', updated);

    // If counterparty is an external merchant demo, auto-confirm after 3.5 seconds
    if (activeTrade.sellerId !== user.id) {
      setTimeout(() => {
        handleSellerRelease(updated);
      }, 3500);
    }
  };

  const handleSellerRelease = (trade: P2PTrade) => {
    const finished: P2PTrade = {
      ...trade,
      status: 'released',
      messages: [
        ...trade.messages,
        {
          id: `msg-${Date.now()}`,
          sender: trade.sellerName,
          text: 'Payment received in full. Crypto released from smart escrow. Thank you!',
          timestamp: Date.now(),
        },
        {
          id: `msg-sys-3`,
          sender: 'Dcoine Escrow Protocol',
          text: `SUCCESS: ${trade.cryptoAmount} ${trade.cryptoSymbol} released to buyer's P2P wallet!`,
          timestamp: Date.now() + 200,
          isSystem: true,
        },
      ],
    };

    setActiveTrade(finished);
    const existingTrades = StorageService.getP2PTrades();
    const updatedTrades = existingTrades.map((t) => (t.id === finished.id ? finished : t));
    StorageService.saveP2PTrades(updatedTrades);
    setTrades(updatedTrades);
    broadcastP2PUpdate('TRADE_UPDATED', finished);

    // Credit P2P Balance
    const sym = trade.cryptoSymbol;
    setP2PBalance((prev) => ({
      ...prev,
      [sym]: parseFloat(((prev[sym] || 0) + trade.cryptoAmount).toFixed(4)),
    }));

    // Also credit user's spot wallet tokens if user is the buyer
    if (trade.buyerId === user.id) {
      const updatedTokens = tokens.map((t) =>
        t.symbol === trade.cryptoSymbol
          ? { ...t, balance: parseFloat((t.balance + trade.cryptoAmount).toFixed(4)) }
          : t
      );
      onUpdateTokens(updatedTokens);
      StorageService.saveTokens(updatedTokens);
    }

    // Save transaction
    StorageService.addTransaction({
      id: `tx-p2p-${Date.now()}`,
      type: 'p2p_buy',
      symbol: trade.cryptoSymbol,
      amount: trade.cryptoAmount,
      fiatValue: trade.fiatAmount,
      network: 'dcoine',
      hash: trade.escrowTxHash,
      status: 'completed',
      timestamp: Date.now(),
    });

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.55 },
    });
  };

  // Open dispute arbitration
  const handleDisputeTrade = (reason?: string) => {
    if (!activeTrade) return;
    const disputed: P2PTrade = {
      ...activeTrade,
      status: 'disputed',
      messages: [
        ...activeTrade.messages,
        {
          id: `msg-${Date.now()}`,
          sender: user.username,
          text: `DISPUTE INITIATED: ${reason || 'Payment dispute opened. Platform escrow arbitrator summoned.'}`,
          timestamp: Date.now(),
        },
        {
          id: `msg-sys-disp`,
          sender: 'Dcoine Arbitration Desk',
          text: 'Smart contract escrow locked. Platform arbitrator joined. Please provide transaction receipt.',
          timestamp: Date.now() + 200,
          isSystem: true,
        },
      ],
    };
    setActiveTrade(disputed);
    const existingTrades = StorageService.getP2PTrades();
    const updatedTrades = existingTrades.map((t) => (t.id === disputed.id ? disputed : t));
    StorageService.saveP2PTrades(updatedTrades);
    setTrades(updatedTrades);
    broadcastP2PUpdate('TRADE_UPDATED', disputed);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeChatMessage.trim() || !activeTrade) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: user.username,
      text: tradeChatMessage.trim(),
      timestamp: Date.now(),
    };

    const updated = {
      ...activeTrade,
      messages: [...activeTrade.messages, newMsg],
    };

    setActiveTrade(updated);
    setTradeChatMessage('');

    const existingTrades = StorageService.getP2PTrades();
    const updatedTrades = existingTrades.map((t) => (t.id === updated.id ? updated : t));
    StorageService.saveP2PTrades(updatedTrades);
    setTrades(updatedTrades);
    broadcastP2PUpdate('TRADE_UPDATED', updated);
  };

  // Create Ad Order
  const handleCreateAdOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: P2POrder = {
      id: `ord-${Date.now()}`,
      userId: user.id,
      type: adForm.type,
      merchantName: user.username,
      merchantRating: 100,
      completedOrdersCount: 1,
      cryptoSymbol: adForm.crypto,
      fiatCurrency: adForm.fiat,
      price: parseFloat(adForm.price) || 1.0,
      minLimit: parseFloat(adForm.minLimit) || 10,
      maxLimit: parseFloat(adForm.maxLimit) || 1000,
      availableAmount: parseFloat(adForm.availableAmount) || 100,
      paymentMethods: adForm.paymentMethods.split(',').map((p) => p.trim()),
      terms: adForm.terms,
      status: 'active',
      avgReleaseTimeMinutes: 2.0,
      createdAt: Date.now(),
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    StorageService.saveP2POrders(updated);
    setShowCreateAdModal(false);
    broadcastP2PUpdate('ORDERS_UPDATED', updated);

    confetti({
      particleCount: 40,
      spread: 60,
    });
  };

  // Cancel order
  const handleCancelOrder = (id: string) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' as const } : o));
    setOrders(updated);
    StorageService.saveP2POrders(updated);
    broadcastP2PUpdate('ORDERS_UPDATED', updated);
  };

  // Transfer between Spot and P2P Wallet
  const handleWalletTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) return;

    const tokenObj = tokens.find((t) => t.symbol === transferToken);

    if (transferDirection === 'to_p2p') {
      if (!tokenObj || tokenObj.balance < amt) {
        alert(`Insufficient ${transferToken} balance in spot wallet.`);
        return;
      }
      // Deduct from spot
      const updatedTokens = tokens.map((t) =>
        t.symbol === transferToken ? { ...t, balance: parseFloat((t.balance - amt).toFixed(4)) } : t
      );
      onUpdateTokens(updatedTokens);
      StorageService.saveTokens(updatedTokens);
      setP2PBalance((prev) => ({
        ...prev,
        [transferToken]: (prev[transferToken] || 0) + amt,
      }));
    } else {
      const currentP2P = p2pBalance[transferToken] || 0;
      if (currentP2P < amt) {
        alert(`Insufficient ${transferToken} balance in P2P escrow wallet.`);
        return;
      }
      setP2PBalance((prev) => ({
        ...prev,
        [transferToken]: parseFloat((currentP2P - amt).toFixed(4)),
      }));
      const updatedTokens = tokens.map((t) =>
        t.symbol === transferToken ? { ...t, balance: parseFloat((t.balance + amt).toFixed(4)) } : t
      );
      onUpdateTokens(updatedTokens);
      StorageService.saveTokens(updatedTokens);
    }

    setTransferAmount('');
    confetti({ particleCount: 30 });
  };

  // Merchant Application
  const handleApplyMerchant = () => {
    const updatedUser: UserProfile = {
      ...user,
      isMerchant: true,
      merchantSecurityPledge: 500,
    };
    onUpdateUser(updatedUser);
    StorageService.saveUser(updatedUser);
    setShowMerchantApplyModal(false);

    confetti({
      particleCount: 80,
      spread: 80,
    });
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-3 sm:px-4">
      {/* P2P Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">P2P Escrow Trading</h1>
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold text-center leading-none tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap shadow-sm">
              Zero Counterparty Risk
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Trade crypto directly with verified merchants backed by platform escrow smart contracts.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'market', label: 'Market' },
            { id: 'orders', label: 'Orders' },
            { id: 'wallet', label: 'P2P Wallet' },
            { id: 'merchant', label: 'Merchant' },
            { id: 'profile', label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                subTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. MARKET TAB */}
      {subTab === 'market' && (
        <div className="space-y-4">
          {/* Escrow Guarantee Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong className="text-emerald-400">100% Escrow Protection:</strong> Seller&apos;s crypto is locked in a decentralized multi-sig smart contract before trade begins.
              </span>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Audited Contract
            </span>
          </div>

          {/* Official P2P Commission Rates Banner (When Published by Admin) */}
          {commissionConfig.isPublished && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                  %
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-xs">Platform P2P Escrow Commission Rates</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      OFFICIAL &amp; TRANSPARENT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Fiat Buyer Commission: <strong className="text-amber-400 font-mono">{commissionConfig.p2pBuyRatePercent}%</strong> • Crypto Seller Commission: <strong className="text-amber-400 font-mono">{commissionConfig.p2pSellRatePercent}%</strong>
                    <span className="text-slate-400 ml-1.5">(Automated escrow security • Zero hidden taker charges)</span>
                  </p>
                </div>
              </div>
              <span className="hidden md:inline-block text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                Escrow Protected
              </span>
            </div>
          )}

          {/* Trade Type & Asset Selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-3.5 shadow-lg">
            {/* Buy / Sell Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setTradeType('buy')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  tradeType === 'buy' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Buy Crypto
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  tradeType === 'sell' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sell Crypto
              </button>
            </div>

            {/* Crypto Token Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
              {availableMarketCryptos.map((crypto) => {
                const heldToken = tokens.find((t) => t.symbol.toUpperCase() === crypto.toUpperCase());
                return (
                  <button
                    key={crypto}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                      selectedCrypto === crypto
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{crypto}</span>
                    {heldToken && heldToken.balance > 0 && (
                      <span className="text-[10px] text-amber-400/90 font-mono font-semibold">
                        ({heldToken.balance > 1000 ? `${(heldToken.balance / 1000).toFixed(1)}k` : heldToken.balance})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Fiat Currency Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Fiat:</span>
              <select
                value={selectedFiat}
                onChange={(e) => setSelectedFiat(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {['USD', 'EUR', 'GBP', 'INR', 'BDT', 'CAD'].map((fiat) => (
                  <option key={fiat} value={fiat}>
                    {fiat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search & Sort Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchant or payment method (e.g. Bank, Wise, Zelle)..."
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value as any)}
                className="px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="best_price">Best Price</option>
                <option value="fastest">Fastest Release</option>
                <option value="success_rate">High Success Rate</option>
                <option value="liquidity">High Liquidity</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
                <p className="text-sm text-slate-400">No active ads match your criteria.</p>
                <button
                  onClick={() => setSubTab('orders')}
                  className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Create Your Own Ad
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-lg hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-amber-400">
                        {order.merchantName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white">{order.merchantName}</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-semibold border border-amber-500/20">
                            Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{order.completedOrdersCount} orders</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{order.merchantRating}% completion</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {order.avgReleaseTimeMinutes} min avg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">Unit Price</span>
                      <div className="text-lg font-mono font-extrabold text-white">
                        {order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} {order.fiatCurrency}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-slate-400">
                        Available:{' '}
                        <span className="font-mono text-slate-200 font-semibold">
                          {order.availableAmount.toLocaleString()} {order.cryptoSymbol}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        Limit:{' '}
                        <span className="font-mono text-slate-200">
                          {order.minLimit} - {order.maxLimit.toLocaleString()} {order.fiatCurrency}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {order.paymentMethods.map((pm, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300"
                          >
                            {pm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleInitiateTrade(order)}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition transform active:scale-95 ${
                        order.type === 'buy'
                          ? 'bg-rose-500 hover:bg-rose-400 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {tradeType === 'buy' ? `Buy ${order.cryptoSymbol}` : `Sell ${order.cryptoSymbol}`}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. ORDERS TAB (My Orders / Create Ad) */}
      {subTab === 'orders' && (
        <div className="space-y-5">
          {/* Active Escrow Trades Section */}
          {trades.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">Active &amp; Recent Escrows</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Live Escrow
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {trades.slice(0, 5).map((tr) => (
                  <div
                    key={tr.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          #{tr.id.slice(-6)}: {tr.type === 'buy' ? 'Buy' : 'Sell'} {tr.cryptoAmount} {tr.cryptoSymbol}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            tr.status === 'released'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : tr.status === 'paid_escrow_locked'
                              ? 'bg-blue-500/20 text-blue-400'
                              : tr.status === 'disputed'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {tr.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 font-mono">
                        Counterparty: {tr.buyerId === user.id ? tr.sellerName : tr.buyerName} | {tr.fiatAmount} {tr.fiatCurrency} ({tr.paymentMethod})
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTrade(tr);
                        setTradeModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      Open Escrow Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-base font-bold text-white">Your P2P Advertisements</h2>
            <button
              onClick={() => setShowCreateAdModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Ad</span>
            </button>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                        ord.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {ord.type} {ord.cryptoSymbol}
                    </span>
                    <span className="font-mono font-bold text-white">
                      {ord.price} {ord.fiatCurrency}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        ord.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Limits: {ord.minLimit} - {ord.maxLimit} {ord.fiatCurrency} | Payment: {ord.paymentMethods.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {ord.status === 'active' && (
                    <button
                      onClick={() => handleCancelOrder(ord.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 hover:border-rose-500 text-xs font-medium transition"
                    >
                      Cancel Ad
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. P2P WALLET TAB */}
      {subTab === 'wallet' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white">P2P Escrow Funding Wallet</h2>
            <p className="text-xs text-slate-400">
              Balances stored here are segregated for instantaneous P2P trading and escrow locking.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['USDT', 'DCOIN', 'BTC', 'ETH'].map((sym) => (
                <div key={sym} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium block">{sym} Escrow</span>
                  <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">
                    {(p2pBalance[sym] || 0).toLocaleString()} <span className="text-[10px] text-amber-400">{sym}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Transfer form */}
            <form onSubmit={handleWalletTransfer} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>
                  Transfer Direction:{' '}
                  <strong className="text-amber-400">
                    {transferDirection === 'to_p2p' ? 'Spot Wallet ➔ P2P Escrow Wallet' : 'P2P Escrow Wallet ➔ Spot Wallet'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setTransferDirection(transferDirection === 'to_p2p' ? 'to_spot' : 'to_p2p')}
                  className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Flip Direction
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Wallet Token</label>
                  <select
                    value={transferToken}
                    onChange={(e) => setTransferToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {tokens.map((t) => (
                      <option key={t.id} value={t.symbol}>
                        {t.symbol} — {t.name} (Spot Bal: {t.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-xs text-slate-400">
                    <span>Transfer Amount</span>
                    <span className="text-[10px] text-slate-400">
                      Avail:{' '}
                      <strong className="text-amber-300 font-mono">
                        {transferDirection === 'to_p2p'
                          ? (tokens.find((t) => t.symbol === transferToken)?.balance || 0).toLocaleString()
                          : (p2pBalance[transferToken] || 0).toLocaleString()}{' '}
                        {transferToken}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="any"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder={`Amount in ${transferToken}`}
                        className="w-full pl-3.5 pr-12 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const maxAmt =
                            transferDirection === 'to_p2p'
                              ? tokens.find((t) => t.symbol === transferToken)?.balance || 0
                              : p2pBalance[transferToken] || 0;
                          setTransferAmount(maxAmt.toString());
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-400 hover:text-amber-300"
                      >
                        MAX
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MERCHANT TAB */}
      {subTab === 'merchant' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Merchant Application & Certified Desk</h2>
                <p className="text-xs text-slate-400">
                  Earn maker fees, establish your fiat trade business, and unlock verified badge trust.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block">Security Deposit</span>
                <span className="text-amber-400 font-mono mt-1 block">500 USDT / 1,000 DCOIN</span>
                <span className="text-[10px] text-slate-500">Refundable upon account retirement</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block">0% Maker Trading Fees</span>
                <span className="text-emerald-400 font-mono mt-1 block">Zero Fees Forever</span>
                <span className="text-[10px] text-slate-500">Keep 100% of your fiat margin</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block">VIP Support & Escrow</span>
                <span className="text-indigo-400 font-mono mt-1 block">Priority Dispute Resolution</span>
                <span className="text-[10px] text-slate-500">&lt; 5 min mediation SLA</span>
              </div>
            </div>

            {user.isMerchant ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>You are a Verified Dcoine Merchant! Security Pledge: {user.merchantSecurityPledge} USDT</span>
                </div>
                <span className="font-bold text-emerald-400">ACTIVE BADGE</span>
              </div>
            ) : (
              <button
                onClick={() => setShowMerchantApplyModal(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 transition"
              >
                Apply for Verified Merchant Status ($500 Security Deposit)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. PROFILE TAB */}
      {subTab === 'profile' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{user.username}</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  KYC Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">UID: {user.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400">Total Trades</span>
              <span className="text-base font-bold text-white block mt-0.5 font-mono">148</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400">Completion Rate</span>
              <span className="text-base font-bold text-emerald-400 block mt-0.5 font-mono">100%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400">Avg Pay Time</span>
              <span className="text-base font-bold text-amber-300 block mt-0.5 font-mono">1.8 Min</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400">Positive Feedback</span>
              <span className="text-base font-bold text-white block mt-0.5 font-mono">99.8%</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trader Reviews</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="text-amber-400 font-medium">CryptoWhale_88</span>
                  <span>Yesterday</span>
                </div>
                <p>Lightning fast payment confirmation! Escrow released immediately without delay.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRADE INITIATION MODAL */}
      {tradeModalOpen && targetOrderForTrade && !activeTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {targetOrderForTrade.cryptoSymbol} with Escrow
              </h3>
              <button onClick={() => setTradeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Unit Price:</span>
                <span className="text-white font-mono font-bold">
                  {targetOrderForTrade.price} {targetOrderForTrade.fiatCurrency}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Merchant:</span>
                <span className="text-amber-400">{targetOrderForTrade.merchantName} (100% Escrow)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Limits:</span>
                <span className="text-slate-200">
                  {targetOrderForTrade.minLimit} - {targetOrderForTrade.maxLimit} {targetOrderForTrade.fiatCurrency}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                I Want to Pay ({targetOrderForTrade.fiatCurrency})
              </label>
              <input
                type="number"
                value={tradeInputFiat}
                onChange={(e) => setTradeInputFiat(e.target.value)}
                min={targetOrderForTrade.minLimit}
                max={targetOrderForTrade.maxLimit}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Platform Commission Rate & Transparency Breakdown */}
            {(() => {
              const currentCommissionRate =
                tradeType === 'buy'
                  ? commissionConfig.p2pBuyRatePercent
                  : commissionConfig.p2pSellRatePercent;
              const inputFiatNum = parseFloat(tradeInputFiat) || 0;
              const grossCrypto =
                targetOrderForTrade.price > 0 ? inputFiatNum / targetOrderForTrade.price : 0;
              const commissionFeeFiat = (inputFiatNum * currentCommissionRate) / 100;
              const commissionFeeCrypto = (grossCrypto * currentCommissionRate) / 100;
              const netCryptoReceived = Math.max(0, grossCrypto - commissionFeeCrypto);

              return (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/25 text-xs space-y-2 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Percent className="w-4 h-4 text-amber-400" />
                        <span>Platform Commission Rate:</span>
                      </span>
                      <span className="font-mono font-extrabold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs">
                        {currentCommissionRate}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Platform Protocol Fee:</span>
                      <span className="font-mono text-slate-200 font-medium">
                        {commissionFeeFiat.toFixed(2)} {targetOrderForTrade.fiatCurrency} ({commissionFeeCrypto.toFixed(4)} {targetOrderForTrade.cryptoSymbol})
                      </span>
                    </div>

                    {commissionConfig.discountPercent > 0 && (
                      <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                        <span>DCOIN Holder Discount:</span>
                        <span className="font-semibold">-{commissionConfig.discountPercent}% Fee Offset</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800 text-slate-400">
                      <span>Gross Crypto Amount:</span>
                      <span className="font-mono text-slate-300">
                        {grossCrypto.toFixed(4)} {targetOrderForTrade.cryptoSymbol}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Escrow Security Pledge:</span>
                      </span>
                      <span className="font-semibold">100% Protected by Smart Contract</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-slate-300 font-bold block">I will receive (Net):</span>
                      <span className="text-[10px] text-slate-500">
                        After {currentCommissionRate}% transparent platform commission
                      </span>
                    </div>
                    <span className="text-lg font-mono font-extrabold text-amber-300">
                      {netCryptoReceived.toFixed(4)} {targetOrderForTrade.cryptoSymbol}
                    </span>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={handleConfirmLockEscrow}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
            >
              Lock in Smart Contract Escrow
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE TRADE / ESCROW EXECUTION SCREEN MODAL */}
      {activeTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Escrow Trade #{activeTrade.id.slice(-6)}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Tx: {activeTrade.escrowTxHash.slice(0, 14)}...</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Time to Pay</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {Math.floor(escrowTimeLeft / 60)}:{String(escrowTimeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTrade(null);
                    setTradeModalOpen(false);
                  }}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Escrow Status Bar */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs px-5">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`font-semibold capitalize px-2 py-0.5 rounded-full ${
                    activeTrade.status === 'released'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : activeTrade.status === 'paid_escrow_locked'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {activeTrade.status.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="font-mono text-white font-bold">
                {activeTrade.cryptoAmount} {activeTrade.cryptoSymbol} ≈ {activeTrade.fiatAmount} {activeTrade.fiatCurrency}
              </span>
            </div>

            {/* Chat & Details Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Payment Details Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span>Merchant Payment Instructions</span>
                  <span className="text-emerald-400">{activeTrade.paymentMethod}</span>
                </div>
                <div className="text-slate-400">
                  Beneficiary Name: <strong className="text-white">{activeTrade.sellerName}</strong>
                </div>
                <div className="text-slate-400">
                  Account/Email/IBAN: <strong className="text-amber-400 font-mono">pay.merchant.dcoine@bank.com</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Important: Include trade reference <strong>#{activeTrade.id.slice(-6)}</strong> in remarks. Do not mention crypto/bitcoin to prevent bank flags.
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1.5 border-t border-slate-800">
                  <span>Platform Commission:</span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {activeTrade.type === 'buy' ? commissionConfig.p2pBuyRatePercent : commissionConfig.p2pSellRatePercent}% Applied &amp; Secured in Escrow
                  </span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-2 pt-2">
                {activeTrade.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-2xl text-xs max-w-[85%] ${
                      m.isSystem
                        ? 'mx-auto bg-slate-800/60 text-amber-300 border border-slate-700/60 text-center w-full max-w-full'
                        : m.sender === user.username
                        ? 'ml-auto bg-amber-500 text-slate-950 font-medium'
                        : 'mr-auto bg-slate-800 text-slate-200'
                    }`}
                  >
                    {!m.isSystem && (
                      <span className="text-[10px] opacity-75 font-bold block mb-0.5">{m.sender}</span>
                    )}
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar & Message Input */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
              {activeTrade.status === 'waiting_payment' && (
                <button
                  onClick={handleMarkPaymentDone}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  I Have Transferred {activeTrade.fiatAmount} {activeTrade.fiatCurrency} (Notify Seller)
                </button>
              )}

              {activeTrade.status === 'paid_escrow_locked' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs flex items-center justify-between">
                    <span>Payment notified. Awaiting seller release.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSellerRelease(activeTrade)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                    >
                      Verify &amp; Release Crypto
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisputeTrade('Seller has not released after payment.')}
                      className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition"
                    >
                      Dispute
                    </button>
                  </div>
                </div>
              )}

              {activeTrade.status === 'disputed' && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs text-center font-bold">
                  Escrow Under Dispute Arbitration. Platform team reviewing bank receipt proof.
                </div>
              )}

              {activeTrade.status === 'released' && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs text-center font-bold">
                  Trade Completed! {activeTrade.cryptoAmount} {activeTrade.cryptoSymbol} has been credited to your P2P Wallet.
                </div>
              )}

              <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tradeChatMessage}
                  onChange={(e) => setTradeChatMessage(e.target.value)}
                  placeholder="Type message to counterparty..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE AD MODAL */}
      {showCreateAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create P2P Advertisement</h3>
                <p className="text-xs text-slate-400">Directly connected to your active wallet tokens &amp; coins</p>
              </div>
              <button onClick={() => setShowCreateAdModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdOrder} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ad Type</label>
                  <select
                    value={adForm.type}
                    onChange={(e) => {
                      const newType = e.target.value as 'buy' | 'sell';
                      setAdForm((prev) => ({
                        ...prev,
                        type: newType,
                        availableAmount:
                          newType === 'sell' && selectedAdToken.balance > 0
                            ? selectedAdToken.balance.toString()
                            : prev.availableAmount,
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="sell">I want to Sell (From My Wallet)</option>
                    <option value="buy">I want to Buy (Deposit to Wallet)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">Crypto Asset</label>
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                      <Wallet className="w-2.5 h-2.5" /> Live Wallet
                    </span>
                  </div>
                  <select
                    value={adForm.crypto}
                    onChange={(e) => {
                      const newSym = e.target.value;
                      const matched = tokens.find((t) => t.symbol.toUpperCase() === newSym.toUpperCase());
                      setAdForm((prev) => {
                        const fiatRate =
                          prev.fiat === 'EUR' ? 0.92 : prev.fiat === 'GBP' ? 0.79 : prev.fiat === 'INR' ? 86 : prev.fiat === 'BDT' ? 122 : 1;
                        const suggestedPrice = matched
                          ? (matched.priceUsd * fiatRate).toFixed(matched.priceUsd < 1 ? 4 : 2)
                          : prev.price;
                        return {
                          ...prev,
                          crypto: newSym,
                          price: suggestedPrice,
                          availableAmount:
                            prev.type === 'sell' && matched && matched.balance > 0
                              ? matched.balance.toString()
                              : prev.availableAmount,
                        };
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    {tokensWithBalance.length > 0 && (
                      <optgroup label="💼 In Your Active Wallet (Live Balance)">
                        {tokensWithBalance.map((t) => (
                          <option key={t.id} value={t.symbol}>
                            {t.symbol} — {t.name} (Bal: {t.balance.toLocaleString()} {t.symbol})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="🌐 All Supported Wallet Coins & Tokens">
                      {(tokensWithBalance.length === 0 ? tokens : otherTokens).map((t) => (
                        <option key={t.id} value={t.symbol}>
                          {t.symbol} — {t.name} {t.balance > 0 ? `(Bal: ${t.balance.toLocaleString()})` : `(~$${t.priceUsd.toLocaleString()})`}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Dynamic Live Wallet Token Info Card */}
              {selectedAdToken && (
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                        {selectedAdToken.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-white">{selectedAdToken.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-1.5">({selectedAdToken.symbol})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Your Spot Wallet Balance</span>
                      <span className="font-mono font-bold text-amber-300">
                        {selectedAdToken.balance.toLocaleString()} {selectedAdToken.symbol}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                    <span>
                      Holding Value:{' '}
                      <strong className="text-emerald-400 font-mono">
                        ${(selectedAdToken.balance * selectedAdToken.priceUsd).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        USD
                      </strong>
                    </span>
                    {adForm.type === 'sell' && selectedAdToken.balance > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAdForm((prev) => ({
                            ...prev,
                            availableAmount: selectedAdToken.balance.toString(),
                            maxLimit: Math.max(
                              parseFloat(prev.maxLimit) || 0,
                              Math.round(selectedAdToken.balance * (parseFloat(prev.price) || 1))
                            ).toString(),
                          }));
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        Sell Max Available Balance
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        Market: ~${selectedAdToken.priceUsd.toLocaleString()} USD
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Price and Available Amount Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">Fixed Price ({adForm.fiat})</label>
                    {selectedAdToken && (
                      <button
                        type="button"
                        onClick={() => {
                          const fiatRate =
                            adForm.fiat === 'EUR' ? 0.92 : adForm.fiat === 'GBP' ? 0.79 : adForm.fiat === 'INR' ? 86 : adForm.fiat === 'BDT' ? 122 : 1;
                          setAdForm((prev) => ({
                            ...prev,
                            price: (selectedAdToken.priceUsd * fiatRate).toFixed(selectedAdToken.priceUsd < 1 ? 4 : 2),
                          }));
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        Use Market
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={adForm.price}
                    onChange={(e) => setAdForm({ ...adForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">Total Available ({adForm.crypto})</label>
                    {selectedAdToken && selectedAdToken.balance > 0 && (
                      <button
                        type="button"
                        onClick={() => setAdForm({ ...adForm, availableAmount: selectedAdToken.balance.toString() })}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                      >
                        MAX
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={adForm.availableAmount}
                    onChange={(e) => setAdForm({ ...adForm, availableAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Fiat Currency and Limits */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fiat Currency</label>
                  <select
                    value={adForm.fiat}
                    onChange={(e) => {
                      const newFiat = e.target.value as any;
                      const fiatRate =
                        newFiat === 'EUR' ? 0.92 : newFiat === 'GBP' ? 0.79 : newFiat === 'INR' ? 86 : newFiat === 'BDT' ? 122 : 1;
                      setAdForm({
                        ...adForm,
                        fiat: newFiat,
                        price: (selectedAdToken.priceUsd * fiatRate).toFixed(selectedAdToken.priceUsd < 1 ? 4 : 2),
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="BDT">BDT (৳)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Min Limit ({adForm.fiat})</label>
                  <input
                    type="number"
                    value={adForm.minLimit}
                    onChange={(e) => setAdForm({ ...adForm, minLimit: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Limit ({adForm.fiat})</label>
                  <input
                    type="number"
                    value={adForm.maxLimit}
                    onChange={(e) => setAdForm({ ...adForm, maxLimit: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Payment Methods (comma separated)</label>
                <input
                  type="text"
                  value={adForm.paymentMethods}
                  onChange={(e) => setAdForm({ ...adForm, paymentMethods: e.target.value })}
                  placeholder="e.g. Bank Transfer, Wise, Zelle, Revolut"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Trade Terms &amp; Instructions</label>
                <input
                  type="text"
                  value={adForm.terms}
                  onChange={(e) => setAdForm({ ...adForm, terms: e.target.value })}
                  placeholder="e.g. Instant escrow release upon verified payment confirmation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition shadow-lg shadow-amber-500/20 mt-2"
              >
                {adForm.type === 'sell' ? 'Publish Sell Ad' : 'Publish Buy Ad'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MERCHANT APPLY MODAL */}
      {showMerchantApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Merchant Security Pledge</h3>
              <button onClick={() => setShowMerchantApplyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              To guarantee escrow safety for all retail traders, merchants lock a refundable security deposit of <strong>500 USDT</strong> in the protocol escrow vault.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Security Deposit:</span>
                <span className="text-amber-400 font-mono font-bold">500.00 USDT</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Merchant Status:</span>
                <span className="text-emerald-400">Instant Verification</span>
              </div>
            </div>

            <button
              onClick={handleApplyMerchant}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              Confirm Deposit & Activate Merchant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  WalletCards,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  Key,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Coins,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
  X,
  Eye,
  EyeOff,
  Search,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BlockchainNetwork, NetworkId, TokenItem, TransactionRecord, UserWallet } from '../types';
import { NETWORKS, StorageService } from '../services/storage';
import { generateAddress, generateMnemonic, generatePrivateKey, generateTxHash, shortenAddress } from '../utils/crypto';
import { Web3WalletService, PROVIDER_DOWNLOAD_URLS } from '../services/web3Wallet';

export interface WalletProviderDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: 'evm' | 'solana' | 'hardware' | 'multi';
  badge?: string;
}

export const WALLET_PROVIDERS: WalletProviderDef[] = [
  { id: 'metamask', name: 'MetaMask', desc: 'Popular EVM Browser & Mobile Extension', icon: '🦊', category: 'evm', badge: 'Popular' },
  { id: 'trust', name: 'Trust Wallet', desc: 'Multi-Asset Mobile & Extension', icon: '🛡️', category: 'multi', badge: 'Popular' },
  { id: 'phantom', name: 'Phantom', desc: 'Solana, BTC & Multi-Chain Wallet', icon: '👻', category: 'solana', badge: 'Popular' },
  { id: 'coinbase', name: 'Coinbase Wallet', desc: 'Self-Custody Mobile & Web3 SDK', icon: '🔵', category: 'multi', badge: 'Popular' },
  { id: 'rainbow', name: 'Rainbow', desc: 'Fun & Secure Ethereum / L2 Wallet', icon: '🌈', category: 'evm', badge: 'Top Pick' },
  { id: 'okx', name: 'OKX Wallet', desc: 'Universal Multi-Chain Gateway & DEX', icon: '⬛', category: 'multi', badge: 'Popular' },
  { id: 'rabby', name: 'Rabby Wallet', desc: 'Game-Changing Web3 EVM Extension', icon: '🐰', category: 'evm', badge: 'Top Pick' },
  { id: 'bitget', name: 'Bitget Wallet', desc: 'Multi-Chain Trading & Staking', icon: '🔷', category: 'multi' },
  { id: 'zerion', name: 'Zerion Wallet', desc: 'Smart Web3 & DeFi Portfolio Wallet', icon: '🧬', category: 'evm' },
  { id: 'ledger', name: 'Ledger', desc: 'Hardware Cold Storage via WebHID Bridge', icon: '🔐', category: 'hardware', badge: 'Hardware' },
  { id: 'trezor', name: 'Trezor', desc: 'Open-Source Cold Storage Hardware', icon: '🔒', category: 'hardware', badge: 'Hardware' },
  { id: 'safepal', name: 'SafePal S1', desc: 'Air-Gapped Hardware & App Ecosystem', icon: '🛡️', category: 'hardware', badge: 'Hardware' },
  { id: 'exodus', name: 'Exodus', desc: 'Multi-Currency Desktop & Mobile Vault', icon: '🪐', category: 'multi' },
  { id: 'argent', name: 'Argent', desc: 'Smart Contract & L2 Account Abstraction', icon: '⚡', category: 'evm' },
  { id: 'uniswap', name: 'Uniswap Wallet', desc: 'DeFi Native Mobile & Web3 Swapping', icon: '🦄', category: 'evm' },
  { id: 'backpack', name: 'Backpack', desc: 'Solana, EVM & xNFT Interactive Wallet', icon: '🎒', category: 'solana' },
  { id: 'solflare', name: 'Solflare', desc: 'Premier Solana Web3 Wallet & Staking', icon: '☀️', category: 'solana' },
  { id: 'keplr', name: 'Keplr', desc: 'The Interchain Cosmos & Web3 Gateway', icon: '🪐', category: 'multi' },
  { id: 'brave', name: 'Brave Wallet', desc: 'Built-in Native Privacy Browser Wallet', icon: '🦁', category: 'evm' },
  { id: '1inch', name: '1inch Wallet', desc: 'DeFi Aggregator & Protected Vault', icon: '🦄', category: 'evm' },
  { id: 'ronin', name: 'Ronin Wallet', desc: 'Web3 Gaming & Axie Infinity Ecosystem', icon: '⚔️', category: 'evm' },
  { id: 'tronlink', name: 'TronLink', desc: 'TRON Ecosystem TRC-20 & DApp Gateway', icon: '🔴', category: 'multi' },
  { id: 'sui', name: 'Sui / Petra Wallet', desc: 'Next-Gen Move & High-Throughput L1s', icon: '💧', category: 'multi' },
];

interface WalletViewProps {
  wallets: UserWallet[];
  activeWallet: UserWallet;
  activeNetwork: BlockchainNetwork;
  tokens: TokenItem[];
  onSelectWallet: (wallet: UserWallet) => void;
  onUpdateWallets: (wallets: UserWallet[]) => void;
  onUpdateTokens: (tokens: TokenItem[]) => void;
  onSelectNetwork: (network: BlockchainNetwork) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  wallets,
  activeWallet,
  activeNetwork,
  tokens,
  onSelectWallet,
  onUpdateWallets,
  onUpdateTokens,
  onSelectNetwork,
}) => {
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddTokenModal, setShowAddTokenModal] = useState(false);
  const [showKeyDetailsModal, setShowKeyDetailsModal] = useState(false);

  // Search & category filter for external wallets
  const [walletSearchQuery, setWalletSearchQuery] = useState('');
  const [walletCategoryFilter, setWalletCategoryFilter] = useState<'all' | 'popular' | 'evm' | 'solana' | 'hardware' | 'multi'>('all');

  // Real Web3 Wallet Authorization states
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [connectingProviderName, setConnectingProviderName] = useState('');
  const [connectWalletError, setConnectWalletError] = useState<string | null>(null);
  const [installGuideModal, setInstallGuideModal] = useState<{ name: string; url: string; providerId: string } | null>(null);

  // Wallet edit & delete management states
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editingWalletName, setEditingWalletName] = useState<string>('');
  const [deletingWalletId, setDeletingWalletId] = useState<string | null>(null);

  // Clipboard
  const [copied, setCopied] = useState(false);
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [copiedPrivateKey, setCopiedPrivateKey] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);

  // New Wallet Form state
  const [newWalletName, setNewWalletName] = useState('');
  const [createdSeed, setCreatedSeed] = useState<{ phrase: string; privateKey: string; address: string } | null>(null);

  // Withdraw Form state
  const [selectedWithdrawToken, setSelectedWithdrawToken] = useState<string>('DCOIN');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Custom Token Form state
  const [customTokenNetwork, setCustomTokenNetwork] = useState<NetworkId>('dcoine');
  const [customTokenContract, setCustomTokenContract] = useState('');
  const [customTokenSymbol, setCustomTokenSymbol] = useState('');
  const [customTokenName, setCustomTokenName] = useState('');
  const [customTokenDecimals, setCustomTokenDecimals] = useState('18');

  // Filter transactions
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>(() => StorageService.getTransactions());
  const [historyFilter, setHistoryFilter] = useState<'all' | 'deposit' | 'withdraw' | 'mine' | 'swap'>('all');

  // Calculate total fiat balance
  const totalBalanceUsd = tokens.reduce((sum, token) => sum + token.balance * token.priceUsd, 0);

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Create New Multi-Wallet
  const handleStartCreateWallet = () => {
    const mnemonic = generateMnemonic();
    const privateKey = generatePrivateKey();
    const address = generateAddress();
    setCreatedSeed({ phrase: mnemonic, privateKey, address });
    setNewWalletName(`Vault #${wallets.length + 1}`);
    setShowCreateModal(true);
  };

  const handleConfirmCreateWallet = () => {
    if (!createdSeed) return;

    const newWallet: UserWallet = {
      id: `w-${Date.now()}`,
      name: newWalletName.trim() || `Vault #${wallets.length + 1}`,
      address: createdSeed.address,
      mnemonicPhrase: createdSeed.phrase,
      privateKey: createdSeed.privateKey,
      network: activeNetwork.id,
      createdAt: Date.now(),
    };

    const updated = [...wallets, newWallet];
    onUpdateWallets(updated);
    StorageService.saveWallets(updated);
    onSelectWallet(newWallet);
    setShowCreateModal(false);
    setCreatedSeed(null);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // 2. Connect 3rd Party Wallet (Real Web3 Authorization)
  const handleConnectProvider = async (providerId: string, customDisplayName?: string) => {
    setConnectWalletError(null);
    const matchedProvider = WALLET_PROVIDERS.find((p) => p.id === providerId);
    const finalName =
      customDisplayName ||
      (matchedProvider
        ? `${matchedProvider.name} Wallet`
        : `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} Wallet`);

    setIsConnectingWallet(true);
    setConnectingProviderName(finalName);

    try {
      const result = await Web3WalletService.connectWallet(providerId, finalName);
      setIsConnectingWallet(false);

      if (result.success && result.address) {
        const newWallet: UserWallet = {
          id: `w-${providerId.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
          name: `${finalName} (Authorized)`,
          address: result.address,
          isExternal: true,
          provider: providerId,
          network: activeNetwork.id,
          isAuthorized: true,
          createdAt: Date.now(),
        };
        const updated = [...wallets, newWallet];
        onUpdateWallets(updated);
        StorageService.saveWallets(updated);
        onSelectWallet(newWallet);
        setShowConnectModal(false);
        setWalletSearchQuery('');
        setWalletCategoryFilter('all');
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
        return;
      }

      if (!result.isRealProvider) {
        setInstallGuideModal({
          name: finalName,
          url: result.installUrl || 'https://metamask.io/download/',
          providerId,
        });
      } else {
        setConnectWalletError(result.error || 'Connection authorization declined in wallet.');
      }
    } catch (err: any) {
      setIsConnectingWallet(false);
      setConnectWalletError(err?.message || 'Failed to authorize wallet connection.');
    }
  };

  const handleConnectSimulatedFallback = (providerId: string, customDisplayName?: string) => {
    const fakeAddress = generateAddress();
    const finalName = customDisplayName || `${providerId} Wallet`;
    const newWallet: UserWallet = {
      id: `w-${providerId.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name: `${finalName} (Simulated)`,
      address: fakeAddress,
      isExternal: true,
      provider: providerId,
      network: activeNetwork.id,
      isAuthorized: false,
      createdAt: Date.now(),
    };
    const updated = [...wallets, newWallet];
    onUpdateWallets(updated);
    StorageService.saveWallets(updated);
    onSelectWallet(newWallet);
    setInstallGuideModal(null);
    setShowConnectModal(false);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // 2b. Wallet Edit & Delete Management
  const handleStartEditWallet = (w: UserWallet) => {
    setEditingWalletId(w.id);
    setEditingWalletName(w.name);
    setDeletingWalletId(null);
  };

  const handleSaveEditWallet = (walletId: string) => {
    if (!editingWalletName.trim()) return;
    const updated = wallets.map((w) =>
      w.id === walletId ? { ...w, name: editingWalletName.trim() } : w
    );
    onUpdateWallets(updated);
    StorageService.saveWallets(updated);
    if (activeWallet.id === walletId) {
      onSelectWallet({ ...activeWallet, name: editingWalletName.trim() });
    }
    setEditingWalletId(null);
    setEditingWalletName('');
  };

  const handleDeleteWallet = (walletId: string) => {
    if (wallets.length <= 1) {
      alert('You must have at least one wallet. Cannot delete your only wallet.');
      return;
    }
    const remaining = wallets.filter((w) => w.id !== walletId);
    onUpdateWallets(remaining);
    StorageService.saveWallets(remaining);
    if (activeWallet.id === walletId && remaining.length > 0) {
      onSelectWallet(remaining[0]);
    }
    setDeletingWalletId(null);
  };

  // 3. Withdraw Action
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = tokens.find((t) => t.symbol === selectedWithdrawToken);
    const amountNum = parseFloat(withdrawAmount);

    if (!token || isNaN(amountNum) || amountNum <= 0) return;
    
    // Check locked mined balance in native DC wallet
    const lockedAmount = token.symbol === 'DCOIN' ? (token.lockedBalance || 0) : 0;
    const availableTransferable = Math.max(0, token.balance - lockedAmount);

    if (amountNum > availableTransferable) {
      alert(`Cannot transfer locked mined DCOIN. Mined rewards (${lockedAmount.toFixed(2)} DCOIN) are permanently locked in your native platform DC wallet and cannot be transferred or moved to external wallets. Available to transfer: ${availableTransferable.toFixed(2)} ${token.symbol}.`);
      return;
    }

    if (amountNum > token.balance) {
      alert(`Insufficient ${token.symbol} balance.`);
      return;
    }
    if (!withdrawAddress.startsWith('0x') && withdrawAddress.length < 24) {
      alert('Please enter a valid destination blockchain address.');
      return;
    }

    setIsSubmittingWithdraw(true);

    setTimeout(() => {
      // Deduct balance
      const updatedTokens = tokens.map((t) => {
        if (t.symbol === token.symbol) {
          return { ...t, balance: parseFloat((t.balance - amountNum).toFixed(4)) };
        }
        return t;
      });
      onUpdateTokens(updatedTokens);
      StorageService.saveTokens(updatedTokens);

      // Record transaction
      const tx: TransactionRecord = {
        id: `tx-wd-${Date.now()}`,
        type: 'withdraw',
        symbol: token.symbol,
        amount: amountNum,
        fiatValue: amountNum * token.priceUsd,
        network: activeNetwork.id,
        hash: generateTxHash(),
        from: activeWallet.address,
        to: withdrawAddress,
        status: 'completed',
        timestamp: Date.now(),
        fee: 0.002,
      };

      StorageService.addTransaction(tx);
      setTxHistory(StorageService.getTransactions());

      setIsSubmittingWithdraw(false);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');

      confetti({
        particleCount: 50,
        spread: 60,
      });
    }, 1200);
  };

  // 4. Add Custom Token
  const handleAddCustomToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTokenSymbol.trim() || !customTokenContract.trim()) {
      alert('Contract address and Token Symbol are required.');
      return;
    }

    const newToken: TokenItem = {
      id: `token-${customTokenSymbol.toLowerCase()}-${Date.now()}`,
      symbol: customTokenSymbol.trim().toUpperCase(),
      name: customTokenName.trim() || customTokenSymbol.trim().toUpperCase(),
      network: customTokenNetwork,
      contractAddress: customTokenContract.trim(),
      decimals: parseInt(customTokenDecimals, 10) || 18,
      balance: 100.0, // Initial imported sample balance
      priceUsd: 1.0,
      change24h: 0.0,
      isCustom: true,
    };

    const updatedTokens = [...tokens, newToken];
    onUpdateTokens(updatedTokens);
    StorageService.saveTokens(updatedTokens);

    setShowAddTokenModal(false);
    setCustomTokenContract('');
    setCustomTokenSymbol('');
    setCustomTokenName('');

    confetti({
      particleCount: 40,
      spread: 50,
    });
  };

  // Filtered transactions
  const filteredTxs = txHistory.filter((t) => {
    if (historyFilter === 'all') return true;
    return t.type === historyFilter;
  });

  // Filtered third-party / external wallets
  const filteredWallets = WALLET_PROVIDERS.filter((provider) => {
    const query = walletSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      provider.name.toLowerCase().includes(query) ||
      provider.desc.toLowerCase().includes(query) ||
      provider.id.toLowerCase().includes(query) ||
      provider.category.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    if (walletCategoryFilter === 'all') return true;
    if (walletCategoryFilter === 'popular') return provider.badge === 'Popular' || provider.badge === 'Top Pick';
    return provider.category === walletCategoryFilter;
  });

  return (
    <div className="space-y-5 pb-24 max-w-3xl mx-auto px-3 sm:px-4">
      {/* Wallet Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <WalletCards className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">{activeWallet.name}</h1>
                {activeWallet.isExternal && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeWallet.provider?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                <span>{shortenAddress(activeWallet.address, 6)}</span>
                <button
                  onClick={() => handleCopyAddress(activeWallet.address)}
                  className="hover:text-amber-400 p-0.5 transition"
                  title="Copy full address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowSwitchModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Switch ({wallets.length})</span>
            </button>

            {!activeWallet.isExternal && (
              <button
                onClick={() => setShowKeyDetailsModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-xs text-amber-400 font-medium transition cursor-pointer"
                title="View Seed Phrase and Private Keys"
              >
                <Key className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Keys</span>
              </button>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="mt-5">
          <span className="text-xs text-slate-400 font-medium block">Total Estimated Portfolio</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              ${totalBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +4.82% 24h
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connected via <span className="text-amber-400 font-semibold">{activeNetwork.name}</span>
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-4 gap-2.5 mt-6">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition transform active:scale-95"
          >
            <ArrowDownLeft className="w-5 h-5 mb-1" />
            <span className="text-xs font-semibold">Deposit</span>
          </button>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition transform active:scale-95"
          >
            <ArrowUpRight className="w-5 h-5 mb-1 text-slate-300" />
            <span className="text-xs font-semibold">Withdraw</span>
          </button>

          <button
            onClick={handleStartCreateWallet}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition transform active:scale-95"
          >
            <Plus className="w-5 h-5 mb-1 text-slate-300" />
            <span className="text-xs font-semibold">New Wallet</span>
          </button>

          <button
            onClick={() => setShowConnectModal(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition transform active:scale-95"
          >
            <Layers className="w-5 h-5 mb-1 text-indigo-400" />
            <span className="text-xs font-semibold">Connect 3P</span>
          </button>
        </div>
      </div>

      {/* Asset List & Coin Management */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Cryptocurrency Holdings</h2>
            <p className="text-xs text-slate-400">Tokens on your multi-chain address</p>
          </div>

          <button
            onClick={() => setShowAddTokenModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 flex-shrink-0" />
            <span>+ Add Token</span>
          </button>
        </div>

        {/* Token Table / Cards */}
        <div className="space-y-2">
          {tokens.map((token) => {
            const tokenValueUsd = token.balance * token.priceUsd;
            return (
              <div
                key={token.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  {token.iconUrl ? (
                    <img src={token.iconUrl} alt={token.symbol} className="w-9 h-9 rounded-full object-contain" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400">
                      {token.symbol.substring(0, 3)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{token.symbol}</span>
                      {token.isCustom && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">Custom</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>${token.priceUsd.toLocaleString()}</span>
                      <span className={token.change24h >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-white">
                    {token.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    ≈ ${tokenValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {token.lockedBalance && token.lockedBalance > 0 && (
                    <div className="text-[10px] text-amber-400 font-mono flex items-center justify-end gap-1 mt-0.5" title="Mined DCOIN locked in native platform wallet">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{token.lockedBalance.toFixed(2)} Locked Mined</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History & Filter */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Transaction Activity</h2>
            <p className="text-xs text-slate-400">On-chain ledger tracking deposits, withdrawals & swaps</p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'deposit', 'withdraw', 'mine', 'swap'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setHistoryFilter(tab)}
                className={`px-2.5 py-1 rounded-xl text-xs capitalize transition ${
                  historyFilter === tab
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredTxs.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500">No transactions found for this filter.</p>
          ) : (
            filteredTxs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/70 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                    {tx.type === 'deposit' && <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                    {tx.type === 'withdraw' && <ArrowUpRight className="w-4 h-4 text-rose-400" />}
                    {tx.type === 'mine' && <Sparkles className="w-4 h-4 text-amber-400" />}
                    {tx.type === 'swap' && <RefreshCw className="w-4 h-4 text-blue-400" />}
                    {(tx.type === 'p2p_buy' || tx.type === 'p2p_sell') && <WalletCards className="w-4 h-4 text-purple-400" />}
                    {tx.type === 'referral' && <Coins className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div>
                    <span className="font-semibold text-white capitalize">{tx.type.replace('_', ' ')}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">
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
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 1. MODAL: Create New Multi-Wallet with Mnemonic Phrase */}
      {showCreateModal && createdSeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create New Non-Custodial Vault</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Wallet Label</label>
              <input
                type="text"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="e.g. Savings Vault, Staking Wallet"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong>Critical Security Rule:</strong> Write down these 12 words in safe order. Never disclose them to anyone. Dcoine support will NEVER ask for your seed phrase.
              </div>
            </div>

            {/* 12-Word Seed Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {createdSeed.phrase.split(' ').map((word, idx) => (
                <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono w-4">{idx + 1}.</span>
                  <span className="font-mono text-amber-300 font-medium">{word}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdSeed.phrase);
                  setCopiedMnemonic(true);
                  setTimeout(() => setCopiedMnemonic(false), 2000);
                }}
                className="flex items-center gap-1 text-slate-300 hover:text-amber-400"
              >
                {copiedMnemonic ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMnemonic ? 'Mnemonic Copied!' : 'Copy 12 Words'}</span>
              </button>

              <span className="text-slate-500 text-[11px]">BIP-39 Standard 128-bit</span>
            </div>

            <button
              onClick={handleConfirmCreateWallet}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300 transition"
            >
              I Have Saved My Seed Phrase
            </button>
          </div>
        </div>
      )}

      {/* 2. MODAL: Connect 3rd Party Wallet with Search */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md max-h-[88vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-3.5 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="text-base font-bold text-white flex flex-wrap items-center gap-2 leading-snug">
                  <span>Connect External Wallet</span>
                  <span className="inline-flex items-center justify-center text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full leading-normal text-center whitespace-nowrap tracking-wide align-middle">
                    {WALLET_PROVIDERS.length}+ Supported
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Search & connect your preferred Web3 or hardware wallet
                </p>
              </div>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setWalletSearchQuery('');
                  setWalletCategoryFilter('all');
                  setConnectWalletError(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex-shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Awaiting Real Web3 Authorization Status */}
            {isConnectingWallet && (
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300 animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold block">Awaiting Wallet Authorization...</span>
                  <span className="text-[11px] text-slate-300">
                    Please approve the connection prompt in your {connectingProviderName} popup window.
                  </span>
                </div>
              </div>
            )}

            {/* Connection Error Notification */}
            {connectWalletError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{connectWalletError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConnectWalletError(null)}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Wallet Search Box */}
            <div className="relative flex-shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={walletSearchQuery}
                onChange={(e) => setWalletSearchQuery(e.target.value)}
                placeholder="Search wallet (e.g. Rainbow, OKX, Ledger, Rabby...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition"
                autoFocus
              />
              {walletSearchQuery && (
                <button
                  type="button"
                  onClick={() => setWalletSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] w-full py-0.5">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'popular', label: '🔥 Popular' },
                  { id: 'evm', label: 'EVM' },
                  { id: 'solana', label: 'Solana' },
                  { id: 'hardware', label: 'Hardware' },
                  { id: 'multi', label: 'Multi-Chain' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setWalletCategoryFilter(cat.id)}
                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition text-xs leading-none text-center ${
                    walletCategoryFilter === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Wallets List (Scrollable) */}
            <div className="space-y-2 overflow-y-auto pr-1 max-h-64 sm:max-h-72">
              {filteredWallets.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">No listed wallet for "{walletSearchQuery}"</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      You can connect and add this as a custom Web3 provider to your Dcoine portfolio!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConnectProvider(walletSearchQuery.trim(), `${walletSearchQuery.trim()} Wallet`)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-bold hover:from-amber-400 hover:to-yellow-300 transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect & Add "{walletSearchQuery.trim()}"</span>
                  </button>
                </div>
              ) : (
                <>
                  {filteredWallets.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleConnectProvider(provider.id, `${provider.name} Wallet`)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900 transition group text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0">{provider.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                              {provider.name}
                            </span>
                            {provider.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30 flex-shrink-0">
                                {provider.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{provider.desc}</p>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-500 -rotate-90 group-hover:text-amber-400 flex-shrink-0 transition" />
                    </button>
                  ))}

                  {/* Quick option to connect as custom wallet if user searches */}
                  {walletSearchQuery.trim().length > 0 &&
                    !filteredWallets.some((w) => w.name.toLowerCase() === walletSearchQuery.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => handleConnectProvider(walletSearchQuery.trim(), `${walletSearchQuery.trim()} Wallet`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-amber-500/5 border border-dashed border-amber-500/30 hover:bg-amber-500/10 text-left transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">✨</span>
                          <div>
                            <span className="text-xs font-bold text-amber-400">
                              Connect as custom: "{walletSearchQuery.trim()}"
                            </span>
                            <p className="text-[10px] text-slate-400">Add custom Web3 wallet to Dcoine</p>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-amber-400" />
                      </button>
                    )}
                </>
              )}
            </div>

            {/* Non-custodial security note & count */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex-shrink-0">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Non-Custodial & Encrypted</span>
              </span>
              <span>Showing {filteredWallets.length} of {WALLET_PROVIDERS.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL: Switch & Manage Wallets */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md max-h-[88vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-3.5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Manage Wallets</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                    {wallets.length} Connected
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select active wallet, edit details, or remove wallets
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSwitchModal(false);
                  setEditingWalletId(null);
                  setDeletingWalletId(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallets List */}
            <div className="space-y-2.5 overflow-y-auto pr-1 max-h-72 sm:max-h-80">
              {wallets.map((w) => {
                const isCurrent = w.id === activeWallet.id;
                const isEditing = editingWalletId === w.id;
                const isDeleting = deletingWalletId === w.id;

                return (
                  <div
                    key={w.id}
                    className={`p-3.5 rounded-2xl border transition space-y-2.5 ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-slate-950 border-slate-800/90 text-slate-300'
                    }`}
                  >
                    {/* Wallet Details / Editing Input */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 block">Edit Wallet Name</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingWalletName}
                            onChange={(e) => setEditingWalletName(e.target.value)}
                            placeholder="Wallet name..."
                            className="w-full bg-slate-900 border border-amber-500/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditWallet(w.id);
                              if (e.key === 'Escape') setEditingWalletId(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditWallet(w.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition flex items-center gap-1 text-xs"
                            title="Save name"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingWalletId(null)}
                            className="px-2 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{w.address}</p>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">{w.name}</span>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold leading-none">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                Active
                              </span>
                            )}
                            {w.isExternal ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 leading-none capitalize">
                                {w.provider || 'External'}
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 leading-none">
                                Vault
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-mono text-slate-400">{shortenAddress(w.address, 6)}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyAddress(w.address)}
                              className="text-slate-500 hover:text-amber-400 p-0.5 transition"
                              title="Copy full address"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delete Confirmation Box */}
                    {isDeleting && (
                      <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 space-y-2 animate-in fade-in">
                        <div className="flex items-center gap-1.5 text-xs text-red-300 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          <span>Delete "{w.name}"? Back up private keys first!</span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDeletingWalletId(null)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWallet(w.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Confirm Delete</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Row: SELECT | EDIT | DELETE */}
                    {!isDeleting && !isEditing && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-1.5">
                        {/* 1. SELECT BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectWallet(w);
                            setShowSwitchModal(false);
                          }}
                          disabled={isCurrent}
                          className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            isCurrent
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-default'
                              : 'bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-800'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isCurrent ? 'Active' : 'Select'}</span>
                        </button>

                        {/* 2. EDIT BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleStartEditWallet(w)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition"
                          title="Edit wallet details"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {/* 3. DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => setDeletingWalletId(w.id)}
                          disabled={wallets.length <= 1}
                          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            wallets.length <= 1
                              ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                              : 'bg-slate-900 hover:bg-red-950/60 hover:text-red-400 hover:border-red-500/40 text-slate-400 border-slate-800'
                          }`}
                          title={wallets.length <= 1 ? 'Cannot delete your only wallet' : 'Delete wallet'}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 flex-shrink-0">
              <button
                onClick={() => {
                  setShowSwitchModal(false);
                  handleStartCreateWallet();
                }}
                className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Create Vault</span>
              </button>

              <button
                onClick={() => {
                  setShowSwitchModal(false);
                  setShowConnectModal(true);
                }}
                className="py-2.5 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 transition flex items-center justify-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>+ Connect 3P</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: Deposit QR Code */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Deposit Crypto</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Selected Network:{' '}
              <span className="text-amber-400 font-bold">{activeNetwork.name} ({activeNetwork.symbol})</span>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
              <div className="w-44 h-44 flex flex-col items-center justify-center relative">
                {/* SVG QR Code Simulation */}
                <div className="grid grid-cols-6 gap-1 w-36 h-36 p-1">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 7 === 0 || i < 8 || i > 28) ? 'bg-slate-950' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                <img
                  src="/logo.png"
                  alt="Dcoine"
                  className="absolute w-8 h-8 rounded-full bg-white p-0.5 shadow-md"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Your {activeNetwork.name} Receiving Address</span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 break-all">
                <span>{activeWallet.address}</span>
                <button
                  onClick={() => handleCopyAddress(activeWallet.address)}
                  className="p-1 hover:text-white ml-2 flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Send only {activeNetwork.symbol} and standard supported tokens to this address. Incoming transfers arrive after 1 confirmation.
            </p>
          </div>
        </div>
      )}

      {/* 5. MODAL: Withdrawal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Withdraw Crypto</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Select Asset</label>
                <select
                  value={selectedWithdrawToken}
                  onChange={(e) => setSelectedWithdrawToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {tokens.map((t) => (
                    <option key={t.id} value={t.symbol}>
                      {t.symbol} — {t.name} (Bal: {t.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Destination Address</label>
                <input
                  type="text"
                  required
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="0x... or recipient public address"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300">Amount</span>
                  <button
                    type="button"
                    onClick={() => {
                      const t = tokens.find((tok) => tok.symbol === selectedWithdrawToken);
                      if (t) {
                        const locked = t.symbol === 'DCOIN' ? (t.lockedBalance || 0) : 0;
                        const avail = Math.max(0, t.balance - locked);
                        setWithdrawAmount(avail.toString());
                      }
                    }}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Max Transferable
                  </button>
                </div>
                {selectedWithdrawToken === 'DCOIN' && (
                  <div className="mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Native Wallet Locked Mined Policy:</strong> Mined DC rewards are locked in your native platform wallet and cannot be transferred to external wallets.
                    </div>
                  </div>
                )}
                <input
                  type="number"
                  step="any"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Network Gas Fee:</span>
                  <span className="text-slate-200 font-mono">≈ 0.002 {activeNetwork.symbol} ($0.15)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Arrival:</span>
                  <span className="text-emerald-400">~ 20 seconds</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingWithdraw}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {isSubmittingWithdraw ? 'Broadcasting to Blockchain...' : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Add Custom Token */}
      {showAddTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Import Custom Token</h3>
              <button onClick={() => setShowAddTokenModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomToken} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Network</label>
                <select
                  value={customTokenNetwork}
                  onChange={(e) => setCustomTokenNetwork(e.target.value as NetworkId)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none"
                >
                  {NETWORKS.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Contract Address</label>
                <input
                  type="text"
                  required
                  value={customTokenContract}
                  onChange={(e) => setCustomTokenContract(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Token Symbol</label>
                  <input
                    type="text"
                    required
                    value={customTokenSymbol}
                    onChange={(e) => setCustomTokenSymbol(e.target.value)}
                    placeholder="e.g. PEPE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Decimals</label>
                  <input
                    type="number"
                    value={customTokenDecimals}
                    onChange={(e) => setCustomTokenDecimals(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Token Name (Optional)</label>
                <input
                  type="text"
                  value={customTokenName}
                  onChange={(e) => setCustomTokenName(e.target.value)}
                  placeholder="e.g. Pepe Coin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition"
              >
                Import Token
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: View Seed Phrase and Private Keys */}
      {showKeyDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Wallet Security Credentials</h3>
              </div>
              <button onClick={() => setShowKeyDetailsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Vault: {activeWallet.name}</span>
              <button
                onClick={() => setRevealSecret(!revealSecret)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:underline"
              >
                {revealSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{revealSecret ? 'Hide Credentials' : 'Tap to Reveal'}</span>
              </button>
            </div>

            {/* Mnemonic Seed Phrase */}
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1">12-Word Mnemonic Phrase</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 select-all">
                {revealSecret
                  ? activeWallet.mnemonicPhrase || 'No mnemonic for external wallet.'
                  : '•••••••••••• •••••••••••• •••••••••••• ••••••••••••'}
              </div>
            </div>

            {/* Private Key */}
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1">Private Key (Hex)</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                {revealSecret
                  ? activeWallet.privateKey || 'Managed by external provider.'
                  : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <strong>Caution:</strong> Anyone with access to your private key or mnemonic can permanently control all your assets. Never share these credentials.
            </div>

            <button
              onClick={() => setShowKeyDetailsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 8. MODAL: Provider Extension Not Installed Prompt */}
      {installGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <WalletCards className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{installGuideModal.name} Not Detected</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                The {installGuideModal.name} browser extension was not found in your current browser. To connect and authorize with your real on-chain account, please install the official extension or open Dcoine in your wallet's built-in dApp browser.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={installGuideModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <span>Install Official {installGuideModal.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() =>
                  handleConnectSimulatedFallback(installGuideModal.providerId, installGuideModal.name)
                }
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                Connect in Simulated Demo Mode
              </button>

              <button
                type="button"
                onClick={() => setInstallGuideModal(null)}
                className="text-xs text-slate-500 hover:text-slate-300 py-1 block mx-auto cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

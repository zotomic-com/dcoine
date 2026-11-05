import React, { useState, useRef } from 'react';
import {
  Compass,
  Search,
  ExternalLink,
  ShieldCheck,
  Star,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Globe,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  X,
  Bookmark,
  Sparkles,
  ChevronRight,
  Wallet,
  FileCode,
  Layers,
  AlertCircle,
  Home,
} from 'lucide-react';
import { DAppItem } from '../types';
import { StorageService } from '../services/storage';

interface BrowserHistoryItem {
  url: string;
  title: string;
}

export const ExplorerView: React.FC = () => {
  const [dapps] = useState<DAppItem[]>(() => StorageService.getDApps());
  const [category, setCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Mode: 'explorer' (directory + lookup results) or 'browser' (in-app Web3 dApp browser)
  const [activeMode, setActiveMode] = useState<'explorer' | 'browser'>('explorer');

  // Input Box State (Targeted by CSS Selector 2)
  const [lookupQuery, setLookupQuery] = useState('');

  // Web3 Browser State
  const [browserUrl, setBrowserUrl] = useState('https://app.uniswap.org');
  const [browserInputUrl, setBrowserInputUrl] = useState('https://app.uniswap.org');
  const [history, setHistory] = useState<BrowserHistoryItem[]>([
    { url: 'https://app.uniswap.org', title: 'Uniswap Interface' },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Blockchain Explorer Lookup State
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    type: 'tx' | 'address' | 'block';
    hash: string;
    details: Record<string, string>;
  } | null>(null);

  // Quick Bookmarks for Web3 Browser
  const quickDApps = [
    { name: 'Uniswap', url: 'https://app.uniswap.org', icon: '🦄', desc: 'DEX & Liquidity' },
    { name: 'DexScreener', url: 'https://dexscreener.com', icon: '📊', desc: 'Live Charts' },
    { name: '1inch', url: 'https://app.1inch.io', icon: '⚡', desc: 'DEX Aggregator' },
    { name: 'Aave', url: 'https://app.aave.com', icon: '👻', desc: 'Lending & Borrowing' },
    { name: 'OpenSea', url: 'https://opensea.io', icon: '🌊', desc: 'NFT Marketplace' },
    { name: 'Etherscan', url: 'https://etherscan.io', icon: '🔍', desc: 'Blockchain Ledger' },
    { name: 'CoinGecko', url: 'https://www.coingecko.com', icon: '🦎', desc: 'Crypto Prices' },
  ];

  const categories = ['All', 'Staking', 'DEX', 'DeFi', 'NFT'];

  const filteredDApps = dapps.filter((d) => {
    if (category !== 'All' && d.category !== category) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.chain.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Helper to check if string looks like a web link / URL
  const isWebUrl = (query: string): boolean => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return false;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
    if (trimmed.startsWith('www.')) return true;
    // Don't treat 0x addresses or hashes as URLs
    if (trimmed.startsWith('0x')) return false;
    // Don't treat numeric blocks as URLs
    if (/^\d+$/.test(trimmed)) return false;
    // Check if it has a valid domain extension or dot
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:[0-9]+)?(\/.*)?$/i;
    if (domainRegex.test(trimmed)) return true;
    // Common Web3 and web TLDs
    const commonTlds = ['.com', '.org', '.io', '.net', '.xyz', '.app', '.fi', '.eth', '.sol', '.exchange', '.finance', '.fun', '.trade'];
    return commonTlds.some((tld) => trimmed.includes(tld)) && !trimmed.includes(' ');
  };

  const normalizeUrl = (query: string): string => {
    let url = query.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  };

  // Navigate to a URL in the browser
  const navigateBrowser = (targetUrl: string, title?: string) => {
    const formatted = normalizeUrl(targetUrl);
    setBrowserUrl(formatted);
    setBrowserInputUrl(formatted);
    setActiveMode('browser');
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ url: formatted, title: title || formatted });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleBrowserBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      const prevItem = history[newIdx];
      setBrowserUrl(prevItem.url);
      setBrowserInputUrl(prevItem.url);
      setIsIframeLoading(true);
      setIframeKey((prev) => prev + 1);
    }
  };

  const handleBrowserForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      const nextItem = history[newIdx];
      setBrowserUrl(nextItem.url);
      setBrowserInputUrl(nextItem.url);
      setIsIframeLoading(true);
      setIframeKey((prev) => prev + 1);
    }
  };

  const handleBrowserRefresh = () => {
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(browserUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Main Search / Lookup Handler (Triggered by form submission)
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) return;

    // 1. If it's a web link or domain name, act as a browser!
    if (isWebUrl(query)) {
      navigateBrowser(query);
      return;
    }

    // 2. Blockchain Explorer Mode: Tx Hash
    if (query.startsWith('0x') && query.length >= 44) {
      setActiveMode('explorer');
      setLookupResult({
        found: true,
        type: 'tx',
        hash: query,
        details: {
          Status: 'Success (Confirmed by 48 validators)',
          'Block Height': '19,482,109',
          Network: 'Dcoine Mainnet (EVM)',
          Timestamp: '12 seconds ago',
          From: '0x9fa4b2e817c6e0018a99cde3194a02be9761e05a8d90',
          To: '0x7b1c4e912384a9ff001cda87204918ef12847a9e1029',
          Value: '125.00 DCOIN ($185.00 USD)',
          'Gas Fee': '0.00045 DCOIN ($0.00067)',
          'Gas Price': '14.2 Gwei',
          Nonce: '68',
        },
      });
      return;
    }

    // 3. Blockchain Explorer Mode: Address / Contract
    if (query.startsWith('0x') && query.length >= 38) {
      setActiveMode('explorer');
      setLookupResult({
        found: true,
        type: 'address',
        hash: query,
        details: {
          'DCOIN Balance': '1,420.50 DCOIN ($2,102.34)',
          'Portfolio Value': '$5,380.20 USD',
          'Token Holdings': 'USDT (2,450.00), ETH (0.85), BTC (0.02)',
          Transactions: '84 total transactions',
          Network: 'Multi-Chain EVM (Dcoine, Ethereum, BSC)',
          'Contract Type': 'EOA (External Owned Wallet)',
          'First Seen': '218 days ago',
        },
      });
      return;
    }

    // 4. Blockchain Explorer Mode: Block Number
    if (/^\d+$/.test(query)) {
      setActiveMode('explorer');
      setLookupResult({
        found: true,
        type: 'block',
        hash: `Block #${query}`,
        details: {
          'Block Height': query,
          'Block Hash': `0x8f2a4b910c...${query.slice(-4)}`,
          Validator: 'Dcoine-Staking-Pool-Alpha',
          'Tx Count': '142 transactions included',
          Reward: '2.00 DCOIN + 0.042 tips',
          'Gas Used': '14,892,100 / 30,000,000 (49.6%)',
          Timestamp: 'Just now (Finalized)',
        },
      });
      return;
    }

    // 5. If query contains keywords or web search term, open web search browser or search DApps
    if (query.includes(' ') || !query.startsWith('0x')) {
      // If user typed something like "uniswap" or "google.com" or a search query
      const matchingDApp = dapps.find((d) => d.name.toLowerCase() === query.toLowerCase());
      if (matchingDApp) {
        navigateBrowser(matchingDApp.url, matchingDApp.name);
      } else {
        // Open web search in the browser
        navigateBrowser(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, `Search: ${query}`);
      }
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-4">
      {/* Header Banner & Dual Browser / Explorer Omnibar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Web3 Browser & Chain Explorer
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Dual Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse any Web3 dApp link, explore transactions, wallet addresses, and block records
              </p>
            </div>
          </div>

          {/* Quick Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveMode('explorer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeMode === 'explorer'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Explorer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('browser')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeMode === 'browser'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Browser</span>
            </button>
          </div>
        </div>

        {/* Browser & Blockchain Search Form (Matched by CSS Selector 1 & 2) */}
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
              {isWebUrl(lookupQuery) ? (
                <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Search className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Paste Web Link (e.g. app.uniswap.org), 0x Address, Tx Hash, or Block #..."
              className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>search</span>
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Quick DApp Launcher Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick DApps:
          </span>
          {quickDApps.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setLookupQuery(item.url);
                navigateBrowser(item.url, item.name);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1.5 shrink-0"
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Blockchain Lookup Result Card */}
        {lookupResult && activeMode === 'explorer' && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white uppercase tracking-wide">
                  Verified On-Chain {lookupResult.type} Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLookupResult(null)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            </div>

            <div className="font-mono text-amber-300 break-all text-[11px] bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <span className="truncate">{lookupResult.hash}</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(lookupResult.hash);
                  }
                }}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0"
                title="Copy hash"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {Object.entries(lookupResult.details).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[11px]">
                  <span className="text-slate-400">{k}:</span>
                  <span className="font-medium text-slate-200 text-right truncate max-w-[200px]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WEB3 BROWSER VIEW (Active when activeMode === 'browser' or when user navigates to a URL) */}
      {activeMode === 'browser' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200">
          {/* Browser Navigation Toolbar */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              {/* Navigation Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleBrowserBack}
                  disabled={historyIndex <= 0}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleBrowserForward}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
                  title="Forward"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleBrowserRefresh}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Reload"
                >
                  <RotateCw className={`w-4 h-4 ${isIframeLoading ? 'animate-spin text-amber-400' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => navigateBrowser('https://app.uniswap.org', 'Uniswap')}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Home"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>

              {/* Browser Omnibar / Address Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigateBrowser(browserInputUrl);
                }}
                className="flex-1 relative flex items-center"
              >
                <div className="absolute left-2.5 flex items-center gap-1 text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold hidden md:inline">Secure</span>
                </div>
                <input
                  type="text"
                  value={browserInputUrl}
                  onChange={(e) => setBrowserInputUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-8 md:pl-20 pr-16 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] hover:bg-amber-400 transition"
                >
                  Go
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={browserUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Open in Native Browser Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMode('explorer')}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Minimize Browser"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Injected Web3 State & Notice */}
            <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Web3 Provider Injected
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
                  Chain: Dcoine Mainnet (EVM)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={browserUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 hover:underline"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Browser Content Frame */}
          <div className="relative w-full h-[540px] sm:h-[620px] bg-slate-950 flex flex-col">
            {isIframeLoading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-300 font-medium">Loading Web3 Application...</p>
                <p className="text-[11px] font-mono text-slate-500 max-w-sm text-center truncate">{browserUrl}</p>
              </div>
            )}

            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={browserUrl}
              title="Web3 dApp Browser"
              onLoad={() => setIsIframeLoading(false)}
              className="w-full h-full border-0 bg-slate-950"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />

            {/* Bottom Browser Bar with iframe notice and direct launch */}
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Browsing in sandbox mode. Some external dApps restrict iframe embedding.
                </span>
              </div>
              <a
                href={browserUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1.5 transition shrink-0"
              >
                <span>Launch in Separate Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DApp Categories & Filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-48 hidden sm:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter apps..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Verified DApps Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredDApps.map((dapp) => (
          <div
            key={dapp.id}
            className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 shadow-lg group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-2xl border ${dapp.iconBg} flex items-center justify-center font-bold text-xs`}>
                    <Globe className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">{dapp.name}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>{dapp.chain}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {dapp.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {dapp.badge}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{dapp.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLookupQuery(dapp.url);
                  navigateBrowser(dapp.url, dapp.name);
                }}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Open in App</span>
              </button>

              <a
                href={dapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <span>New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Download,
  Filter,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Coins,
  Receipt,
  Layers,
  Save,
} from 'lucide-react';
import { RevenueRecord } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminEarningsTabProps {
  revenueRecords: RevenueRecord[];
  initialFilter?: string;
  onUpdateCommissionRates?: (p2pFee: number, swapFee: number) => void;
}

export const AdminEarningsTab: React.FC<AdminEarningsTabProps> = ({
  revenueRecords,
  initialFilter = 'all',
  onUpdateCommissionRates,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(initialFilter);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  // Commission controls state
  const siteSettings = StorageService.getSiteSettings();
  const [p2pFeePercent, setP2pFeePercent] = useState<number>(siteSettings.p2pSellFeePercent || 0.5);
  const [swapFeePercent, setSwapFeePercent] = useState<number>(siteSettings.swapFeePercent || 0.25);
  const [isSavedRate, setIsSavedRate] = useState(false);

  // Calculations
  const p2pRecords = revenueRecords.filter((r) => r.type === 'p2p_sell');
  const swapRecords = revenueRecords.filter((r) => r.type === 'swap_sell');
  const adsRecords = revenueRecords.filter((r) => r.type === 'ad_revenue');

  const p2pTotal = p2pRecords.reduce((sum, r) => sum + r.platformFeeAmount, 0);
  const swapTotal = swapRecords.reduce((sum, r) => sum + r.platformFeeAmount, 0);
  const adsTotal = adsRecords.reduce((sum, r) => sum + r.platformFeeAmount, 0);
  const grandTotal = p2pTotal + swapTotal + adsTotal;

  // Filter records
  const filteredRecords = revenueRecords.filter((r) => {
    if (activeCategory === 'p2p' && r.type !== 'p2p_sell') return false;
    if (activeCategory === 'swap' && r.type !== 'swap_sell') return false;
    if (activeCategory === 'ads' && r.type !== 'ad_revenue') return false;
    return true;
  });

  const handleSaveRates = () => {
    const current = StorageService.getSiteSettings();
    current.p2pSellFeePercent = Number(p2pFeePercent);
    current.swapFeePercent = Number(swapFeePercent);
    StorageService.saveSiteSettings(current);

    if (onUpdateCommissionRates) {
      onUpdateCommissionRates(p2pFeePercent, swapFeePercent);
    }

    setIsSavedRate(true);
    setTimeout(() => setIsSavedRate(false), 2500);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Type,Title,Gross Amount,Platform Cut,Fee Rate %,Currency,Date,Status']
        .concat(
          filteredRecords.map(
            (r) =>
              `"${r.id}","${r.type}","${r.title.replace(/"/g, '""')}",${r.grossAmount},${r.platformFeeAmount},${r.feeRatePercent},${r.currency},"${new Date(r.timestamp).toISOString()}","${r.status}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dcoine_earnings_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            3. Platform Earnings & Revenue Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full monetary ledger: P2P sells fee cuts, DEX swap liquidity fees, and digital ads revenue
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Top 4 Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Total Platform Revenue */}
        <div
          onClick={() => setActiveCategory('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Platform Revenue</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">
            ${grandTotal.toFixed(2)}
          </div>
          <div className="text-[11px] text-purple-300/80 mt-1 font-medium">
            Aggregated across all revenue channels
          </div>
        </div>

        {/* P2P Sells Fees */}
        <div
          onClick={() => setActiveCategory('p2p')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeCategory === 'p2p'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider">P2P Sells Earnings</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {p2pFeePercent}% Cut
            </span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
            ${p2pTotal.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1 font-medium">
            From {p2pRecords.length} escrow trade settlements
          </div>
        </div>

        {/* Swap Sells Fees */}
        <div
          onClick={() => setActiveCategory('swap')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeCategory === 'swap'
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider">Swap Sells Earnings</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {swapFeePercent}% Cut
            </span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-cyan-400 mt-1">
            ${swapTotal.toFixed(2)}
          </div>
          <div className="text-[11px] text-cyan-300/80 mt-1 font-medium">
            From {swapRecords.length} decentralized swaps
          </div>
        </div>

        {/* Ads Revenue */}
        <div
          onClick={() => setActiveCategory('ads')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeCategory === 'ads'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ads Monetization</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">
            ${adsTotal.toFixed(2)}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1 font-medium">
            Google AdSense & Web3 sponsors
          </div>
        </div>
      </div>

      {/* Commission Rates Adjustment Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Live Platform Commission Take Rates</div>
            <div className="text-[11px] text-slate-400">
              Adjust automated percentage fee charged on P2P escrow sells and DEX liquidity swaps
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">P2P Sell Rate:</label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={p2pFeePercent}
                onChange={(e) => setP2pFeePercent(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="absolute right-2 top-1 text-slate-400 text-xs">%</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Swap DEX Rate:</label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={swapFeePercent}
                onChange={(e) => setSwapFeePercent(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="absolute right-2 top-1 text-slate-400 text-xs">%</span>
            </div>
          </div>

          <button
            onClick={handleSaveRates}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
          >
            {isSavedRate ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {isSavedRate ? 'Saved!' : 'Apply Rates'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Earnings ({revenueRecords.length})
          </button>
          <button
            onClick={() => setActiveCategory('p2p')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === 'p2p' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            P2P Sells ({p2pRecords.length})
          </button>
          <button
            onClick={() => setActiveCategory('swap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === 'swap' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Swap Sells ({swapRecords.length})
          </button>
          <button
            onClick={() => setActiveCategory('ads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === 'ads' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ads Revenue ({adsRecords.length})
          </button>
        </div>
      </div>

      {/* Itemized Revenue Ledger Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Revenue Stream & Source</th>
                <th className="py-3 px-4">Transaction / Ad Ref</th>
                <th className="py-3 px-4">Gross Trade Volume</th>
                <th className="py-3 px-4">Platform Fee Cut</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4 text-right">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  {/* Revenue Stream */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.type === 'p2p_sell'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : r.type === 'swap_sell'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {r.type.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-white">{r.title}</span>
                    </div>
                  </td>

                  {/* Ref */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                    {r.sourceDetails.tradeId || r.sourceDetails.txHash || r.sourceDetails.adNetwork || 'Direct Pool'}
                    {r.sourceDetails.userOrMerchant && (
                      <div className="text-[10px] text-slate-500">by {r.sourceDetails.userOrMerchant}</div>
                    )}
                  </td>

                  {/* Gross Volume */}
                  <td className="py-3.5 px-4 font-mono text-slate-200 whitespace-nowrap">
                    ${r.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {r.currency}
                  </td>

                  {/* Platform Cut */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      +${r.platformFeeAmount.toFixed(2)} {r.currency}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Rate: {r.feeRatePercent}%
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    {new Date(r.timestamp).toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'credited'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : r.status === 'settled'
                          ? 'bg-blue-500/10 text-blue-300'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
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

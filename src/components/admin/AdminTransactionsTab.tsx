import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Activity,
  Layers,
  Coins,
  Shield,
  Download,
} from 'lucide-react';
import { TransactionRecord } from '../../types';

interface AdminTransactionsTabProps {
  transactions: TransactionRecord[];
  onInspectTx: (tx: TransactionRecord) => void;
}

export const AdminTransactionsTab: React.FC<AdminTransactionsTabProps> = ({
  transactions,
  onInspectTx,
}) => {
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [coinFilter, setCoinFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.fiatValue || 0), 0);
  const completedCount = transactions.filter((t) => t.status === 'completed').length;
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const failedCount = transactions.filter((t) => t.status === 'failed').length;

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (networkFilter !== 'all' && String(tx.network).toLowerCase() !== networkFilter.toLowerCase()) return false;
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (coinFilter !== 'all' && tx.symbol.toUpperCase() !== coinFilter.toUpperCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHash = tx.hash.toLowerCase().includes(q);
      const matchFrom = (tx.from || '').toLowerCase().includes(q);
      const matchTo = (tx.to || '').toLowerCase().includes(q);
      const matchFromName = (tx.fromUserName || '').toLowerCase().includes(q);
      const matchFromMail = (tx.fromUserEmail || '').toLowerCase().includes(q);
      const matchToName = (tx.toUserName || '').toLowerCase().includes(q);
      const matchToMail = (tx.toUserEmail || '').toLowerCase().includes(q);
      const matchCoin = tx.symbol.toLowerCase().includes(q);
      if (!matchHash && !matchFrom && !matchTo && !matchFromName && !matchFromMail && !matchToName && !matchToMail && !matchCoin) {
        return false;
      }
    }

    return true;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Hash,Network,Coin,Amount,USD Value,From User,To User,Type,Status,Date']
        .concat(
          filteredTransactions.map(
            (t) =>
              `"${t.hash}","${t.network}","${t.symbol}",${t.amount},${t.fiatValue || 0},"${t.fromUserName || ''}","${t.toUserName || ''}","${t.type}","${t.status}","${new Date(t.timestamp).toISOString()}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dcoine_transactions_ledger_${Date.now()}.csv`);
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
            <Receipt className="w-5 h-5 text-purple-400" />
            5. Multi-Chain Transactions Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full transaction details volume, network chain exploration, coin specs, and sender/receiver records
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Volume</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">
            ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all chains & pairs</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Transactions</span>
          <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
            {transactions.length}
          </div>
          <div className="text-[11px] text-purple-300/80 mt-1">On-chain & escrow events</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed / Settled</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
            {completedCount}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Finalized on consensus</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending / In Mempool</span>
          <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1">Awaiting confirmations</div>
        </div>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by hash, sender, recipient, coin, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Network Chain Filter */}
          <select
            value={networkFilter}
            onChange={(e) => setNetworkFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Chains</option>
            <option value="dcoine">Dcoine Mainnet</option>
            <option value="ethereum">Ethereum</option>
            <option value="bsc">BNB Smart Chain</option>
            <option value="polygon">Polygon</option>
            <option value="solana">Solana</option>
            <option value="bitcoin">Bitcoin</option>
            <option value="arbitrum">Arbitrum</option>
          </select>

          {/* Coin Filter */}
          <select
            value={coinFilter}
            onChange={(e) => setCoinFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Coins</option>
            <option value="DCOIN">DCOIN</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
            <option value="SOL">SOL</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="swap">Swap</option>
            <option value="p2p_buy">P2P Buy</option>
            <option value="p2p_sell">P2P Sell</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="mine">Mining Yield</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Network Chain</th>
                <th className="py-3 px-4">Coin & Volume Details</th>
                <th className="py-3 px-4">User Details (Sender → Receiver)</th>
                <th className="py-3 px-4">Tx Hash</th>
                <th className="py-3 px-4">Type & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    {/* Network Chain */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span className="font-semibold text-white uppercase text-[11px]">
                          {String(tx.network)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Block #{tx.blockNumber || 19842104}
                      </div>
                    </td>

                    {/* Coin & Volume */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-white text-sm">
                        {tx.amount.toLocaleString()} {tx.symbol}
                      </div>
                      {tx.fiatValue && (
                        <div className="font-mono text-emerald-400 text-xs">
                          ≈ ${tx.fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                        </div>
                      )}
                    </td>

                    {/* User Details */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium flex items-center gap-1.5">
                        <span>{tx.fromUserName || 'Alex Vance'}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span>{tx.toUserName || 'Dcoine Vault'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {tx.fromUserEmail || 'alex.vance@cryptomail.org'}
                      </div>
                    </td>

                    {/* Hash */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>
                          {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                        </span>
                        <button
                          onClick={() => copyHash(tx.hash)}
                          className="text-slate-400 hover:text-white"
                          title="Copy hash"
                        >
                          {copiedHash === tx.hash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Type & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-200 capitalize">
                        {tx.type.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
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

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onInspectTx(tx)}
                        className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

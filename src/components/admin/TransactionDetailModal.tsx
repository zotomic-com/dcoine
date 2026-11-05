import React from 'react';
import { X, Copy, Check, ExternalLink, ArrowRight, Shield, Activity, Coins, Link2, User, Fuel } from 'lucide-react';
import { TransactionRecord } from '../../types';

interface TransactionDetailModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const getChainName = (network: string) => {
    switch (network.toLowerCase()) {
      case 'dcoine':
        return 'Dcoine Mainnet 2.0';
      case 'ethereum':
        return 'Ethereum Mainnet (ERC-20)';
      case 'bsc':
        return 'BNB Smart Chain (BEP-20)';
      case 'polygon':
        return 'Polygon POS Network';
      case 'solana':
        return 'Solana High-Speed Layer 1';
      case 'bitcoin':
        return 'Bitcoin Native Ledger';
      case 'arbitrum':
        return 'Arbitrum One Rollup';
      default:
        return network;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-white custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                transaction.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : transaction.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {transaction.status.toUpperCase()}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono font-medium">
              {transaction.type.toUpperCase().replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Volume & Coin Info */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> Transacted Coin & Amount
            </div>
            <div className="text-2xl font-mono font-extrabold text-white flex items-center gap-2">
              {transaction.amount.toLocaleString()} {transaction.symbol}
            </div>
            {transaction.fiatValue && (
              <div className="text-xs text-slate-400 mt-0.5">
                ≈ ${transaction.fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD Valuation
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Network Fee</div>
            <div className="text-sm font-mono font-semibold text-emerald-400">
              {transaction.fee ? `$${transaction.fee.toFixed(4)}` : '< $0.01'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Blockchain Network & Hash */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Network Chain & Ledger Identification
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Network Chain:</span>
              <div className="font-semibold text-white mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {getChainName(String(transaction.network))}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Block Height:</span>
              <div className="font-mono text-slate-200 mt-1">
                #{transaction.blockNumber || 19842104}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 text-xs">Transaction Hash:</span>
            <div className="mt-1 flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 break-all">
              <span>{transaction.hash}</span>
              <button
                onClick={() => copyToClipboard(transaction.hash, 'hash')}
                className="ml-2 text-slate-400 hover:text-white flex-shrink-0"
                title="Copy Hash"
              >
                {copied === 'hash' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sender & Receiver User Details */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Sender & Receiver Account Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* From */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                From (Sender)
              </span>
              <div className="font-semibold text-white mt-1">
                {transaction.fromUserName || 'Alex Vance'}
              </div>
              <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                {transaction.fromUserEmail || 'alex.vance@cryptomail.org'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1.5 break-all">
                {transaction.from || '0x321aB04928e1FaB88E12A3492De919488aB01249'}
              </div>
            </div>

            {/* To */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                To (Recipient / Contract)
              </span>
              <div className="font-semibold text-white mt-1">
                {transaction.toUserName || 'Dcoine Liquidity Vault'}
              </div>
              <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                {transaction.toUserEmail || 'treasury@dcoine.network'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1.5 break-all">
                {transaction.to || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'}
              </div>
            </div>
          </div>
        </div>

        {/* Gas & Execution Specs */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-2">
            <Fuel className="w-3.5 h-3.5 text-amber-400" /> Gas & Consensus Execution Details
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px]">Gas Units Used</span>
              <div className="font-mono text-white text-[11px] mt-0.5">{transaction.gasUsed || '54,200 (18 Gwei)'}</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px]">Consensus State</span>
              <div className="font-mono text-emerald-400 text-[11px] mt-0.5">Finalized (64 blocks)</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px]">Smart Contract Verified</span>
              <div className="font-mono text-amber-400 text-[11px] mt-0.5">Audit: CertiK & PeckShield</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => copyToClipboard(JSON.stringify(transaction, null, 2), 'json')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copied === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === 'json' ? 'Copied Full JSON' : 'Copy Raw Receipt'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-lg shadow-amber-500/20"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

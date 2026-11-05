import React from 'react';
import { X, Copy, Check, MapPin, Globe, Phone, Mail, User, ShieldCheck, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { P2POrder } from '../../types';

interface P2PAdDetailModalProps {
  order: P2POrder | null;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: P2POrder['status']) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const P2PAdDetailModal: React.FC<P2PAdDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onDeleteOrder,
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!order) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isBuy = order.type === 'buy';
  const isNew = Date.now() - order.createdAt < 24 * 3600 * 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-white custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isBuy
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {order.type.toUpperCase()} AD
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                order.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : order.status === 'paused'
                  ? 'bg-amber-500/10 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {order.status.toUpperCase()}
            </span>
            {isNew ? (
              <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                New Published
              </span>
            ) : (
              <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                Older Published
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ad Title & Order ID */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {order.cryptoSymbol} / {order.fiatCurrency} Escrow Marketplace Listing
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Ad ID: {order.id}</span>
              <button
                onClick={() => copyToClipboard(order.id, 'id')}
                className="text-amber-400 hover:text-amber-300"
                title="Copy ID"
              >
                {copied === 'id' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-mono font-bold text-amber-400">
              {order.price.toLocaleString()} {order.fiatCurrency}
            </div>
            <div className="text-xs text-slate-400">Per 1 {order.cryptoSymbol}</div>
          </div>
        </div>

        {/* Section 1: Who Posted From Where & When */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Poster / Creator Full Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Poster Name:</span>
              <div className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                {order.merchantName}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-slate-400">Email Address:</span>
              <div className="font-mono text-slate-200 mt-0.5 flex items-center gap-1">
                {order.merchantEmail || 'user@dcoine.network'}
                <button
                  onClick={() => copyToClipboard(order.merchantEmail || '', 'email')}
                  className="text-slate-400 hover:text-white"
                >
                  {copied === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <span className="text-slate-400">Phone Number:</span>
              <div className="font-mono text-slate-200 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {order.merchantPhone || '+1 (555) 019-2834'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Location / Country:</span>
              <div className="font-medium text-slate-200 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                {order.location || 'Berlin, Germany'} ({order.country || 'Germany'})
              </div>
            </div>
            <div>
              <span className="text-slate-400">Publisher IP Address:</span>
              <div className="font-mono text-slate-300 mt-0.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" />
                {order.ipAddress || '192.0.2.14'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Published When:</span>
              <div className="font-medium text-slate-200 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Limits & Available Liquidity */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Ad Volume & Escrow Limits
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Available Pool</span>
              <div className="font-mono font-bold text-white mt-1">
                {order.availableAmount.toLocaleString()} {order.cryptoSymbol}
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Minimum Limit</span>
              <div className="font-mono font-bold text-white mt-1">
                {order.minLimit.toLocaleString()} {order.fiatCurrency}
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Maximum Limit</span>
              <div className="font-mono font-bold text-white mt-1">
                {order.maxLimit.toLocaleString()} {order.fiatCurrency}
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Avg Release Speed</span>
              <div className="font-mono font-bold text-emerald-400 mt-1">
                {order.avgReleaseTimeMinutes} mins
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Buyer & Seller Details (Active or Past Matched Counterparties) */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Buyer & Seller Matched Contact Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Buyer Box */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>Buyer Counterparty</span>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-white">
                  {order.buyerName || (isBuy ? order.merchantName : 'Liam O Connor')}
                </div>
                <div className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {order.buyerEmail || (isBuy ? order.merchantEmail : 'liam.oc@dublinledger.ie')}
                </div>
                <div className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {order.buyerPhone || (isBuy ? order.merchantPhone : '+353 87 2345678')}
                </div>
              </div>
            </div>

            {/* Seller Box */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>Seller Counterparty</span>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-white">
                  {order.sellerName || (!isBuy ? order.merchantName : 'Elena Rostova')}
                </div>
                <div className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {order.sellerEmail || (!isBuy ? order.merchantEmail : 'elena.rostova@berlinfintech.de')}
                </div>
                <div className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {order.sellerPhone || (!isBuy ? order.merchantPhone : '+49 152 9018234')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Payment Methods & Trading Terms */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="mb-2">
            <span className="text-slate-400 font-medium">Accepted Payment Channels:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {order.paymentMethods.map((pm, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 font-medium"
                >
                  {pm}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <span className="text-slate-400 font-medium">Merchant Terms & Escrow Notes:</span>
            <p className="mt-1 text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
              {order.terms}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onUpdateStatus && order.status === 'active' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'paused')}
                className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
              >
                Pause Ad
              </button>
            )}
            {onUpdateStatus && order.status === 'paused' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'active')}
                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
              >
                Resume Ad
              </button>
            )}
            {onDeleteOrder && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this P2P ad listing from the platform?')) {
                    onDeleteOrder(order.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-semibold transition"
              >
                Delete Ad
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

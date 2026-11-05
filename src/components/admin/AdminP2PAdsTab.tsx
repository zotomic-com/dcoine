import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Pause,
  Play,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Mail,
  DollarSign,
  User,
  X,
  CheckCircle,
} from 'lucide-react';
import { P2POrder } from '../../types';

interface AdminP2PAdsTabProps {
  orders: P2POrder[];
  onInspectAd: (order: P2POrder) => void;
  onAddOrder: (order: P2POrder) => void;
  onUpdateStatus: (orderId: string, status: P2POrder['status']) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const AdminP2PAdsTab: React.FC<AdminP2PAdsTabProps> = ({
  orders,
  onInspectAd,
  onAddOrder,
  onUpdateStatus,
  onDeleteOrder,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'buy' | 'sell' | 'new' | 'old'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Ad Form
  const [newAdForm, setNewAdForm] = useState({
    type: 'sell' as 'buy' | 'sell',
    merchantName: '',
    merchantEmail: '',
    merchantPhone: '',
    location: 'Berlin, Germany',
    country: 'Germany',
    cryptoSymbol: 'USDT',
    fiatCurrency: 'USD',
    price: 1.0,
    availableAmount: 2500,
    minLimit: 50,
    maxLimit: 2500,
    paymentMethods: 'Bank Transfer, Wise, Revolut',
    terms: 'Fast escrow release. Verified buyers only.',
  });

  const oneDayMs = 24 * 3600 * 1000;
  const buyAdsCount = orders.filter((o) => o.type === 'buy').length;
  const sellAdsCount = orders.filter((o) => o.type === 'sell').length;
  const newAdsCount = orders.filter((o) => Date.now() - o.createdAt < oneDayMs).length;
  const oldAdsCount = orders.filter((o) => Date.now() - o.createdAt >= oneDayMs).length;

  const filteredOrders = orders.filter((o) => {
    if (filterTab === 'buy' && o.type !== 'buy') return false;
    if (filterTab === 'sell' && o.type !== 'sell') return false;
    if (filterTab === 'new' && Date.now() - o.createdAt >= oneDayMs) return false;
    if (filterTab === 'old' && Date.now() - o.createdAt < oneDayMs) return false;

    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMerchant = o.merchantName.toLowerCase().includes(q);
      const matchEmail = (o.merchantEmail || '').toLowerCase().includes(q);
      const matchPhone = (o.merchantPhone || '').toLowerCase().includes(q);
      const matchLocation = (o.location || '').toLowerCase().includes(q);
      const matchCrypto = o.cryptoSymbol.toLowerCase().includes(q);
      const matchFiat = o.fiatCurrency.toLowerCase().includes(q);
      if (!matchMerchant && !matchEmail && !matchPhone && !matchLocation && !matchCrypto && !matchFiat) {
        return false;
      }
    }

    return true;
  });

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdForm.merchantName.trim()) return;

    const newOrder: P2POrder = {
      id: `ord_p2p_${Date.now()}`,
      userId: `usr_merchant_${Math.random().toString(36).substring(2, 6)}`,
      type: newAdForm.type,
      merchantName: newAdForm.merchantName.trim(),
      merchantEmail: newAdForm.merchantEmail.trim() || 'merchant@dcoine.network',
      merchantPhone: newAdForm.merchantPhone.trim() || '+1 (555) 0192',
      location: newAdForm.location,
      country: newAdForm.country,
      ipAddress: '198.51.100.28',
      merchantRating: 99.0,
      completedOrdersCount: 45,
      cryptoSymbol: newAdForm.cryptoSymbol,
      fiatCurrency: newAdForm.fiatCurrency,
      price: Number(newAdForm.price) || 1,
      availableAmount: Number(newAdForm.availableAmount) || 1000,
      minLimit: Number(newAdForm.minLimit) || 50,
      maxLimit: Number(newAdForm.maxLimit) || 2500,
      paymentMethods: newAdForm.paymentMethods.split(',').map((p) => p.trim()).filter(Boolean),
      terms: newAdForm.terms,
      status: 'active',
      avgReleaseTimeMinutes: 2.5,
      createdAt: Date.now(),
      buyerName: newAdForm.type === 'buy' ? newAdForm.merchantName : 'Counterparty Trader',
      buyerEmail: newAdForm.type === 'buy' ? newAdForm.merchantEmail : 'trader@dcoine.network',
      buyerPhone: newAdForm.type === 'buy' ? newAdForm.merchantPhone : '+1 (555) 0912',
      sellerName: newAdForm.type === 'sell' ? newAdForm.merchantName : 'Counterparty Trader',
      sellerEmail: newAdForm.type === 'sell' ? newAdForm.merchantEmail : 'trader@dcoine.network',
      sellerPhone: newAdForm.type === 'sell' ? newAdForm.merchantPhone : '+1 (555) 0912',
    };

    onAddOrder(newOrder);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            4. P2P Ads Marketplace Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full control of new and old published buy & sell ads with full poster identity, buyer & seller details
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Post New P2P Ad</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterTab('all')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'all'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Total Ads</div>
          <div className="text-xl font-mono font-bold text-white mt-0.5">{orders.length}</div>
        </button>

        <button
          onClick={() => setFilterTab('buy')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'buy'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Buy Ads</div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{buyAdsCount}</div>
        </button>

        <button
          onClick={() => setFilterTab('sell')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'sell'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Sell Ads</div>
          <div className="text-xl font-mono font-bold text-rose-400 mt-0.5">{sellAdsCount}</div>
        </button>

        <button
          onClick={() => setFilterTab('new')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'new'
              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">New (24h)</div>
          <div className="text-xl font-mono font-bold text-blue-400 mt-0.5">{newAdsCount}</div>
        </button>

        <button
          onClick={() => setFilterTab('old')}
          className={`p-3 rounded-xl border text-left transition ${
            filterTab === 'old'
              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Older Ads (&gt;24h)</div>
          <div className="text-xl font-mono font-bold text-purple-400 mt-0.5">{oldAdsCount}</div>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by merchant name, email, phone, location, coin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Ads Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Type & Age</th>
                <th className="py-3 px-4">Poster Details (Name, Mail, Phone, Location)</th>
                <th className="py-3 px-4">Coin & Price</th>
                <th className="py-3 px-4">Limits & Escrow Available</th>
                <th className="py-3 px-4">Buyer / Seller Match</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No P2P ads found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ad) => {
                  const isBuy = ad.type === 'buy';
                  const isNew = Date.now() - ad.createdAt < oneDayMs;

                  return (
                    <tr key={ad.id} className="hover:bg-slate-800/40 transition">
                      {/* Type & Age */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${
                              isBuy
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {ad.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isNew ? (
                              <span className="text-blue-400 font-bold">New (&lt;24h)</span>
                            ) : (
                              <span>Older ({Math.round((Date.now() - ad.createdAt) / oneDayMs)}d)</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Poster Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1">
                          {ad.merchantName}
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                          {ad.merchantEmail || 'poster@dcoine.network'}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-rose-400" />
                          <span>{ad.location || 'Berlin, Germany'}</span>
                          <span className="text-slate-600">•</span>
                          <span>{ad.merchantPhone || '+1 (555) 0192'}</span>
                        </div>
                      </td>

                      {/* Coin & Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white text-sm">
                          {ad.cryptoSymbol}
                        </div>
                        <div className="font-mono text-xs text-amber-400 font-semibold">
                          {ad.price.toLocaleString()} {ad.fiatCurrency}
                        </div>
                      </td>

                      {/* Limits */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-white text-xs">
                          {ad.availableAmount.toLocaleString()} {ad.cryptoSymbol}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {ad.minLimit} - {ad.maxLimit} {ad.fiatCurrency}
                        </div>
                      </td>

                      {/* Counterparty details */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-slate-300">
                          {isBuy ? (
                            <>
                              <span className="text-emerald-400 font-semibold">Buyer:</span>{' '}
                              {ad.buyerName || ad.merchantName}
                            </>
                          ) : (
                            <>
                              <span className="text-rose-400 font-semibold">Seller:</span>{' '}
                              {ad.sellerName || ad.merchantName}
                            </>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                          {isBuy ? (ad.buyerEmail || ad.merchantEmail) : (ad.sellerEmail || ad.merchantEmail)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {isBuy ? (ad.buyerPhone || ad.merchantPhone) : (ad.sellerPhone || ad.merchantPhone)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ad.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : ad.status === 'paused'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ad.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Full Details */}
                          <button
                            onClick={() => onInspectAd(ad)}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            title="View Full Ad Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {/* Pause / Resume */}
                          {ad.status === 'active' ? (
                            <button
                              onClick={() => onUpdateStatus(ad.id, 'paused')}
                              className="p-1 rounded-lg text-amber-400 hover:bg-amber-500/10 transition"
                              title="Pause Ad"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateStatus(ad.id, 'active')}
                              className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition"
                              title="Activate Ad"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm('Delete this P2P ad permanently?')) {
                                onDeleteOrder(ad.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Delete Ad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: POST NEW P2P AD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" /> Create & Publish P2P Ad
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Ad Type</label>
                  <select
                    value={newAdForm.type}
                    onChange={(e) => setNewAdForm({ ...newAdForm, type: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="sell">Sell Crypto (Merchant Selling)</option>
                    <option value="buy">Buy Crypto (Merchant Buying)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Crypto Coin</label>
                  <select
                    value={newAdForm.cryptoSymbol}
                    onChange={(e) => setNewAdForm({ ...newAdForm, cryptoSymbol: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="DCOIN">DCOIN (Native)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Merchant / Poster Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={newAdForm.merchantName}
                  onChange={(e) => setNewAdForm({ ...newAdForm, merchantName: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Poster Email</label>
                  <input
                    type="email"
                    placeholder="merchant@example.com"
                    value={newAdForm.merchantEmail}
                    onChange={(e) => setNewAdForm({ ...newAdForm, merchantEmail: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Poster Phone Number</label>
                  <input
                    type="text"
                    placeholder="+49 152 9018234"
                    value={newAdForm.merchantPhone}
                    onChange={(e) => setNewAdForm({ ...newAdForm, merchantPhone: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Unit Price ({newAdForm.fiatCurrency})</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newAdForm.price}
                    onChange={(e) => setNewAdForm({ ...newAdForm, price: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Available Amount</label>
                  <input
                    type="number"
                    value={newAdForm.availableAmount}
                    onChange={(e) => setNewAdForm({ ...newAdForm, availableAmount: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Min Limit</label>
                  <input
                    type="number"
                    value={newAdForm.minLimit}
                    onChange={(e) => setNewAdForm({ ...newAdForm, minLimit: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Max Limit</label>
                  <input
                    type="number"
                    value={newAdForm.maxLimit}
                    onChange={(e) => setNewAdForm({ ...newAdForm, maxLimit: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Payment Methods (comma separated)</label>
                <input
                  type="text"
                  value={newAdForm.paymentMethods}
                  onChange={(e) => setNewAdForm({ ...newAdForm, paymentMethods: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Trading Terms</label>
                <textarea
                  rows={2}
                  value={newAdForm.terms}
                  onChange={(e) => setNewAdForm({ ...newAdForm, terms: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-500/25"
                >
                  Publish P2P Ad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

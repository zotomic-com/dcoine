import React, { useState } from 'react';
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { P2PAdDetailModal } from './admin/P2PAdDetailModal';
import { TransactionDetailModal } from './admin/TransactionDetailModal';
import { StorageService } from '../services/storage';
import { P2POrder, TransactionRecord } from '../types';

interface AdminDashboardProps {
  onNavigateSection?: (section: string, filter?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateSection = () => {},
}) => {
  const [users] = useState(() => StorageService.getUsersRegistry());
  const [p2pOrders, setP2pOrders] = useState(() => StorageService.getP2POrders());
  const [transactions] = useState(() => StorageService.getTransactions());
  const [revenueRecords] = useState(() => StorageService.getRevenueRecords());

  const [selectedAd, setSelectedAd] = useState<P2POrder | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  const handleUpdateAdStatus = (orderId: string, newStatus: P2POrder['status']) => {
    const list = StorageService.getP2POrders();
    const target = list.find((o) => o.id === orderId);
    if (target) {
      target.status = newStatus;
      StorageService.saveP2POrders(list);
      setP2pOrders([...list]);
      if (selectedAd && selectedAd.id === orderId) {
        setSelectedAd({ ...target });
      }
    }
  };

  const handleDeleteAd = (orderId: string) => {
    StorageService.deleteP2POrder(orderId);
    setP2pOrders(StorageService.getP2POrders());
    setSelectedAd(null);
  };

  return (
    <div className="p-4 sm:p-6 text-white max-w-7xl mx-auto space-y-6">
      <AdminDashboardTab
        users={users}
        p2pOrders={p2pOrders}
        transactions={transactions}
        revenueRecords={revenueRecords}
        onNavigateSection={onNavigateSection}
        onInspectAd={(ad) => setSelectedAd(ad)}
        onInspectTx={(tx) => setSelectedTx(tx)}
      />

      {/* Inspect Modals */}
      <P2PAdDetailModal
        order={selectedAd}
        onClose={() => setSelectedAd(null)}
        onUpdateStatus={handleUpdateAdStatus}
        onDeleteOrder={handleDeleteAd}
      />

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};
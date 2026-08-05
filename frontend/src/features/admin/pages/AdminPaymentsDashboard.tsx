import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../../api/client';
import { useToast } from '../../../context/ToastContext';
import { 
  ArrowUpRightIcon, 
  ArrowDownLeftIcon, 
  BanknotesIcon, 
  ReceiptPercentIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';

interface Transaction {
  _id: string;
  gigId?: {
    _id: string;
    title: string;
  };
  ownerId?: {
    name: string;
    businessName: string;
  };
  totalAmount: number;
  platformFee: number;
  paymentStatus: string;
  createdAt: string;
}

interface Stats {
  totalVolume: number;
  totalCommission: number;
  totalNetDistributed: number;
}

const AdminPaymentsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats>({ totalVolume: 0, totalCommission: 0, totalNetDistributed: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/payments/dashboard');
      if (res.data && res.data.success) {
        setStats(res.data.data.stats || { totalVolume: 0, totalCommission: 0, totalNetDistributed: 0 });
        setRecentTransactions(res.data.data.recentTransactions || []);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load payment revenue dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-secondary tracking-widest uppercase animate-pulse">Loading finance dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-gray-50/20 min-h-screen">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-textMain tracking-tight">Payments & Revenue</h1>
        <p className="text-xs text-secondary mt-0.5">Monitor platform checkout volumes, commissions, and worker payouts.</p>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Volume */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Total Platform Volume</span>
            <h3 className="text-3xl font-black text-textMain">₹{stats.totalVolume.toLocaleString()}</h3>
            <span className="text-[10px] text-green-600 font-extrabold flex items-center gap-0.5">
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
              +14.8% from last month
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <BanknotesIcon className="w-6 h-6 stroke-[1.5]" />
          </div>
        </div>

        {/* Card 2: Commission Earned */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Platform Commission</span>
            <h3 className="text-3xl font-black text-textMain">₹{stats.totalCommission.toLocaleString()}</h3>
            <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-0.5">
              <ReceiptPercentIcon className="w-3.5 h-3.5" />
              10% standard commission rate
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <ReceiptPercentIcon className="w-6 h-6 stroke-[1.5]" />
          </div>
        </div>

        {/* Card 3: Worker Payouts */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Net Payouts Distributed</span>
            <h3 className="text-3xl font-black text-textMain">₹{stats.totalNetDistributed.toLocaleString()}</h3>
            <span className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-0.5">
              <ArrowDownLeftIcon className="w-3.5 h-3.5" />
              90% net crew distribution
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <UserGroupIcon className="w-6 h-6 stroke-[1.5]" />
          </div>
        </div>
      </div>

      {/* Recent Transactions Panel */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-extrabold text-textMain tracking-tight">Recent Transactions</h2>
          <Link
            to="/admin/payments/transactions"
            className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-secondary uppercase tracking-widest bg-gray-50/50">
                <th className="px-4 py-3">Gig Title</th>
                <th className="px-4 py-3">Provider (Owner)</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Platform Fee (10%)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Date</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-secondary italic">
                    No transactions recorded on the platform yet.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  let statusColor = 'bg-gray-100 text-gray-600';
                  if (tx.paymentStatus === 'paid') statusColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                  if (tx.paymentStatus === 'pending') statusColor = 'bg-amber-50 text-amber-600 border border-amber-100';
                  if (tx.paymentStatus === 'failed') statusColor = 'bg-rose-50 text-rose-600 border border-rose-100';

                  return (
                    <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-textMain">
                        {tx.gigId?.title || 'Unknown Gig'}
                      </td>
                      <td className="px-4 py-4 text-secondary">
                        <span className="block font-bold text-textMain">
                          {tx.ownerId?.businessName || 'Business Provider'}
                        </span>
                        <span className="text-[10px] block mt-0.5">{tx.ownerId?.name}</span>
                      </td>
                      <td className="px-4 py-4 font-black text-textMain">
                        ₹{tx.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-semibold text-secondary">
                        ₹{tx.platformFee.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {tx.paymentStatus === 'paid' ? 'Completed' : tx.paymentStatus === 'pending' ? 'Processing' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-secondary font-medium">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => navigate(`/admin/payments/transactions/${tx._id}`)}
                          className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-[10px] font-bold rounded-lg text-secondary transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsDashboard;

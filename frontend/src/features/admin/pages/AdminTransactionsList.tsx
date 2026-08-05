import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client';
import { useToast } from '../../../context/ToastContext';
import Pagination from '../../../components/Pagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Transaction {
  _id: string;
  gigId?: {
    _id: string;
    title: string;
    categoryId?: {
      name: string;
    };
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

interface Summaries {
  monthlyVolume: number;
  averagePlatformFee: number;
  pendingPayouts: number;
}

const AdminTransactionsList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summaries, setSummaries] = useState<Summaries>({ monthlyVolume: 0, averagePlatformFee: 10, pendingPayouts: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const ITEMS_PER_PAGE = 8;

  // Filter states
  const [activeTab, setActiveTab] = useState<string>('all'); // all | completed | processing | refunded
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, activeTab]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/payments', {
        params: {
          search: searchQuery,
          status: activeTab,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });

      if (res.data && res.data.success) {
        setTransactions(res.data.data.transactions || []);
        setTotalItems(res.data.data.total || 0);
        setSummaries(res.data.data.summaries || { monthlyVolume: 0, averagePlatformFee: 10, pendingPayouts: 0 });
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load transaction ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-gray-50/20 min-h-screen flex flex-col justify-between">
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-textMain tracking-tight">All Transactions</h1>
            <p className="text-xs text-secondary mt-0.5">Manage and monitor all platform financial activity across events and hospitality.</p>
          </div>
          <button
            // onClick={() => showToast('Export feature will be available in production release.', 'info')}
            className="self-start md:self-auto px-4 py-2 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary shadow-sm transition-all"
          >
            Export Data
          </button>
        </div>

        {/* Filters and search block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
            {/* {['all', 'completed', 'processing', 'refunded'].map((tab) => ( */}
            {['all', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2.5 border-b-2 transition-all capitalize ${
                  activeTab === tab
                    ? 'border-primary text-textMain'
                    : 'border-transparent text-secondary hover:text-textMain'
                }`}
              >
                {tab === 'processing' ? 'Processing' : tab === 'completed' ? 'Completed' : tab === 'refunded' ? 'Refunded' : 'All Transactions'}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gig title..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs text-textMain outline-none transition-all placeholder:text-gray-400 focus:ring-1 focus:ring-primary shadow-sm hover:border-gray-300"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm active:scale-95"
            >
              Apply Filter
            </button>
          </form>
        </div>

        {/* Main Table Ledger */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-secondary font-medium animate-pulse">Loading transaction records...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-secondary uppercase tracking-widest bg-gray-50/50">
                    <th className="px-4 py-3">Gig Title</th>
                    <th className="px-4 py-3">Provider (Owner)</th>
                    <th className="px-4 py-3">Worker Total</th>
                    <th className="px-4 py-3">Platform Fee (10%)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Date</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-secondary italic">
                        No transactions found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      let statusColor = 'bg-gray-100 text-gray-600';
                      if (tx.paymentStatus === 'paid') statusColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                      if (tx.paymentStatus === 'pending') statusColor = 'bg-amber-50 text-amber-600 border border-amber-100';
                      if (tx.paymentStatus === 'failed') statusColor = 'bg-rose-50 text-rose-600 border border-rose-100';

                      return (
                        <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 font-bold text-textMain">
                            <span>{tx.gigId?.title || 'Unknown Gig'}</span>
                            {tx.gigId?.categoryId?.name && (
                              <span className="block text-[9px] text-secondary font-semibold uppercase tracking-wider mt-0.5">
                                {tx.gigId.categoryId.name}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-secondary">
                            <span className="block font-bold text-textMain">
                              {tx.ownerId?.businessName || 'Business Owner'}
                            </span>
                            <span className="text-[10px] block mt-0.5">{tx.ownerId?.name}</span>
                          </td>
                          <td className="px-4 py-4 font-black text-textMain">
                            ₹{(tx.totalAmount - tx.platformFee).toLocaleString()}
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
          )}

          {/* Pagination controls */}
          {!loading && totalItems > ITEMS_PER_PAGE && (
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-secondary font-medium">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / ITEMS_PER_PAGE)}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Card Row matching Figma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200 mt-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Monthly Total Volume</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-textMain">₹{summaries.monthlyVolume.toLocaleString()}</span>
            <span className="text-[10px] text-green-600 font-extrabold flex items-center gap-0.5">
              +12% volume
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Average Platform Fee</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-textMain">{summaries.averagePlatformFee.toFixed(1)}%</span>
            <span className="text-[10px] text-secondary font-medium">Standard rate applied</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Pending Payouts</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-textMain">₹{summaries.pendingPayouts.toLocaleString()}</span>
            <span className="text-[10px] text-secondary font-medium">Processing in escrow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionsList;

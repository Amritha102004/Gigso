import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../api/client';
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
  BriefcaseIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface OwnerPaymentDTO {
  _id: string;
  gigId?: {
    _id: string;
    title: string;
  };
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId: string;
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
}

interface PendingPaymentDTO {
  id: string;
  title: string;
  totalBudget: number;
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  workers: Array<{
    id: string;
    name: string;
    roleName: string;
    amount: number;
  }>;
  eventDate?: string;
}

const PaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const targetGigId = searchParams.get('gigId');

  const [payments, setPayments] = useState<OwnerPaymentDTO[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingGigId, setPayingGigId] = useState<string | null>(null);

  // Active Tab: 'history' | 'pending'
  const [activeTab, setActiveTab] = useState<'history' | 'pending'>('history');

  // Pagination states
  const [historyPage, setHistoryPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const ITEMS_PER_PAGE = 4; // 4 items per page for cards fits beautifully in a 2x2 grid!

  useEffect(() => {
    if (targetGigId) {
      setActiveTab('pending');
    }
  }, [targetGigId]);

  useEffect(() => {
    fetchPayments();
  }, []);



  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/payments/history/owner');
      if (res.data && res.data.success) {
        setPayments(res.data.data.payments || []);
        setPendingPayments(res.data.data.pendingPayments || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve payments dashboard details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (gigId: string) => {
    try {
      setPayingGigId(gigId);
      const res = await apiClient.post('/payments/checkout', { gigId });
      if (res.data && res.data.success && res.data.data.url) {
        window.location.href = res.data.data.url;
      } else {
        showToast('Failed to start checkout process.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not initiate Stripe Checkout session.', 'error');
    } finally {
      setPayingGigId(null);
    }
  };

  // Stats Calculations
  const totalPaid = payments
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const pendingPayoutsSum = pendingPayments.reduce((sum, p) => sum + p.totalAmount, 0);

  const platformFeesSum = payments
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.platformFee, 0);

  // Pagination calculations for Transaction History
  const totalHistoryPages = Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE));
  const adjustedHistoryPage = Math.min(historyPage, totalHistoryPages);
  const paginatedPayments = payments.slice(
    (adjustedHistoryPage - 1) * ITEMS_PER_PAGE,
    adjustedHistoryPage * ITEMS_PER_PAGE
  );

  // Pagination calculations for Upcoming Payouts
  const totalPendingPages = Math.max(1, Math.ceil(pendingPayments.length / ITEMS_PER_PAGE));
  const adjustedPendingPage = Math.min(pendingPage, totalPendingPages);
  const paginatedPending = pendingPayments.slice(
    (adjustedPendingPage - 1) * ITEMS_PER_PAGE,
    adjustedPendingPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Owner — Payments Dashboard</h1>
        <p className="text-sm text-secondary">Manage and disburse payments to hired workers, review financial details, and view platform receipts.</p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Paid */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Total Paid to Date</span>
            <h3 className="text-2xl font-black text-textMain">₹{totalPaid.toLocaleString()}</h3>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <ArrowUpRightIcon className="w-3 h-3" />
              +10% from last month
            </span>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Pending Payouts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Pending Payouts</span>
            <h3 className="text-2xl font-black text-textMain">₹{pendingPayoutsSum.toLocaleString()}</h3>
            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5 animate-pulse" />
              Settle to avoid delays
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
            <CreditCardIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Platform Fees */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Platform Fees Paid</span>
            <h3 className="text-2xl font-black text-textMain">₹{platformFeesSum.toLocaleString()}</h3>
            <span className="text-[10px] text-secondary font-medium">Avg. 10% per transaction</span>
          </div>
          <div className="w-12 h-12 bg-gray-50 text-secondary rounded-2xl flex items-center justify-center shadow-sm">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
        </div>
      </div>



      {/* Navigation tabs section */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-primary text-textMain'
                : 'border-transparent text-secondary hover:text-textMain'
            }`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all relative ${
              activeTab === 'pending'
                ? 'border-primary text-textMain'
                : 'border-transparent text-secondary hover:text-textMain'
            }`}
          >
            Upcoming Payouts
            {pendingPayments.length > 0 && (
              <span className="absolute top-1.5 right-1 px-1.5 py-0.5 bg-indigo-600 text-white rounded-full text-[9px] font-bold">
                {pendingPayments.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content 1: Payment History (Table View) */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-textMain">Transaction Receipts</h2>
              <span className="text-xs text-secondary">{payments.length} invoices</span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-secondary animate-pulse">Loading transaction receipts...</div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-xs text-secondary">No transaction receipts registered yet.</div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-secondary uppercase font-bold tracking-wider">
                        <th className="p-4 pl-6">Gig Name</th>
                        <th className="p-4">Stripe Session ID</th>
                        <th className="p-4">Paid Date</th>
                        <th className="p-4">Subtotal</th>
                        <th className="p-4">Fee (10%)</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4 pr-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedPayments.map((payment) => {
                        const gigTitle = payment.gigId?.title || 'Gig details';
                        const dateStr = payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString()
                          : new Date(payment.createdAt).toLocaleDateString();

                        return (
                          <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-textMain">{gigTitle}</td>
                            <td className="p-4 text-secondary font-mono text-[10px]">{payment.transactionId.substring(0, 15)}...</td>
                            <td className="p-4 text-secondary">{dateStr}</td>
                            <td className="p-4 text-secondary">₹{payment.subtotal.toLocaleString()}</td>
                            <td className="p-4 text-secondary">₹{payment.platformFee.toLocaleString()}</td>
                            <td className="p-4 font-bold text-primary">₹{payment.totalAmount.toLocaleString()}</td>
                            <td className="p-4 pr-6 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700`}>
                                paid
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls for History */}
                {totalHistoryPages > 1 && (
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <span className="text-[10px] font-semibold text-secondary">
                      Page {adjustedHistoryPage} of {totalHistoryPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                        disabled={adjustedHistoryPage === 1}
                        className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition-all text-secondary"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))}
                        disabled={adjustedHistoryPage === totalHistoryPages}
                        className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition-all text-secondary"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Upcoming Payouts (Detailed Card Grid View) */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-secondary bg-white rounded-2xl border border-gray-100 animate-pulse">
                Loading payout requests...
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="bg-emerald-50/50 border border-emerald-100/50 p-8 rounded-2xl text-center flex flex-col items-center gap-2">
                <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
                <div className="text-xs font-bold text-emerald-800">All Clear! No pending payout requests.</div>
                <p className="text-[10px] text-emerald-700">Completed gigs will show up here to be settled with Stripe Checkout.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedPending.map((p) => {
                    const isTargeted = p.id === targetGigId;
                    return (
                      <div 
                        key={p.id} 
                        className={`bg-white rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between ${
                          isTargeted 
                            ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-500/10 scale-[1.01]' 
                            : 'border-gray-100 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {isTargeted && (
                          <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                            Selected Gig
                          </span>
                        )}
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-extrabold text-sm text-textMain line-clamp-1">{p.title}</h3>
                            <p className="text-[10px] text-secondary font-medium">Gig Completed — Payment Pending</p>
                          </div>

                          {/* Workers list */}
                          <div className="bg-gray-50/70 rounded-xl p-3.5 space-y-2 max-h-36 overflow-y-auto">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary uppercase tracking-wider pb-1 border-b border-gray-100">
                              <UserGroupIcon className="w-3.5 h-3.5" />
                              Hired Crew ({p.workers.length})
                            </div>
                            {p.workers.length === 0 ? (
                              <div className="text-[10px] text-secondary italic">No hired crew for this gig.</div>
                            ) : (
                              p.workers.map((worker) => (
                                <div key={worker.id} className="flex justify-between items-center text-[10px] text-textMain font-medium">
                                  <span>{worker.name} ({worker.roleName})</span>
                                  <span className="font-bold">₹{worker.amount.toLocaleString()}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Financial Calculations breakdown */}
                          <div className="space-y-2 border-t border-dashed border-gray-100 pt-3 text-xs">
                            <div className="flex justify-between items-center text-[11px] text-secondary">
                              <span>Workers' Subtotal</span>
                              <span>₹{p.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-secondary">
                              <span>Platform Commission (10%)</span>
                              <span>₹{p.platformFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-textMain border-t border-gray-50 pt-2 text-xs">
                              <span>Total Payable</span>
                              <span className="text-indigo-600">₹{p.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCheckout(p.id)}
                          disabled={payingGigId !== null}
                          className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                          {payingGigId === p.id ? 'Starting Checkout...' : 'Pay via Stripe'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls for Pending Grid */}
                {totalPendingPages > 1 && (
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-semibold text-secondary">
                      Page {adjustedPendingPage} of {totalPendingPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPendingPage(prev => Math.max(prev - 1, 1))}
                        disabled={adjustedPendingPage === 1}
                        className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition-all text-secondary"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPendingPage(prev => Math.min(prev + 1, totalPendingPages))}
                        disabled={adjustedPendingPage === totalPendingPages}
                        className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition-all text-secondary"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;

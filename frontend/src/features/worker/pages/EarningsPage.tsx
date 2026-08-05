import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../api/client';
import { BanknotesIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface WorkerPayoutDTO {
  _id: string;
  paymentId: {
    _id: string;
    totalAmount: number;
    transactionId: string;
    paidAt?: string;
    gigId?: {
      _id: string;
      title: string;
    };
  };
  basePay: number;
  bonus: number;
  totalPay: number;
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
}

interface PendingPayoutDTO {
  id: string;
  gigTitle: string;
  amount: number;
  eventDate: string;
}

const EarningsPage: React.FC = () => {
  const { user, token, loginState } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [payouts, setPayouts] = useState<WorkerPayoutDTO[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayoutDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    // 1. Check if returning from onboarding redirect or needs auto-sync
    const checkStripeStatus = async () => {
      const isReturn = searchParams.get('stripe_return') === 'true';
      const isRefresh = searchParams.get('stripe_refresh') === 'true';
      const needsStatusCheck = isReturn || isRefresh || (user && user.stripeAccountId && !user.stripeOnboardingCompleted);

      if (needsStatusCheck && !hasVerified) {
        try {
          setHasVerified(true);
          const res = await apiClient.get('/payments/connect/status');
          if (res.data && res.data.success) {
            const statusData = res.data.data;
            if (statusData.stripeOnboardingCompleted) {
              showToast('Stripe Connected Account successfully verified!', 'success');
              const localToken = token || localStorage.getItem('accessToken');
              if (statusData.user && localToken) {
                loginState(statusData.user, localToken);
              }
            } else if (isReturn) {
              showToast('Please complete all fields on the Stripe onboarding form.', 'warning');
            }
          }
        } catch (err) {
          console.error("Stripe check failed:", err);
          if (isReturn || isRefresh) {
            showToast('Failed to verify Stripe connection status.', 'error');
          }
        } finally {
          if (isReturn || isRefresh) {
            setSearchParams({});
          }
        }
      }
    };

    checkStripeStatus();
    fetchPayouts();
  }, [searchParams, user]);

  const fetchPayouts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/payments/history/worker');
      if (res.data && res.data.success) {
        setPayouts(res.data.data.payouts || []);
        setPendingPayouts(res.data.data.pendingPayouts || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve payouts history.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeOnboard = async () => {
    try {
      setIsOnboarding(true);
      const res = await apiClient.post('/payments/connect');
      if (res.data && res.data.success && res.data.data.url) {
        window.location.href = res.data.data.url;
      } else {
        showToast('Failed to generate Stripe onboarding link.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting with Stripe.', 'error');
    } finally {
      setIsOnboarding(false);
    }
  };

  // Aggregates
  const totalEarned = payouts
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.totalPay, 0);

  const pendingEarned = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(payouts.length / ITEMS_PER_PAGE));
  const adjustedPage = Math.min(currentPage, totalPages);
  const paginatedPayouts = payouts.slice(
    (adjustedPage - 1) * ITEMS_PER_PAGE,
    adjustedPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Earnings</h1>
        <p className="text-sm text-secondary">Track your payouts, transaction statements, and Connect Account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earned Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Total Earnings</span>
            <h3 className="text-2xl font-black text-textMain mt-1.5">₹{totalEarned.toLocaleString()}</h3>
            <p className="text-[10px] text-green-600 font-bold mt-1">Transferred to bank</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <BanknotesIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Pending Payouts</span>
            <h3 className="text-2xl font-black text-textMain mt-1.5">₹{pendingEarned.toLocaleString()}</h3>
            <p className="text-[10px] text-amber-600 font-bold mt-1">Awaiting release</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <BanknotesIcon className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Stripe Connection Setup Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Stripe Connect</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${user?.stripeOnboardingCompleted ? 'text-green-600' : 'text-red-500'}`}>
                  {user?.stripeOnboardingCompleted ? 'Connected' : 'Not Connected'}
                </span>
                {user?.stripeOnboardingCompleted && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#635bff] flex items-center justify-center text-white font-black text-lg select-none">
              S
            </div>
          </div>
          <button
            onClick={handleStripeOnboard}
            disabled={isOnboarding}
            className={`mt-4 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-colors border shadow-sm ${
              user?.stripeOnboardingCompleted
                ? 'bg-white border-gray-200 text-textMain hover:bg-gray-50'
                : 'bg-primary text-white border-transparent hover:bg-primary/90'
            }`}
          >
            {isOnboarding ? 'Loading...' : user?.stripeOnboardingCompleted ? 'Update Connect Account' : 'Connect Stripe Account'}
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pending payouts card list if any */}
      {pendingPayouts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-textMain uppercase tracking-wider">Awaiting Release Payouts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingPayouts.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-textMain">{p.gigTitle}</h4>
                  <span className="text-[10px] text-secondary">
                    Event Date: {new Date(p.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-black text-base text-amber-600">₹{p.amount.toLocaleString()}</div>
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Pending Pay</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger History List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-textMain">Payouts Ledger</h2>
          <span className="text-xs text-secondary">{payouts.length} transactions</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-secondary animate-pulse">Loading statements...</div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-xs text-secondary">No payouts registered yet.</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-secondary uppercase font-bold tracking-wider">
                    <th className="p-4 pl-6">Gig Reference</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Paid Date</th>
                    <th className="p-4">Base Payout</th>
                    <th className="p-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPayouts.map((payout) => {
                    const gigTitle = payout.paymentId?.gigId?.title || 'Gig Assignment';
                    const txId = payout.paymentId?.transactionId || '—';
                    const dateStr = payout.paymentId?.paidAt
                      ? new Date(payout.paymentId.paidAt).toLocaleDateString()
                      : new Date(payout.createdAt).toLocaleDateString();

                    return (
                      <tr key={payout._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-textMain">{gigTitle}</td>
                        <td className="p-4 text-secondary font-mono text-[10px]">{txId.substring(0, 15)}...</td>
                        <td className="p-4 text-secondary">{dateStr}</td>
                        <td className="p-4 font-bold text-textMain">₹{payout.totalPay.toLocaleString()}</td>
                        <td className="p-4 pr-6 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            payout.paymentStatus === 'paid'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {payout.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <span className="text-[10px] font-semibold text-secondary">
                  Page {adjustedPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={adjustedPage === 1}
                    className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition-all text-secondary"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={adjustedPage === totalPages}
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
    </div>
  );
};

export default EarningsPage;

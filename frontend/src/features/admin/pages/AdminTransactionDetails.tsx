import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client';
import { useToast } from '../../../context/ToastContext';
import { 
  ArrowLeftIcon, 
  ArrowDownTrayIcon, 
  MapPinIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface WorkerPayment {
  _id: string;
  workerId: {
    name: string;
    email: string;
    profileImage: string | null;
  };
  roleId: {
    roleName: string;
    payPerPerson: number;
  };
  basePay: number;
  bonus: number;
  totalPay: number;
  paymentStatus: string;
}

interface PaymentDetails {
  _id: string;
  transactionId: string;
  totalAmount: number;
  platformFee: number;
  paymentStatus: string;
  createdAt: string;
  paidAt?: string;
  gigId: {
    _id: string;
    title: string;
    location: string;
    eventDate: string;
    startTime: string;
    status: string;
  };
  ownerId: {
    name: string;
    email: string;
    businessName: string;
  };
}

const AdminTransactionDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/payments/${transactionId}`);
      if (res.data && res.data.success) {
        setPayment(res.data.data.payment);
        setWorkerPayments(res.data.data.workerPayments || []);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load transaction details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-secondary tracking-widest uppercase animate-pulse">Loading statement...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-secondary">Transaction not found.</p>
        <button
          onClick={() => navigate('/admin/payments')}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  let statusColor = 'bg-gray-100 text-gray-600';
  if (payment.paymentStatus === 'paid') statusColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  if (payment.paymentStatus === 'pending') statusColor = 'bg-amber-50 text-amber-600 border border-amber-100';
  if (payment.paymentStatus === 'failed') statusColor = 'bg-rose-50 text-rose-600 border border-rose-100';

  const workerSubtotal = workerPayments.reduce((acc, wp) => acc + wp.totalPay, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-gray-50/20 min-h-screen">
      {/* Top breadcrumb & action header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/payments/transactions')}
          className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-textMain transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to all transactions
        </button>
        <button
          // onClick={() => showToast('Receipt download feature will be ready in production release.', 'info')}
          className="px-4 py-2 bg-[#6b704c] text-white hover:bg-[#6b704c]/95 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Download Receipt
        </button>
      </div>

      {/* Transaction Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-textMain tracking-tight">
            Transaction #TRX-{payment.transactionId.substring(8, 16).toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 text-xs text-secondary font-medium">
            <span>Attempted on {new Date(payment.createdAt).toLocaleDateString()}</span>
            <span>&middot;</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
              {payment.paymentStatus === 'paid' ? 'Completed' : payment.paymentStatus === 'pending' ? 'Processing' : 'Failed'}
            </span>
          </div>
        </div>
      </div>

      {/* Split Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gig Info, Crew Breakdown, Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gig Information */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Gig Information</h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-primary">
                <DocumentTextIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-textMain">{payment.gigId?.title || 'Gig details not available'}</h4>
                <p className="text-xs font-semibold text-secondary">{payment.ownerId?.businessName}</p>
                <div className="flex items-center gap-4 text-[10px] text-secondary font-medium pt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {payment.gigId?.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {new Date(payment.gigId?.eventDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Worker Payouts list */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Worker Payment Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-secondary uppercase tracking-widest bg-gray-50/50">
                    <th className="px-4 py-3">Worker Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Base Pay</th>
                    <th className="px-4 py-3">Bonus</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {workerPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-secondary italic">
                        No worker payouts split for this transaction yet.
                      </td>
                    </tr>
                  ) : (
                    workerPayments.map((wp) => (
                      <tr key={wp._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 flex items-center gap-3">
                          <img
                            src={wp.workerId?.profileImage ? `http://localhost:3000${wp.workerId?.profileImage}` : '/default-avatar.png'}
                            alt={wp.workerId?.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + wp.workerId?.name;
                            }}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-100"
                          />
                          <div>
                            <span className="block font-bold text-textMain">{wp.workerId?.name}</span>
                            <span className="text-[9px] text-secondary font-mono">{wp.workerId?.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-secondary">
                          {wp.roleId?.roleName || 'Crew member'}
                        </td>
                        <td className="px-4 py-4 text-secondary font-medium">
                          ₹{wp.basePay.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-secondary font-medium">
                          ₹{wp.bonus.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-black text-textMain">
                          ₹{wp.totalPay.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs and Timeline section */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Timeline & Status Log</h3>
            <div className="relative border-l border-gray-200 ml-3 pl-6 space-y-6 text-xs">
              
              {payment.paymentStatus === 'paid' && (
                <div className="relative">
                  <span className="absolute -left-[31px] bg-emerald-50 text-emerald-600 rounded-full p-1 border border-white">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-textMain">Payouts Distributed</h4>
                    <p className="text-secondary text-[10px] mt-0.5">
                      System automatically routed splits to worker connected accounts.
                    </p>
                    {payment.paidAt && (
                      <span className="text-[9px] text-gray-400 font-medium block mt-1">
                        {new Date(payment.paidAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="relative">
                <span className={`absolute -left-[31px] rounded-full p-1 border border-white ${
                  payment.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className="font-bold text-textMain">Payment Released by Owner</h4>
                  <p className="text-secondary text-[10px] mt-0.5">
                    Platform checkout completed successfully via Stripe Business portal.
                  </p>
                  <span className="text-[9px] text-gray-400 font-medium block mt-1">
                    {new Date(payment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="relative font-medium text-secondary">
                <span className="absolute -left-[31px] bg-emerald-50 text-emerald-600 rounded-full p-1 border border-white">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className="font-bold text-textMain">Gig Marked Complete</h4>
                  <p className="text-secondary text-[10px] mt-0.5">
                    Event completed and applications transitioned to locked crew rolls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Invoice cost summary box & Stripe Reference details */}
        <div className="space-y-6">
          
          {/* Invoice box */}
          <div className="bg-[#6b704c] text-white rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">Payment Summary</h3>
            <div className="space-y-3 pt-2 text-xs border-b border-white/10 pb-4">
              <div className="flex justify-between">
                <span className="opacity-90">Subtotal (Workers)</span>
                <span className="font-bold">₹{workerSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Platform Fee (10%)</span>
                <span className="font-bold">₹{payment.platformFee.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Grand Total</span>
              <span className="text-2xl font-black">₹{payment.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Details Metadata Box */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Payment Details</h3>
            <div className="space-y-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Method</span>
                <span className="font-bold text-textMain">Stripe Business Checkout</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Transaction ID</span>
                <span className="font-mono text-[10px] text-textMain break-all">{payment.transactionId}</span>
              </div>
              {payment.paymentStatus === 'paid' && (
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Payout Reference</span>
                  <span className="font-mono text-[10px] text-textMain break-all">
                    po_{payment.transactionId.substring(8, 18)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Support panel */}
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 text-center space-y-3">
            <h4 className="text-xs font-extrabold text-textMain">Need help with this?</h4>
            <p className="text-[10px] text-secondary leading-relaxed">
              Questions about fees, transfers, or worker payment distributions should be handled by support operations.
            </p>
            <button
              onClick={() => showToast('Support tickets are disabled in local sandbox.', 'info')}
              className="w-full py-2 bg-white border border-gray-200 text-[10px] font-bold rounded-xl text-textMain hover:bg-gray-100 transition-colors uppercase tracking-wider"
            >
              Open Support Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionDetails;

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../api/client';
import { CheckCircleIcon, StarIcon, HomeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import WorkerReviewFlowModal from '../../../components/WorkerReviewFlowModal';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const sessionId = searchParams.get('session_id');

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    gigId: string;
    gigTitle: string;
    totalAmount: number;
    transactionId: string;
  } | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('Missing Stripe checkout session ID.');
        setIsVerifying(false);
        return;
      }

      try {
        setIsVerifying(true);
        const res = await apiClient.post('/payments/verify', { sessionId });
        if (res.data && res.data.success) {
          const payment = res.data.data.payment;
          setPaymentDetails({
            gigId: payment.gigId?._id || payment.gigId,
            gigTitle: payment.gigId?.title || 'Creative Campaign Assets',
            totalAmount: payment.totalAmount || 0,
            transactionId: payment.transactionId || sessionId,
          });
          showToast('Payment completed successfully!', 'success');
        } else {
          setError(res.data.message || 'Payment verification failed.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to verify payment with the server.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-textMain mt-4 animate-pulse">Verifying checkout session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircleIcon className="w-10 h-10 rotate-180" />
        </div>
        <h1 className="text-xl font-bold text-textMain">Verification Error</h1>
        <p className="text-xs text-secondary mt-2 max-w-sm">{error}</p>
        <button
          onClick={() => navigate('/owner/payments')}
          className="mt-6 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm"
        >
          Back to Payments
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col items-center text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircleIcon className="w-12 h-12 stroke-[1.5]" />
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-textMain tracking-tight">Payment Successful!</h1>
          <p className="text-xs text-secondary max-w-xs leading-relaxed">
            You have successfully released payments for <span className="font-extrabold text-textMain">{paymentDetails?.gigTitle}</span>. Workers will receive their funds via Stripe soon.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-gray-50 rounded-2xl p-4 w-full flex items-center justify-between border border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-secondary">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[8px] font-bold text-secondary uppercase tracking-widest block">Transaction ID</span>
              <span className="text-[10px] text-textMain font-mono font-bold">
                #TXN-{paymentDetails?.transactionId.substring(8, 20)}...
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold text-secondary uppercase tracking-widest block">Amount Paid</span>
            <span className="text-sm font-black text-emerald-600">₹{(paymentDetails?.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Buttons List */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => setIsReviewOpen(true)}
            className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <StarIcon className="w-4 h-4" />
            Give Review to workers!
          </button>
          
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="w-full py-3 bg-white border border-gray-200 text-textMain text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <HomeIcon className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/owner/payments')}
            className="w-full py-3 bg-gray-50 text-secondary text-xs font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <DocumentTextIcon className="w-4 h-4" />
            View Receipt
          </button>
        </div>

        {/* Footer Support Text */}
        <div className="text-[10px] text-secondary">
          Need help? <a href="mailto:support@gigso.com" className="text-primary font-bold hover:underline">Contact Gigso Support</a>
        </div>
      </div>

      {paymentDetails && (
        <WorkerReviewFlowModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          gigId={paymentDetails.gigId}
          gigTitle={paymentDetails.gigTitle}
        />
      )}
    </div>
  );
};

export default PaymentSuccessPage;

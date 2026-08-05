import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon, ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUtcTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col items-center text-center space-y-6">
        {/* Failure Warning Icon */}
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-inner">
          <XCircleIcon className="w-12 h-12 stroke-[1.5]" />
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-textMain tracking-tight">Payment Failed</h1>
          <p className="text-xs text-secondary max-w-xs leading-relaxed">
            Something went wrong while processing your payment. Please check your billing details or try again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => navigate('/owner/payments')}
            className="w-full py-3 bg-[#6b704c] hover:bg-[#6b704c]/90 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <ArrowPathIcon className="w-4 h-4 animate-spin-reverse" />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = 'mailto:support@gigso.com'}
            className="w-full py-3 bg-gray-50 text-secondary text-xs font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <EnvelopeIcon className="w-4 h-4" />
            Contact Support
          </button>
        </div>

        {/* Technical metadata summary section */}
        <div className="border-t border-gray-100 pt-4 w-full text-center space-y-1">
          <div className="text-[9px] font-mono text-secondary">
            <span className="font-bold uppercase">Error ID:</span> #99283-GG-PAY
          </div>
          <div className="text-[9px] font-mono text-secondary">
            Transaction attempt logged at {currentUtcTime} UTC
          </div>
        </div>

        {/* Footer legal policies text */}
        <div className="text-[10px] text-secondary flex gap-3">
          <span>&copy; 2026 Gigso Inc.</span>
          <span>&middot;</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>&middot;</span>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;

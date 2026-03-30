import React, { useState, useRef, useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/Button';
import authService from '../../services/authService';

const OtpVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(54);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'registration';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    // Focus next empty or last
    const nextEmpty = pasteData.length < 6 ? pasteData.length : 5;
    inputRefs.current[nextEmpty]?.focus();
  };

  const handleResend = () => {
    if (!email) {
      setError('Email missing from URL request.');
      return;
    }

    setError('');
    authService.resendOtp({ email, type })
      .then(() => {
        setTimeLeft(60); // Reset timer 
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Failed to resend OTP.');
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const finalOtp = otp.join('');
    if (finalOtp.length === 6) {
      if (!email) {
        setError('Email missing from URL request.');
        return;
      }
      
      setIsSubmitting(true);
      authService.verifyOtp({ email, otp: finalOtp, type })
        .then(() => {
          if (type === 'registration') {
            navigate('/login');
          } else if (type === 'password-reset') {
            navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(finalOtp)}`);
          }
        })
        .catch((err: any) => {
          setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
        setError('Please enter all 6 digits.');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-[480px] bg-white rounded-3xl p-10 shadow-xl shadow-gray-200/50 ring-1 ring-black/5 relative z-10">
        
        {/* Decorative top badge */}
        <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-textMain mb-3">Enter OTP</h2>
          <p className="text-secondary text-sm leading-relaxed">
            We've sent a 6-digit verification code to your registered mobile number for <span className="text-primary font-medium">Gigso Owner access.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {error && (
            <div className="p-3 text-sm text-center text-red-600 bg-red-50 rounded-lg">
                {error}
            </div>
          )}

          <div className="flex justify-between max-w-sm mx-auto gap-2">
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold bg-white border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm hover:border-gray-300 transition-colors"
                required
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-secondary mb-2">
                Didn't receive the code? {' '}
                <button 
                  type="button" 
                  disabled={timeLeft > 0} 
                  className={`font-semibold ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:underline'}`}
                  onClick={handleResend}
                >
                    Resend Code
                </button>
            </p>
            {timeLeft > 0 && (
                <p className="text-xs font-semibold text-textMain">{formatTime(timeLeft)}</p>
            )}
          </div>

          <Button type="submit" variant="primary" fullWidth>
            {isSubmitting ? 'Verifying...' : (
                <>Verify Code <span aria-hidden="true" className="ml-2">→</span></>
            )}
          </Button>

        </form>

      </div>
      
      <p className="mt-8 text-xs text-gray-400 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        Secure end-to-end encrypted verification
      </p>

    </div>
  );
};

export default OtpVerification;

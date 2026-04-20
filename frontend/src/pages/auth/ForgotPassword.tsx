import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import authService from '../../services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    authService.forgotPassword({ email })
      .then(() => {
        navigate('/verify-otp', {
          state: {
            email,
            type: 'password-reset'
          },
          replace:true
        });
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
        setError(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to request password reset. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col pt-12">
        
        <div className="min-h-[calc(100vh-6rem)] bg-background flex flex-col items-center justify-center p-6 relative w-full">
            <div className="w-full max-w-[440px] bg-white rounded-3xl p-10 shadow-xl shadow-gray-200/50 ring-1 ring-black/5 relative z-10">
                <div className="text-center mb-8 pt-2">
                    <span className="text-xl font-bold text-primary tracking-tight">Gigso</span>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-textMain mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-secondary text-sm">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    <InputField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                    />

                    <div className="pt-2">
                        <Button type="submit" variant="primary" fullWidth>
                            {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm">
                    <Link to="/login" className="font-semibold text-primary hover:underline inline-flex items-center gap-2">
                        <span>&larr;</span> Back to login
                    </Link>
                </div>
            </div>

            <div className="mt-10 mb-8 flex items-center justify-center">
                <p className="text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Secure Reset Process</p>
            </div>
        </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import authService from '../services/auth.service';
import { useAuth } from '../../../context/AuthContext';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import type { AuthResponse } from '../../../types/api.types';
import { isStrongPassword } from '../../../utils/validators';

const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role');
  const { loginState } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    setIsSubmitting(true);
    setError('');

    const token = credentialResponse.credential;
    if (!token) {
      setError('Google signup failed: no credential received.');
      setIsSubmitting(false);
      return;
    }

    if (!role) {
      setError('Please select a role from the previous page before signing up with Google.');
      setIsSubmitting(false);
      return;
    }

    authService.googleLogin({ token, role })
      .then((res: AuthResponse) => {
        loginState(res.user, res.accessToken);
        if (res.user.role === 'admin') {
          navigate('/admin/owners');
        } else {
          navigate('/home');
        }
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Google Signup failed.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleGoogleError = () => {
    setError('Google Signup failed.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isStrongPassword(formData.password)) {
        setError('Password does not meet the security requirements. Must be at least 8 characters, include a number and a special character.');
        return;
    }

    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: role || 'worker',
    };

    setIsSubmitting(true);
    authService.sendOtp(payload)
      .then(() => {
        navigate('/verify-otp', { 
          state: { 
            email: formData.email, 
            type: 'registration' 
          },
          replace:true
        });
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
        setError(axiosErr.response?.data?.error || 'Failed to send OTP. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      {/* Decorative background gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-secondary to-primary opacity-20" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}} />
      </div>

      <div className="w-full max-w-[500px] bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-gray-200/50 ring-1 ring-black/5 relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/role-selection')}
          className="absolute top-8 left-8 text-gray-400 hover:text-textMain transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="text-center mb-8 pt-2">
          <span className="text-xl font-bold text-primary tracking-tight">Gigso</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-textMain mb-2">
            Create your account
          </h2>
          <p className="text-secondary text-sm">
            Join Gigso and start your journey
          </p>
        </div>

        {/* Google Signup Button */}
        <div className="flex justify-center w-full">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
                text="signup_with"
            />
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-400">Or with email</span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <InputField
            label="Full Name"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name" 
          />

          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@company.com"
          />

          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min. 8 characters"
          />

          <InputField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Min. 8 characters"
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          By signing up, you agree to our <a href="#" className="font-semibold text-textMain hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-textMain hover:underline">Privacy Policy</a>
        </p>

        <p className="mt-6 text-center text-sm text-textMain font-medium">
          Already have an account? <a href="#" className="text-primary hover:underline">Log in</a>
        </p>

      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import authService from '../services/auth.service';
import { useAuth } from '../../../context/AuthContext';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import type { AuthResponse } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';

const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role');
  const { loginState } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (!/^[\p{L}\s'\-.]+$/u.test(formData.fullName.trim())) {
      errors.fullName = 'Name can only contain letters, spaces, hyphens, or apostrophes';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character (!@#$%^&*)';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    setIsSubmitting(true);
    const token = credentialResponse.credential;
    if (!token) {
      showToast('Google signup failed: no credential received.', 'error');
      setIsSubmitting(false);
      return;
    }
    if (!role) {
      showToast('Please select a role from the previous page before signing up with Google.', 'warning');
      setIsSubmitting(false);
      return;
    }
    authService.googleLogin({ token, role })
      .then((res: AuthResponse) => {
        loginState(res.user, res.accessToken);
        if (res.user.role === 'admin') navigate('/admin/owners');
        else navigate('/home');
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        showToast(axiosErr.response?.data?.error || 'Google Signup failed.', 'error');
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleGoogleError = () => showToast('Google Signup failed.', 'error');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: formData.fullName.trim(),
      email: formData.email,
      password: formData.password,
      role: role || 'worker',
    };

    setIsSubmitting(true);
    authService.sendOtp(payload)
      .then(() => {
        navigate('/verify-otp', {
          state: { email: formData.email, type: 'registration' },
          replace: true,
        });
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
        showToast(axiosErr.response?.data?.error || 'Failed to send OTP. Please try again.', 'error');
      })
      .finally(() => setIsSubmitting(false));
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
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <InputField
            id="signup-fullname"
            label="Full Name"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name"
            error={fieldErrors.fullName}
          />

          <InputField
            id="signup-email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@company.com"
            error={fieldErrors.email}
          />

          <InputField
            id="signup-password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min. 8 characters"
            error={fieldErrors.password}
          />

          <InputField
            id="signup-confirm-password"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Min. 8 characters"
            error={fieldErrors.confirmPassword}
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
          Already have an account? <a href="/login" className="text-primary hover:underline">Log in</a>
        </p>

      </div>
    </div>
  );
};

export default Signup;

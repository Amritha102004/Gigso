import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import authService from '../services/auth.service';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import type { AuthResponse } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { loginState } = useAuth();
  const { showToast } = useToast();

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email address';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    setIsSubmitting(true);
    const token = credentialResponse.credential;
    if (!token) {
      showToast('Google login failed: no credential received.', 'error');
      setIsSubmitting(false);
      return;
    }

    authService.googleLogin({ token })
      .then((res: AuthResponse) => {
        loginState(res.user, res.accessToken);
        if (res.user.role === 'admin') navigate('/admin/owners');
        else if (res.user.role === 'worker') navigate('/worker/profile');
        else navigate('/owner/profile');
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { requiresRole?: boolean; error?: string } } };
        if (axiosErr.response?.data?.requiresRole) {
          showToast('Account not found. Please sign up first.', 'warning');
        } else {
          showToast(axiosErr.response?.data?.error || 'Google Login failed.', 'error');
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleGoogleError = () => showToast('Google Login failed.', 'error');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    authService.login(formData)
      .then((res: AuthResponse) => {
        loginState(res.user, res.accessToken);
        if (res.user.role === 'admin') navigate('/admin/owners');
        else if (res.user.role === 'worker') navigate('/worker/profile');
        else navigate('/owner/profile');
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
        showToast(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Invalid email or password.', 'error');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen flex flex-col pt-12">
        <header className="absolute inset-x-0 top-0 z-50">
            {/* Same header structure as Landing Page, Optional */}
        </header>
        
        <div className="min-h-[calc(100vh-6rem)] bg-background flex flex-col items-center justify-center p-6 relative w-full">
            <div className="w-full max-w-[440px] bg-white rounded-3xl p-10 shadow-xl shadow-gray-200/50 ring-1 ring-black/5 relative z-10">
                <div className="text-center mb-8 pt-2">
                    <span className="text-xl font-bold text-primary tracking-tight">Gigso</span>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-textMain mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-secondary text-sm">
                        Sign in to manage your gigs and workforce
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <InputField
                        id="login-email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="owner@Gigso.com"
                        error={fieldErrors.email}
                    />

                    <div className="relative">
                        <div className="absolute right-0 top-0 text-right pr-1 pb-1">
                             <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <InputField
                            id="login-password"
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="........"
                            error={fieldErrors.password}
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" variant="primary" fullWidth>
                          {isSubmitting ? 'Logging in...' : 'Login'}
                        </Button>
                    </div>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-4 text-gray-400">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center w-full">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        width="100%"
                        text="continue_with"
                    />
                </div>

                <p className="mt-10 text-center text-sm text-secondary">
                    Don't have an account? <Link to="/role-selection" className="font-semibold text-primary hover:underline">Sign Up</Link>
                </p>
            </div>

            <div className="mt-10 flex space-x-6 text-xs text-secondary">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
        </div>
    </div>
  );
};

export default Login;

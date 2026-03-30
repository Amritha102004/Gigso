import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import authService from '../../services/authService';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    authService.login(formData)
      .then((res) => {
        const { accessToken, role } = res;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Invalid email or password.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col pt-12">
        <header className="absolute inset-x-0 top-0 z-50">
            {/* Same header structure as Landing Page, Optional */}
        </header>
        
        <div className="min-h-[calc(100vh-6rem)] bg-background flex flex-col items-center justify-center p-6 relative w-full">
            {/* Outline Box mapping to Figma */}
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">
                        {error}
                        </div>
                    )}

                    <InputField
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="owner@Gigso.com"
                        required
                    />

                    <div className="relative">
                        {/* Nested labels logic to keep "Forgot Password?" properly aligned */}
                        <div className="absolute right-0 top-0 text-right pr-1 pb-1">
                             <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <InputField
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="........"
                            required
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

                <Button variant="google" fullWidth>
                    Continue with Google
                </Button>

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

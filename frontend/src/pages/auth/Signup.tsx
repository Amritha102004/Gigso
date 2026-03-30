import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';

const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  });

  const [error, setError] = useState('');

  const isOwner = role === 'owner';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isOwner && !formData.businessName) {
      setError('Business Name is required for Owners.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Mock successful submission
    alert(`Account created successfully for ${role}! (UI Only)`);
    // navigate('/dashboard'); // Not connected to backend yet
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
        <Button variant="google" fullWidth>
          Sign up with Google
        </Button>

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
            required
          />

          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@company.com"
            required
          />

          {isOwner && (
            <InputField
              label="Business Name"
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Acme Studio"
              required
            />
          )}

          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min. 8 characters"
            required
          />

          <InputField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Min. 8 characters"
            required
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth>
              Create Account
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

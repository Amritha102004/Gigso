import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Basic strength check (matches hint)
    const strongRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!strongRegex.test(formData.password)) {
        setError('Password does not meet the security requirements.');
        return;
    }

    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
        setIsSubmitting(false);
        alert('Password reset successful! You can now login.');
        navigate('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col pt-12">
        
        <div className="min-h-[calc(100vh-6rem)] bg-background flex flex-col items-center justify-center p-6 relative w-full">
            <div className="w-full max-w-[440px] bg-white rounded-3xl p-10 shadow-xl shadow-gray-200/50 ring-1 ring-black/5 relative z-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="text-center mb-8 pt-2">
                    <span className="text-xl font-bold text-primary tracking-tight">Gigso</span>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-textMain mb-2">
                        Reset Password
                    </h2>
                    <p className="text-secondary text-sm">
                        Choose a strong password for your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    <InputField
                        label="New Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="........"
                        required
                    />

                    <InputField
                        label="Confirm New Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="........"
                        required
                    />

                    {/* Password Requirements Hint Box */}
                    <div className="bg-background/80 rounded-lg p-4 border border-gray-100 flex gap-3 text-secondary text-xs leading-relaxed">
                        <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <p>Must be at least 8 characters, include a number and a special character.</p>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" variant="primary" fullWidth>
                            {isSubmitting ? 'Resetting...' : (
                                <>Reset Password <span aria-hidden="true" className="ml-2">→</span></>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm">
                    <Link to="/login" className="font-medium text-secondary hover:text-primary transition-colors">
                        Back to Login
                    </Link>
                </div>
            </div>
            
             <div className="mt-10 mb-8 w-full max-w-[500px] border-t border-dashed border-gray-300"></div>
        </div>
    </div>
  );
};

export default ResetPassword;

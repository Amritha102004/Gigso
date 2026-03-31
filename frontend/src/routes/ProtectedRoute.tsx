import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show nothing while evaluating hydration
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary bg-background">
        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Kick to login if user state missing entirely
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

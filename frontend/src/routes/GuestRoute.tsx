import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

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

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'worker') {
      if (!user.isProfileCompleted) {
        return <Navigate to="/setup-worker-profile" replace />;
      }
      return <Navigate to="/worker/home" replace />;
    } else if (user.role === 'owner') {
      if (!user.isProfileCompleted) {
        return <Navigate to="/setup-owner-profile" replace />;
      }
      return <Navigate to="/owner/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default GuestRoute;

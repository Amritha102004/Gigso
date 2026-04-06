import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HomePage: React.FC = () => {
  const { user, logoutState } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutState();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold text-textMain tracking-tight">
        Welcome to Gigso
        {user?.name ? `, ${user.name}` : ''}
      </h1>

      {user && (
        <p className="text-secondary text-sm">
          Signed in as <span className="font-semibold text-textMain">{user.email}</span>
          {' · '}
          <span className="capitalize">{user.role}</span>
        </p>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default HomePage;

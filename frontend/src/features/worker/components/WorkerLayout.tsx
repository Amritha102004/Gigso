import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { HomeIcon, BriefcaseIcon, MagnifyingGlassIcon, CurrencyDollarIcon, ChatBubbleLeftIcon, UserIcon } from '@heroicons/react/24/outline';

const WorkerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/worker/home', icon: HomeIcon },
    { name: 'My Gigs', path: '/worker/my-gigs', icon: BriefcaseIcon },
    { name: 'Browse Gigs', path: '/worker/browse', icon: MagnifyingGlassIcon },
    { name: 'Earnings', path: '/worker/earnings', icon: CurrencyDollarIcon },
    { name: 'Messages', path: '/worker/messages', icon: ChatBubbleLeftIcon },
    { name: 'Profile', path: '/worker/profile', icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-lg">
            G
          </div>
          <div>
            <h1 className="text-xl font-bold text-textMain">Gigso</h1>
            <p className="text-xs text-secondary">Worker Portal</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-secondary hover:bg-gray-50 hover:text-textMain'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-full h-full p-2 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-textMain truncate">{user?.name}</p>
              <p className="text-xs text-secondary truncate">Pro Member</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left text-xs font-medium text-red-600 hover:text-red-700 px-2"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default WorkerLayout;

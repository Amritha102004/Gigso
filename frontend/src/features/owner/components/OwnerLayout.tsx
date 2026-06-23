import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Squares2X2Icon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const OwnerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: Squares2X2Icon },
    { name: 'Gigs', path: '/owner/gigs', icon: BriefcaseIcon },
    { name: 'Messages', path: '/owner/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Payments', path: '/owner/payments', icon: BanknotesIcon },
    { name: 'Profile', path: '/owner/profile', icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#6b704c] rounded-md flex items-center justify-center text-white font-bold text-lg">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-textMain tracking-tight">Gigso</h1>
              <p className="text-[10px] uppercase tracking-wider text-secondary font-semibold">Owner Portal</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-4 space-y-1 mt-6">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#6b704c]/10 text-[#6b704c]'
                      : 'text-secondary hover:bg-gray-50 hover:text-textMain'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-100 bg-[#f9f9f5] m-4 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#6b704c]/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-[#6b704c] font-bold text-lg">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-textMain truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-secondary truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-secondary hover:text-red-600 transition-colors p-1"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
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

export default OwnerLayout;

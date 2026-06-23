import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  PlusIcon,
  BriefcaseIcon, 
  UserGroupIcon, 
  BanknotesIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Post a New Gig',
      description: 'Create and publish job postings to hire professional workers quickly.',
      icon: PlusIcon,
      path: '/owner/gigs', // Post flow will start from here
      color: 'from-[#6b704c]/10 to-[#8a9163]/10 text-[#6b704c]',
    },
    {
      title: 'Manage Gigs',
      description: 'Review job applications, select candidates, and monitor ongoing work.',
      icon: BriefcaseIcon,
      path: '/owner/gigs',
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600',
    },
    {
      title: 'Payments',
      description: 'Fund deposits, release escrow payments, and manage invoicing.',
      icon: BanknotesIcon,
      path: '/owner/payments',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600',
    },
    {
      title: 'Business Profile',
      description: 'Update business information, website links, and industry options.',
      icon: UserGroupIcon,
      path: '/owner/profile',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#6b704c] to-[#4c4f36] rounded-3xl p-8 sm:p-12 text-white shadow-lg shadow-gray-100">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none">
          <SparklesIcon className="w-full h-full object-contain" />
        </div>
        <div className="relative z-10 space-y-4 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
            <SparklesIcon className="w-3.5 h-3.5" /> Owner Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed">
            Ready to find quality staff? Post a new gig, view pending worker applications, or manage payouts on your active assignments.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/owner/gigs')}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#6b704c] font-bold rounded-xl text-sm hover:bg-opacity-95 transition-all shadow-md active:scale-95"
            >
              Post a Gig
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-textMain">Business Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-textMain group-hover:text-[#6b704c] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-[#6b704c] opacity-0 group-hover:opacity-100 transition-opacity">
                Manage &rarr;
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

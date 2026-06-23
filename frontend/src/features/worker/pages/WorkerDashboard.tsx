import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  BriefcaseIcon, 
  UserIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Find Work',
      description: 'Browse available gigs matching your skillset and start applying.',
      icon: BriefcaseIcon,
      path: '/worker/browse',
      color: 'from-blue-500/10 to-indigo-500/10 text-primary',
    },
    {
      title: 'My Profile',
      description: 'Update your portfolio, skills, and personal information to stand out.',
      icon: UserIcon,
      path: '/worker/profile',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600',
    },
    {
      title: 'Track Earnings',
      description: 'Check your pending payments and track your completed gig payouts.',
      icon: CurrencyDollarIcon,
      path: '/worker/earnings',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600',
    },
    {
      title: 'Messages',
      description: 'Chat directly with business owners regarding your active gigs.',
      icon: ChatBubbleLeftIcon,
      path: '/worker/messages',
      color: 'from-amber-500/10 to-orange-500/10 text-amber-600',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-indigo-600 rounded-3xl p-8 sm:p-12 text-white shadow-lg shadow-indigo-100">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <SparklesIcon className="w-full h-full object-contain" />
        </div>
        <div className="relative z-10 space-y-4 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
            <SparklesIcon className="w-3.5 h-3.5" /> Worker Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            Ready to find your next gig? Explore open jobs, keep your profile up to date, and connect with business owners today.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/worker/browse')}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-bold rounded-xl text-sm hover:bg-opacity-95 transition-all shadow-md active:scale-95"
            >
              Browse Gigs
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-textMain">Quick Actions</h2>
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
                  <h3 className="font-bold text-textMain group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Get Started &rarr;
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;

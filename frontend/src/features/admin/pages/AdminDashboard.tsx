import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  TagIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Owners Management',
      description: 'Approve, suspend, or view registered owners.',
      path: '/admin/owners',
      icon: UserGroupIcon,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      title: 'Workers Management',
      description: 'View and manage worker profiles and statuses.',
      path: '/admin/workers',
      icon: UserGroupIcon,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Categories',
      description: 'Manage gig categories and classification.',
      path: '/admin/categories',
      icon: TagIcon,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      title: 'Gigs Management',
      description: 'Moderate, review, and view all system gigs.',
      path: '/admin/gigs',
      icon: BriefcaseIcon,
      color: 'bg-sky-50 text-sky-700 border-sky-100',
    },
  ];

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Admin Dashboard</h1>
        <p className="text-secondary text-sm mt-1">Welcome back! Manage the Gigso platform settings and operations.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              onClick={() => navigate(card.path)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-textMain group-hover:text-primary transition-colors">{card.title}</h3>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">{card.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary mt-6 group-hover:underline">
                Manage
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;

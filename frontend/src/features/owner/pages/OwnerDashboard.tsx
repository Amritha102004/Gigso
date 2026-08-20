import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../api/client';
import { useToast } from '../../../context/ToastContext';
import { 
  PlusIcon,
  BriefcaseIcon, 
  UserGroupIcon, 
  BanknotesIcon,
  BellIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Gig {
  id: string;
  title: string;
  location: string;
  status: 'active' | 'closed' | 'draft' | 'completed' | 'cancelled';
  eventDate: string;
  spotsFilled: number;
  totalSpots: number;
  totalBudget: number;
}

interface UpcomingGig {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  spotsFilled: number;
  totalSpots: number;
}

interface PaymentLog {
  id: string;
  transactionId: string;
  amount: number;
  fee: number;
  gigTitle: string;
  createdAt: string;
}

interface DashboardData {
  stats: {
    activeGigs: number;
    pendingReviews: number;
    hiredCrew: number;
    totalSpent: number;
  };
  recentGigs: Gig[];
  upcomingGigs: UpcomingGig[];
  recentPayments: PaymentLog[];
}

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<string>('30'); // '7' | '30' | 'all'

  useEffect(() => {
    fetchDashboardStats();
  }, [range]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/owner/gigs/dashboard/stats', {
        params: { range }
      });
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-secondary tracking-widest uppercase animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats || { activeGigs: 0, pendingReviews: 0, hiredCrew: 0, totalSpent: 0 };
  const recentGigs = data?.recentGigs || [];
  const upcomingGigs = data?.upcomingGigs || [];
  const recentPayments = data?.recentPayments || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-gray-50/20 min-h-screen">
      
      {/* Top Welcome Title Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-textMain tracking-tight">Owner Dashboard</h1>
          <p className="text-xs text-secondary mt-0.5">Welcome back, {user?.name || 'Partner'}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-secondary bg-white px-3 py-1.5 border border-gray-100 rounded-xl shadow-sm hover:border-gray-200">
          <CalendarDaysIcon className="w-4 h-4 text-primary" />
          <select 
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-xs text-textMain cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Active Gigs */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Active Gigs</span>
            <h3 className="text-3xl font-black text-textMain">{stats.activeGigs}</h3>
            <span className="text-[9px] font-bold text-green-600 uppercase tracking-wide">Live Seekers</span>
          </div>
          <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <BriefcaseIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 2: Pending Applications */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Pending Reviews</span>
            <h3 className="text-3xl font-black text-textMain">{stats.pendingReviews}</h3>
            <span className={`text-[9px] font-bold uppercase tracking-wide ${stats.pendingReviews > 0 ? 'text-amber-600 animate-pulse' : 'text-gray-400'}`}>
              {stats.pendingReviews > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            stats.pendingReviews > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
          }`}>
            <BellIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 3: Crew Hired */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Crew Hired</span>
            <h3 className="text-3xl font-black text-textMain">{stats.hiredCrew}</h3>
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">Accepted Roster</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <UserGroupIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 4: Payments Funded */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Funded Payouts</span>
            <h3 className="text-3xl font-black text-textMain">₹{stats.totalSpent.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Processed Escrow</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <BanknotesIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

      </div>

      {/* Action Alert Banner */}
      {stats.pendingReviews > 0 && (
        <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-xs font-semibold text-amber-800">
            <BellIcon className="w-5 h-5 text-amber-600 shrink-0" />
            <span>You have {stats.pendingReviews} pending applications on active gigs waiting for your approval.</span>
          </div>
          <button
            onClick={() => navigate('/owner/gigs')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider transition-all"
          >
            Review Candidates &rarr;
          </button>
        </div>
      )}

      {/* Two-Column split workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left main grid: Recent Gigs status ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-textMain tracking-tight">Recent Gigs Status</h2>
              <button
                onClick={() => navigate('/owner/gigs')}
                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-secondary uppercase tracking-widest bg-gray-50/50">
                    <th className="px-4 py-3">Gig Name</th>
                    <th className="px-4 py-3">Venue / Location</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Spots Filled</th>
                    <th className="px-4 py-3 text-right">Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {recentGigs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-secondary italic">
                        No gigs posted yet. Click "Post a Gig" to begin.
                      </td>
                    </tr>
                  ) : (
                    recentGigs.map((g) => {
                      let statusStyle = 'bg-gray-100 text-gray-600';
                      if (g.status === 'active') statusStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                      if (g.status === 'closed') statusStyle = 'bg-rose-50 text-rose-600 border border-rose-100';
                      if (g.status === 'draft') statusStyle = 'bg-amber-50 text-amber-600 border border-amber-100';

                      const fillRate = g.totalSpots > 0 ? (g.spotsFilled / g.totalSpots) * 100 : 0;

                      return (
                        <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 font-bold text-textMain">
                            <button 
                              onClick={() => navigate(`/owner/gigs`)} 
                              className="hover:underline text-left"
                            >
                              {g.title}
                            </button>
                            <span className="block text-[9px] text-secondary font-mono mt-0.5">
                              Event: {new Date(g.eventDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-secondary font-medium">
                            {g.location}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                              {g.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-1 min-w-[80px]">
                              <span className="font-bold text-textMain text-[10px]">
                                {g.spotsFilled} / {g.totalSpots} filled
                              </span>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(fillRate, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-black text-textMain">
                            ₹{g.totalBudget.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payouts Ledger Widget */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-textMain tracking-tight">Recent Escrow Payments</h2>
              <button
                onClick={() => navigate('/owner/payments')}
                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
              >
                View Payments
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-secondary uppercase tracking-widest bg-gray-50/50">
                    <th className="px-4 py-3">Gig Assignment</th>
                    <th className="px-4 py-3">Transaction reference</th>
                    <th className="px-4 py-3">Platform Fee (10%)</th>
                    <th className="px-4 py-3 text-right">Total Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-secondary italic">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 font-bold text-textMain">
                          {p.gigTitle}
                          <span className="block text-[9px] text-secondary font-mono mt-0.5">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-secondary text-[10px] truncate max-w-[120px]">
                          {p.transactionId}
                        </td>
                        <td className="px-4 py-4 text-secondary font-medium">
                          ₹{p.fee.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-black text-textMain">
                          ₹{p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Upcoming Events & Quick Actions */}
        <div className="space-y-6">
          
          {/* Upcoming Events Calendar Panel */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-primary" />
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {upcomingGigs.length === 0 ? (
                <p className="text-xs text-secondary italic">No upcoming active gigs scheduled.</p>
              ) : (
                upcomingGigs.map((ug) => {
                  const fillRate = ug.totalSpots > 0 ? (ug.spotsFilled / ug.totalSpots) * 100 : 0;
                  return (
                    <div key={ug.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-textMain truncate hover:underline cursor-pointer" onClick={() => navigate('/owner/gigs')}>
                          {ug.title}
                        </span>
                        <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0">
                          {ug.startTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-secondary font-semibold">
                        <span>{new Date(ug.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>{ug.spotsFilled} / {ug.totalSpots} crew</span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(fillRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigate('/owner/gigs')}
                className="w-full py-2.5 bg-[#6b704c] text-white hover:bg-[#6b704c]/95 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
              >
                <PlusIcon className="w-4 h-4 stroke-[2]" />
                Post a New Gig
              </button>
              <button
                onClick={() => navigate('/owner/payments')}
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary flex items-center justify-center gap-1.5 transition-all"
              >
                <BanknotesIcon className="w-4 h-4" />
                Manage Payments
              </button>
              <button
                onClick={() => navigate('/owner/profile')}
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary flex items-center justify-center gap-1.5 transition-all"
              >
                <UserGroupIcon className="w-4 h-4" />
                Business Profile
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OwnerDashboard;

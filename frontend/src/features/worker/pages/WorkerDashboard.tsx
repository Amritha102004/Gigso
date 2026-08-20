import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../api/client';
import { useToast } from '../../../context/ToastContext';
import { 
  BriefcaseIcon, 
  CurrencyRupeeIcon, 
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface Application {
  id: string;
  gigTitle: string;
  roleName: string;
  status: 'pending' | 'accepted' | 'rejected';
  pay: number;
  appliedAt: string;
}

interface UpcomingShift {
  id: string;
  title: string;
  location: string;
  eventDate: string;
  startTime: string;
  roleName: string;
  pay: number;
}

interface DashboardData {
  stats: {
    totalEarnings: number;
    confirmedShifts: number;
    appliedGigs: number;
    rating: number;
  };
  upcomingShifts: UpcomingShift[];
  recentApplications: Application[];
}

const WorkerDashboard: React.FC = () => {
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
      const res = await apiClient.get('/worker/gigs/dashboard/stats', {
        params: { range }
      });
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load worker dashboard metrics.', 'error');
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

  const stats = data?.stats || { totalEarnings: 0, confirmedShifts: 0, appliedGigs: 0, rating: 5.0 };
  const upcomingShifts = data?.upcomingShifts || [];
  const recentApplications = data?.recentApplications || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-gray-50/20 min-h-screen">
      
      {/* Top Welcome Title Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-textMain tracking-tight">Worker Dashboard</h1>
          <p className="text-xs text-secondary mt-0.5">Welcome back, {user?.name || 'Partner'}. Ready for your next gig shift?</p>
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
        
        {/* Card 1: Total Earnings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Total Earnings</span>
            <h3 className="text-3xl font-black text-textMain">₹{stats.totalEarnings.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-green-600 uppercase tracking-wide">Payouts Deposited</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CurrencyRupeeIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 2: Confirmed Shifts */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Confirmed Shifts</span>
            <h3 className="text-3xl font-black text-textMain">{stats.confirmedShifts}</h3>
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">Accepted Jobs</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <ClockIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 3: Applied Gigs */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Applied Gigs</span>
            <h3 className="text-3xl font-black text-textMain">{stats.appliedGigs}</h3>
            <span className="text-[9px] font-bold text-primary uppercase tracking-wide">Submissions</span>
          </div>
          <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <BriefcaseIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 4: Worker Rating */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Average Rating</span>
            <h3 className="text-3xl font-black text-textMain">{stats.rating.toFixed(1)}</h3>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide flex items-center gap-0.5">
              <StarIcon className="w-3 h-3 text-amber-500 fill-amber-500" /> Client Score
            </span>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-50 rounded-2xl flex items-center justify-center">
            <StarIcon className="w-5.5 h-5.5 stroke-[1.75] text-amber-500" />
          </div>
        </div>

      </div>

      {/* Two-Column split workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left main grid: Recent Applications outcome tracking */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-textMain tracking-tight">Recent Applications</h2>
              <button
                onClick={() => navigate('/worker/my-gigs')}
                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
              >
                View Applications
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-secondary uppercase tracking-widest bg-gray-50/50">
                    <th className="px-4 py-3">Gig Assignment</th>
                    <th className="px-4 py-3">Role Applied</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-secondary italic">
                        No applications submitted yet. Click "Find Work" to browse gigs!
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => {
                      let statusStyle = 'bg-gray-100 text-gray-600';
                      if (app.status === 'accepted') statusStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                      if (app.status === 'rejected') statusStyle = 'bg-rose-50 text-rose-600 border border-rose-100';
                      if (app.status === 'pending') statusStyle = 'bg-amber-50 text-amber-600 border border-amber-100';

                      return (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 font-bold text-textMain">
                            <span className="block">{app.gigTitle}</span>
                            <span className="text-[9px] text-secondary font-mono mt-0.5">
                              Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-secondary">
                            {app.roleName}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-black text-textMain">
                            ₹{app.pay.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Upcoming confirmed shifts & Quick Actions */}
        <div className="space-y-6">
          
          {/* Upcoming Shifts list widget */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <CalendarDaysIcon className="w-4.5 h-4.5 text-primary" />
              Upcoming Shifts
            </h3>
            
            <div className="space-y-4">
              {upcomingShifts.length === 0 ? (
                <p className="text-xs text-secondary italic">No upcoming accepted shifts scheduled.</p>
              ) : (
                upcomingShifts.map((shift) => (
                  <div key={shift.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-xs text-textMain truncate">
                        {shift.title}
                      </span>
                      <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0">
                        {shift.startTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-secondary font-medium">
                      <MapPinIcon className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span className="truncate">{shift.location}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-secondary font-semibold">
                      <span>{new Date(shift.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-primary font-extrabold">₹{shift.pay.toLocaleString()} &middot; {shift.roleName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigate('/worker/browse')}
                className="w-full py-2.5 bg-primary text-white hover:bg-primary/95 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
              >
                <BriefcaseIcon className="w-4 h-4 stroke-[2]" />
                Find Gigs & Shifts
              </button>
              <button
                onClick={() => navigate('/worker/earnings')}
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary flex items-center justify-center gap-1.5 transition-all"
              >
                <CurrencyRupeeIcon className="w-4 h-4" />
                Track Payout Earnings
              </button>
              <button
                onClick={() => navigate('/worker/profile')}
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary flex items-center justify-center gap-1.5 transition-all"
              >
                <ClipboardDocumentListIcon className="w-4 h-4" />
                Manage Skills Resume
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkerDashboard;

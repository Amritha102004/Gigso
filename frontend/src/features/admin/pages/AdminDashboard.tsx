import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client';
import { useToast } from '../../../context/ToastContext';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  TagIcon, 
  ArrowRightIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  _id: string;
  transactionId: string;
  totalAmount: number;
  platformFee: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  gigId?: {
    title: string;
  };
  ownerId?: {
    name: string;
    businessName?: string;
  };
}

interface TrendPoint {
  label: string;
  gigs: number;
  applicants: number;
}

interface DashboardData {
  stats: {
    totalVolume: number;
    totalCommission: number;
    totalNetDistributed: number;
    totalWorkers: number;
    totalOwners: number;
    totalGigs: number;
  };
  recentTransactions: Transaction[];
  trends: TrendPoint[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<string>('30'); // '7' | '30' | 'all'
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [range]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/payments/dashboard', {
        params: { range }
      });
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load admin metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-secondary tracking-widest uppercase animate-pulse">Loading platform statistics...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalVolume: 0,
    totalCommission: 0,
    totalNetDistributed: 0,
    totalWorkers: 0,
    totalOwners: 0,
    totalGigs: 0
  };
  const recentTransactions = data?.recentTransactions || [];
  const trends = data?.trends || [];
  const totalUsers = stats.totalWorkers + stats.totalOwners;

  // Chart Constants
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const viewboxWidth = 600;

  // Calculate points for the trends chart
  const maxVal = Math.max(...trends.map(t => Math.max(t.gigs, t.applicants, 5)));
  
  const getPoints = (key: 'gigs' | 'applicants') => {
    if (trends.length < 2) return '';
    return trends.map((t, idx) => {
      const x = paddingLeft + (idx / (trends.length - 1)) * (viewboxWidth - paddingLeft - paddingRight);
      const y = chartHeight - paddingBottom - (t[key] / maxVal) * (chartHeight - paddingTop - paddingBottom);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const getAreaPoints = (key: 'gigs' | 'applicants') => {
    if (trends.length < 2) return '';
    const pointsStr = getPoints(key);
    const startX = paddingLeft;
    const endX = viewboxWidth - paddingRight;
    const baseY = chartHeight - paddingBottom;
    return `${startX},${baseY} ${pointsStr} ${endX},${baseY}`;
  };

  const gigsPoints = getPoints('gigs');
  const applicantsPoints = getPoints('applicants');
  const gigsArea = getAreaPoints('gigs');
  const applicantsArea = getAreaPoints('applicants');

  // Handle Chart Hover Index Selection
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (trends.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = viewboxWidth / rect.width;
    const chartX = x * scaleX;

    const chartWidth = viewboxWidth - paddingLeft - paddingRight;
    const pct = (chartX - paddingLeft) / chartWidth;
    const closestIdx = Math.min(trends.length - 1, Math.max(0, Math.round(pct * (trends.length - 1))));
    setHoveredIdx(closestIdx);
  };

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto space-y-8">
      
      {/* Top Welcome Title Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/50 pb-4">
        <div>
          <h1 className="text-2xl font-black text-textMain tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-secondary mt-0.5">Welcome back! Moderate and track Gigso platform statistics in real-time.</p>
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
        
        {/* Card 1: Platform commission commission */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Platform Revenue</span>
            <h3 className="text-2xl font-black text-textMain">₹{stats.totalCommission.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">10% commission fees</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ChartBarIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 2: Total volume */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Escrow Volume</span>
            <h3 className="text-2xl font-black text-textMain">₹{stats.totalVolume.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">Gross Funded</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <BanknotesIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 3: Total Gigs */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Total Gigs</span>
            <h3 className="text-2xl font-black text-textMain">{stats.totalGigs}</h3>
            <span className="text-[9px] font-bold text-primary uppercase tracking-wide">Jobs Posted</span>
          </div>
          <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <BriefcaseIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

        {/* Card 4: Active Users */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Registered Users</span>
            <h3 className="text-2xl font-black text-textMain">{totalUsers}</h3>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Workers + Owners</span>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <UsersIcon className="w-5.5 h-5.5 stroke-[1.75]" />
          </div>
        </div>

      </div>

      {/* Row 3 Grid: SVG Trends Line Chart (Left 2/3) + User Distribution (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Platform Activity Trends Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-textMain tracking-tight">Gigs Posted vs Applicants Activity</h2>
              <p className="text-[10px] text-secondary mt-0.5">Overview of recruitment activity and applications submission volumes.</p>
            </div>
            {/* Custom Chart Legends */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6b704c]"></span>
                Gigs Posted
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Applicants
              </div>
            </div>
          </div>

          {/* Live SVG Vector Graph */}
          <div className="relative pt-2">
            {trends.length < 2 ? (
              <div className="h-48 flex items-center justify-center text-xs text-secondary italic">
                Insufficient timeline data points to render curves.
              </div>
            ) : (
              <svg 
                viewBox={`0 0 ${viewboxWidth} ${chartHeight}`} 
                className="w-full h-auto overflow-visible select-none cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <defs>
                  <linearGradient id="gigsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b704c" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6b704c" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIdx) => {
                  const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
                  const gridVal = Math.round(maxVal - ratio * maxVal);
                  return (
                    <g key={gridIdx} className="opacity-40">
                      <line 
                        x1={paddingLeft} 
                        y1={y} 
                        x2={viewboxWidth - paddingRight} 
                        y2={y} 
                        stroke="#e5e7eb" 
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text 
                        x={paddingLeft - 8} 
                        y={y + 3} 
                        textAnchor="end" 
                        className="font-mono text-[9px] fill-secondary font-bold"
                      >
                        {gridVal}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Area Fills */}
                <polygon points={gigsArea} fill="url(#gigsGrad)" />
                <polygon points={applicantsArea} fill="url(#appsGrad)" />

                {/* Main Line Curves */}
                <polyline 
                  fill="none" 
                  stroke="#6b704c" 
                  strokeWidth="2" 
                  points={gigsPoints} 
                />
                <polyline 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="2" 
                  points={applicantsPoints} 
                />

                {/* X Axis Labels */}
                {trends.map((t, idx) => {
                  const showLabel = range === '7' || range === 'all' || idx % 5 === 0 || idx === trends.length - 1;
                  if (!showLabel) return null;

                  const x = paddingLeft + (idx / (trends.length - 1)) * (viewboxWidth - paddingLeft - paddingRight);
                  return (
                    <text 
                      key={idx}
                      x={x} 
                      y={chartHeight - 12} 
                      textAnchor="middle" 
                      className="text-[9px] font-bold fill-secondary font-sans opacity-85"
                    >
                      {t.label}
                    </text>
                  );
                })}

                {/* Hover Indicator Line & tooltip circle points */}
                {hoveredIdx !== null && (
                  <g>
                    {(() => {
                      const x = paddingLeft + (hoveredIdx / (trends.length - 1)) * (viewboxWidth - paddingLeft - paddingRight);
                      const yGigs = chartHeight - paddingBottom - (trends[hoveredIdx].gigs / maxVal) * (chartHeight - paddingTop - paddingBottom);
                      const yApps = chartHeight - paddingBottom - (trends[hoveredIdx].applicants / maxVal) * (chartHeight - paddingTop - paddingBottom);

                      return (
                        <>
                          <line 
                            x1={x} 
                            y1={paddingTop} 
                            x2={x} 
                            y2={chartHeight - paddingBottom} 
                            stroke="#9ca3af" 
                            strokeWidth="1.25"
                            strokeDasharray="2 2"
                          />
                          <circle cx={x} cy={yGigs} r="4.5" fill="#6b704c" stroke="white" strokeWidth="1.5" />
                          <circle cx={x} cy={yApps} r="4.5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
                        </>
                      );
                    })()}
                  </g>
                )}
              </svg>
            )}

            {/* Interactive HTML Floating Tooltip Box */}
            {hoveredIdx !== null && trends[hoveredIdx] && (
              <div 
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white p-3 rounded-xl shadow-lg border border-gray-800 text-[10px] space-y-1.5 transition-all duration-150 min-w-[130px] z-10"
              >
                <div className="font-extrabold text-[11px] border-b border-gray-800 pb-1 text-gray-300">
                  {trends[hoveredIdx].label}
                </div>
                <div className="flex justify-between gap-4 font-bold">
                  <span className="text-[#a3a97d] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6b704c]"></span>
                    Gigs Posted:
                  </span>
                  <span>{trends[hoveredIdx].gigs}</span>
                </div>
                <div className="flex justify-between gap-4 font-bold">
                  <span className="text-indigo-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Applicants:
                  </span>
                  <span>{trends[hoveredIdx].applicants}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Platform Distribution Widget */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <ChartBarIcon className="w-4 h-4 text-primary" />
              Platform Distribution
            </h3>
            <p className="text-[10px] text-secondary mt-0.5">Demographics ratio of registered owners vs workers.</p>
          </div>
          
          <div className="space-y-6 text-xs font-semibold text-textMain py-2">
            {/* Workers Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-secondary font-bold">Workers (Crew)</span>
                <span>{stats.totalWorkers} users</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${totalUsers > 0 ? (stats.totalWorkers / totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Owners Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-secondary font-bold">Business Owners</span>
                <span>{stats.totalOwners} users</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${totalUsers > 0 ? (stats.totalOwners / totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 font-mono border-t border-gray-50 pt-2.5">
            Total active cohort: {totalUsers} profiles
          </div>
        </div>

      </div>

      {/* Row 4 Grid: Recent Transactions ledger (Left 2/3) + Quick Moderation (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left main column: Recent Transactions ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-textMain tracking-tight">Recent platform payments</h2>
              <button
                onClick={() => navigate('/admin/payments')}
                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
              >
                View Payments
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-secondary uppercase tracking-widest bg-gray-50/50">
                    <th className="px-4 py-3">Gig Details</th>
                    <th className="px-4 py-3">Business Owner</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">10% Platform Fee</th>
                    <th className="px-4 py-3 text-right">Escrow Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-secondary italic">
                        No transactions recorded on the platform yet.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => {
                      let statusStyle = 'bg-gray-100 text-gray-600';
                      if (tx.paymentStatus === 'paid') statusStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                      if (tx.paymentStatus === 'pending') statusStyle = 'bg-amber-50 text-amber-600 border border-amber-100';
                      if (tx.paymentStatus === 'failed') statusStyle = 'bg-rose-50 text-rose-600 border border-rose-100';

                      return (
                        <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 font-bold text-textMain">
                            <span className="block truncate max-w-[150px]">{tx.gigId?.title || 'Staffing Payment'}</span>
                            <span className="text-[9px] text-secondary font-mono mt-0.5">
                              ID: {tx.transactionId || tx._id}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-secondary font-medium">
                            {tx.ownerId?.businessName || tx.ownerId?.name || 'Partner Owner'}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                              {tx.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center font-semibold text-secondary">
                            ₹{tx.platformFee.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-right font-black text-textMain">
                            ₹{tx.totalAmount.toLocaleString()}
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

        {/* Right Sidebar: Quick Moderation shortcuts */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Platform Moderation</h3>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => navigate('/admin/gigs')}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary flex items-center justify-between px-4 transition-all"
            >
              <span className="flex items-center gap-2">
                <BriefcaseIcon className="w-4.5 h-4.5 text-secondary" />
                Moderate Gigs
              </span>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/admin/categories')}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary flex items-center justify-between px-4 transition-all"
            >
              <span className="flex items-center gap-2">
                <TagIcon className="w-4.5 h-4.5 text-secondary" />
                Manage Categories
              </span>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/admin/owners')}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary flex items-center justify-between px-4 transition-all"
            >
              <span className="flex items-center gap-2">
                <UserGroupIcon className="w-4.5 h-4.5 text-secondary" />
                Owners Profiles
              </span>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/admin/workers')}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-secondary flex items-center justify-between px-4 transition-all"
            >
              <span className="flex items-center gap-2">
                <UserGroupIcon className="w-4.5 h-4.5 text-secondary" />
                Workers Profiles
              </span>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;

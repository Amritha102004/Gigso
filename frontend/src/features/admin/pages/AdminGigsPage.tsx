import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  FlagIcon, 
  TrashIcon, 
  ArrowPathIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { FlagIcon as FlagIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import adminService from '../services/admin.service';
import type { AdminGig, AdminGigRole } from '../services/admin.service';
import categoryService from '../services/category.service';
import type { CategoryDTO } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DataTable } from '../../../components/DataTable';
import type { Column } from '../../../components/DataTable';

const AdminGigsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [gigs, setGigs] = useState<AdminGig[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('');

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const LIMIT = 10;

  // Stats
  const [stats, setStats] = useState({
    liveGigs: 0,
    openRoles: 0,
    completionRate: 100,
    cancellations: 0,
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories({ limit: 1000 });
      if (data && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchGigs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminService.getGigs({
        page,
        limit: LIMIT,
        search: search || undefined,
        categoryId: categoryId || undefined,
        status: status || undefined,
        date: date || undefined,
      });

      if (data) {
        setGigs(data.gigs);
        setTotal(data.total);
        setTotalPages(data.totalPages);

        // Fetch stats (we can compute them dynamically or run a separate query)
        // For local simplicity and accurate stats, we fetch the first page or calculate based on returned counts
        const allData = await adminService.getGigs({ limit: 1000 });
        if (allData && allData.gigs) {
          const list = allData.gigs;
          const live = list.filter((g: AdminGig) => g.status === 'active').length;
          const completed = list.filter((g: AdminGig) => g.status === 'completed').length;
          const cancelled = list.filter((g: AdminGig) => g.status === 'cancelled').length;
          
          let totalSpots = 0;
          let filledSpots = 0;
          list.forEach((g: AdminGig) => {
            if (g.status === 'active') {
              (g.roles || []).forEach((r: AdminGigRole) => {
                totalSpots += r.spots || 0;
                filledSpots += r.filledSpots || 0;
              });
            }
          });

          const rate = list.length > 0 ? (completed / list.length) * 100 : 100;

          setStats({
            liveGigs: live,
            openRoles: Math.max(0, totalSpots - filledSpots),
            completionRate: Math.round(rate * 10) / 10,
            cancellations: cancelled,
          });
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching admin gigs:', err);
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMessage || 'Failed to fetch gigs.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryId, status, date]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  const handleReset = () => {
    setSearch('');
    setCategoryId('');
    setStatus('');
    setDate('');
    setLocationQuery('');
    setPage(1);
  };

  const handleToggleFlag = async (gigId: string, currentFlagged: boolean) => {
    try {
      await adminService.toggleFlagGig(gigId, !currentFlagged);
      showToast(
        `Gig ${!currentFlagged ? 'flagged for review' : 'unflagged'} successfully`,
        'success'
      );
      fetchGigs();
    } catch (err: unknown) {
      console.error('Error toggling flag:', err);
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      showToast(errorMessage || 'Failed to update flag status.', 'error');
    }
  };

  const handleDelete = (gigId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Gig Posting',
      message: 'Are you sure you want to delete this gig? This action will remove it from the owner dashboard and cancel any pending applications.',
      onConfirm: async () => {
        try {
          await adminService.deleteGig(gigId);
          showToast('Gig posting deleted successfully.', 'success');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          fetchGigs();
        } catch (err: unknown) {
          console.error('Error deleting gig:', err);
          const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
          showToast(errorMessage || 'Failed to delete gig.', 'error');
        }
      }
    });
  };

  // Filter in memory for location city search to avoid heavy backend regex
  const filteredGigs = gigs.filter(g => {
    if (!locationQuery.trim()) return true;
    return g.location.toLowerCase().includes(locationQuery.toLowerCase());
  });

  const getFulfillmentInfo = (gig: AdminGig) => {
    const totalSpots = (gig.roles || []).reduce((sum: number, r: AdminGigRole) => sum + (r.spots || 0), 0);
    const filledSpots = (gig.roles || []).reduce((sum: number, r: AdminGigRole) => sum + (r.filledSpots || 0), 0);
    const percent = totalSpots > 0 ? (filledSpots / totalSpots) * 100 : 0;
    
    return {
      text: `${filledSpots}/${totalSpots} ACCEPTED`,
      percent,
      isFilled: totalSpots > 0 && filledSpots === totalSpots,
    };
  };

  const getStatusBadge = (gig: AdminGig) => {
    const { isFilled } = getFulfillmentInfo(gig);
    
    if (gig.isFlagged) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Flagged
        </span>
      );
    }

    if (gig.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100 uppercase tracking-wider text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          Completed
        </span>
      );
    }
    
    if (gig.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Cancelled
        </span>
      );
    }

    if (isFilled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Filled
        </span>
      );
    }

    if (gig.status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-wider text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
        {gig.status}
      </span>
    );
  };

  const columns: Column<AdminGig>[] = [
    {
      header: 'Gig Title',
      accessor: (gig) => {
        const gigId = (gig.id || '').toString();
        return (
          <div>
            <div className="font-bold text-textMain leading-tight">{gig.title}</div>
            <div className="text-[10px] text-secondary font-mono mt-0.5 uppercase">
              ID: GIG-{gigId ? gigId.substring(Math.max(0, gigId.length - 4)) : ''}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Provider',
      accessor: (gig) => (
        <span className="font-semibold text-secondary">
          {gig.ownerId && typeof gig.ownerId === 'object' ? gig.ownerId.name : 'Unknown Owner'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: (gig) => (
        <span className="inline-block px-2.5 py-0.5 bg-primary/5 text-primary rounded-full font-bold uppercase tracking-wider text-[9px]">
          {gig.category?.name || 'Category'}
        </span>
      ),
    },
    {
      header: 'Location',
      accessor: (gig) => <span className="font-medium text-secondary">{gig.location}</span>,
    },
    {
      header: 'Date',
      accessor: (gig) => (
        <span className="font-semibold text-textMain">
          {new Date(gig.eventDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      ),
    },
    {
      header: 'Fulfillment',
      accessor: (gig) => {
        const fulfill = getFulfillmentInfo(gig);
        return (
          <div className="w-28 space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-secondary">
              <span>{fulfill.text}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${fulfill.isFilled ? 'bg-blue-600' : 'bg-primary/70'}`}
                style={{ width: `${Math.min(100, fulfill.percent)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (gig) => getStatusBadge(gig),
    },
    {
      header: 'Actions',
      className: 'text-center',
      accessor: (gig) => {
        const gigId = (gig.id || '').toString();
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/admin/gigs/${gigId}`)}
              title="View Details"
              className="p-1.5 text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleToggleFlag(gigId, !!gig.isFlagged)}
              title={gig.isFlagged ? "Unflag Gig" : "Flag for Review"}
              className={`p-1.5 rounded-lg transition-all ${
                gig.isFlagged 
                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                  : 'text-secondary hover:text-amber-600 hover:bg-amber-50/50'
              }`}
            >
              {gig.isFlagged ? (
                <FlagIconSolid className="w-4 h-4" />
              ) : (
                <FlagIcon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => handleDelete(gigId)}
              title="Delete Gig"
              className="p-1.5 text-secondary hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">
            Gigs Management <span className="text-secondary font-normal text-sm">({total})</span>
          </h1>
          <p className="text-secondary text-sm mt-1">ADMIN &gt; GIGS</p>
        </div>

        {/* Global Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search owners or titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-textMain focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-full sm:w-[250px] outline-none"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-textMain outline-none focus:border-primary bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">Location Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter city..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs text-textMain outline-none focus:border-primary"
              />
              <MapPinIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-textMain outline-none focus:border-primary bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active / Open</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">Date Range</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-textMain outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-textMain transition-all shadow-sm bg-white"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl mb-6">{error}</div>}

      {/* Gigs Grid Table */}
      {/* Reusable DataTable */}
      <DataTable
        columns={columns}
        data={filteredGigs}
        isLoading={isLoading}
        emptyMessage="No gigs found matching the filters."
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        whitespaceNowrap={false}
      />

      {/* Platform Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Live Gigs</span>
            <div className="text-2xl font-black text-textMain">{stats.liveGigs}</div>
            <span className="text-[10px] text-emerald-600 font-bold tracking-wide">+12% from last week</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Open Roles</span>
            <div className="text-2xl font-black text-textMain">{stats.openRoles}</div>
            <span className="text-[10px] text-amber-600 font-bold tracking-wide">Needs urgent fulfillment</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Completion Rate</span>
            <div className="text-2xl font-black text-textMain">{stats.completionRate}%</div>
            <span className="text-[10px] text-emerald-600 font-bold tracking-wide">Steady performance</span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Cancellations</span>
            <div className="text-2xl font-black text-textMain">{stats.cancellations}</div>
            <span className="text-[10px] text-rose-600 font-bold tracking-wide">-2% improvement</span>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl flex items-center justify-center">
            <XCircleIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete Posting"
        type="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminGigsPage;

import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../services/admin.service';
import type { UserDTO } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DataTable } from '../../../components/DataTable';
import type { Column } from '../../../components/DataTable';

interface WorkerRow extends UserDTO {
  status: 'active' | 'suspended';
}

const deriveStatus = (user: UserDTO): 'active' | 'suspended' =>
  user.isSuspended ? 'suspended' : 'active';

const WorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;
  const { showToast } = useToast();

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchWorkers = useCallback(async (searchTerm: string, currentPage: number, statusTerm: string) => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsersByRole('worker', {
        page: currentPage,
        limit: LIMIT,
        search: searchTerm || undefined,
        status: statusTerm !== 'all' ? statusTerm : undefined,
      });
      const mapped: WorkerRow[] = data.users.map((u) => ({ ...u, status: deriveStatus(u) }));
      setWorkers(mapped);
      setTotal(data.total);
      setTotalPages(data.totalPages || Math.ceil(data.total / LIMIT));
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch workers';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch when page, statusFilter, or debouncedSearch changes
  useEffect(() => {
    fetchWorkers(debouncedSearch, page, statusFilter);
  }, [fetchWorkers, debouncedSearch, page, statusFilter]);

  const handleSuspendToggle = (id: string) => {
    const worker = workers.find(w => w._id === id);
    const action = worker?.status === 'suspended' ? 'unsuspend' : 'suspend';
    
    setConfirmState({
      isOpen: true,
      title: `${action === 'suspend' ? 'Suspend' : 'Unsuspend'} User`,
      message: `Are you sure you want to ${action} ${worker?.name || 'this user'}?`,
      confirmText: action === 'suspend' ? 'Suspend' : 'Unsuspend',
      type: action === 'suspend' ? 'danger' : 'primary',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.suspendUser(id);
          setWorkers((prev) =>
            prev.map((w) => {
              if (w._id !== id) return w;
              const updated = { ...w, isSuspended: !w.isSuspended };
              return { ...updated, status: deriveStatus(updated) };
            })
          );
          showToast(`User successfully ${action}ed.`, 'success');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Action failed';
          showToast(msg, 'error');
        }
      },
    });
  };

  const getStatusBadge = (status: WorkerRow['status']) => {
    if (status === 'suspended') {
      return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Suspended</span>;
    }
    return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>;
  };

  const columns: Column<WorkerRow>[] = [
    {
      header: 'Worker Name',
      accessor: (worker) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
            {worker.name.charAt(0).toUpperCase()}
          </div>
          <p className="font-bold text-textMain">{worker.name}</p>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: (worker) => <span className="text-secondary">{worker.email}</span>,
    },
    {
      header: 'Status',
      accessor: (worker) => getStatusBadge(worker.status),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (worker) => (
        <button
          onClick={() => handleSuspendToggle(worker._id!)}
          title={worker.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
          className={`p-2 transition-colors rounded-lg ${worker.status === 'suspended' ? 'text-gray-400 hover:text-green-600 hover:bg-green-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
        >
          {worker.status === 'suspended' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Worker Management</h1>
          <p className="text-secondary text-sm mt-1">Manage your workforce</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-white/75 border border-gray-200 rounded-lg text-xs font-bold text-secondary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search workers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-[250px]"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-secondary text-sm font-semibold mb-2">Total Workers</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-textMain">{total}</span>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">All time</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-secondary text-sm font-semibold mb-2">Active on Page</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-textMain">
              {workers.filter((w) => w.status === 'active').length}
            </span>
            <span className="text-xs font-bold text-[#848462] flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> On page
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-secondary text-sm font-semibold mb-2">Suspended on Page</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-textMain">
              {workers.filter((w) => w.status === 'suspended').length}
            </span>
          </div>
        </div>
      </div>

      {/* Reusable DataTable */}
      <DataTable
        columns={columns}
        data={workers}
        isLoading={isLoading}
        emptyMessage="No workers found."
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default WorkersPage;

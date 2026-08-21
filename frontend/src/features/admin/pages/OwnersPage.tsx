import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../services/admin.service';
import type { UserDTO } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DataTable } from '../../../components/DataTable';
import type { Column } from '../../../components/DataTable';

interface OwnerRow extends UserDTO {
  status: 'pending' | 'approved' | 'suspended';
}

const deriveStatus = (user: UserDTO): 'pending' | 'approved' | 'suspended' => {
  if (user.isSuspended) return 'suspended';
  if (user.isApproved) return 'approved';
  return 'pending';
};

const OwnersPage: React.FC = () => {
  const [owners, setOwners] = useState<OwnerRow[]>([]);
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

  const fetchOwners = useCallback(async (searchTerm: string, currentPage: number, statusTerm: string) => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsersByRole('owner', {
        page: currentPage,
        limit: LIMIT,
        search: searchTerm || undefined,
        status: statusTerm !== 'all' ? statusTerm : undefined,
      });
      const mapped: OwnerRow[] = data.users.map((u) => ({ ...u, status: deriveStatus(u) }));
      setOwners(mapped);
      setTotal(data.total);
      setTotalPages(data.totalPages || Math.ceil(data.total / LIMIT));
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch owners';
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
    fetchOwners(debouncedSearch, page, statusFilter);
  }, [fetchOwners, debouncedSearch, page, statusFilter]);

  const handleApprove = (id: string) => {
    const owner = owners.find((o) => o._id === id);
    setConfirmState({
      isOpen: true,
      title: 'Approve User',
      message: `Are you sure you want to approve ${owner?.name || 'this user'}? They will gain access to post gigs.`,
      confirmText: 'Approve',
      type: 'primary',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.approveUser(id);
          setOwners((prev) =>
            prev.map((o) =>
              o._id === id ? { ...o, isApproved: true, status: deriveStatus({ ...o, isApproved: true }) } : o
            )
          );
          showToast('User approved successfully.', 'success');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Approval failed';
          showToast(msg, 'error');
        }
      },
    });
  };

  const handleSuspendToggle = (id: string) => {
    const owner = owners.find((o) => o._id === id);
    const action = owner?.status === 'suspended' ? 'unsuspend' : 'suspend';
    
    setConfirmState({
      isOpen: true,
      title: `${action === 'suspend' ? 'Suspend' : 'Unsuspend'} User`,
      message: `Are you sure you want to ${action} ${owner?.name || 'this user'}?`,
      confirmText: action === 'suspend' ? 'Suspend' : 'Unsuspend',
      type: action === 'suspend' ? 'danger' : 'primary',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.suspendUser(id);
          setOwners((prev) =>
            prev.map((o) => {
              if (o._id !== id) return o;
              const updated = { ...o, isSuspended: !o.isSuspended };
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

  const getStatusBadge = (status: OwnerRow['status']) => {
    const styles: Record<OwnerRow['status'], string> = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700',
    };
    const labels: Record<OwnerRow['status'], string> = {
      approved: 'Approved',
      pending: 'Pending',
      suspended: 'Suspended',
    };
    return (
      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const columns: Column<OwnerRow>[] = [
    {
      header: 'Owner Name',
      accessor: (owner) => <span className="text-textMain font-medium">{owner.name}</span>,
    },
    {
      header: 'Email',
      accessor: (owner) => <span className="text-secondary">{owner.email}</span>,
    },
    {
      header: 'Status',
      accessor: (owner) => getStatusBadge(owner.status),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (owner) => (
        <div className="space-x-4">
          {owner.status === 'pending' && (
            <button
              onClick={() => handleApprove(owner._id!)}
              className="text-xs font-bold text-primary hover:text-primary/70 transition-colors"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => handleSuspendToggle(owner._id!)}
            className={`text-xs font-bold transition-colors ${owner.status === 'suspended' ? 'text-gray-500 hover:text-textMain' : 'text-red-500 hover:text-red-700'}`}
          >
            {owner.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Admin — Owner Management</h1>
          <p className="text-secondary text-sm mt-1">Manage business partners and approvals</p>
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
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search owners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-[200px]"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-bold text-textMain">
          All Owners <span className="text-secondary font-normal text-sm">({total})</span>
        </h2>
      </div>

      {/* Reusable DataTable */}
      <DataTable
        columns={columns}
        data={owners}
        isLoading={isLoading}
        emptyMessage="No owners found."
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

export default OwnersPage;

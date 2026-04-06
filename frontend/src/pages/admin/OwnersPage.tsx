import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/adminService';
import type { UserDTO } from '../../types/api.types';

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const fetchOwners = useCallback(async (searchTerm: string, currentPage: number) => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsersByRole('owner', {
        page: currentPage,
        limit: LIMIT,
        search: searchTerm || undefined,
      });
      const mapped: OwnerRow[] = data.users.map((u) => ({ ...u, status: deriveStatus(u) }));
      setOwners(mapped);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch owners';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners(search, page);
  }, [fetchOwners, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOwners(search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchOwners]);

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveUser(id);
      setOwners((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, isApproved: true, status: deriveStatus({ ...o, isApproved: true }) } : o
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      alert(msg);
    }
  };

  const handleSuspendToggle = async (id: string) => {
    try {
      await adminService.suspendUser(id);
      setOwners((prev) =>
        prev.map((o) => {
          if (o._id !== id) return o;
          const updated = { ...o, isSuspended: !o.isSuspended };
          return { ...updated, status: deriveStatus(updated) };
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      alert(msg);
    }
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

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Admin — Owner Management</h1>
          <p className="text-secondary text-sm mt-1">Manage business partners and approvals</p>
        </div>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search owners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-[250px]"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-bold text-textMain">
          All Owners <span className="text-secondary font-normal text-sm">({total})</span>
        </h2>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8F9FA] text-[#848462] text-xs font-bold tracking-wider uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Owner Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {owners.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No owners found.</td></tr>
              ) : (
                owners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-textMain font-medium">{owner.name}</td>
                    <td className="px-6 py-4 text-secondary">{owner.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(owner.status)}</td>
                    <td className="px-6 py-4 text-right space-x-4">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-secondary">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default OwnersPage;

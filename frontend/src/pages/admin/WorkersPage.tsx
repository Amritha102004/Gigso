import React, { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/adminService';
import type { UserDTO } from '../../types/api.types';

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const fetchWorkers = useCallback(async (searchTerm: string, currentPage: number) => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsersByRole('worker', {
        page: currentPage,
        limit: LIMIT,
        search: searchTerm || undefined,
      });
      const mapped: WorkerRow[] = data.users.map((u) => ({ ...u, status: deriveStatus(u) }));
      setWorkers(mapped);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch workers';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers(search, page);
  }, [fetchWorkers, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchWorkers(search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchWorkers]);

  const handleSuspendToggle = async (id: string) => {
    try {
      await adminService.suspendUser(id);
      setWorkers((prev) =>
        prev.map((w) => {
          if (w._id !== id) return w;
          const updated = { ...w, isSuspended: !w.isSuspended };
          return { ...updated, status: deriveStatus(updated) };
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      alert(msg);
    }
  };

  const getStatusBadge = (status: WorkerRow['status']) => {
    if (status === 'suspended') {
      return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Suspended</span>;
    }
    return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>;
  };

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Worker Management</h1>
          <p className="text-secondary text-sm mt-1">Manage your workforce</p>
        </div>
        {/* Search */}
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
          <h3 className="text-secondary text-sm font-semibold mb-2">Active</h3>
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
          <h3 className="text-secondary text-sm font-semibold mb-2">Suspended</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-textMain">
              {workers.filter((w) => w.status === 'suspended').length}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8F9FA] text-[#848462] text-[10px] font-bold tracking-widest uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Worker Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {workers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No workers found.</td></tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-textMain">{worker.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary">{worker.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(worker.status)}</td>
                    <td className="px-6 py-4 text-right">
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

export default WorkersPage;

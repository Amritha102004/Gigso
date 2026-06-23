import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../services/category.service';
import type { CategoryDTO } from '../../../types/api.types';

// SVG Icon list mapped for display
export const categoryIconMap: Record<string, (className?: string) => React.ReactNode> = {
  Camera: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  ),
  Utensils: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5m3 11.25a3 3 0 003-3V4.5m-3 0v1.5m3-1.5V6" />
    </svg>
  ),
  Shield: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
    </svg>
  ),
  Truck: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125a1.125 1.125 0 001.125-1.125V9.75M8.25 18.75h6m3 0h.625c.621 0 1.125-.504 1.125-1.125v-1.5m-3.75 2.625a3 3 0 00-3-3M6.75 14.25h12m.75-4.5h-3.375a1.125 1.125 0 01-1.125-1.125V4.5m0 0H7.875c-.621 0-1.125.504-1.125 1.125V14.25" />
    </svg>
  ),
  Music: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 0v11.25a3 3 0 11-3-3m3.75-5.25v11.25a3 3 0 11-3-3m-6.75-3.75V16.5a3 3 0 11-3-3m3.75-4.5v11.25a3 3 0 11-3-3" />
    </svg>
  ),
  Sparkles: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.904L9 9l.813 5.096L15 15l-5.187.904zM19.071 4.929l-.707 1.414-.707-1.414.707-.707.707.707zM17 11a1 1 0 11-2 0 1 1 0 012 0zM7 4a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  ),
  DocumentText: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Paintbrush: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l9.37-9.37a2.828 2.828 0 114 4l-9.37 9.37a4.5 4.5 0 01-1.897 1.13L4.5 21l.378-3.133a4.5 4.5 0 011.13-1.897l9.37-9.37z" />
    </svg>
  ),
  UserGroup: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Cpu: (className = "w-5 h-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M19.5 8.25H18M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5m-15-6A2.25 2.25 0 016.75 7.5h10.5a2.25 2.25 0 012.25 2.25v5.25a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-5.25z" />
    </svg>
  )
};

export const renderCategoryIcon = (iconName: string, className = "w-5 h-5") => {
  const renderFn = categoryIconMap[iconName];
  if (renderFn) return renderFn(className);
  // Default fallback tag icon
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 003.182 0l4.318-4.318a2.25 2.25 0 000-3.182L11.16 3.659A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
};

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const fetchCategories = useCallback(async (searchTerm: string, currentPage: number) => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories({
        page: currentPage,
        limit: LIMIT,
        search: searchTerm || undefined,
      });
      setCategories(data.categories);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch categories';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(search, page);
  }, [fetchCategories, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCategories(search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchCategories]);

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete category "${name}"?`);
    if (!isConfirmed) return;

    try {
      await categoryService.deleteCategory(id);
      setError('');
      // Refetch current page or page 1 if we empty the page
      const nextCategories = categories.filter((c) => c.id !== id);
      if (nextCategories.length === 0 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchCategories(search, page);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete category';
      alert(msg);
    }
  };

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Admin — Category Management</h1>
          <p className="text-secondary text-sm mt-1">Create, update, and manage job categories for gigs</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-full sm:w-[220px] transition-all"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          {/* Add Button */}
          <button
            onClick={() => navigate('/admin/categories/add')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#575727] transition-all whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm shadow-sm">{error}</div>}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-textMain">
          All Categories <span className="text-secondary font-normal text-sm">({total})</span>
        </h2>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-[#F8F9FA] text-[#848462] text-xs font-bold tracking-wider uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-16">Icon</th>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          {renderCategoryIcon(category.icon)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-textMain font-semibold">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-secondary max-w-xs truncate" title={category.description}>
                        {category.description}
                      </td>
                      <td className="px-6 py-4 text-secondary text-xs">
                        {category.createdAt ? new Date(category.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-4">
                        <button
                          onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                          className="text-xs font-bold text-primary hover:text-[#575727] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors bg-white shadow-sm"
          >
            Previous
          </button>
          <span className="text-sm text-secondary">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors bg-white shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;

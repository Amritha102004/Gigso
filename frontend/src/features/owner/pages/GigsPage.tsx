import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import gigService from '../services/gig.service';
import type { GigListItemDTO } from '../../../types/api.types';

const GigsPage: React.FC = () => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<GigListItemDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchGigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = activeTab === 'all' ? undefined : activeTab;
      const response = await gigService.getMyGigs(statusParam);
      if (response.success && response.data) {
        setGigs(response.data);
      } else {
        setError(response.message || 'Failed to load gigs.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching gigs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await gigService.deleteGig(id);
      if (response.success) {
        setGigs(prev => prev.filter(g => g.id !== id));
      } else {
        alert(response.message || 'Failed to delete gig.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting gig.');
    }
  };

  const filteredGigs = gigs.filter(gig => 
    gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGigs = gigs.length;
  const activeCount = gigs.filter(g => g.status === 'active').length;
  const completedCount = gigs.filter(g => g.status === 'completed').length;
  const draftCount = gigs.filter(g => g.status === 'draft').length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">My Gigs</h1>
          <p className="text-sm text-secondary">Manage and monitor all your gig listings and assignments.</p>
        </div>
        <button
          onClick={() => navigate('/owner/gigs/create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-[#575727] transition-all shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          Post a New Gig
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-textMain">{totalGigs}</div>
            <div className="text-xs text-secondary font-medium">Total Listings</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
            <div className="text-xs text-secondary font-medium">Active Gigs</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
            <div className="text-xs text-secondary font-medium">Completed</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-gray-50 text-gray-500 rounded-xl">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{draftCount}</div>
            <div className="text-xs text-secondary font-medium">Drafts</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100 w-full sm:w-auto">
          {['all', 'active', 'completed', 'draft'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-white text-textMain shadow-sm border border-gray-100' 
                  : 'text-secondary hover:text-textMain'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gigs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs text-textMain placeholder-secondary focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-secondary">Loading your gigs...</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-red-500 font-semibold">{error}</div>
        ) : filteredGigs.length === 0 ? (
          <div className="p-12 text-center text-sm text-secondary">
            No gigs found. {searchQuery ? 'Try matching a different keyword.' : 'Get started by posting a gig.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Gig Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Event Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Roles Filled</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGigs.map((gig) => {
                  const percentFilled = gig.totalSpots > 0 ? Math.round((gig.filledSpots / gig.totalSpots) * 100) : 0;
                  
                  let statusBadge = 'bg-gray-100 text-gray-700';
                  if (gig.status === 'active') statusBadge = 'bg-blue-50 text-blue-700 border border-blue-100';
                  if (gig.status === 'completed') statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                  if (gig.status === 'cancelled') statusBadge = 'bg-rose-50 text-rose-700 border border-rose-100';

                  return (
                    <tr key={gig.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-textMain">{gig.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg text-xs text-secondary font-medium">
                          {gig.category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-textMain font-medium">
                        {new Date(gig.eventDate).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusBadge}`}>
                          {gig.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-secondary">
                            <span>{gig.filledSpots} / {gig.totalSpots} spots</span>
                            <span>{percentFilled}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all" 
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => navigate(`/owner/gigs/${gig.id}`)}
                            title="View Detail"
                            className="p-2 hover:bg-gray-100 rounded-lg text-secondary hover:text-textMain transition-all"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {gig.status === 'draft' && (
                            <button
                              onClick={() => navigate(`/owner/gigs/${gig.id}/edit`)}
                              title="Edit Gig"
                              className="p-2 hover:bg-gray-100 rounded-lg text-secondary hover:text-primary transition-all"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(gig.id)}
                            title="Delete Gig"
                            className="p-2 hover:bg-rose-50 rounded-lg text-secondary hover:text-rose-600 transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GigsPage;

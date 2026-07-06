import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import workerGigService from '../services/gig.service';
import type { GigListItemDTO, CategoryDTO } from '../../../types/api.types';
import LocationAutocomplete from '../../../components/LocationAutocomplete';
import { useToast } from '../../../context/ToastContext';
import {
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const BrowseGigsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [gigs, setGigs] = useState<GigListItemDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [minPay, setMinPay] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'applied'>('all');

  // Trigger filters trigger
  useEffect(() => {
    fetchCategories();
    fetchGigs();
  }, [category, activeTab]); // Fetch immediately when category or tab changes

  const fetchCategories = async () => {
    try {
      const res = await workerGigService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const filters = {
        search: search.trim() || undefined,
        category: category || undefined,
        location: location.trim() || undefined,
        minPay: minPay ? Number(minPay) : undefined,
        date: date || undefined,
      };
      
      const res = await workerGigService.browseGigs(filters);
      if (res.success && res.data) {
        setGigs(res.data);
      } else {
        showToast(res.message || 'Failed to fetch gigs', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching gigs:', err);
      showToast(err.response?.data?.message || 'Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGigs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setMinPay('');
    setDate('');
    // Trigger list fetch
    setTimeout(() => {
      fetchGigs();
    }, 50);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Available Gigs</h1>
          <p className="text-sm text-secondary mt-0.5">
            Found {gigs.length} {gigs.length === 1 ? 'opportunity' : 'opportunities'} matching your profile.
          </p>
        </div>

        {/* Tab Buttons (All, Saved, Applied) */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm self-start md:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary hover:text-textMain'
            }`}
          >
            All Gigs
          </button>
          <button
            onClick={() => {
              setActiveTab('saved');
              showToast('Saved gigs bookmarks coming soon in future phases!', 'info');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary hover:text-textMain'
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => {
              setActiveTab('applied');
              showToast('View your applications in the upcoming approvals update!', 'info');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'applied'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary hover:text-textMain'
            }`}
          >
            Applied
          </button>
        </div>
      </div>

      {/* Filter Options Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search gigs, skills, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-[#575727] transition-all shadow-sm flex items-center gap-1.5"
          >
            Search
          </button>
        </form>

        {/* Extended Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Category Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Autocomplete */}
          <div className="flex flex-col">
            <LocationAutocomplete
              id="worker-browse-location"
              label="Location"
              value={location}
              onChange={(val) => setLocation(val)}
              placeholder="City or Remote"
              wrapperClassName="relative mb-0 flex flex-col"
              labelClassName="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5"
              inputClassName="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Date Picker */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
            />
          </div>

          {/* Min Pay Rate */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1.5">Min Pay Rate ($)</label>
            <input
              type="number"
              placeholder="0.00"
              value={minPay}
              onChange={(e) => setMinPay(e.target.value)}
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Filter Action Links */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-red-600 transition-colors"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            Clear Filters
          </button>
          
          <button
            onClick={fetchGigs}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline transition-colors"
          >
            <FunnelIcon className="w-3.5 h-3.5" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Gigs List Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-secondary">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-semibold">Searching opportunities...</p>
        </div>
      ) : gigs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-secondary">
            <BriefcaseIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-textMain text-lg">No Gigs Found</h3>
            <p className="text-secondary text-sm leading-relaxed max-w-sm mx-auto">
              We couldn't find any active gig matches matching your criteria. Try adjusting your search keywords or clear filters to reset.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#575727] transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => {
            const spotsLeft = gig.totalSpots - gig.filledSpots;
            const isLowSpots = spotsLeft <= 2;
            
            return (
              <div
                key={gig.id}
                onClick={() => navigate(`/worker/gigs/${gig.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
              >
                <div className="p-6 space-y-4">
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {gig.category.name}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-textMain text-base group-hover:text-primary transition-colors line-clamp-1">
                      {gig.title}
                    </h3>
                    <div className="space-y-1 text-xs text-secondary">
                      <p className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(gig.eventDate)}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{gig.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Gig Summary Box */}
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-2">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                      Positions
                    </span>
                    <div className="text-xs text-textMain font-bold">
                      {gig.totalRoles} {gig.totalRoles === 1 ? 'Role' : 'Roles'} available • Total Budget: ${gig.totalBudget}
                    </div>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="bg-gray-50/20 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  {/* Spots Indicator */}
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isLowSpots ? 'text-rose-600 animate-pulse' : 'text-emerald-700'
                    }`}
                  >
                    {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering card navigate twice
                      navigate(`/worker/gigs/${gig.id}`);
                    }}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-[#575727] transition-all shadow-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseGigsPage;

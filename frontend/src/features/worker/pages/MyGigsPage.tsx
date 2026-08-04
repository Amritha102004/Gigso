import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import workerGigService from '../services/gig.service';
import type { GigApplicationDTO } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../api/client';
import Pagination from '../../../components/Pagination';
import { getErrorMessage } from '../../../utils/error';

const MyGigsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<GigApplicationDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Announcements modal states
  const [activeUpdatesGig, setActiveUpdatesGig] = useState<{ id: string; title: string } | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Filter values
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategory, selectedLocation]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await workerGigService.getWorkerApplications();
      if (res.success && res.data) {
        setApplications(res.data);
      } else {
        showToast(res.message || 'Failed to fetch assignments', 'error');
      }
    } catch (err: unknown) {
      console.error(err);
      showToast(getErrorMessage(err, 'Error loading assignments'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdates = async (gigId: string, gigTitle: string) => {
    setActiveUpdatesGig({ id: gigId, title: gigTitle });
    setLoadingAnnouncements(true);
    try {
      const res = await apiClient.get(`/announcements/${gigId}`);
      if (res.data && res.data.data) {
        setAnnouncements(res.data.data.announcements);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch announcements.', 'error');
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Determine categories and locations dynamically from applications for dropdowns
  const categories = Array.from(
    new Set(
      applications
        .map((app) => app.gig?.category?.name)
        .filter((cat): cat is string => !!cat)
    )
  );

  const locations = Array.from(
    new Set(
      applications
        .map((app) => app.gig?.location)
        .filter((loc): loc is string => !!loc)
    )
  );

  // Helper to check assignment status/period
  const getAssignmentStatus = (app: GigApplicationDTO) => {
    if (app.status === 'rejected') return 'rejected';
    if (app.status === 'pending') return 'pending';

    // If accepted, status depends on the gig's date or completion status
    if (app.gig?.status === 'completed') return 'completed';

    const eventDate = new Date(app.gig?.eventDate || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If date is today, In Progress
    const eventTime = eventDate.getTime();
    const todayTime = today.getTime();

    if (eventTime === todayTime) {
      return 'in_progress';
    } else if (eventTime < todayTime) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider">
            In Progress
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter application list
  const filteredApps = applications.filter((app) => {
    const status = getAssignmentStatus(app);

    // Tab filter
    if (activeTab === 'upcoming' && status !== 'upcoming') return false;
    if (activeTab === 'in_progress' && status !== 'in_progress') return false;
    if (activeTab === 'completed' && status !== 'completed') return false;

    // Search query
    if (searchQuery) {
      const titleMatch = app.gig?.title.toLowerCase().includes(searchQuery.toLowerCase());
      const roleMatch = app.role?.roleName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!titleMatch && !roleMatch) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && app.gig?.category?.name !== selectedCategory) {
      return false;
    }

    // Location filter
    if (selectedLocation !== 'all' && app.gig?.location !== selectedLocation) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-textMain">My Gigs</h1>
          <p className="text-sm text-secondary">Manage and track your gig applications and assignments.</p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100 w-full md:w-auto">
          {['all', 'upcoming', 'in_progress', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-textMain shadow-sm border border-gray-100'
                  : 'text-secondary hover:text-textMain'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search my gigs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs text-textMain placeholder-secondary focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs text-secondary bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-semibold"
        >
          <option value="all">Category: All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs text-secondary bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-semibold"
        >
          <option value="all">Location: All</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {(selectedCategory !== 'all' || selectedLocation !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedLocation('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-primary hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Gigs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-sm text-secondary shadow-sm">
            Loading assignments...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-sm text-secondary shadow-sm space-y-3">
            <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="font-semibold text-textMain">No gigs found</p>
            <p className="text-xs text-secondary">
              {activeTab === 'all'
                ? "You haven't applied to any gigs yet."
                : `You don't have any ${activeTab.replace('_', ' ')} gigs.`}
            </p>
            <button
              onClick={() => navigate('/worker/browse')}
              className="inline-flex px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#575727] transition-all"
            >
              Browse Gigs
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
              const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
              const paginatedApps = filteredApps.slice(
                (adjustedCurrentPage - 1) * ITEMS_PER_PAGE,
                adjustedCurrentPage * ITEMS_PER_PAGE
              );

              return paginatedApps.map((app) => {
                const status = getAssignmentStatus(app);
                return (
                  <div
                    key={app.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Left Side: Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary flex-shrink-0">
                        <BriefcaseIcon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-textMain text-sm line-clamp-1">{app.gig?.title}</h3>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-xs font-bold text-secondary">{app.role?.roleName}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-secondary">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {formatDate(app.gig?.eventDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {app.gig?.startTime}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <MapPinIcon className="w-3.5 h-3.5" />
                            {app.gig?.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Price & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Payout</span>
                        <span className="font-bold text-primary text-sm">₹{app.role?.payPerPerson}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {status === 'completed' ? (
                          <button
                            onClick={() => showToast('Reviews will be available in next phase!', 'info')}
                            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 font-bold text-xs text-textMain rounded-xl shadow-sm transition-all"
                          >
                            Review
                          </button>
                        ) : app.status === 'accepted' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenUpdates(app.gigId, app.gig?.title || 'Gig')}
                              className="px-4 py-2 border border-primary/20 hover:bg-primary/5 font-bold text-xs text-primary rounded-xl shadow-sm transition-all"
                            >
                              Updates
                            </button>
                            <button
                              onClick={() => {
                                const ownerId = typeof app.gig?.ownerId === 'object' ? app.gig?.ownerId?.id : app.gig?.ownerId;
                                const ownerName = typeof app.gig?.ownerId === 'object' ? app.gig?.ownerId?.name : 'Owner';
                                navigate(`/worker/messages?gigId=${app.gigId}&ownerId=${ownerId}&gigTitle=${encodeURIComponent(app.gig?.title || 'Gig')}&ownerName=${encodeURIComponent(ownerName)}`);
                              }}
                              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 font-bold text-xs text-textMain rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
                              Chat
                            </button>
                          </div>
                        ) : null}

                        <button
                          onClick={() => navigate(`/worker/gigs/${app.gigId}`)}
                          className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#575727] transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredApps.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Support Box */}
      <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-textMain text-sm">Need help with a gig?</h4>
            <p className="text-xs text-secondary font-medium">Our support team is available 24/7 for active workers.</p>
          </div>
        </div>
        <button
          onClick={() => showToast('Support ticket creation will be implemented in next phase.', 'info')}
          className="px-5 py-2.5 bg-white border border-gray-200 font-bold text-xs text-textMain rounded-xl hover:bg-gray-50 transition-all shadow-sm"
        >
          Contact Support
        </button>
      </div>
      {/* Announcements Modal */}
      {activeUpdatesGig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl relative flex flex-col max-h-[80vh]">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-textMain text-base">Gig Announcements</h3>
                <p className="text-[10px] text-secondary font-semibold uppercase tracking-wider mt-0.5">
                  {activeUpdatesGig.title}
                </p>
              </div>
              <button
                onClick={() => setActiveUpdatesGig(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-secondary hover:text-textMain transition-all font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {loadingAnnouncements ? (
                <div className="text-center text-xs text-secondary animate-pulse">Loading updates...</div>
              ) : announcements.length === 0 ? (
                <p className="text-xs text-secondary italic text-center py-6">No announcements posted for this gig yet.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann._id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                      <p className="text-xs text-textMain leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                      <span className="text-[9px] text-gray-400 block text-right">
                        Posted: {new Date(ann.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-end">
              <button
                onClick={() => setActiveUpdatesGig(null)}
                className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-sm active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGigsPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon,
  UserGroupIcon,
  CheckIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import gigService from '../services/gig.service';
import type { GigResponseDTO, GigApplicationDTO } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';
import Pagination from '../../../components/Pagination';
import { getErrorMessage } from '../../../utils/error';

const ViewGigPage: React.FC = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [gig, setGig] = useState<GigResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'applications'>('roster');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [applications, setApplications] = useState<GigApplicationDTO[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 4;

  // Reset page on sub-tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab]);

  useEffect(() => {
    const state = location.state as { activeTab?: 'roster' | 'applications' } | null;
    if (state?.activeTab) {
      setActiveSubTab(state.activeTab);
    }
  }, [location.state]);

  const fetchGigDetails = async () => {
    if (!gigId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await gigService.getGigById(gigId);
      if (res.success && res.data) {
        setGig(res.data);
      } else {
        setError(res.message || 'Failed to find gig details.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, 'Error fetching gig details.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!gigId) return;
    try {
      const res = await gigService.getGigApplications(gigId);
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err: unknown) {
      console.error('Error fetching applications:', err);
    }
  };

  useEffect(() => {
    if (gigId) {
      fetchGigDetails();
      fetchApplications();
    }
  }, [gigId]);

  const handlePublish = async () => {
    if (!gig) return;
    try {
      setActionLoading(true);
      const res = await gigService.publishGig(gig.id);
      if (res.success && res.data) {
        setGig(res.data);
        showToast('Gig published successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to publish gig.', 'error');
      }
    } catch (err: unknown) {
      console.error(err);
      showToast(getErrorMessage(err, 'Error publishing gig.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!gig) return;
    if (!window.confirm('Are you sure you want to mark this gig as completed? This will lock roles and payout requests.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await gigService.markAsCompleted(gig.id);
      if (res.success && res.data) {
        setGig(res.data);
        showToast('Gig marked as completed.', 'success');
      } else {
        showToast(res.message || 'Failed to complete gig.', 'error');
      }
    } catch (err: unknown) {
      console.error(err);
      showToast(getErrorMessage(err, 'Error completing gig.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: 'accepted' | 'rejected') => {
    if (!gig) return;
    try {
      setActionLoading(true);
      const res = await gigService.updateApplicationStatus(gig.id, appId, status);
      if (res.success) {
        showToast(`Application has been ${status === 'accepted' ? 'approved' : 'rejected'}.`, 'success');
        fetchApplications();
        fetchGigDetails();
      } else {
        showToast(res.message || 'Failed to update status.', 'error');
      }
    } catch (err: unknown) {
      console.error(err);
      showToast(getErrorMessage(err, 'Error updating application status.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-secondary">Loading gig details...</div>;
  }

  if (error || !gig) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="text-red-500 font-bold">{error || 'Gig not found.'}</div>
        <button
          onClick={() => navigate('/owner/gigs')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold"
        >
          Back to Gigs List
        </button>
      </div>
    );
  }

  let statusColor = 'bg-gray-100 text-gray-700';
  if (gig.status === 'active') statusColor = 'bg-blue-50 text-blue-700 border border-blue-100';
  if (gig.status === 'completed') statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  if (gig.status === 'cancelled') statusColor = 'bg-rose-50 text-rose-700 border border-rose-100';

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
        <span className="hover:text-textMain cursor-pointer" onClick={() => navigate('/owner/gigs')}>Gigs</span>
        <ChevronRightIcon className="w-3 h-3" />
        <span className="text-textMain">{gig.title}</span>
      </div>

      {/* Main Header / Title info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColor}`}>
              {gig.status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-textMain">{gig.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-secondary pt-1">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              {new Date(gig.eventDate).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4" />
              {gig.startTime}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4" />
              {gig.location}
            </span>
          </div>
        </div>

        {/* Action button in header */}
        <div className="flex flex-wrap gap-3 self-start md:self-auto">
          {(gig.status === 'draft' || (gig.status === 'active' && applications.length === 0)) && (
            <button
              onClick={() => navigate(`/owner/gigs/${gig.id}/edit`)}
              className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-textMain transition-all"
            >
              Edit Details
            </button>
          )}
          {gig.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-[#575727] transition-all shadow-sm disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              Publish Gig
            </button>
          )}

          {gig.status === 'active' && (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
            >
              <CheckIcon className="w-4 h-4" />
              Mark as Completed
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout: Left Details, Right Roles Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Description & Sub-tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Gig Description</h3>
            <p className="text-xs text-secondary leading-relaxed whitespace-pre-wrap">{gig.description}</p>
          </div>

          {/* Sub Tabs Container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setActiveSubTab('roster')}
                className={`flex-1 py-4 text-xs font-bold border-b-2 transition-all ${
                  activeSubTab === 'roster' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent text-secondary hover:text-textMain'
                }`}
              >
                Roles & Roster
              </button>
              <button
                onClick={() => setActiveSubTab('applications')}
                className={`flex-1 py-4 text-xs font-bold border-b-2 transition-all ${
                  activeSubTab === 'applications' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent text-secondary hover:text-textMain'
                }`}
              >
                Worker Applications
              </button>
            </div>

            <div className="p-6">
              {activeSubTab === 'roster' ? (
                <div className="space-y-6">
                  {/* Confirmed Workers Section grouped by role */}
                  <div className="space-y-6">
                    {gig.roles.map((role) => {
                      const confirmedApps = applications.filter(
                        (a) => a.roleId === role.id && a.status === 'accepted'
                      );
                      const spotsRemaining = Math.max(0, role.spots - confirmedApps.length);

                      return (
                        <div key={role.id} className="space-y-3">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <h4 className="text-xs font-bold text-textMain uppercase tracking-wider">
                              {role.roleName} ({confirmedApps.length} / {role.spots})
                            </h4>
                            <span className="text-[10px] text-secondary font-semibold">
                              Payout: ₹{role.payPerPerson}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {confirmedApps.map((app) => (
                              <div
                                key={app.id}
                                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={app.worker?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop&q=60'}
                                    alt={app.worker?.name}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                  />
                                  <div>
                                    <div className="font-bold text-xs text-textMain">{app.worker?.name}</div>
                                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                                      <span>★ 4.8</span>
                                      <span className="text-secondary font-normal">(42 reviews)</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedWorker(app.worker)}
                                  className="text-[10px] font-bold text-primary hover:underline border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                  VIEW PROFILE
                                </button>
                              </div>
                            ))}

                            {/* Render empty slots */}
                            {Array.from({ length: spotsRemaining }).map((_, idx) => (
                              <div
                                key={idx}
                                className="border border-dashed border-gray-200 bg-gray-50/20 rounded-xl p-4 flex items-center justify-center text-secondary text-[11px] font-semibold h-[72px]"
                              >
                                Position Pending
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Applications Tab grouped by role with pagination */
                <div className="space-y-6">
                  {(() => {
                    const pendingApplications = applications.filter((a) => a.status === 'pending');
                    const totalPages = Math.ceil(pendingApplications.length / ITEMS_PER_PAGE);
                    const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
                    const paginatedPending = pendingApplications.slice(
                      (adjustedCurrentPage - 1) * ITEMS_PER_PAGE,
                      adjustedCurrentPage * ITEMS_PER_PAGE
                    );

                    if (pendingApplications.length === 0) {
                      return (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
                            <UserGroupIcon className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-textMain text-sm">No Pending Applications</h3>
                          <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                            There are currently no pending worker applications for this gig posting.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {paginatedPending.map((app) => (
                            <div
                              key={app.id}
                              className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between gap-4 shadow-sm hover:shadow transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={app.worker?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop&q=60'}
                                    alt={app.worker?.name}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                  />
                                  <div>
                                    <div className="font-bold text-xs text-textMain">{app.worker?.name}</div>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                      <span className="px-1.5 py-0.5 bg-primary/5 text-primary text-[9px] font-bold rounded uppercase">
                                        {app.role?.roleName}
                                      </span>
                                      <span className="text-[10px] text-amber-500 font-bold">
                                        ★ 4.8
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedWorker(app.worker)}
                                  className="text-[10px] font-bold text-primary hover:underline border border-gray-200 px-2 py-1 rounded-lg"
                                >
                                  Profile
                                </button>
                              </div>

                              <p className="text-[11px] text-secondary line-clamp-2">
                                {app.worker?.profile?.bio || 'No worker bio provided yet.'}
                              </p>

                              <div className="flex items-center gap-2 border-t border-gray-50 pt-3">
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                  className="flex-1 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-[11px] rounded-lg transition-all"
                                >
                                  Reject
                                </button>
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleStatusUpdate(app.id, 'accepted')}
                                  className="flex-1 py-1.5 bg-primary text-white font-bold text-[11px] rounded-lg hover:bg-[#575727] transition-all"
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Financial & Category Info Summary Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider border-b border-gray-100 pb-3">Financials</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-secondary font-medium">Payout Status:</span>
                <span className="font-bold text-textMain uppercase">{gig.paymentStatus}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                <span className="text-secondary font-medium">Workers' Payout:</span>
                <span className="font-bold text-textMain">₹{gig.totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary font-medium">Platform Fee (10%):</span>
                <span className="font-bold text-textMain">₹{Math.round(gig.totalBudget * 0.1).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-gray-100 pt-3 text-primary font-bold">
                <span>Total Payable:</span>
                <span className="text-base font-black text-primary">₹{Math.round(gig.totalBudget * 1.1).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider border-b border-gray-100 pb-3">Category Details</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                {gig.category.name.substring(0,2)}
              </div>
              <div>
                <div className="font-bold text-xs text-textMain">{gig.category.name}</div>
                <div className="text-[10px] text-secondary leading-relaxed mt-0.5">{gig.category.description}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Worker Profile Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedWorker.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop&q=60'}
                  alt={selectedWorker.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h3 className="font-bold text-textMain text-base">{selectedWorker.name}</h3>
                  <p className="text-xs text-secondary font-medium">Worker Profile</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-secondary hover:text-textMain transition-all text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Email</span>
                  <span className="font-semibold text-textMain break-all">{selectedWorker.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Phone</span>
                  <span className="font-semibold text-textMain">{selectedWorker.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">About Me</span>
                <p className="text-secondary leading-relaxed bg-gray-50/40 p-3 rounded-xl border border-gray-100">
                  {selectedWorker.profile?.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Skills & Expertise</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWorker.profile?.skills && selectedWorker.profile.skills.length > 0 ? (
                    selectedWorker.profile.skills.map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-secondary italic">No skills specified</span>
                  )}
                </div>
              </div>

              {/* Portfolio */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Portfolio Links</span>
                <div className="space-y-1">
                  {selectedWorker.profile?.portfolio && selectedWorker.profile.portfolio.length > 0 ? (
                    selectedWorker.profile.portfolio.map((link: string, idx: number) => (
                      <a
                        key={idx}
                        href={link.startsWith('http') ? link : `https://${link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-bold block truncate"
                      >
                        🔗 {link}
                      </a>
                    ))
                  ) : (
                    <span className="text-secondary italic block">No portfolio links provided</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedWorker(null)}
              className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-[#575727] transition-all"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewGigPage;

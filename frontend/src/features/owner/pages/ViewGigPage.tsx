import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon,
  UserGroupIcon,
  CheckIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import gigService from '../services/gig.service';
import { aiService, type ApplicantMatchResult, type MatchApplicantsPayload } from '../services/ai.service';
import type { GigResponseDTO, GigApplicationDTO } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../api/client';
import Pagination from '../../../components/Pagination';
import { getErrorMessage } from '../../../utils/error';
import WorkerReviewFlowModal from '../../../components/WorkerReviewFlowModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

const ViewGigPage: React.FC = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  
  const [gig, setGig] = useState<GigResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'applications' | 'updates'>('roster');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);

  const [applications, setApplications] = useState<GigApplicationDTO[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<GigApplicationDTO['worker'] | null>(null);
  const [aiMatches, setAiMatches] = useState<Record<string, ApplicantMatchResult>>({});
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [sortByMatch, setSortByMatch] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  // Announcement states
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState<string>('');
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState<boolean>(false);

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

  const fetchAnnouncements = async () => {
    if (!gigId) return;
    try {
      const res = await apiClient.get(`/announcements/${gigId}`);
      if (res.data && res.data.data) {
        setAnnouncements(res.data.data.announcements);
      }
    } catch (err: unknown) {
      console.error('Error fetching announcements:', err);
    }
  };

  useEffect(() => {
    if (gigId) {
      fetchGigDetails();
      fetchApplications();
      fetchAnnouncements();
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

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim() || !gigId) return;
    try {
      setIsSubmittingAnnouncement(true);
      const res = await apiClient.post(`/announcements/${gigId}`, { message: newAnnouncement.trim() });
      if (res.data && res.data.data) {
        setAnnouncements((prev) => [res.data.data.announcement, ...prev]);
        setNewAnnouncement('');
        showToast('Announcement posted successfully!', 'success');
      }
    } catch (err: unknown) {
      console.error(err);
      showToast(getErrorMessage(err, 'Failed to post announcement.'), 'error');
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };

  const checkCancelAllowed = () => {
    if (!gig) return false;
    const acceptedCount = applications.filter(a => a.status === 'accepted' || a.status === 'completed' || a.status === 'paid').length;
    if (acceptedCount === 0) return true;

    const eventStart = new Date(gig.eventDate);
    const match = gig.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      eventStart.setHours(hours, minutes, 0, 0);
    }

    const msDiff = eventStart.getTime() - Date.now();
    const daysLeft = msDiff / (1000 * 60 * 60 * 24);
    return daysLeft >= 2;
  };

  const handleCancel = () => {
    if (!gig) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Gig Posting',
      message: 'Are you sure you want to cancel this gig? Accepted workers will be notified and their applications will be rejected. This action cannot be undone.',
      confirmText: 'Yes, Cancel Gig',
      cancelText: 'Keep Gig',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          const res = await apiClient.delete(`/owner/gigs/${gig.id}`);
          if (res.data && res.data.success) {
            showToast('Gig has been successfully cancelled.', 'success');
            fetchGigDetails();
          }
        } catch (err) {
          console.error(err);
          showToast(getErrorMessage(err, 'Failed to cancel gig.'), 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleComplete = () => {
    if (!gig) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Close Gig Applications',
      message: 'Are you sure you want to close applications for this gig? Hired workers will be kept in the roster, and new applications will be locked.',
      confirmText: 'Yes, Close Applications',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          const res = await gigService.markAsCompleted(gig.id);
          if (res.success && res.data) {
            setGig(res.data);
            showToast('Gig has been successfully closed.', 'success');
          } else {
            showToast(res.message || 'Failed to close gig.', 'error');
          }
        } catch (err: unknown) {
          console.error(err);
          showToast(getErrorMessage(err, 'Error closing gig.'), 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
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

  const handleRunAIMatchmaker = async () => {
    if (!gig) return;
    const pendingApps = applications.filter((a) => a.status === 'pending');
    if (pendingApps.length === 0) {
      showToast('No pending applications to analyze.', 'info');
      return;
    }

    try {
      setIsAnalyzingAI(true);
      const payload: MatchApplicantsPayload = {
        gig: {
          gigId: gig.id,
          title: gig.title,
          description: gig.description,
          category: typeof gig.category === 'object' ? gig.category?.name : gig.category,
          location: gig.location || '',
          roleName: gig.roles && gig.roles.length > 0 ? gig.roles[0].roleName : '',
          requiredSkills: [],
        },
        applicants: pendingApps.map((app) => ({
          applicationId: app.id,
          workerId: app.worker?._id || '',
          name: app.worker?.name || 'Worker',
          bio: app.worker?.profile?.bio || '',
          skills: app.worker?.profile?.skills || [],
          experienceYears: 0,
          averageRating: 4.8,
          completedGigsCount: 0,
          roleApplied: app.role?.roleName || '',
        })),
      };

      const res = await aiService.matchApplicants(payload);
      if (res.success && res.data) {
        const matchMap: Record<string, ApplicantMatchResult> = {};
        res.data.forEach((m: ApplicantMatchResult) => {
          matchMap[m.applicationId] = m;
        });
        setAiMatches(matchMap);
        setSortByMatch(true);
        showToast('AI Match Insights generated successfully! ✨', 'success');
      } else {
        showToast(res.message || 'Failed to generate AI match insights.', 'error');
      }
    } catch (err: unknown) {
      console.error('AI Match error:', err);
      showToast(getErrorMessage(err, 'Failed to generate AI insights.'), 'error');
    } finally {
      setIsAnalyzingAI(false);
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
  let statusText: string = gig.status;
  if (gig.status === 'active') {
    statusColor = 'bg-blue-50 text-blue-700 border border-blue-100';
    statusText = 'active';
  } else if (gig.status === 'completed') {
    if (gig.paymentStatus === 'unpaid') {
      statusColor = 'bg-amber-50 text-amber-700 border border-amber-100';
      statusText = 'payment pending';
    } else {
      statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      statusText = 'completed';
    }
  } else if (gig.status === 'cancelled') {
    statusColor = 'bg-rose-50 text-rose-700 border border-rose-100';
    statusText = 'cancelled';
  }

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
              {statusText}
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
              Close Gig
            </button>
          )}

          {(gig.status === 'active' || gig.status === 'closed') && checkCancelAllowed() && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-all shadow-sm disabled:opacity-50"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel Gig
            </button>
          )}
          {gig.status === 'completed' && (
            <button
              onClick={() => setIsReviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-[#575727] transition-all shadow-sm"
            >
              Review Workers
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
                Worker Applications ({applications.filter(a => a.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveSubTab('updates')}
                className={`flex-1 py-4 text-xs font-bold border-b-2 transition-all ${
                  activeSubTab === 'updates' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent text-secondary hover:text-textMain'
                }`}
              >
                Gig Updates ({announcements.length})
              </button>
            </div>

            <div className="p-6">
              {activeSubTab === 'roster' && (
                <div className="space-y-6">
                  {/* Confirmed Workers Section grouped by role */}
                  <div className="space-y-6">
                    {gig.roles.map((role) => {
                      const confirmedApps = applications.filter(
                        (a) => a.roleId === role.id && (a.status === 'accepted' || a.status === 'completed' || a.status === 'paid')
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
              )}

              {activeSubTab === 'applications' && (
                <div className="space-y-6">
                  {(() => {
                    const pendingApplications = applications.filter((a) => a.status === 'pending');
                    const hasAiScores = Object.keys(aiMatches).length > 0;

                    let sortedPending = [...pendingApplications];
                    if (sortByMatch && hasAiScores) {
                      sortedPending.sort((a, b) => {
                        const scoreA = aiMatches[a.id]?.matchScore ?? 0;
                        const scoreB = aiMatches[b.id]?.matchScore ?? 0;
                        return scoreB - scoreA;
                      });
                    }

                    const totalPages = Math.ceil(sortedPending.length / ITEMS_PER_PAGE);
                    const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
                    const paginatedPending = sortedPending.slice(
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
                      <div className="space-y-5">
                        {/* AI Matchmaker Advisory Banner */}
                        <div className="bg-gradient-to-r from-primary/5 via-emerald-50/50 to-primary/5 border border-primary/20 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <SparklesIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-textMain">AI Matchmaker & Fit Scorer</h4>
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-semibold">Advisory Only</span>
                              </div>
                              <p className="text-[11px] text-secondary mt-0.5">
                                AI analyzes candidates against your gig requirements. You retain 100% final authority to Approve or Reject.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            {hasAiScores && (
                              <button
                                onClick={() => setSortByMatch(!sortByMatch)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  sortByMatch 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-white text-textMain border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <span>Sort by Match</span>
                                {sortByMatch && <CheckIcon className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button
                              disabled={isAnalyzingAI}
                              onClick={handleRunAIMatchmaker}
                              className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold bg-primary hover:bg-[#575727] text-white transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                            >
                              <SparklesIcon className={`w-3.5 h-3.5 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
                              <span>{isAnalyzingAI ? 'Analyzing...' : hasAiScores ? 'Re-analyze with AI' : 'Analyze Applicants ✨'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {paginatedPending.map((app) => {
                            const match = aiMatches[app.id];
                            return (
                              <div
                                key={app.id}
                                className={`bg-white border rounded-xl p-4 flex flex-col justify-between gap-3.5 shadow-sm hover:shadow transition-all ${
                                  match && match.matchScore >= 85 
                                    ? 'border-emerald-200 hover:border-emerald-300' 
                                    : 'border-gray-100 hover:border-gray-200'
                                }`}
                              >
                                <div className="space-y-2.5">
                                  {/* Top header: Worker info + Profile Button */}
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
                                      className="text-[10px] font-bold text-primary hover:underline border border-gray-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                      Profile
                                    </button>
                                  </div>

                                  {/* AI Match Advisory Box (if analyzed) */}
                                  {match ? (
                                    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2.5 space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                          match.matchScore >= 90
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : match.matchScore >= 80
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                          <SparklesIcon className="w-3 h-3 text-emerald-600" />
                                          {match.matchScore}% Match • {match.fitRecommendation}
                                        </span>
                                        <span className="text-[9px] text-emerald-700/80 font-medium">AI Advisory</span>
                                      </div>
                                      <p className="text-[11px] text-gray-700 leading-snug">
                                        {match.summary}
                                      </p>
                                      {match.strengths && match.strengths.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                          {match.strengths.map((st, i) => (
                                            <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 bg-white rounded border border-emerald-200 text-emerald-900 shadow-2xs">
                                              ✓ {st}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-secondary line-clamp-2">
                                      {app.worker?.profile?.bio || 'No worker bio provided yet.'}
                                    </p>
                                  )}
                                </div>

                                {/* Manual Owner Decision Action Buttons */}
                                <div className="flex items-center gap-2 border-t border-gray-50 pt-2.5">
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                    className="flex-1 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-[11px] rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleStatusUpdate(app.id, 'accepted')}
                                    className="flex-1 py-1.5 bg-primary text-white font-bold text-[11px] rounded-lg hover:bg-[#575727] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                                  >
                                    Approve
                                  </button>
                                </div>
                              </div>
                            );
                          })}
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
              {activeSubTab === 'updates' && (
                <div className="space-y-6">
                  {/* Announcement List (Clean, scrollable, like chat history) */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-secondary italic text-center py-8">
                        No announcements posted for this gig yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {announcements.map((ann) => (
                          <div key={ann._id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
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

                  {/* Post new update form (Placed at the bottom) */}
                  <form onSubmit={handlePostAnnouncement} className="space-y-3 pt-4 border-t border-gray-100">
                    <label className="text-xs font-bold text-textMain uppercase tracking-wider block">
                      Broadcast New Update / Announcement
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write message to all accepted workers (e.g. Bring a water bottle, gate changes...)"
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs text-textMain outline-none focus:border-primary shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingAnnouncement || !newAnnouncement.trim()}
                        className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-[#575727] transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-95 shrink-0"
                      >
                        <PaperAirplaneIcon className="w-3.5 h-3.5" />
                        Send
                      </button>
                    </div>
                  </form>
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
            {(gig.status === 'closed' || gig.status === 'completed') && gig.paymentStatus === 'unpaid' && (
              <button
                onClick={() => navigate(`/owner/payments?gigId=${gig.id}`)}
                className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors shadow-sm uppercase tracking-wider block text-center"
              >
                Review & Make Payment
              </button>
            )}
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

      {gig && (
        <WorkerReviewFlowModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          gigId={gig.id}
          gigTitle={gig.title}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ViewGigPage;

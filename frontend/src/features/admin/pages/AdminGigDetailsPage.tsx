import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  MapPinIcon, 
  CalendarIcon, 
  CheckIcon,
  FlagIcon,
  BriefcaseIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { FlagIcon as FlagIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import adminService from '../services/admin.service';
import type { AdminGig, AdminGigRole } from '../services/admin.service';
import type { OwnerProfileResponseDTO, GigApplicationDTO } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

const AdminGigDetailsPage: React.FC = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [gig, setGig] = useState<AdminGig | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfileResponseDTO | null>(null);
  const [applications, setApplications] = useState<GigApplicationDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'applications'>('overview');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Confirm delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const fetchDetails = async () => {
    if (!gigId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getGigById(gigId);
      if (res) {
        setGig(res.gig);
        setOwnerProfile(res.ownerProfile);
        setApplications(res.applications || []);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(errorMessage || 'Error fetching gig details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [gigId]);

  const handleToggleFlag = async () => {
    if (!gig) return;
    try {
      setActionLoading(true);
      const updated = await adminService.toggleFlagGig(gig.id, !gig.isFlagged);
      setGig(updated);
      showToast(
        `Gig successfully ${!gig.isFlagged ? 'flagged for review' : 'unflagged'}`,
        'success'
      );
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      showToast(errorMessage || 'Error updating flag status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGig = async () => {
    if (!gig) return;
    try {
      setActionLoading(true);
      await adminService.deleteGig(gig.id);
      showToast('Gig posting deleted successfully.', 'success');
      navigate('/admin/gigs');
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      showToast(errorMessage || 'Error deleting gig.', 'error');
    } finally {
      setActionLoading(false);
      setIsDeleteOpen(false);
    }
  };

  const handleApplicationStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    if (!gig) return;
    try {
      setActionLoading(true);
      await adminService.updateApplicationStatus(gig.id, appId, status);
      showToast(`Application has been ${status === 'accepted' ? 'approved' : 'rejected'}.`, 'success');
      fetchDetails();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      showToast(errorMessage || 'Failed to update application status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-secondary">Loading gig details...</div>;
  }

  if (error || !gig) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="text-red-500 font-bold">{error || 'Gig not found.'}</div>
        <button
          onClick={() => navigate('/admin/gigs')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold"
        >
          Back to Gigs List
        </button>
      </div>
    );
  }

  // Derived stats
  const totalRolesCount = (gig.roles || []).length;
  const totalSpotsCount = (gig.roles || []).reduce((sum: number, r: AdminGigRole) => sum + (r.spots || 0), 0);
  const totalFilledSpots = (gig.roles || []).reduce((sum: number, r: AdminGigRole) => sum + (r.filledSpots || 0), 0);
  const totalApplicationsCount = applications.length;
  const totalBudget = gig.totalBudget || 0;

  // Service Fee (15%)
  const serviceFee = totalBudget * 0.15;
  const netPayout = totalBudget - serviceFee;

  // Split applications
  const acceptedWorkers = applications.filter(app => app.status === 'accepted');
  const pendingApplicants = applications.filter(app => app.status === 'pending');

  let statusColor = 'bg-gray-100 text-gray-700';
  if (gig.status === 'active') statusColor = 'bg-blue-50 text-blue-700 border border-blue-100';
  if (gig.status === 'completed') statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  if (gig.status === 'cancelled') statusColor = 'bg-rose-50 text-rose-700 border border-rose-100';
  if (gig.isFlagged) statusColor = 'bg-amber-50 text-amber-700 border border-amber-100';

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-secondary mb-6">
        <span className="hover:text-textMain cursor-pointer" onClick={() => navigate('/admin/gigs')}>Gigs</span>
        <ChevronRightIcon className="w-3 h-3" />
        <span className="text-textMain">{gig.title}</span>
      </div>

      {/* Flagged Alert Banner */}
      {gig.isFlagged && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl flex items-center gap-3 shadow-sm text-xs font-semibold">
          <FlagIconSolid className="w-5 h-5 text-amber-500 animate-bounce" />
          <div>
            <p className="font-bold text-amber-900">This gig is currently Flagged for Review</p>
            <p className="text-amber-700 mt-0.5 font-medium">It remains editable by the admin, but platform operations may be suspended or limited until reviewed.</p>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-lg uppercase shadow-inner">
            {gig.category?.name ? gig.category.name.substring(0, 2) : 'GI'}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-textMain">{gig.title}</h1>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                {gig.isFlagged ? 'Flagged' : gig.status}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary font-medium">
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="w-3.5 h-3.5" />
                {ownerProfile?.businessName || (gig.ownerId && typeof gig.ownerId === 'object' ? gig.ownerId.name : 'Owner')}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {new Date(gig.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5" />
                {gig.location}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFlag}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
              gig.isFlagged
                ? 'border-amber-600 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'border-gray-200 bg-white text-textMain hover:bg-gray-50'
            }`}
          >
            {gig.isFlagged ? (
              <FlagIconSolid className="w-4 h-4 text-amber-600" />
            ) : (
              <FlagIcon className="w-4 h-4 text-secondary" />
            )}
            {gig.isFlagged ? 'Flagged for Review' : 'Flag for Review'}
          </button>
          
          <button
            onClick={() => setIsDeleteOpen(true)}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all shadow-sm disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            Delete Posting
          </button>
        </div>
      </div>

      {/* Row of 3 Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">Total Roles</span>
          <div className="text-2xl font-black text-textMain">{totalRolesCount}</div>
          <span className="text-[10px] text-secondary font-medium">{totalFilledSpots} of {totalSpotsCount} positions filled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">Applications</span>
          <div className="text-2xl font-black text-textMain">{totalApplicationsCount}</div>
          <span className="text-[10px] text-emerald-600 font-bold tracking-wide">
            {acceptedWorkers.length} Hired • {pendingApplicants.length} Pending
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">Total Value</span>
          <div className="text-2xl font-black text-primary">₹{totalBudget.toLocaleString()}</div>
          <span className="text-[10px] text-secondary font-medium">Estimated payout budget</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tab Screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-4 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary bg-white shadow-sm'
                    : 'border-transparent text-secondary hover:text-textMain'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`flex-1 py-4 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'roles'
                    ? 'border-primary text-primary bg-white shadow-sm'
                    : 'border-transparent text-secondary hover:text-textMain'
                }`}
              >
                Roles
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`flex-1 py-4 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'applications'
                    ? 'border-primary text-primary bg-white shadow-sm'
                    : 'border-transparent text-secondary hover:text-textMain'
                }`}
              >
                Workers & Applications ({applications.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Gig Description</h3>
                    <p className="text-xs text-secondary leading-relaxed whitespace-pre-wrap">{gig.description}</p>
                  </div>

                  {/* Requirements List (Static placeholders) */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Standard Requirements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-secondary font-medium">
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50/50 rounded-xl border border-gray-100">
                        <CheckIcon className="w-4 h-4 text-emerald-600" />
                        Valid Government ID Check
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50/50 rounded-xl border border-gray-100">
                        <CheckIcon className="w-4 h-4 text-emerald-600" />
                        Physical Fitness & Grooming
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50/50 rounded-xl border border-gray-100">
                        <CheckIcon className="w-4 h-4 text-emerald-600" />
                        Professional Behavior & On-time
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50/50 rounded-xl border border-gray-100">
                        <CheckIcon className="w-4 h-4 text-emerald-600" />
                        Uniform & Styling Compliance
                      </div>
                    </div>
                  </div>

                  {/* Role Distribution Table */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Role Distribution</h3>
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-secondary uppercase tracking-wider">
                            <th className="px-4 py-3">Role Name</th>
                            <th className="px-4 py-3 text-center">Spots</th>
                            <th className="px-4 py-3 text-right">Pay Rate</th>
                            <th className="px-4 py-3 text-center">Filled</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(gig.roles || []).map((role: any) => (
                            <tr key={role.id || role._id}>
                              <td className="px-4 py-3 font-semibold text-textMain">{role.roleName}</td>
                              <td className="px-4 py-3 text-center text-secondary font-medium">{role.spots}</td>
                              <td className="px-4 py-3 text-right font-bold text-primary">₹{role.payPerPerson}/hr</td>
                              <td className="px-4 py-3 text-center font-bold text-secondary">
                                {Math.round(((role.filledSpots || 0) / role.spots) * 100)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'roles' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Manage Roles</h3>
                  <div className="space-y-4">
                    {(gig.roles || []).map((role: any) => {
                      const percent = Math.min(100, Math.round(((role.filledSpots || 0) / role.spots) * 100));
                      return (
                        <div key={role.id || role._id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl space-y-3 shadow-inner">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-textMain">{role.roleName}</h4>
                            <span className="text-xs font-bold text-primary">₹{role.payPerPerson}/hr</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-secondary font-bold">
                              <span>{role.filledSpots || 0} OF {role.spots} SPOTS FILLED</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${percent === 100 ? 'bg-blue-600' : 'bg-primary/70'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'applications' && (
                <div className="space-y-8">
                  {/* Hired Personnel */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Accepted Workers ({acceptedWorkers.length})
                    </h4>
                    
                    {acceptedWorkers.length === 0 ? (
                      <div className="text-xs text-secondary py-3 italic bg-gray-50 rounded-xl text-center border border-gray-100 border-dashed">
                        No workers hired yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {acceptedWorkers.map((app) => (
                          <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-primary border border-gray-200 shadow-inner">
                              {app.worker?.name ? app.worker.name.substring(0, 1) : 'W'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-textMain truncate">{app.worker?.name}</div>
                              <div className="text-[10px] text-secondary font-medium truncate">{app.role?.roleName}</div>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[9px] uppercase tracking-wider">
                              Hired
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Applicants */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Pending Applicants ({pendingApplicants.length})
                    </h4>
                    
                    {pendingApplicants.length === 0 ? (
                      <div className="text-xs text-secondary py-3 italic bg-gray-50 rounded-xl text-center border border-gray-100 border-dashed">
                        No pending applications.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingApplicants.map((app) => (
                          <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-primary border border-gray-200 shadow-inner">
                                {app.worker?.name ? app.worker.name.substring(0, 1) : 'W'}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-textMain">{app.worker?.name}</div>
                                <div className="text-[10px] text-secondary font-medium mt-0.5">
                                  Applied for: <span className="font-bold text-primary">{app.role?.roleName}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                onClick={() => handleApplicationStatus(app.id, 'rejected')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] font-bold rounded-lg transition-all"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleApplicationStatus(app.id, 'accepted')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-primary text-white hover:bg-[#575727] text-[10px] font-bold rounded-lg transition-all shadow-sm"
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary Sidebar Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider border-b border-gray-100 pb-3">
              Payment Summary
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-secondary">Gross Payout Value:</span>
                <span className="text-textMain font-bold">₹{totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-rose-600">
                <span>Platform Fee (15%):</span>
                <span>- ₹{serviceFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-black text-sm">
                <span className="text-textMain">Net Provider Payout:</span>
                <span className="text-primary">₹{netPayout.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-2 text-secondary">
                <span>Status:</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full font-bold">
                  Pending Settlement
                </span>
              </div>
            </div>
          </div>

          {/* Provider Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider border-b border-gray-100 pb-3">
              Provider Info
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                {gig.ownerId && typeof gig.ownerId === 'object' ? gig.ownerId.name.substring(0, 2) : 'OW'}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-textMain truncate">
                  {ownerProfile?.businessName || (gig.ownerId && typeof gig.ownerId === 'object' ? gig.ownerId.name : 'Owner Profile')}
                </h4>
                <p className="text-[10px] text-secondary truncate mt-0.5">
                  {gig.ownerId && typeof gig.ownerId === 'object' ? gig.ownerId.email : ''}
                </p>
              </div>
            </div>

            <button 
              onClick={() => showToast('Feature coming soon in next phases!', 'info')}
              className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-textMain text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Contact Provider
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Gig Posting"
        message="Are you sure you want to permanently delete this gig posting? All pending applications will be lost."
        confirmText="Delete Posting"
        type="danger"
        onConfirm={handleDeleteGig}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default AdminGigDetailsPage;

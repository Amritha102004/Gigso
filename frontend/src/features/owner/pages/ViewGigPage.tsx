import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CheckIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import gigService from '../services/gig.service';
import type { GigResponseDTO } from '../../../types/api.types';

const ViewGigPage: React.FC = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const navigate = useNavigate();
  
  const [gig, setGig] = useState<GigResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'applications'>('roster');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

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
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching gig details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigDetails();
  }, [gigId]);

  const handlePublish = async () => {
    if (!gig) return;
    try {
      setActionLoading(true);
      const res = await gigService.publishGig(gig.id);
      if (res.success && res.data) {
        setGig(res.data);
      } else {
        alert(res.message || 'Failed to publish gig.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error publishing gig.');
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
      } else {
        alert(res.message || 'Failed to complete gig.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error completing gig.');
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
            <span className="text-xs text-secondary font-mono">ID: {gig.id}</span>
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
          {gig.status === 'draft' && (
            <>
              <button
                onClick={() => navigate(`/owner/gigs/${gig.id}/edit`)}
                className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-textMain transition-all"
              >
                Edit Details
              </button>
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-[#575727] transition-all shadow-sm disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Publish Gig
              </button>
            </>
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
                  {/* Detailed Roles Listing */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-textMain uppercase tracking-wider">Required Roles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gig.roles.map((role) => (
                        <div key={role.id} className="border border-gray-100 p-4 rounded-xl space-y-2 hover:shadow-sm transition-all bg-gray-50/20">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-xs text-textMain">{role.roleName}</span>
                            <span className="inline-flex px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                              {role.spots} spots
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-secondary pt-1.5 border-t border-gray-100/60">
                            <span>Payout Rate:</span>
                            <span className="font-bold text-textMain">${role.payPerPerson} / person</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmed Workers Section Mock */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-textMain uppercase tracking-wider">Confirmed Workers Roster</h4>
                    <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/20">
                      <UserGroupIcon className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <p className="text-xs font-bold text-textMain">No Workers Confirmed Yet</p>
                      <p className="text-[10px] text-secondary mt-1">Once you accept applicant profiles, their details will display here.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Applications Placeholder */
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
                    <UserGroupIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-textMain text-sm">Applications Module coming soon</h3>
                  <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                    In the next release phase, workers will browse this gig posting and apply. You will manage candidates here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Financial & Category Info Summary Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider border-b border-gray-100 pb-3">Financials</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary font-medium">Payout Status:</span>
                <span className="text-xs font-bold text-textMain uppercase">{gig.paymentStatus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary font-medium">Estimated Budget:</span>
                <span className="text-base font-black text-primary">${gig.totalBudget.toLocaleString()}</span>
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
    </div>
  );
};

export default ViewGigPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import workerGigService from '../services/gig.service';
import type { GigResponseDTO, GigApplicationDTO } from '../../../types/api.types';
import { useToast } from '../../../context/ToastContext';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const GigDetailPage: React.FC = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [gig, setGig] = useState<GigResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userApplications, setUserApplications] = useState<GigApplicationDTO[]>([]);

  useEffect(() => {
    if (gigId) {
      fetchGigDetails();
      fetchUserApplications();
    }
  }, [gigId]);

  const fetchUserApplications = async () => {
    try {
      const res = await workerGigService.getWorkerApplications();
      if (res.success && res.data) {
        setUserApplications(res.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const res = await workerGigService.getGigById(gigId!);
      if (res.success && res.data) {
        setGig(res.data);
      } else {
        showToast(res.message || 'Failed to load gig details', 'error');
        navigate('/worker/browse');
      }
    } catch (err: any) {
      console.error('Error fetching gig details:', err);
      showToast(err.response?.data?.message || 'Failed to retrieve gig details', 'error');
      navigate('/worker/browse');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleApplyClick = async (roleId: string, roleName: string) => {
    if (!gig) return;
    try {
      const res = await workerGigService.applyForGigRole(gig.id, roleId);
      if (res.success) {
        showToast(`Successfully requested the role: ${roleName}`, 'success');
        fetchUserApplications();
      } else {
        showToast(res.message || 'Failed to apply.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error submitting application.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] gap-3 text-secondary bg-gray-50/20">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold">Loading gig details...</p>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="p-8 text-center bg-gray-50/20 min-h-[calc(100vh-6rem)]">
        <p className="text-secondary text-sm">Gig details could not be found.</p>
      </div>
    );
  }

  // Calculate total spots available across all roles
  const totalSpots = gig.roles.reduce((sum, r) => sum + r.spots, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header / Nav Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/worker/browse')}
          className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-textMain px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Gigs
        </button>
      </div>

      {/* Main Title Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            {gig.category.name}
          </span>
        </div>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-textMain tracking-tight">{gig.title}</h1>
          <p className="text-xs font-medium text-secondary flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
            Posted by Business Owner • Verified Partner
          </p>
        </div>
      </div>

      {/* Layout Split: Content on Left, Summary Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Details Cards (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Date</span>
                <span className="text-xs font-bold text-textMain leading-snug">{formatDate(gig.eventDate)}</span>
              </div>
            </div>

            {/* Time Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Time</span>
                <span className="text-xs font-bold text-textMain leading-snug">{gig.startTime}</span>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Location</span>
                <span className="text-xs font-bold text-textMain leading-snug break-words">{gig.location}</span>
              </div>
            </div>
          </div>

          {/* Roles Table Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-textMain">Roles Available</h2>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-bold text-secondary uppercase">Role Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary uppercase w-32">Pay</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary uppercase w-32 text-center">Spots Left</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary uppercase w-28 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {gig.roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50/20">
                    <td className="px-6 py-4 font-semibold text-textMain">
                      {role.roleName}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      ${role.payPerPerson}/hr
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase tracking-wider text-[10px]">
                        {role.spots} {role.spots === 1 ? 'spot' : 'spots'} left
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const app = userApplications.find((a) => a.roleId === role.id);
                        if (app) {
                          if (app.status === 'pending') {
                            return (
                              <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-500 font-bold rounded-lg border border-gray-200 cursor-not-allowed">
                                Requested
                              </span>
                            );
                          }
                          if (app.status === 'accepted') {
                            return (
                              <span className="inline-block px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 cursor-not-allowed">
                                Accepted
                              </span>
                            );
                          }
                          if (app.status === 'rejected') {
                            return (
                              <span className="inline-block px-3 py-1.5 bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200 cursor-not-allowed">
                                Rejected
                              </span>
                            );
                          }
                        }
                        return (
                          <button
                            onClick={() => handleApplyClick(role.id, role.roleName)}
                            className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-[#575727] transition-all shadow-sm active:scale-95"
                          >
                            Apply
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Description Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-textMain">About this Gig</h2>
            <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
              {gig.description}
            </p>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="space-y-6">
          {/* Gig Summary Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Gig Summary</h3>

            <div className="space-y-4">
              {/* Team Size */}
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-secondary border border-gray-100 flex-shrink-0">
                  <SparklesIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Team Size</span>
                  <span className="text-xs font-bold text-textMain">{totalSpots} Members Total</span>
                </div>
              </div>

              {/* Insurance */}
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-secondary border border-gray-100 flex-shrink-0">
                  <ShieldCheckIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Insurance</span>
                  <span className="text-xs font-bold text-textMain">Provider Covered</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => showToast('Share functionality coming soon!', 'info')}
                className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-[#575727] transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                Share Gig
              </button>
              <button
                onClick={() => showToast('Report filed. We will review this listing.', 'warning')}
                className="w-full py-2.5 bg-white border border-gray-200 text-secondary hover:text-rose-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Report Listing
              </button>
            </div>
          </div>

          {/* Map Preview Box */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Map Preview</h3>
            
            {/* Mock Map Drawing */}
            <div className="h-44 bg-blue-50 border border-blue-100 rounded-xl relative flex items-center justify-center overflow-hidden">
              {/* Stylized mock map grid patterns */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute inset-x-0 h-0.5 bg-indigo-500/20 top-1/2 -translate-y-1/2" />
              <div className="absolute inset-y-0 w-0.5 bg-indigo-500/20 left-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col items-center gap-1 text-center p-4">
                <div className="w-9 h-9 rounded-full bg-rose-600 shadow-md flex items-center justify-center text-white animate-bounce">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-textMain uppercase bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100 max-w-[200px] truncate">
                  {gig.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;

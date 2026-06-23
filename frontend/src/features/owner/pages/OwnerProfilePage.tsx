import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ownerProfileService from '../services/profile.service';
import type { OwnerProfileResponseDTO } from '../../../types/api.types';
import authService from '../../auth/services/auth.service';
import {
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  LightBulbIcon,
  StarIcon,
  PencilIcon,
  BuildingOffice2Icon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';

const OwnerProfilePage: React.FC = () => {
  const { user, loginState } = useAuth();
  const [profile, setProfile] = useState<OwnerProfileResponseDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
  // Contact info states
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await ownerProfileService.getOwnerProfile();
      if (data) {
        setProfile(data);
        setBusinessName(data.businessName || '');
        setIndustry(data.industry || '');
        setCompanySize(data.companySize || '');
        // Clean website prefix for input
        let cleanWebsite = data.website || '';
        if (cleanWebsite.startsWith('https://')) {
          cleanWebsite = cleanWebsite.replace('https://', '');
        } else if (cleanWebsite.startsWith('http://')) {
          cleanWebsite = cleanWebsite.replace('http://', '');
        }
        setWebsite(cleanWebsite);
        setDescription(data.description || '');
        setLocation(data.location || '');
      }
      if (user) {
        setOwnerName(user.name || '');
        setPhoneNumber(user.phone || '');
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    if (!ownerName.trim()) {
      setError('Name is required');
      setIsSaving(false);
      return;
    }

    // Format website with https prefix
    let formattedWebsite = website;
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      formattedWebsite = `https://${website}`;
    }

    try {
      const result = await ownerProfileService.setupOwnerProfile({
        name: ownerName,
        phone: phoneNumber,
        businessName,
        industry,
        companySize,
        website: formattedWebsite,
        description,
        location,
      });

      // Update local auth context
      const token = localStorage.getItem('accessToken') || '';
      if (result.data?.user) {
        loginState(result.data.user, token);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await authService.changePassword({ oldPassword, newPassword });
      setSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <ArrowPathIcon className="animate-spin w-8 h-8 text-[#6b704c]" />
      </div>
    );
  }

  // --- VIEW MODE ---
  if (!isEditing) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
        {/* Top Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-textMain tracking-tight">Business Profile</h1>
          <button
            onClick={() => {
              setIsEditing(true);
              setError('');
              setSuccess('');
            }}
            className="flex items-center gap-2 bg-[#6b704c] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#5a5e3f] transition-colors text-sm shadow-sm"
          >
            <PencilIcon className="w-4 h-4 text-white" />
            Edit Profile
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm flex items-center gap-2 border border-green-100">
            <CheckCircleIcon className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Business Header Card */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-6 shadow-sm border border-gray-100">
          <div className="w-24 h-24 rounded-2xl bg-[#8c946b] overflow-hidden flex-shrink-0 flex items-center justify-center text-white relative">
            <BuildingOffice2Icon className="w-12 h-12 text-white/90" />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-textMain tracking-tight">{profile?.businessName || 'Grand Hotel Events'}</h2>
              <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold tracking-wider uppercase">
                Verified Business
              </span>
            </div>
            <p className="text-secondary text-sm font-medium mt-1">
              Owned by {user?.name || 'Alex Rivera'} {user?.phone && `• ${user.phone}`}
            </p>
            <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-secondary">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-secondary/60" /> {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-secondary/60" /> Joined January 2023
              </span>
            </div>
          </div>
        </div>

        {/* Main Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-textMain mb-5 pb-3 border-b border-gray-100">
                Business Information
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <span className="text-xs font-bold text-secondary tracking-wider uppercase col-span-1">Bio</span>
                  <p className="text-sm text-textMain col-span-3 leading-relaxed">
                    {profile?.description || 'Premier event hosting and management services in the heart of NYC.'}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <span className="text-xs font-bold text-secondary tracking-wider uppercase col-span-1">Industry</span>
                  <span className="text-sm text-textMain col-span-3 font-medium">
                    {profile?.industry || 'Hospitality & Events'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <span className="text-xs font-bold text-secondary tracking-wider uppercase col-span-1">Company Size</span>
                  <span className="text-sm text-textMain col-span-3 font-medium">
                    {profile?.companySize || '50-200 Employees'}
                  </span>
                </div>
                {profile?.website && (
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="text-xs font-bold text-secondary tracking-wider uppercase col-span-1">Website</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6b704c] hover:underline text-sm font-medium col-span-3 truncate"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Settings Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-textMain mb-4">Payment Settings</h3>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#635bff] flex items-center justify-center text-white font-black text-xl select-none">
                    S
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-textMain leading-tight">Stripe Account</h4>
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Connected</span>
                  </div>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-[#635bff]" />
              </div>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Last Payout</span>
                  <span className="font-bold text-textMain">$2,450.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Pending</span>
                  <span className="font-bold text-textMain">$840.00</span>
                </div>
              </div>
              <button className="mt-5 w-full py-2.5 bg-white border border-gray-200 text-textMain text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                Manage Payouts
              </button>
            </div>

            {/* Pro Tip Card */}
            <div className="bg-[#f4f4ef] rounded-2xl p-6 border border-[#6b704c]/10 flex gap-3 items-start">
              <LightBulbIcon className="w-5 h-5 text-[#6b704c] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-textMain tracking-wide uppercase">Pro Tip</h4>
                <p className="text-[12px] text-secondary mt-1.5 leading-relaxed">
                  A complete profile with a professional bio and website link increases gig application rates by 35%.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Performance Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Total Gigs</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-textMain">142</span>
              <span className="text-xs font-bold text-green-600">+12 this month</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Completed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-textMain">138</span>
              <span className="text-xs font-bold text-secondary">97% success rate</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Avg Rating</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-textMain">4.9</span>
              <span className="text-xs text-secondary font-medium flex items-center gap-1">
                <StarIcon className="w-3.5 h-3.5 text-yellow-400" /> Based on 84 reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EDIT MODE ---
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
      {/* Edit Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-textMain tracking-tight">Edit Business Profile</h1>
          <p className="text-sm text-secondary mt-0.5">Update your business presence and contact details.</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setError('');
            setSuccess('');
          }}
          className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-textMain px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Profile
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm flex items-center gap-2 border border-green-100">
          <CheckCircleIcon className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Main Forms */}
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        {/* Section 1: Business Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-base font-bold text-textMain flex items-center gap-2 pb-3 border-b border-gray-100">
            <BuildingOffice2Icon className="w-5 h-5 text-secondary" />
            Business Details
          </h2>
          
          {/* Logo Upload Placeholder */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-secondary relative cursor-pointer hover:bg-gray-100 transition-colors">
              <BuildingOffice2Icon className="w-6 h-6 text-secondary/40" />
            </div>
            <div>
              <p className="text-xs font-bold text-textMain">Business Logo</p>
              <p className="text-[11px] text-secondary mt-0.5">PNG, JPG up to 5MB. Recommended size 480x480px.</p>
              <button type="button" className="text-xs text-[#6b704c] font-bold hover:underline mt-1">Upload new</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Industry</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology & SaaS"
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Website</label>
            <div className="flex rounded-lg shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-secondary text-sm">
                https://
              </span>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.example.com"
                className="flex-1 block w-full rounded-none rounded-r-lg border-gray-200 focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-base font-bold text-textMain flex items-center gap-2 pb-3 border-b border-gray-100">
            <UserIcon className="w-5 h-5 text-secondary" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Owner Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border-gray-200 bg-gray-50 text-secondary shadow-sm text-sm cursor-not-allowed"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <PhoneIcon className="w-4 h-4 text-secondary" />
                </span>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Location</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <MapPinIcon className="w-4 h-4 text-secondary" />
                </span>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: About the Business */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-base font-bold text-textMain flex items-center gap-2 pb-3 border-b border-gray-100">
            <BuildingOffice2Icon className="w-5 h-5 text-secondary" />
            About the Business
          </h2>
          <div>
            <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Business Bio / Description</label>
            <textarea
              rows={4}
              maxLength={500}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
            />
            <span className="block text-[11px] text-secondary text-right mt-1">
              Maximum 500 characters
            </span>
          </div>
        </div>

        {/* Bottom Actions for profile edit form */}
        <div className="flex justify-end items-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-sm font-semibold text-secondary hover:text-textMain"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#6b704c] text-white rounded-lg text-sm font-bold hover:bg-[#5a5e3f] disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Section 4: Security (Password Form) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-base font-bold text-textMain flex items-center gap-2 pb-3 border-b border-gray-100">
          <LockClosedIcon className="w-5 h-5 text-secondary" />
          Security
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full max-w-md rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textMain uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-[#6b704c] focus:border-[#6b704c] text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#6b704c] text-white rounded-lg text-sm font-bold hover:bg-[#5a5e3f] transition-colors shadow-sm"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerProfilePage;

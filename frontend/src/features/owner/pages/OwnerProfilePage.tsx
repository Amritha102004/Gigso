import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ownerProfileService from '../services/profile.service';
import type { OwnerProfileResponseDTO } from '../../../types/api.types';
import authService from '../../auth/services/auth.service';
import InputField from '../../../components/InputField';
import { useToast } from '../../../context/ToastContext';
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
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<OwnerProfileResponseDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  // Contact info states
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Password states
  const [profileErrors, setProfileErrors] = useState<{
    ownerName?: string;
    phoneNumber?: string;
    businessName?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    description?: string;
    location?: string;
  }>({});

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

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
        setProfileImage(user.profileImage || '');
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, WEBP, and GIF images are allowed', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size cannot exceed 5MB', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const res = await authService.uploadImage(file);
      setProfileImage(res.url);
      showToast('Profile image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetFormFields = () => {
    setError('');
    setSuccess('');
    setProfileErrors({});
    if (profile) {
      setBusinessName(profile.businessName || '');
      setIndustry(profile.industry || '');
      setCompanySize(profile.companySize || '');
      let cleanWebsite = profile.website || '';
      if (cleanWebsite.startsWith('https://')) {
        cleanWebsite = cleanWebsite.replace('https://', '');
      } else if (cleanWebsite.startsWith('http://')) {
        cleanWebsite = cleanWebsite.replace('http://', '');
      }
      setWebsite(cleanWebsite);
      setDescription(profile.description || '');
      setLocation(profile.location || '');
    }
    if (user) {
      setOwnerName(user.name || '');
      setPhoneNumber(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProfileErrors({});
    setIsSaving(true);

    const errors: typeof profileErrors = {};
    if (!ownerName.trim()) {
      errors.ownerName = 'Full name is required';
    }
    if (phoneNumber && !/^\+?[0-9\s-()]{10,20}$/.test(phoneNumber)) {
      errors.phoneNumber = 'Enter a valid phone number';
    }
    if (!businessName.trim()) {
      errors.businessName = 'Business name is required';
    }
    if (!industry.trim()) {
      errors.industry = 'Industry is required';
    }
    if (!companySize.trim()) {
      errors.companySize = 'Company size is required';
    }
    if (!location.trim()) {
      errors.location = 'Location is required';
    }
    if (!description.trim()) {
      errors.description = 'Description is required';
    }

    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) {
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
        phone: phoneNumber || undefined,
        profileImage: profileImage || undefined,
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

      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const validatePasswordChange = () => {
    const errors: typeof passwordErrors = {};
    if (!oldPassword) {
      errors.oldPassword = 'Current password is required';
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      if (newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      } else if (!/[0-9]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least one number';
      } else if (!/[A-Z]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least one uppercase letter';
      } else if (!/[!@#$%^&*]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least one special character (!@#$%^&*)';
      }
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'New passwords do not match';
    }
    return errors;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    const errors = validatePasswordChange();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      await authService.changePassword({ oldPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
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
              resetFormFields();
              setIsEditing(true);
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

        {/* Business Header Card */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-6 shadow-sm border border-gray-100">
          <div className="w-24 h-24 rounded-2xl bg-[#8c946b] overflow-hidden flex-shrink-0 flex items-center justify-center text-white relative">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <BuildingOffice2Icon className="w-12 h-12 text-white/90" />
            )}
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
            resetFormFields();
            setIsEditing(false);
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
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center text-secondary relative cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {profileImage ? (
                <img src={profileImage} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <BuildingOffice2Icon className="w-6 h-6 text-secondary/40" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-textMain">Business Logo</p>
              <p className="text-[11px] text-secondary mt-0.5">PNG, JPG up to 5MB. Recommended size 480x480px.</p>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#6b704c] font-bold hover:underline mt-1"
              >
                Upload new
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange}
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="owner-business-name"
              label="Business Name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              error={profileErrors.businessName}
            />
            <InputField
              id="owner-industry"
              label="Industry"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Hospitality & Events"
              error={profileErrors.industry}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-textMain mb-1.5 flex justify-between">Website</label>
            <div className="flex rounded-lg shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-secondary text-sm">
                https://
              </span>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.example.com"
                className={`flex-1 block w-full rounded-none rounded-r-lg border border-gray-200 focus:ring-[#6b704c] focus:border-[#6b704c] text-sm ${
                  profileErrors.website ? 'border-red-400 focus:border-red-500' : ''
                }`}
              />
            </div>
            {profileErrors.website && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {profileErrors.website}
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-base font-bold text-textMain flex items-center gap-2 pb-3 border-b border-gray-100">
            <UserIcon className="w-5 h-5 text-secondary" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="owner-name"
              label="Owner Name"
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              error={profileErrors.ownerName}
            />
            <InputField
              id="owner-email"
              label="Email Address"
              type="email"
              value={user?.email || ''}
              disabled
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="owner-phone"
              label="Phone Number"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={profileErrors.phoneNumber}
            />
            <InputField
              id="owner-location"
              label="Location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={profileErrors.location}
            />
          </div>
        </div>

        {/* Section 3: About the Business */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-base font-bold text-textMain flex items-center gap-2 pb-3 border-b border-gray-100">
            <BuildingOffice2Icon className="w-5 h-5 text-secondary" />
            About the Business
          </h2>
          <div className="flex flex-col mb-4">
            <label htmlFor="owner-description" className="text-sm font-semibold text-textMain mb-1.5 flex justify-between">
              Business Bio / Description
            </label>
            <textarea
              id="owner-description"
              rows={4}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-1 shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                profileErrors.description
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-[#6b704c] focus:ring-[#6b704c]'
              }`}
            />
            <div className="flex justify-between mt-1">
              {profileErrors.description ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {profileErrors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="block text-[11px] text-secondary">
                Maximum 500 characters
              </span>
            </div>
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
          <div className="max-w-md text-left">
            <InputField
              id="owner-current-password"
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              error={passwordErrors.oldPassword}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <InputField
                id="owner-new-password"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                error={passwordErrors.newPassword}
              />
            </div>
            <div>
              <InputField
                id="owner-confirm-password"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Min. 8 characters"
                error={passwordErrors.confirmPassword}
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

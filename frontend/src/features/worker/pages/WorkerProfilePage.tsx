import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import workerProfileService from '../services/profile.service';
import type { WorkerProfileResponseDTO } from '../../../types/api.types';
import authService from '../../auth/services/auth.service';
import InputField from '../../../components/InputField';
import LocationAutocomplete from '../../../components/LocationAutocomplete';
import { useToast } from '../../../context/ToastContext';
import { MapPinIcon, PencilSquareIcon, StarIcon, PhoneIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { getErrorMessage } from '../../../utils/error';
import apiClient from '../../../api/client';

const WorkerProfilePage: React.FC = () => {
  const { user, token, loginState } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<WorkerProfileResponseDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  
  // Review states
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [reviews, setReviews] = useState<any[]>([]);

  const handleStripeOnboard = async () => {
    try {
      setIsOnboarding(true);
      const res = await apiClient.post('/payments/connect');
      if (res.data && res.data.data && res.data.data.url) {
        window.location.href = res.data.data.url;
      } else {
        showToast('Failed to generate onboarding URL', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting with Stripe', 'error');
    } finally {
      setIsOnboarding(false);
    }
  };

  // Edit states
  const [workerName, setWorkerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [portfolioStr, setPortfolioStr] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const [profileErrors, setProfileErrors] = useState<{
    workerName?: string;
    phoneNumber?: string;
    age?: string;
    location?: string;
    skillsStr?: string;
    portfolioStr?: string;
    bio?: string;
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


  useEffect(() => {
    fetchProfile();
    const checkStripeConnection = async () => {
      if (user && user.stripeAccountId && !user.stripeOnboardingCompleted) {
        try {
          const res = await apiClient.get('/payments/connect/status');
          if (res.data && res.data.success && res.data.data?.stripeOnboardingCompleted) {
            showToast('Stripe Connected Account successfully verified!', 'success');
            const localToken = token || localStorage.getItem('accessToken');
            if (res.data.data.user && localToken) {
              loginState(res.data.data.user, localToken);
            }
          }
        } catch (err) {
          console.error("Auto check stripe connect status failed:", err);
        }
      }
    };
    checkStripeConnection();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await workerProfileService.getWorkerProfile();
      if (data) {
        setProfile(data);
        setSkillsStr(data.skills.join(', '));
        setPortfolioStr(data.portfolio?.join(', ') || '');
        setAge(data.age || '');
        setBio(data.bio || '');
        setLocation(data.location || '');
      }
      if (user) {
        setWorkerName(user.name || '');
        setPhoneNumber(user.phone || '');
        setProfileImage(user.profileImage || '');

        const userId = user._id || user.id;
        if (userId) {
          try {
            const summaryRes = await apiClient.get(`/reviews/summary/${userId}`);
            if (summaryRes.data && summaryRes.data.success) {
              setRatingSummary(summaryRes.data.data.summary);
            }
            const reviewsRes = await apiClient.get(`/reviews/user/${userId}`);
            if (reviewsRes.data && reviewsRes.data.success) {
              setReviews(reviewsRes.data.data.reviews || []);
            }
          } catch (revErr) {
            console.error("Failed to load reviews:", revErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load profile", err);
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
    } catch (err: unknown) {
      showToast(getErrorMessage(err, 'Failed to upload image'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetFormFields = () => {
    setError('');
    setProfileErrors({});
    if (profile) {
      setSkillsStr(profile.skills.join(', '));
      setPortfolioStr(profile.portfolio?.join(', ') || '');
      setAge(profile.age || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
    }
    if (user) {
      setWorkerName(user.name || '');
      setPhoneNumber(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProfileErrors({});
    setIsSaving(true);
    
    const errors: typeof profileErrors = {};
    if (!workerName.trim()) {
      errors.workerName = 'Full name is required';
    }
    if (age !== '' && (isNaN(Number(age)) || Number(age) < 18 || Number(age) > 100)) {
      errors.age = 'Age must be between 18 and 100';
    }
    if (phoneNumber && !/^\+?[0-9\s-()]{10,20}$/.test(phoneNumber)) {
      errors.phoneNumber = 'Enter a valid phone number';
    }
    if (!skillsStr.trim()) {
      errors.skillsStr = 'Skills are required';
    }
    if (!location.trim()) {
      errors.location = 'Location is required';
    }
    if (!bio.trim()) {
      errors.bio = 'Bio is required';
    }

    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) {
      setIsSaving(false);
      return;
    }

    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const portfolio = portfolioStr.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const result = await workerProfileService.setupWorkerProfile({
        name: workerName,
        phone: phoneNumber || undefined,
        profileImage: profileImage || undefined,
        skills,
        portfolio: portfolio.length > 0 ? portfolio : undefined,
        age: Number(age),
        bio,
        location
      });

      // Update local auth context
      const token = localStorage.getItem('accessToken') || '';
      if (result.data?.user) {
        loginState(result.data.user, token);
      }

      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
      fetchProfile();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update profile'));
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
      await authService.changePassword({ currentPassword: oldPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      showToast(getErrorMessage(err, 'Failed to change password'), 'error');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  // --- VIEW MODE ---
  if (!isEditing) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl p-6 flex items-start justify-between shadow-sm border border-gray-100">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-textMain">{user?.name}</h1>
              <p className="text-secondary mt-1 flex items-center gap-2 text-sm">
                 {profile?.skills[0] ? `• ${profile.skills[0]} Specialist` : ''}
              </p>
              <p className="text-secondary mt-2 flex items-center gap-1 text-sm">
                <MapPinIcon className="w-4 h-4 text-gray-400" /> {profile?.location || 'No location set'}
              </p>
              {user?.phone && (
                <p className="text-secondary mt-1 flex items-center gap-1 text-sm">
                  <PhoneIcon className="w-4 h-4 text-gray-400" /> {user.phone}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              resetFormFields();
              setIsEditing(true);
            }}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* About Me */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                 About Me
              </h2>
              <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
                {profile?.bio || 'No bio provided.'}
              </p>
            </div>

            {/* Recent Gigs (Mocked) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-textMain">Recent Gigs</h2>
                <button className="text-sm text-primary hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-gray-50 rounded-xl hover:shadow-sm transition-shadow">
                    <div>
                      <h3 className="font-semibold text-textMain">Sample Gig {i}</h3>
                      <p className="text-xs text-secondary mt-1">Lead Role • {i} days ago</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  </div>
                ))}
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
                    {user?.stripeOnboardingCompleted ? (
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Connected</span>
                    ) : (
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Not Connected</span>
                    )}
                  </div>
                </div>
                {user?.stripeOnboardingCompleted && (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                )}
              </div>
              {!user?.stripeOnboardingCompleted && (
                <p className="text-xs text-secondary mt-3 leading-relaxed">
                  To apply for gigs and receive payouts, you must link your Stripe account.
                </p>
              )}
              <button
                onClick={handleStripeOnboard}
                disabled={isOnboarding}
                className="mt-4 w-full py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isOnboarding ? 'Connecting...' : user?.stripeOnboardingCompleted ? 'Update Stripe Connect' : 'Setup Connect Account'}
              </button>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-textMain mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-textMain rounded-lg text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-secondary">No skills added.</p>
                )}
              </div>
            </div>

            {/* Performance (Real data) */}
            <div className="bg-primary rounded-2xl p-6 text-white shadow-sm">
              <h2 className="text-lg font-bold mb-4">Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Rating</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {ratingSummary.average > 0 ? ratingSummary.average : 'N/A'} 
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Total Reviews</p>
                  <p className="text-2xl font-bold">{ratingSummary.count}</p>
                </div>
              </div>
            </div>

            {/* Portfolio Links */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-textMain mb-4">Portfolio</h2>
              {profile?.portfolio && profile.portfolio.length > 0 ? (
                <ul className="space-y-2">
                  {profile.portfolio.map((link, idx) => (
                    <li key={idx}>
                      <a href={link} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm break-all">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-secondary">No portfolio links added.</p>
              )}
            </div>

            {/* Reviews & Feedback List Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-textMain mb-4">Reviews & Feedback</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-secondary italic">No reviews received yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev: any) => (
                    <div key={rev._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-textMain">{rev.reviewerId?.name || 'Anonymous'}</span>
                          <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">
                            ({rev.reviewerId?.role})
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating ? 'text-amber-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-secondary mt-1 leading-relaxed whitespace-pre-line">
                        {rev.comment || 'No comment provided.'}
                      </p>
                      <span className="text-[9px] text-gray-400 block mt-1.5">
                        Gig: {rev.gigId?.title || 'Creative Task'} &middot; {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EDIT MODE ---
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Edit Profile</h1>
          <p className="text-sm text-secondary">Manage your public information and account security.</p>
        </div>
        <button
          onClick={() => {
            resetFormFields();
            setIsEditing(false);
          }}
          className="text-sm font-medium text-secondary hover:text-textMain"
        >
          Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-textMain mb-6">Profile Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer overflow-hidden group bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 text-white text-[10px] font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                Upload Photo
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange}
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="worker-name"
              label="Full Name"
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              error={profileErrors.workerName}
            />
            <InputField
              id="worker-phone"
              label="Phone Number"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              error={profileErrors.phoneNumber}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="worker-age"
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              error={profileErrors.age}
            />
            <LocationAutocomplete
              id="worker-location"
              label="Location"
              value={location}
              onChange={(val) => setLocation(val)}
              error={profileErrors.location}
            />
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="worker-bio" className="text-sm font-semibold text-textMain mb-1.5 flex justify-between">
              Short Bio
            </label>
            <textarea
              id="worker-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-1 shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                profileErrors.bio
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-primary focus:ring-primary'
              }`}
            />
            {profileErrors.bio && (
              <p id="worker-bio-error" className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {profileErrors.bio}
              </p>
            )}
          </div>

          <InputField
            id="worker-skills"
            label="Skills (comma separated)"
            type="text"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            error={profileErrors.skillsStr}
          />

          <InputField
            id="worker-portfolio"
            label="Portfolio Links (comma separated)"
            type="text"
            value={portfolioStr}
            onChange={(e) => setPortfolioStr(e.target.value)}
            error={profileErrors.portfolioStr}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-textMain"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-textMain mb-6">Security & Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="max-w-md">
            <InputField
              id="worker-current-password"
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              error={passwordErrors.oldPassword}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <InputField
                id="worker-new-password"
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
                id="worker-confirm-password"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Min. 8 characters"
                error={passwordErrors.confirmPassword}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerProfilePage;

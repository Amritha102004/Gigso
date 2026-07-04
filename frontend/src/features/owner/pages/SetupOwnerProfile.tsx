import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ownerProfileService from '../services/profile.service';
import authService from '../../auth/services/auth.service';
import InputField from '../../../components/InputField';
import { useToast } from '../../../context/ToastContext';

const SetupOwnerProfile: React.FC = () => {
  const { user, loginState } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    businessName?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    description?: string;
    location?: string;
  }>({});

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, WEBP, and GIF images are allowed', 'error');
      return;
    }

    // Validate size (5MB)
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

  const validate = () => {
    const errors: typeof fieldErrors = {};
    const nameRegex = /^[\p{L}\s'\-.]+$/u;
    const hasAlphanumericRegex = /[\p{L}\p{N}]/u;
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (!nameRegex.test(fullName.trim())) {
      errors.fullName = 'Name can only contain letters, spaces, hyphens, or apostrophes';
    }

    if (phone && !phoneRegex.test(phone.trim())) {
      errors.phone = 'Phone must be a valid number (7–15 digits, optional + prefix)';
    }

    if (!businessName.trim()) {
      errors.businessName = 'Business name is required';
    } else if (!nameRegex.test(businessName.trim())) {
      errors.businessName = 'Business name can only contain letters, spaces, hyphens, or apostrophes';
    }

    if (!industry.trim()) {
      errors.industry = 'Industry is required';
    } else if (!nameRegex.test(industry.trim())) {
      errors.industry = 'Industry can only contain letters, spaces, hyphens, or apostrophes';
    }

    if (!companySize) {
      errors.companySize = 'Company size is required';
    }

    if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(website.trim())) {
      errors.website = 'Must be a valid URL (starting with http:// or https://)';
    }

    if (!location.trim()) {
      errors.location = 'Location is required';
    } else if (!hasAlphanumericRegex.test(location.trim())) {
      errors.location = 'Location must contain at least one letter or digit';
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    } else if (description.trim().length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters';
    } else if (!hasAlphanumericRegex.test(description.trim())) {
      errors.description = 'Description must contain at least one letter or digit';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ownerProfileService.setupOwnerProfile({
        name: fullName.trim(),
        phone: phone.trim() || undefined,
        profileImage: profileImage || undefined,
        businessName: businessName.trim(),
        industry: industry.trim(),
        companySize,
        website: website.trim() || undefined,
        description: description.trim(),
        location: location.trim(),
      });

      const token = localStorage.getItem('accessToken') || '';
      if (result.data?.user) {
        loginState(result.data.user, token);
      }

      showToast('Profile setup completed successfully!', 'success');
      navigate('/owner/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to setup profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-textMain">
          Setup Owner Profile
        </h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Tell us about your business to start posting gigs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <label className="block text-sm font-semibold text-textMain mb-2">
                Profile Photo
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer overflow-hidden group bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
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

            <InputField
              id="setup-fullName"
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              error={fieldErrors.fullName}
            />

            <InputField
              id="setup-phone"
              label="Phone Number"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              error={fieldErrors.phone}
            />

            <InputField
              id="setup-businessName"
              label="Business Name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name"
              error={fieldErrors.businessName}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="setup-industry"
                label="Industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology"
                error={fieldErrors.industry}
              />

              <div className="flex flex-col mb-4">
                <label htmlFor="setup-companySize" className="text-sm font-semibold text-textMain mb-1.5">
                  Company Size <span className="text-red-500">*</span>
                </label>
                <select
                  id="setup-companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-1 shadow-sm hover:border-gray-300 ${
                    fieldErrors.companySize
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-primary focus:ring-primary'
                  }`}
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
                {fieldErrors.companySize && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.companySize}
                  </p>
                )}
              </div>
            </div>

            <InputField
              id="setup-website"
              label="Website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              error={fieldErrors.website}
            />

            <InputField
              id="setup-location"
              label="Location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              error={fieldErrors.location}
            />

            <div className="flex flex-col mb-4">
              <label htmlFor="setup-description" className="text-sm font-semibold text-textMain mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="setup-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell workers about your business..."
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-1 shadow-sm hover:border-gray-300 ${
                  fieldErrors.description
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-primary'
                }`}
              />
              {fieldErrors.description && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupOwnerProfile;

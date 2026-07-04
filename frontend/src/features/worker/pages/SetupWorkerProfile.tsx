import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import workerProfileService from '../services/profile.service';
import authService from '../../auth/services/auth.service';
import InputField from '../../../components/InputField';
import { useToast } from '../../../context/ToastContext';

const SetupWorkerProfile: React.FC = () => {
  const { user, loginState } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [portfolioStr, setPortfolioStr] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    skills?: string;
    portfolio?: string;
    age?: string;
    bio?: string;
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

    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    if (skills.length === 0) {
      errors.skills = 'At least one skill is required';
    } else {
      const invalidSkill = skills.find(s => !nameRegex.test(s));
      if (invalidSkill) {
        errors.skills = 'Skills can only contain letters, spaces, hyphens, or apostrophes';
      }
    }

    const portfolio = portfolioStr.split(',').map(s => s.trim()).filter(Boolean);
    if (portfolio.length > 0) {
      const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
      const invalidUrl = portfolio.find(url => !urlRegex.test(url));
      if (invalidUrl) {
        errors.portfolio = 'Each portfolio entry must be a valid URL';
      }
    }

    if (age === '') {
      errors.age = 'Age is required';
    } else if (!Number.isInteger(age) || age < 18 || age > 80) {
      errors.age = 'Age must be a whole number between 18 and 80';
    }

    if (!location.trim()) {
      errors.location = 'Location is required';
    } else if (location.trim().length < 2) {
      errors.location = 'Location must be at least 2 characters';
    } else if (!hasAlphanumericRegex.test(location.trim())) {
      errors.location = 'Location must contain at least one letter or digit';
    }

    if (!bio.trim()) {
      errors.bio = 'Bio is required';
    } else if (bio.trim().length < 10) {
      errors.bio = 'Bio must be at least 10 characters long';
    } else if (bio.trim().length > 1000) {
      errors.bio = 'Bio cannot exceed 1000 characters';
    } else if (!hasAlphanumericRegex.test(bio.trim())) {
      errors.bio = 'Bio must contain at least one letter or digit';
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

    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const portfolio = portfolioStr.split(',').map(s => s.trim()).filter(Boolean);

    setIsLoading(true);
    try {
      const result = await workerProfileService.setupWorkerProfile({
        name: fullName.trim(),
        phone: phone.trim() || undefined,
        profileImage: profileImage || undefined,
        skills,
        portfolio: portfolio.length > 0 ? portfolio : undefined,
        age: Number(age),
        bio: bio.trim(),
        location: location.trim(),
      });

      const token = localStorage.getItem('accessToken') || '';
      if (result.data?.user) {
        loginState(result.data.user, token);
      }

      showToast('Profile setup completed successfully!', 'success');
      navigate('/worker/home');
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
          Setup Worker Profile
        </h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Tell us about your skills and experience to find gigs
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
              id="setup-skills"
              label="Skills (comma separated)"
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="React, Node.js, Design"
              error={fieldErrors.skills}
            />

            <InputField
              id="setup-portfolio"
              label="Portfolio URLs (comma separated)"
              type="text"
              value={portfolioStr}
              onChange={(e) => setPortfolioStr(e.target.value)}
              placeholder="https://github.com/myname"
              error={fieldErrors.portfolio}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="setup-age"
                label="Age"
                type="text"
                value={age === '' ? '' : String(age)}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="18"
                error={fieldErrors.age}
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
            </div>

            <div className="flex flex-col mb-4">
              <label htmlFor="setup-bio" className="text-sm font-semibold text-textMain mb-1.5">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="setup-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell owners about yourself..."
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-1 shadow-sm hover:border-gray-300 ${
                  fieldErrors.bio
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-primary'
                }`}
              />
              {fieldErrors.bio && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.bio}
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

export default SetupWorkerProfile;

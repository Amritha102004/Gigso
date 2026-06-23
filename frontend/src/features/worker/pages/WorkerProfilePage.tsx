import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import profileService from '../../user/services/profile.service';
import type { WorkerProfilePayload } from '../../user/services/profile.service';
import authService from '../../auth/services/auth.service';
import { MapPinIcon, PencilSquareIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const WorkerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<WorkerProfilePayload | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Edit states
  const [skillsStr, setSkillsStr] = useState('');
  const [portfolioStr, setPortfolioStr] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

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
      const data = await profileService.getWorkerProfile();
      if (data) {
        setProfile(data);
        setSkillsStr(data.skills.join(', '));
        setPortfolioStr(data.portfolio?.join(', ') || '');
        setAge(data.age);
        setBio(data.bio || '');
        setLocation(data.location || '');
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const portfolio = portfolioStr.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await profileService.setupWorkerProfile({
        skills,
        portfolio,
        age: Number(age),
        bio,
        location
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
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
                <MapPinIcon className="w-4 h-4" /> {profile?.location || 'No location set'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* About Me */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                 About Me
              </h2>
              <p className="text-secondary text-sm leading-relaxed">
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
            {/* Skills */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-textMain mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile?.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-textMain rounded-lg text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance (Mocked) */}
            <div className="bg-primary rounded-2xl p-6 text-white shadow-sm">
              <h2 className="text-lg font-bold mb-4">Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Rating</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    4.9 <StarIcon className="w-5 h-5 text-yellow-400" />
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Gigs Done</p>
                  <p className="text-2xl font-bold">124</p>
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
          onClick={() => setIsEditing(false)}
          className="text-sm font-medium text-secondary hover:text-textMain"
        >
          Cancel
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/>{success}</div>}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-textMain mb-6">Profile Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-textMain mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-primary focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Short Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-primary focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Skills (comma separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-primary focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Portfolio Links (comma separated)</label>
            <input
              type="text"
              value={portfolioStr}
              onChange={(e) => setPortfolioStr(e.target.value)}
              className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-primary focus:border-primary text-sm"
            />
          </div>

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
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Security Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-textMain mb-6">Security & Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full max-w-md rounded-lg border-gray-200 shadow-sm focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-primary focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-primary focus:border-primary text-sm"
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

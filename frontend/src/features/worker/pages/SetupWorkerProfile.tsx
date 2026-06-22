import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import profileService from '../../user/services/profile.service';

const SetupWorkerProfile: React.FC = () => {
  const { user, loginState } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [skillsStr, setSkillsStr] = useState('');
  const [portfolioStr, setPortfolioStr] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const portfolio = portfolioStr.split(',').map(s => s.trim()).filter(Boolean);

    if (skills.length === 0) {
      setError('At least one skill is required.');
      return;
    }
    if (!age || age < 18) {
      setError('You must be at least 18 years old.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await profileService.setupWorkerProfile({
        skills,
        portfolio,
        age: Number(age),
        bio,
        location
      });
      
      // Update local auth context
      const token = localStorage.getItem('accessToken') || '';
      if (result.data?.user) {
        loginState(result.data.user, token);
      }
      
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup profile');
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
          Tell us about your skills and experience
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="skills" className="block text-sm font-medium leading-6 text-textMain">
                Skills (comma separated)
              </label>
              <div className="mt-2">
                <input
                  id="skills"
                  type="text"
                  required
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="React, Node.js, Design"
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-textMain shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium leading-6 text-textMain">
                Portfolio URLs (comma separated)
              </label>
              <div className="mt-2">
                <input
                  id="portfolio"
                  type="text"
                  value={portfolioStr}
                  onChange={(e) => setPortfolioStr(e.target.value)}
                  placeholder="https://github.com/myname"
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-textMain shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium leading-6 text-textMain">
                  Age
                </label>
                <div className="mt-2">
                  <input
                    id="age"
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-textMain shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium leading-6 text-textMain">
                  Location
                </label>
                <div className="mt-2">
                  <input
                    id="location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-textMain shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium leading-6 text-textMain">
                Bio
              </label>
              <div className="mt-2">
                <textarea
                  id="bio"
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-textMain shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
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

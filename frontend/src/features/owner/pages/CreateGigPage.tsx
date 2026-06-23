import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  TrashIcon, 
  PlusIcon,
  BriefcaseIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import gigService from '../services/gig.service';
import type { CategoryDTO } from '../../../types/api.types';

interface RoleInput {
  roleName: string;
  spots: number;
  payPerPerson: number;
}

const CreateGigPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description, setDescription] = useState('');
  
  // Roles state (default with one empty role row)
  const [roles, setRoles] = useState<RoleInput[]>([
    { roleName: '', spots: 1, payPerPerson: 100 }
  ]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await gigService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategoryId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const addRoleRow = () => {
    setRoles([...roles, { roleName: '', spots: 1, payPerPerson: 100 }]);
  };

  const removeRoleRow = (index: number) => {
    if (roles.length === 1) return;
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleRoleChange = (index: number, field: keyof RoleInput, value: string | number) => {
    const updated = [...roles];
    if (field === 'spots' || field === 'payPerPerson') {
      const numVal = Math.max(0, Number(value));
      updated[index] = { ...updated[index], [field]: numVal };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setRoles(updated);
  };

  // Calculate total budget
  const totalBudget = roles.reduce((sum, r) => sum + (r.spots * r.payPerPerson), 0);

  // Validations
  const validateStep1 = () => {
    if (!title.trim()) return 'Title is required';
    if (!categoryId) return 'Category is required';
    if (!location.trim()) return 'Location is required';
    if (!eventDate) return 'Event Date is required';
    if (!startTime.trim()) return 'Start Time is required';
    if (!description.trim()) return 'Description is required';
    return null;
  };

  const validateStep2 = () => {
    for (let i = 0; i < roles.length; i++) {
      if (!roles[i].roleName.trim()) {
        return `Role #${i + 1} name is required`;
      }
      if (roles[i].spots <= 0) {
        return `Role #${i + 1} spots must be at least 1`;
      }
      if (roles[i].payPerPerson < 0) {
        return `Role #${i + 1} pay per person cannot be negative`;
      }
    }
    return null;
  };

  const handleContinue = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSave = async (isPublishing: boolean) => {
    setError(null);
    const step1Err = validateStep1();
    if (step1Err) {
      setError(step1Err);
      setStep(1);
      return;
    }
    const step2Err = validateStep2();
    if (step2Err) {
      setError(step2Err);
      setStep(2);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title,
        description,
        categoryId,
        location,
        eventDate,
        startTime,
        roles,
        status: (isPublishing ? 'active' : 'draft') as 'active' | 'draft',
      };
      const res = await gigService.createGig(payload);
      if (res.success) {
        navigate('/owner/gigs');
      } else {
        setError(res.message || 'Failed to create gig.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error creating gig.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb / Nav Back */}
      <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
        <span className="hover:text-textMain cursor-pointer" onClick={() => navigate('/owner/gigs')}>Gigs</span>
        <ChevronRightIcon className="w-3 h-3" />
        <span className="text-textMain">Post a Gig</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textMain">Post a New Gig</h1>
        <p className="text-sm text-secondary">Create a job posting, list specific roles, and set rates.</p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step === 1 ? 'bg-primary text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            1
          </span>
          <span className="text-xs font-bold text-textMain">Basic Information</span>
        </div>
        <div className="flex-1 border-t border-dashed border-gray-200" />
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-secondary'
          }`}>
            2
          </span>
          <span className="text-xs font-bold text-textMain">Roles & Rates</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <InformationCircleIcon className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Step 1 Content */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-textMain">1. Gig Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Gig Title</label>
              <input
                type="text"
                placeholder="e.g. Catering Staff for Corporate Gala"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Category</label>
                {categoriesLoading ? (
                  <div className="text-xs text-secondary py-2.5">Loading categories...</div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Hyatt, Ballroom B"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Start Time</label>
                <input
                  type="text"
                  placeholder="e.g. 18:00 or 6:00 PM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Job Description</label>
              <textarea
                rows={5}
                placeholder="Describe the gig details, duties, dress code, or other specific guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={() => navigate('/owner/gigs')}
              className="px-4 py-2 text-xs font-semibold text-secondary hover:text-textMain transition-all"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-textMain transition-all disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-[#575727] transition-all shadow-sm"
              >
                Continue
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Content */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-textMain">2. Roles & Payout Rates</h2>
            <button
              onClick={addRoleRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-primary text-primary hover:bg-primary/5 text-xs font-semibold rounded-lg transition-all"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add Role
            </button>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-4 py-3 text-xs font-bold text-secondary uppercase">Role Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-secondary uppercase w-24">Spots</th>
                  <th className="px-4 py-3 text-xs font-bold text-secondary uppercase w-36">Pay per person ($)</th>
                  <th className="px-4 py-3 text-xs font-bold text-secondary uppercase w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roles.map((role, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/20">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="e.g. Head Bartender"
                        value={role.roleName}
                        onChange={(e) => handleRoleChange(idx, 'roleName', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-textMain focus:border-primary outline-none transition-all bg-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={role.spots}
                        onChange={(e) => handleRoleChange(idx, 'spots', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-textMain focus:border-primary outline-none transition-all text-center bg-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={role.payPerPerson}
                        onChange={(e) => handleRoleChange(idx, 'payPerPerson', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-textMain focus:border-primary outline-none transition-all text-right bg-white"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => removeRoleRow(idx)}
                        disabled={roles.length === 1}
                        className="p-1.5 text-secondary hover:text-rose-600 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Budget Footer */}
          <div className="bg-primary/5 p-4 rounded-xl flex items-center justify-between border border-primary/10">
            <div className="flex items-center gap-2 text-primary">
              <BriefcaseIcon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Estimated Budget</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-primary">${totalBudget.toLocaleString()}</div>
              <div className="text-[10px] text-secondary">Sum of (spots × pay) across all roles</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-secondary hover:text-textMain transition-all"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-textMain transition-all disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-[#575727] transition-all shadow-sm disabled:opacity-50"
              >
                Publish Gig
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGigPage;

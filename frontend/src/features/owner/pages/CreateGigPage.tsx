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
import LocationAutocomplete from '../../../components/LocationAutocomplete';

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
  
  // Track draft ID once created
  const [createdGigId, setCreatedGigId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description, setDescription] = useState('');
  
  // Field-level error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Roles state (default with one empty role row)
  const [roles, setRoles] = useState<RoleInput[]>([
    { roleName: '', spots: 1, payPerPerson: 250 }
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
    setRoles([...roles, { roleName: '', spots: 1, payPerPerson: 250 }]);
  };

  const removeRoleRow = (index: number) => {
    if (roles.length === 1) return;
    setRoles(roles.filter((_, i) => i !== index));
    // Also clear errors associated with the removed row
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[`roleName_${index}`];
      delete copy[`spots_${index}`];
      delete copy[`payPerPerson_${index}`];
      return copy;
    });
  };

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleRoleChange = (index: number, field: keyof RoleInput, value: string | number) => {
    const updated = [...roles];
    if (field === 'spots' || field === 'payPerPerson') {
      const numVal = Math.max(0, Number(value));
      updated[index] = { ...updated[index], [field]: numVal };
    } else {
      updated[index] = { ...updated[index], [field]: value as any };
    }
    setRoles(updated);
    clearError(`${field}_${index}`);
  };

  // Calculate total budget
  const totalBudget = roles.reduce((sum, r) => sum + (r.spots * r.payPerPerson), 0);

  // Validations
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!categoryId) newErrors.categoryId = 'Category is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!eventDate) newErrors.eventDate = 'Event Date is required';
    if (!startTime.trim()) newErrors.startTime = 'Start Time is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    for (let i = 0; i < roles.length; i++) {
      if (!roles[i].roleName.trim()) {
        newErrors[`roleName_${i}`] = 'Role name is required';
      }
      if (roles[i].spots <= 0) {
        newErrors[`spots_${i}`] = 'Spots must be at least 1';
      }
      if (roles[i].payPerPerson < 250) {
        newErrors[`payPerPerson_${i}`] = 'Payout must be at least ₹250';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    const isValid = validateStep1();
    if (!isValid) return;

    try {
      setLoading(true);
      setError(null);

      const basePayload = {
        title,
        description,
        categoryId,
        location,
        eventDate,
        startTime,
      };

      if (!createdGigId) {
        // Create draft (no roles yet)
        const res = await gigService.createGig({
          ...basePayload,
          roles: [],
          status: 'draft',
        });
        if (res.success && res.data) {
          setCreatedGigId(res.data.id);
          setStep(2);
        } else {
          setError(res.message || 'Failed to save draft.');
        }
      } else {
        // Update draft (without roles yet, just base fields)
        const res = await gigService.updateGig(createdGigId, basePayload);
        if (res.success) {
          setStep(2);
        } else {
          setError(res.message || 'Failed to update draft.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving gig draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraftStep1 = async () => {
    const isValid = validateStep1();
    if (!isValid) return;

    try {
      setLoading(true);
      setError(null);

      const basePayload = {
        title,
        description,
        categoryId,
        location,
        eventDate,
        startTime,
      };

      if (!createdGigId) {
        const res = await gigService.createGig({
          ...basePayload,
          roles: [],
          status: 'draft',
        });
        if (res.success) {
          navigate('/owner/gigs');
        } else {
          setError(res.message || 'Failed to save draft.');
        }
      } else {
        const res = await gigService.updateGig(createdGigId, basePayload);
        if (res.success) {
          navigate('/owner/gigs');
        } else {
          setError(res.message || 'Failed to update draft.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving gig draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraftStep2 = async () => {
    const isValid = validateStep2();
    if (!isValid) return;

    if (!createdGigId) {
      setError('No draft found to save. Please return to Step 1.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await gigService.updateGig(createdGigId, { roles });
      if (res.success) {
        navigate('/owner/gigs');
      } else {
        setError(res.message || 'Failed to save draft.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving draft.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishStep2 = async () => {
    const isValid = validateStep2();
    if (!isValid) return;

    if (!createdGigId) {
      setError('No draft found to publish. Please return to Step 1.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // 1. Update roles first
      const updateRes = await gigService.updateGig(createdGigId, { roles });
      if (!updateRes.success) {
        setError(updateRes.message || 'Failed to update gig roles before publishing.');
        return;
      }
      // 2. Publish gig (marks status as active)
      const publishRes = await gigService.publishGig(createdGigId);
      if (publishRes.success) {
        navigate('/owner/gigs');
      } else {
        setError(publishRes.message || 'Failed to publish gig.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error publishing gig.');
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError('title');
                }}
                className={`w-full px-4 py-2.5 border rounded-xl text-xs text-textMain focus:ring-1 focus:ring-primary outline-none transition-all ${
                  errors.title ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                }`}
              />
              {errors.title && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Category</label>
                {categoriesLoading ? (
                  <div className="text-xs text-secondary py-2.5">Loading categories...</div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      clearError('categoryId');
                    }}
                    className={`w-full px-4 py-2.5 border rounded-xl text-xs text-textMain focus:ring-1 focus:ring-primary outline-none bg-white transition-all ${
                      errors.categoryId ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )}
                {errors.categoryId && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.categoryId}</p>}
              </div>
              <div>
                <LocationAutocomplete
                  id="create-gig-location"
                  label="Location"
                  value={location}
                  onChange={(val) => {
                    setLocation(val);
                    clearError('location');
                  }}
                  placeholder="e.g. Grand Hyatt, Ballroom B"
                  wrapperClassName="relative mb-0 flex flex-col"
                  labelClassName="block text-xs font-bold text-secondary mb-1.5 uppercase"
                  inputClassName={`w-full px-4 py-2.5 border rounded-xl text-xs text-textMain focus:ring-1 focus:ring-primary outline-none transition-all ${
                    errors.location ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                  }`}
                />
                {errors.location && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.location}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    clearError('eventDate');
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-xs text-textMain focus:ring-1 focus:ring-primary outline-none transition-all ${
                    errors.eventDate ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                  }`}
                />
                {errors.eventDate && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.eventDate}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    clearError('startTime');
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-xs text-textMain focus:ring-1 focus:ring-primary outline-none transition-all ${
                    errors.startTime ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                  }`}
                />
                {errors.startTime && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.startTime}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5 uppercase">Job Description</label>
              <textarea
                rows={5}
                placeholder="Describe the gig details, duties, dress code, or other specific guidelines..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError('description');
                }}
                className={`w-full px-4 py-2.5 border rounded-xl text-xs text-textMain focus:ring-1 focus:ring-primary outline-none transition-all resize-none ${
                  errors.description ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                }`}
              />
              {errors.description && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.description}</p>}
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
                onClick={handleSaveDraftStep1}
                disabled={loading}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-textMain transition-all disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={handleContinue}
                disabled={loading}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-[#575727] transition-all shadow-sm disabled:opacity-50"
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
                  <th className="px-4 py-3 text-xs font-bold text-secondary uppercase w-36">Pay per person (₹)</th>
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
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs text-textMain outline-none transition-all bg-white ${
                          errors[`roleName_${idx}`] ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                        }`}
                      />
                      {errors[`roleName_${idx}`] && <p className="text-rose-500 text-[9px] mt-0.5 font-semibold">{errors[`roleName_${idx}`]}</p>}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={role.spots}
                        onChange={(e) => handleRoleChange(idx, 'spots', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs text-textMain outline-none transition-all text-center bg-white ${
                          errors[`spots_${idx}`] ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                        }`}
                      />
                      {errors[`spots_${idx}`] && <p className="text-rose-500 text-[9px] mt-0.5 font-semibold text-center">{errors[`spots_${idx}`]}</p>}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="250"
                        value={role.payPerPerson}
                        onChange={(e) => handleRoleChange(idx, 'payPerPerson', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs text-textMain outline-none transition-all text-right bg-white ${
                          errors[`payPerPerson_${idx}`] ? 'border-rose-500 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                        }`}
                      />
                      {errors[`payPerPerson_${idx}`] && <p className="text-rose-500 text-[9px] mt-0.5 font-semibold text-right">{errors[`payPerPerson_${idx}`]}</p>}
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
              <div className="text-xl font-black text-primary">₹{totalBudget.toLocaleString()}</div>
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
                onClick={handleSaveDraftStep2}
                disabled={loading}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-textMain transition-all disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublishStep2}
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

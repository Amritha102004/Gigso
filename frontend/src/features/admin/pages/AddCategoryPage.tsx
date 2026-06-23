import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import categoryService from '../services/category.service';
import { categoryIconMap, renderCategoryIcon } from './CategoriesPage';

const AddCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const isEditMode = !!categoryId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Camera');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing category details if in Edit Mode
  useEffect(() => {
    if (!isEditMode) return;

    const loadCategory = async () => {
      try {
        setIsLoading(true);
        const data = await categoryService.getCategoryById(categoryId);
        setName(data.name);
        setDescription(data.description);
        setSelectedIcon(data.icon || 'Camera');
        setError(null);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to load category';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [categoryId, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!selectedIcon) {
      setError('Please select an icon');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon: selectedIcon,
      };

      if (isEditMode) {
        await categoryService.updateCategory(categoryId, payload);
      } else {
        await categoryService.createCategory(payload);
      }

      navigate('/admin/categories');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'An error occurred';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const iconOptions = Object.keys(categoryIconMap);

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto font-sans">
      {/* Breadcrumb / Nav Back */}
      <div className="flex items-center gap-2 text-xs font-semibold text-secondary mb-4">
        <span className="hover:text-textMain cursor-pointer" onClick={() => navigate('/admin/categories')}>Categories</span>
        <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-textMain">{isEditMode ? 'Edit Category' : 'Add Category'}</span>
      </div>

      {/* Header */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-textMain tracking-tight">
          {isEditMode ? 'Edit Category' : 'Create New Category'}
        </h1>
        <p className="text-secondary text-sm mt-1">
          {isEditMode ? 'Update the details and icon of this category' : 'Define a new gig type for the marketplace'}
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="max-w-4xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Input Fields */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="categoryName" className="block text-xs font-bold text-secondary mb-1.5 uppercase tracking-wider">
                    Category Name
                  </label>
                  <input
                    id="categoryName"
                    type="text"
                    placeholder="e.g. Photography"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="categoryDesc" className="block text-xs font-bold text-secondary mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    id="categoryDesc"
                    rows={6}
                    placeholder="Provide a detailed description of the services included under this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column: Icon Selection */}
              <div>
                <label className="block text-xs font-bold text-secondary mb-1.5 uppercase tracking-wider">
                  Select Icon
                </label>
                <p className="text-secondary text-xs mb-3">Choose a representation visual matching the category domain</p>
                <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                  {iconOptions.map((iconKey) => {
                    const isSelected = selectedIcon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setSelectedIcon(iconKey)}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all hover:scale-105 ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white border-gray-200 text-secondary hover:border-primary hover:text-primary shadow-sm'
                        }`}
                      >
                        <div className="p-1">{renderCategoryIcon(iconKey, 'w-6 h-6')}</div>
                        <span className="text-[9px] font-bold mt-1 tracking-tight">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/admin/categories')}
                className="px-4 py-2 text-xs font-semibold text-secondary hover:text-textMain transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-[#575727] transition-all shadow-md disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isEditMode ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddCategoryPage;

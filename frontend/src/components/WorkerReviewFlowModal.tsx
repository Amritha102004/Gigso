import React, { useEffect, useState } from 'react';
import { XMarkIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import apiClient from '../api/client';
import { useToast } from '../context/ToastContext';

interface Worker {
  id: string;
  name: string;
  profileImage: string | null;
  roleName: string;
}

interface WorkerReviewFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  gigId: string;
  gigTitle: string;
}

const WorkerReviewFlowModal: React.FC<WorkerReviewFlowModalProps> = ({
  isOpen,
  onClose,
  gigId,
  gigTitle,
}) => {
  const { showToast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Rating states per worker
  const [reviewedWorkerIds, setReviewedWorkerIds] = useState<Set<string>>(new Set());
  const [activeWorker, setActiveWorker] = useState<Worker | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && gigId) {
      fetchHiredWorkers();
    }
  }, [isOpen, gigId]);

  const fetchHiredWorkers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/reviews/gig/${gigId}/workers`);
      if (res.data && res.data.success) {
        setWorkers(res.data.data.workers || []);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load crew members for reviews.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorker = (worker: Worker) => {
    if (reviewedWorkerIds.has(worker.id)) return;
    setActiveWorker(worker);
    setRating(0);
    setComment('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorker) return;
    if (rating === 0) {
      showToast('Please select a star rating.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient.post('/reviews', {
        gigId,
        reviewedUserId: activeWorker.id,
        rating,
        comment,
      });

      if (res.data && res.data.success) {
        showToast(`Review for ${activeWorker.name} submitted!`, 'success');
        setReviewedWorkerIds(prev => {
          const next = new Set(prev);
          next.add(activeWorker.id);
          return next;
        });
        setActiveWorker(null);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-100 shadow-2xl relative z-10 flex flex-col max-h-[85vh] animate-scaleUp">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-textMain tracking-tight">Review Hired Workers</h3>
            <p className="text-[10px] text-secondary mt-0.5 uppercase tracking-wider font-bold">GIG: {gigTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:bg-gray-50 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-secondary font-medium">Loading worker list...</span>
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-12 text-xs text-secondary italic">
              No workers were hired for this gig.
            </div>
          ) : !activeWorker ? (
            /* Workers List View */
            <div className="space-y-3">
              <p className="text-xs text-secondary leading-relaxed">
                Click on any worker below to write an optional rating and comment on their performance:
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {workers.map((worker) => {
                  const isReviewed = reviewedWorkerIds.has(worker.id);
                  return (
                    <button
                      key={worker.id}
                      onClick={() => handleSelectWorker(worker)}
                      disabled={isReviewed}
                      className={`flex items-center justify-between p-4 border rounded-2xl text-left transition-all ${
                        isReviewed
                          ? 'bg-emerald-50/30 border-emerald-100/50 cursor-not-allowed opacity-90'
                          : 'bg-white border-gray-200 hover:border-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.profileImage ? `http://localhost:3000${worker.profileImage}` : '/default-avatar.png'}
                          alt={worker.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + worker.name;
                          }}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-100 bg-gray-50"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-textMain">{worker.name}</h4>
                          <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block mt-0.5">
                            {worker.roleName}
                          </span>
                        </div>
                      </div>
                      
                      {isReviewed ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider">
                          <CheckCircleIcon className="w-4 h-4" />
                          Reviewed
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-primary hover:underline">
                          Rate Worker &rarr;
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Individual Worker Review Form View */
            <div className="space-y-5 animate-scaleUp">
              <button
                onClick={() => setActiveWorker(null)}
                className="text-[10px] font-bold text-secondary hover:text-textMain flex items-center gap-1"
              >
                &larr; Back to all workers
              </button>

              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                <img
                  src={activeWorker.profileImage ? `http://localhost:3000${activeWorker.profileImage}` : '/default-avatar.png'}
                  alt={activeWorker.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + activeWorker.name;
                  }}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-white"
                />
                <div>
                  <h4 className="text-xs font-bold text-textMain">{activeWorker.name}</h4>
                  <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block mt-0.5">
                    {activeWorker.roleName}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating selection */}
                <div className="flex flex-col items-center space-y-1.5 py-1">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Select Rating</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isSelected = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform transform hover:scale-125 focus:outline-none"
                        >
                          {isSelected ? (
                            <StarIcon className="w-8 h-8 text-amber-400 drop-shadow-sm" />
                          ) : (
                            <StarOutlineIcon className="w-8 h-8 text-gray-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {rating > 0 && (
                    <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest animate-pulse">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </span>
                  )}
                </div>

                {/* Comment Area */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Tell us how it was to work with ${activeWorker.name}...`}
                    rows={4}
                    maxLength={500}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-textMain outline-none transition-all placeholder:text-gray-400 focus:ring-1 focus:ring-primary shadow-sm hover:border-gray-300 resize-none"
                  ></textarea>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveWorker(null)}
                    className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-secondary rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 disabled:bg-primary/50 transition-all shadow-sm uppercase tracking-wider"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-secondary">
          <span>{reviewedWorkerIds.size} of {workers.length} workers reviewed</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-50 text-textMain font-bold rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-wider text-[10px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerReviewFlowModal;

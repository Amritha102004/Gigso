import React, { useState } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import apiClient from '../api/client';
import { useToast } from '../context/ToastContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gigId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  gigId,
  reviewedUserId,
  reviewedUserName,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast('Please select a star rating.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post('/reviews', {
        gigId,
        reviewedUserId,
        rating,
        comment,
      });

      if (res.data && res.data.success) {
        showToast('Review submitted successfully!', 'success');
        if (onSuccess) onSuccess();
        onClose();
        // Reset state
        setRating(0);
        setComment('');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-gray-100 shadow-2xl relative z-10 flex flex-col space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-extrabold text-textMain tracking-tight">Write a Review</h3>
            <p className="text-[10px] text-secondary mt-0.5">Share your experience with {reviewedUserName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Selection */}
          <div className="flex flex-col items-center space-y-1.5 py-2">
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
              placeholder="Tell us about the collaboration, communication, professionalism..."
              rows={4}
              maxLength={500}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-textMain outline-none transition-all placeholder:text-gray-400 focus:ring-1 focus:ring-primary shadow-sm hover:border-gray-300 resize-none"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-secondary rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 disabled:bg-primary/50 transition-all shadow-sm uppercase tracking-wider"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

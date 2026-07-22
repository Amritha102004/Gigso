import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6 pb-2 border-t border-gray-100">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-secondary hover:text-textMain hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all active:scale-95 flex items-center justify-center min-w-[32px] min-h-[32px]"
      >
        &lt;
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNum = i + 1;
        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center min-w-[32px] min-h-[32px] ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'border border-gray-200 text-secondary hover:text-textMain hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-secondary hover:text-textMain hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all active:scale-95 flex items-center justify-center min-w-[32px] min-h-[32px]"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;

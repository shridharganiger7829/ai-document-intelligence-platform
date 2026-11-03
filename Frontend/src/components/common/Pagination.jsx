import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  perPage = 10,
  hasNext = false,
  hasPrev = false,
  onPageChange,
}) => {
  if (totalPages <= 1 && totalRecords <= perPage) return null;

  const startRecord = (page - 1) * perPage + 1;
  const endRecord = Math.min(page * perPage, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-white/5 text-sm text-slate-400">
      <div>
        Showing <span className="font-semibold text-slate-200">{startRecord}</span> to{' '}
        <span className="font-semibold text-slate-200">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalRecords}</span> entries
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev && page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-surface-card hover:bg-surface-cardHover text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white">
          Page {page} of {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext && page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-surface-card hover:bg-surface-cardHover text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

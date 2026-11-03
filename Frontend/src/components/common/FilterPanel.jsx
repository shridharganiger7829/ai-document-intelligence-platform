import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterPanel = ({
  filters,
  onChange,
  onReset,
  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'uploaded', label: 'Uploaded' },
    { value: 'queued', label: 'Queued' },
    { value: 'processing', label: 'Processing' },
    { value: 'extracted', label: 'Extracted' },
    { value: 'review_submitted', label: 'Review Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'corrections_requested', label: 'Corrections Requested' },
  ],
  documentTypes = [
    { value: '', label: 'All Document Types' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'purchase_order', label: 'Purchase Order' },
    { value: 'tax_form', label: 'Tax Form' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' },
  ],
}) => {
  const handleFieldChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const hasActiveFilters =
    Boolean(filters.status) ||
    Boolean(filters.document_type) ||
    Boolean(filters.date_from) ||
    Boolean(filters.date_to);

  return (
    <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-surface-card/60 border border-white/5 backdrop-blur-sm text-xs">
      <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
        <Filter className="w-3.5 h-3.5 text-brand-400" />
        <span>Filters:</span>
      </div>

      {/* Status Filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => handleFieldChange('status', e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-500/50"
      >
        {statuses.map((item) => (
          <option key={item.value} value={item.value} className="bg-navy-900 text-slate-200">
            {item.label}
          </option>
        ))}
      </select>

      {/* Document Type Filter */}
      <select
        value={filters.document_type || ''}
        onChange={(e) => handleFieldChange('document_type', e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-500/50"
      >
        {documentTypes.map((item) => (
          <option key={item.value} value={item.value} className="bg-navy-900 text-slate-200">
            {item.label}
          </option>
        ))}
      </select>

      {/* Date From */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <span>From:</span>
        <input
          type="date"
          value={filters.date_from || ''}
          onChange={(e) => handleFieldChange('date_from', e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-500/50"
        />
      </div>

      {/* Date To */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <span>To:</span>
        <input
          type="date"
          value={filters.date_to || ''}
          onChange={(e) => handleFieldChange('date_to', e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-500/50"
        />
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

export default FilterPanel;

import React from 'react';

const STATUS_CONFIGS = {
  uploaded: {
    label: 'Uploaded',
    bg: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    dot: 'bg-slate-400',
  },
  queued: {
    label: 'Queued',
    bg: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
    dot: 'bg-sky-400 animate-pulse',
  },
  processing: {
    label: 'Processing',
    bg: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    dot: 'bg-amber-400 animate-ping',
  },
  extracted: {
    label: 'Extracted',
    bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
    dot: 'bg-indigo-400',
  },
  pending_review: {
    label: 'Pending Review',
    bg: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    dot: 'bg-blue-400',
  },
  review_submitted: {
    label: 'Review Submitted',
    bg: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    dot: 'bg-purple-400',
  },
  verified: {
    label: 'Verified',
    bg: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
    dot: 'bg-teal-400',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    dot: 'bg-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    dot: 'bg-rose-400',
  },
  corrections_requested: {
    label: 'Corrections Req.',
    bg: 'bg-orange-950/60 text-brand-300 border-brand-800/60',
    dot: 'bg-brand-500',
  },
  flagged_for_admin: {
    label: 'Flagged for Admin',
    bg: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/60',
    dot: 'bg-fuchsia-400',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-950/60 text-red-300 border-red-800/60',
    dot: 'bg-red-500',
  },
  extraction_failed: {
    label: 'Extraction Failed',
    bg: 'bg-red-950/60 text-red-300 border-red-800/60',
    dot: 'bg-red-500',
  },
  active: {
    label: 'Active',
    bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    dot: 'bg-emerald-400',
  },
  inactive: {
    label: 'Inactive',
    bg: 'bg-slate-800/70 text-slate-400 border-slate-700/50',
    dot: 'bg-slate-500',
  },
};

export const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIGS[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

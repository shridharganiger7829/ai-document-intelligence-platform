import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/5 bg-surface-card/40 my-4">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-7 h-7 text-brand-400" />
      </div>
      <h4 className="text-base font-semibold text-white mb-1.5">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all duration-200 shadow-md hover:shadow-glow-brand"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

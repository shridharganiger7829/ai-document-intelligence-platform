import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }[size] || 'w-7 h-7';

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeClass} animate-spin text-brand-500`} />
      {text && <p className="text-sm font-medium text-slate-400">{text}</p>}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse p-4">
      <div className="h-10 bg-slate-800/60 rounded-xl" />
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="h-8 bg-slate-800/40 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;

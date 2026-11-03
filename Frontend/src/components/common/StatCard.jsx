import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'brand', // 'brand', 'teal', 'emerald', 'rose', 'sky'
  onClick,
}) => {
  const colorMap = {
    brand: {
      border: 'border-brand-500/20 hover:border-brand-500/40',
      iconBg: 'bg-brand-500/15 text-brand-400',
      glow: 'group-hover:shadow-glow-brand',
      pill: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    },
    teal: {
      border: 'border-navy-600/30 hover:border-teal-500/40',
      iconBg: 'bg-teal-500/15 text-teal-400',
      glow: 'group-hover:shadow-glow-teal',
      pill: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      glow: 'group-hover:shadow-emerald-900/30',
      pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400',
      glow: 'group-hover:shadow-rose-900/30',
      pill: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    sky: {
      border: 'border-sky-500/20 hover:border-sky-500/40',
      iconBg: 'bg-sky-500/15 text-sky-400',
      glow: 'group-hover:shadow-sky-900/30',
      pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
  }[colorScheme] || {
    border: 'border-slate-700/40 hover:border-slate-600',
    iconBg: 'bg-slate-800 text-slate-300',
    glow: '',
    pill: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-surface-card/80 backdrop-blur-md p-5 border ${colorMap.border} shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${colorMap.glow}`}
    >
      {/* Subtle ambient gradient in card */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-white/[0.03] blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
            {value !== undefined && value !== null ? value : '-'}
          </h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border border-white/5 ${colorMap.iconBg} transition-transform group-hover:scale-110 duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
          <span>{subtitle}</span>
          {trend && (
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${colorMap.pill}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;

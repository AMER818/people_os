import React from 'react';

interface AnalyticsStatsProps {
  stats: {
    label: string;
    val: string;
    trend: string;
    icon: any;
    color: string;
  }[];
}

const AnalyticsStats: React.FC<AnalyticsStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
      {stats.map((s, i) => (
        <div
          key={i}
          role="status"
          aria-label={`${s.label}: ${s.val}, trend ${s.trend}`}
          className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
        >
          <div
            className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
          ></div>
          <div className="flex items-center justify-between mb-8">
            <div
              className={`p-4 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 dark:text-${s.color}-400 shadow-inner group-hover:scale-110 transition-transform`}
            >
              <s.icon size={28} />
            </div>
            <span
              className={`text-[0.625rem] font-black px-3 py-1.5 rounded-xl border ${s.trend.startsWith('+') ? 'text-success bg-emerald-50 dark:bg-success/10 border-success/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200'}`}
            >
              {s.trend}
            </span>
          </div>
          <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mb-2">
            {s.label}
          </p>
          <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            {s.val}
          </h4>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsStats;

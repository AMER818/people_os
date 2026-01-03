import React from 'react';

interface AssetStatsProps {
  stats: {
    label: string;
    val: string | number;
    icon: any;
    color: string;
  }[];
}

const AssetStats: React.FC<AssetStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {stats.map((s, i) => (
        <div
          key={i}
          role="status"
          aria-label={`${s.label}: ${s.val}`}
          className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
        >
          <div
            className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
          ></div>
          <div className="flex items-center justify-between mb-8">
            <div
              className={`p-4 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 dark:text-${s.color}-400 shadow-inner group-hover:scale-110 transition-transform`}
            >
              <s.icon size={24} />
            </div>
            <span className="text-[0.625rem] font-black px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 border border-slate-100 dark:border-slate-600 uppercase tracking-widest">
              Global Scan
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

export default AssetStats;

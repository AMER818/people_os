import React from 'react';

interface RecruitmentStatsProps {
  stats: {
    label: string;
    value: string | number;
    change: string;
    color: string;
    icon: any;
  }[];
}

const RecruitmentStats: React.FC<RecruitmentStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((s, i) => (
        <div
          key={i}
          role="status"
          aria-label={`${s.label}: ${s.value}`}
          className="bg-surface p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
        >
          <div
            className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
          ></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div
              className={`p-4 rounded-2xl bg-${s.color}-500/10 text-${s.color}-500 shadow-inner group-hover:rotate-12 transition-transform`}
            >
              <s.icon size={28} />
            </div>
            {s.change && (
              <span
                className={`text-[0.625rem] font-black px-3 py-1.5 rounded-xl border ${s.change.startsWith('+') ? 'text-success bg-success/10 border-success/20' : 'text-text-muted bg-muted-bg border-border'}`}
              >
                {s.change}
              </span>
            )}
          </div>

          <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-2">
            {s.label}
          </p>

          {s.value}
        </div>
      ))}
    </div>
  );
};

export default RecruitmentStats;

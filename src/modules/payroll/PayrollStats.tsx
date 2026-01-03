import React from 'react';


interface PayrollStatsProps {
  stats: {
    label: string;
    val: string;
    icon: any;
    color: string;
  }[];
}

const PayrollStats: React.FC<PayrollStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
      {stats.map((s, i) => (
        <div
          key={i}
          role="status"
          aria-label={`${s.label}: ${s.val}`}

          className="bg-surface p-10 rounded-md border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
        >
          <div
            className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color === 'indigo' ? 'primary' : s.color === 'emerald' ? 'success' : s.color === 'rose' ? 'danger' : 'warning'}-soft blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
          ></div>
          <div
            className={`p-4 rounded-md bg-${s.color === 'indigo' ? 'primary' : s.color === 'emerald' ? 'success' : s.color === 'rose' ? 'danger' : 'warning'}-soft text-${s.color === 'indigo' ? 'primary' : s.color === 'emerald' ? 'success' : s.color === 'rose' ? 'danger' : 'warning'} w-fit mb-8 shadow-inner group-hover:rotate-12 transition-transform`}
          >
            <s.icon size={28} />
          </div>
          <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-2">
            {s.label}
          </p>
          <h4 className="text-4xl font-black text-text-primary tracking-tighter leading-none">
            {s.val}
          </h4>
        </div>
      ))}
    </div>
  );
};

export default PayrollStats;

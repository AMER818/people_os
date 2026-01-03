import React from 'react';
import { Lock, ShieldCheck, UserCheck, Scale, History, ChevronRight } from 'lucide-react';

const ComplianceVault: React.FC = () => {
  const items = [
    { label: 'EOBI Compliance', icon: ShieldCheck, color: 'primary' },
    { label: 'Social Security', icon: UserCheck, color: 'success' },
    { label: 'Taxation (P-4)', icon: Scale, color: 'primary' },
    { label: 'Payroll Audit Trail', icon: History, color: 'danger' },
  ];

  return (
    <div className="bg-surface p-12 rounded-md border border-border shadow-md">
      <div className="flex items-center justify-between mb-12">
        <h4 className="text-2xl font-black text-text-primary antialiased tracking-tight uppercase">
          Compliance Rules
        </h4>
        <div className="w-12 h-12 bg-muted-bg rounded-md flex items-center justify-center text-text-muted">
          <Lock size={20} />
        </div>
      </div>
      <div className="space-y-6">
        {items.map((item, i) => (
          <button
            key={i}
            aria-label={`View ${item.label} rules`}
            className="w-full flex items-center justify-between p-8 bg-muted-bg/50 rounded-md hover:scale-105 transition-all group border border-transparent hover:border-border shadow-sm"
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-12 h-12 bg-${item.color}-soft text-${item.color} rounded-md flex items-center justify-center shadow-inner`}
              >
                <item.icon size={22} />
              </div>
              <span className="text-xs font-black text-text-primary uppercase tracking-widest">
                {item.label}
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-text-muted group-hover:text-primary transition-colors"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ComplianceVault;

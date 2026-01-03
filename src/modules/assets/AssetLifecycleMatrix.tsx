import React from 'react';
import { Database, TrendingUp, Clock, UserCheck, Truck } from 'lucide-react';

const AssetLifecycleMatrix: React.FC = () => {
  const items = [
    { label: 'Neural Condition Score', icon: TrendingUp, val: '8.4/10', color: 'blue' },
    { label: 'Warranty Expiry Pulse', icon: Clock, val: '12 Nodes', color: 'rose' },
    { label: 'Custodian Stability', icon: UserCheck, val: '94%', color: 'emerald' },
    { label: 'Procurement Pipeline', icon: Truck, val: 'Active', color: 'indigo' },
  ];

  return (
    <div role="region" aria-label="Asset Lifecycle Matrix" className="bg-white dark:bg-slate-800 p-16 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden flex flex-col justify-between">
      <div className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
        <Database size={320} />
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-8 uppercase">
          Asset Lifecycle Matrix
        </h4>
        <div className="space-y-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all shadow-inner group/item"
            >
              <div className="flex items-center gap-6">
                <div
                  className={`w-14 h-14 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 rounded-2xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform`}
                >
                  <item.icon size={28} />
                </div>
                <span className="text-[0.75rem] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  {item.label}
                </span>
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white">{item.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetLifecycleMatrix;

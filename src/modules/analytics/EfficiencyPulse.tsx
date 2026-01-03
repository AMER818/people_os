import React from 'react';
import { Zap, Scale } from 'lucide-react';

const EfficiencyPulse: React.FC = () => {
  return (
    <div role="region" aria-label="Efficiency Pulse Dashboard" className="bg-emerald-600 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-8 -bottom-8 p-12 opacity-10 group-hover:rotate-45 transition-transform duration-700">
        <Zap size={280} />
      </div>
      <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-emerald-100 mb-8 flex items-center gap-3">
        <Scale size={14} /> Efficiency Pulse
      </h4>
      <div className="space-y-10 relative z-10">
        <div>
          <p className="text-slate-100/60 text-[0.6875rem] font-black uppercase tracking-widest mb-3">
            OpEx Allocation
          </p>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-black tracking-tighter">94.2%</span>
            <span className="text-[0.6875rem] font-black uppercase bg-white/10 px-3 py-1 rounded-lg">
              +1.2%
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-xs font-bold leading-relaxed opacity-80 antialiased">
            Internal resource utilization is peaking at optimal thresholds. AI suggests increasing
            procurement velocity for Site-B.
          </p>
        </div>
        <button aria-label="Launch Procurement Hub" className="w-full py-5 bg-white text-emerald-700 rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
          Launch Procurement Hub
        </button>
      </div>
    </div>
  );
};

export default EfficiencyPulse;

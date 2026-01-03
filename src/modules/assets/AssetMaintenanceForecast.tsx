import React from 'react';
import { RefreshCw, Cpu, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const AssetMaintenanceForecast: React.FC = () => {
  return (
    <div className="bg-slate-950 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
        <RefreshCw size={280} />
      </div>
      <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-indigo-400 mb-10">
        Neural Maintenance Forecast
      </h4>
      <p className="text-3xl font-black tracking-tighter leading-tight antialiased max-w-sm uppercase">
        Detected{' '}
        <span className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-8">
          Critical Entropy
        </span>{' '}
        in Battery Health for 14 MacBook nodes across Engineering Cluster.
      </p>
      <div className="mt-12 space-y-6">
        <div className="px-8 py-5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Cpu className="text-indigo-400" size={24} />
            <span className="text-[0.6875rem] font-black uppercase tracking-widest">
              Hardware Decay Prediction: High
            </span>
          </div>
          <AlertTriangle className="text-rose-500" size={18} />
        </div>
        <div className="px-8 py-5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShieldAlert className="text-blue-400" size={24} />
            <span className="text-[0.6875rem] font-black uppercase tracking-widest">
              Insurance Liability: Optimized
            </span>
          </div>
          <CheckCircle2 className="text-emerald-500" size={18} />
        </div>
      </div>
      <button aria-label="Start automated repair flow" className="w-full mt-12 py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black uppercase text-[0.6875rem] tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all">
        Automate Repair Flow
      </button>
    </div>
  );
};

export default AssetMaintenanceForecast;

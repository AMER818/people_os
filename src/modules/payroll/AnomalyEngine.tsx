import React from 'react';
import { AlertTriangle, Zap, ChevronRight } from 'lucide-react';

const AnomalyEngine: React.FC = () => {
  return (
    <div className="bg-danger-soft p-14 rounded-md border border-danger/20 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
        <AlertTriangle className="w-32 h-32 text-danger" />
      </div>
      <div className="flex items-center gap-6 mb-10 relative z-10">
        <div className="w-14 h-14 bg-danger text-white rounded-md flex items-center justify-center shadow-md">
          <Zap size={28} />
        </div>
        <h3 className="text-2xl font-black text-danger tracking-tight leading-tight uppercase">
          Variance Alert
        </h3>
      </div>
      <div className="p-8 bg-surface rounded-md border border-danger/30 shadow-md relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-danger animate-ping"></div>
          <p className="text-[0.625rem] font-black text-danger uppercase tracking-[0.3em]">
            Critical Variance
          </p>
        </div>
        <p className="text-lg font-black text-text-primary leading-tight">
          Engineering payroll is{' '}
          <span className="text-danger underline underline-offset-4 decoration-danger/30">
            12.5% above
          </span>{' '}
          baseline forecast.
        </p>
        <button aria-label="View anomaly details" className="mt-8 text-[0.625rem] font-black uppercase tracking-widest text-text-muted hover:text-danger transition-all flex items-center gap-3">
          View Details <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default AnomalyEngine;

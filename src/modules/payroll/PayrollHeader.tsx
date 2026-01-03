import React from 'react';
import { Globe, Plus, Play, RefreshCw } from 'lucide-react';

interface PayrollHeaderProps {
  onOpenBonusModal: () => void;
  onExecuteCycle: () => void;
  isProcessing: boolean;
  progress: number;
}

const PayrollHeader: React.FC<PayrollHeaderProps> = ({
  onOpenBonusModal,
  onExecuteCycle,
  isProcessing,
  progress,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div>
        <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none uppercase antialiased">
          Fiscal Terminal
        </h1>
        <p className="text-text-muted mt-4 font-black uppercase tracking-[0.4em] text-[0.75rem] flex items-center gap-4">
          <span className="w-10 h-[0.125rem] bg-primary"></span>
          Comprehensive Compensation Flux & Statutory Governance
        </p>
      </div>
      <div className="flex gap-4 p-2 bg-surface rounded-md shadow-md border border-border">
        <button aria-label="Global View" className="bg-muted-bg p-5 rounded-md text-text-muted hover:text-primary transition-all shadow-sm">
          <Globe size={24} />
        </button>
        <button
          onClick={onOpenBonusModal}
          className="px-8 py-4 bg-muted-bg text-text-muted rounded-md font-black uppercase text-[0.625rem] tracking-widest hover:bg-surface transition-all shadow-sm flex items-center gap-3"
        >
          <Plus size={16} /> Variable Pay
        </button>
        <button
          onClick={onExecuteCycle}
          disabled={isProcessing}
          className="bg-primary text-white px-12 py-4 rounded-md font-black uppercase text-[0.6875rem] tracking-widest flex items-center gap-4 shadow-md shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Play size={18} className="fill-current" />
          )}
          {isProcessing ? `Processing: ${progress}%` : 'Execute P-Cycle'}
        </button>
      </div>
    </div>
  );
};

export default PayrollHeader;

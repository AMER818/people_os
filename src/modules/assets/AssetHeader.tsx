import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';

interface AssetHeaderProps {
  onReset: () => void;
  onProvision: () => void;
}

const AssetHeader: React.FC<AssetHeaderProps> = ({ onReset, onProvision }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
          Resource Ledger
        </h1>
        <p className="text-slate-400 mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
          <span className="w-8 h-[0.125rem] bg-blue-600"></span>
          Hardware Lifecycle, Fiscal Custodianship & Neural Health Monitor
        </p>
      </div>
      <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <button
          onClick={onReset}
          aria-label="Refresh ledger"
          className="bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
        >
          <RefreshCw size={20} />
        </button>
        <button
          onClick={onProvision}
          aria-label="Provision new asset"
          className="bg-blue-600 text-white px-10 py-4 rounded-[1.375rem] font-black uppercase text-[0.6875rem] tracking-widest flex items-center gap-4 shadow-xl hover:-translate-y-1 transition-all active:scale-95"
        >
          <Plus size={18} /> Provision Asset
        </button>
      </div>
    </div>
  );
};

export default AssetHeader;

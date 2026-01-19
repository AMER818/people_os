import React from 'react';
import {
  ShieldCheck,
  X,
  Info,
  History as HistoryIcon,
  UserCheck,
  CheckCircle2,
  PenTool,
  Wrench,
} from 'lucide-react';
import { Asset, AssetCategory } from '../../types';

interface AssetAuditModalProps {
  asset: Asset;
  getCategoryIcon: (cat: AssetCategory) => React.ReactNode;
  onStatusChange: (id: string, status: Asset['status']) => void;
  onClose: () => void;
}

const AssetAuditModal: React.FC<AssetAuditModalProps> = ({
  asset,
  getCategoryIcon,
  onStatusChange,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-5xl rounded-[5rem] shadow-[0_0_9.375rem_rgba(0,0,0,0.7)] border border-white/5 overflow-hidden animate-in slide-in-from-bottom-24 duration-700 flex flex-col max-h-[90vh]">
        <div className="p-20 flex items-center justify-between bg-slate-950 text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent"></div>
          <div className="flex items-center gap-10 relative z-10">
            <div className="p-10 bg-blue-600 rounded-[2.5rem] shadow-2xl border-4 border-white/10 text-white animate-in zoom-in duration-500">
              {getCategoryIcon(asset.category)}
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter leading-none uppercase antialiased">
                {asset.name}
              </h3>
              <p className="text-blue-400 font-black text-[0.75rem] uppercase tracking-[0.5em] mt-4 flex items-center gap-3">
                <ShieldCheck size={14} /> {asset.id} • {asset.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-6 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white"
          >
            <X size={32} />
          </button>
        </div>
        <div className="p-20 grid grid-cols-1 lg:grid-cols-3 gap-20 flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
          <div className="lg:col-span-2 space-y-16">
            <div className="space-y-10">
              <h5 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-3">
                <Info size={14} /> Node Technical Artifacts
              </h5>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-[0.5625rem] font-black text-slate-400 uppercase">
                    Serial Identity
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {asset.serialNumber}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[0.5625rem] font-black text-slate-400 uppercase">
                    Procurement Date
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {asset.assignedDate}
                  </p>
                </div>
              </div>
              <div className="p-10 bg-muted rounded-[3rem] border border-border">
                <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Technical Specifications
                </p>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{asset.specifications || 'No detailed technical metadata found in registry.'}"
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <h5 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-3">
                <HistoryIcon size={14} /> Custodianship Chronology
              </h5>
              <div className="space-y-6">
                {[
                  {
                    user: asset.custodianName,
                    role: 'Current Custodian',
                    date: asset.assignedDate,
                    status: 'Active',
                  },
                  {
                    user: 'Mark Sterling',
                    role: 'Prev Custodian',
                    date: 'Jan 2023',
                    status: 'Terminated',
                  },
                ].map((h, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-6 rounded-[2rem] border ${h.status === 'Active' ? 'bg-blue-600/5 border-blue-600/20' : 'bg-muted border-transparent opacity-60'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">
                          {h.user}
                        </p>
                        <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest">
                          {h.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-[0.625rem] font-black text-slate-400 uppercase">
                      {h.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-muted p-10 rounded-[3.5rem] border border-border shadow-inner">
              <h5 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">
                Governance Phase
              </h5>
              <div className="space-y-6">
                {[
                  { label: 'Deployed', color: 'emerald' },
                  { label: 'Maintenance', color: 'orange' },
                  { label: 'Storage', color: 'blue' },
                  { label: 'Retired', color: 'rose' },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => onStatusChange(asset.id, s.label as any)}
                    className={`w-full flex items-center justify-between p-6 rounded-[1.75rem] border transition-all ${asset.status === s.label ? `bg-${s.color}-500 text-white border-${s.color}-600 shadow-lg scale-105` : 'bg-card border-transparent text-slate-400 hover:border-slate-200'}`}
                  >
                    <span className="text-[0.6875rem] font-black uppercase tracking-widest">
                      {s.label}
                    </span>
                    {asset.status === s.label && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <button
                aria-label="Modify asset metadata"
                className="w-full mt-12 py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black uppercase text-[0.6875rem] tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <PenTool size={18} /> Modify Metadata
              </button>
              <button
                aria-label="Log maintenance activity"
                className="w-full py-6 bg-card text-slate-400 rounded-[1.75rem] font-black uppercase text-[0.6875rem] tracking-widest shadow-sm flex items-center justify-center gap-4 border border-border"
              >
                <Wrench size={18} /> Log Maintenance
              </button>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-full py-4 text-slate-400 font-black uppercase text-[0.625rem] tracking-[0.4em] hover:text-rose-500 transition-colors text-center"
              >
                Close Viewport
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAuditModal;

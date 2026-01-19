import React from 'react';
import {
  Receipt,
  ShieldCheck,
  X,
  Plus,
  Ban,
  CheckCircle2,
  Clock,
  ShieldAlert,
  History,
  Download,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatting';

interface PaystubModalProps {
  tx: any;
  onClose: () => void;
}

const PaystubModal: React.FC<PaystubModalProps> = ({ tx, onClose }) => {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-8 bg-app/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-surface w-full max-w-5xl rounded-md shadow-md border border-border overflow-hidden animate-in slide-in-from-bottom-24 duration-700 flex flex-col max-h-[90vh]">
        <div className="p-8 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 text-surface relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
          <div className="flex items-center gap-10 relative z-10">
            <div className="p-10 bg-white/10 backdrop-blur-md rounded-md shadow-md border-4 border-white/10 text-white">
              <Receipt size={48} />
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter leading-none uppercase antialiased">
                {tx.name}
              </h3>
              <p className="text-primary font-black text-[0.75rem] uppercase tracking-[0.5em] mt-4 flex items-center gap-3">
                <ShieldCheck size={14} /> Fiscal Artifact • {tx.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close paystub"
            className="p-6 bg-surface/5 hover:bg-surface/10 rounded-full transition-all text-surface"
          >
            <X size={32} />
          </button>
        </div>
        <div className="p-20 grid grid-cols-1 lg:grid-cols-3 gap-20 flex-1 overflow-y-auto custom-scrollbar no-scrollbar font-sans">
          <div className="lg:col-span-2 space-y-16">
            <div className="grid grid-cols-2 gap-12">
              <div className="card-premium p-6 space-y-3">
                <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest">
                  Gross Disbursement
                </p>
                <p className="text-4xl font-black text-text-primary font-mono">
                  {formatCurrency(tx.gross)}
                </p>
              </div>
              <div className="card-premium p-6 space-y-3">
                <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest">
                  Net Value Hashed
                </p>
                <p className="text-4xl font-black text-success font-mono">
                  {formatCurrency(tx.net)}
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <h5 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-text-muted border-b border-border pb-4 flex items-center gap-3">
                <Plus size={14} className="text-primary" /> Earnings breakdown
              </h5>
              <div className="grid grid-cols-2 gap-10">
                <div className="p-10 bg-muted-bg rounded-md border border-border">
                  <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-4">
                    Core Salary
                  </p>
                  <p className="text-2xl font-black text-text-primary font-mono">
                    {formatCurrency(tx.gross - tx.allowances)}
                  </p>
                </div>
                <div className="p-10 bg-muted-bg rounded-md border border-border shadow-[0_0_15px_-5px_var(--vibrant-green)]">
                  <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-4">
                    Total Allowances
                  </p>
                  <p className="text-2xl font-black text-primary font-mono">
                    +{formatCurrency(tx.allowances)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <h5 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-text-muted border-b border-border pb-4 flex items-center gap-3">
                <Ban size={14} className="text-danger" /> Fiscal Deductions
              </h5>
              <div className="grid grid-cols-2 gap-10">
                <div className="p-10 bg-muted-bg rounded-md border border-border">
                  <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-4">
                    Income Tax (P-10)
                  </p>
                  <p className="text-2xl font-black text-danger font-mono">
                    -{formatCurrency(tx.tax)}
                  </p>
                </div>
                <div className="p-10 bg-muted-bg rounded-md border border-border">
                  <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-4">
                    Other Deductions
                  </p>
                  <p className="text-2xl font-black text-danger font-mono">
                    -{formatCurrency(tx.deductions)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-muted-bg/50 p-10 rounded-md border border-border shadow-inner">
              <h5 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-text-muted mb-8">
                Governance Status
              </h5>
              <div className="space-y-6">
                {[
                  { label: 'Processed', color: 'success', icon: CheckCircle2 },
                  { label: 'Pending', color: 'warning', icon: Clock },
                  { label: 'Flagged', color: 'danger', icon: ShieldAlert },
                  { label: 'Reversed', color: 'text-muted', icon: History },
                ].map((s) => (
                  <button
                    key={s.label}
                    className={`w-full flex items-center justify-between p-6 rounded-md border transition-all ${tx.status === s.label ? `bg-${s.color} text-white border-${s.color} shadow-md scale-105` : 'bg-surface border-transparent text-text-muted hover:border-border'}`}
                  >
                    <span className="text-[0.6875rem] font-black uppercase tracking-widest">
                      {s.label}
                    </span>
                    <s.icon size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <button className="w-full py-6 bg-primary text-white rounded-md font-black uppercase text-[0.6875rem] tracking-widest shadow-md flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all">
                <Download size={18} /> Export Paystub PDF
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-text-muted font-black uppercase text-[0.625rem] tracking-[0.4em] hover:text-danger transition-colors text-center"
              >
                Close Artifact View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystubModal;

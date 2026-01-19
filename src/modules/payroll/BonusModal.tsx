import React from 'react';
import { DollarSign, X, Send } from 'lucide-react';

interface BonusModalProps {
  onClose: () => void;
}

const BonusModal: React.FC<BonusModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-app/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-surface w-full max-w-xl rounded-md shadow-md border border-border overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
        <div className="p-12 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-success text-white rounded-md shadow-[0_0_15px_var(--vibrant-green)]">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-text-primary tracking-tight leading-none uppercase">
                Log Variable Pay
              </h3>
              <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2">
                Strategic Bonus or Incentive Entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-muted-bg rounded-md text-text-muted hover:text-danger transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <form className="p-12 space-y-8">
          <div className="space-y-3">
            <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
              Target Node UID
            </label>
            <input
              aria-label="Target Node UID"
              required
              className="w-full bg-muted-bg border-none rounded-md px-8 py-5 font-black text-text-primary outline-none focus:ring-2 focus:ring-success/20 shadow-inner"
              placeholder="ABC01-XXXX..."
            />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
                Amount Vector
              </label>
              <input
                required
                type="number"
                className="w-full bg-muted-bg border-none rounded-md px-8 py-5 font-black text-text-primary outline-none focus:ring-2 focus:ring-success/20 shadow-inner"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
                Incentive Cluster
              </label>
              <select className="w-full bg-muted-bg border-none rounded-md px-8 py-5 font-black text-text-primary outline-none cursor-pointer shadow-inner appearance-none">
                <option>Performance Bonus</option>
                <option>Project Completion</option>
                <option>Referral Reward</option>
                <option>Sales Commission</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-2">
              Approval Logic / Memo
            </label>
            <textarea
              rows={3}
              className="w-full bg-muted-bg border-none rounded-md px-8 py-5 font-bold text-text-primary outline-none resize-none shadow-inner"
              placeholder="Provide justification for fiscal flux..."
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-6 bg-success text-white rounded-md font-black uppercase text-[0.75rem] tracking-[0.3em] shadow-md shadow-success/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            <Send size={18} /> Commit Incentive Node
          </button>
        </form>
      </div>
    </div>
  );
};

export default BonusModal;

import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Asset } from '../../types';

interface ProvisionAssetModalProps {
  newAsset: Partial<Asset>;
  setNewAsset: (asset: Partial<Asset>) => void;
  onEnroll: (e: React.FormEvent) => void;
  onClose: () => void;
}

const ProvisionAssetModal: React.FC<ProvisionAssetModalProps> = ({
  newAsset,
  setNewAsset,
  onEnroll,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] shadow-[0_0_6.25rem_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
        <div className="p-12 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
              <SlidersHorizontal size={24} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                Provision Node
              </h3>
              <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-2">
                New Hardware Identifier Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onEnroll} className="p-12 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest ml-2">
                Resource Name
              </label>
              <input
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.25rem] px-8 py-5 font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                placeholder="e.g. iPhone 15 Pro"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest ml-2">
                Classification
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.25rem] px-8 py-5 font-black text-slate-900 dark:text-white outline-none cursor-pointer shadow-inner"
                value={newAsset.category}
                onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
              >
                {[
                  'Laptop',
                  'Desktop PC',
                  'Mobile',
                  'Tablet',
                  'IT Gadget',
                  'Vehicle',
                  'Software',
                  'Furniture',
                  'Network',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest ml-2">
                Serial Signature
              </label>
              <input
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.25rem] px-8 py-5 font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                placeholder="S/N Vector..."
                value={newAsset.serialNumber}
                onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest ml-2">
                Initial Status
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.25rem] px-8 py-5 font-black text-slate-900 dark:text-white outline-none cursor-pointer shadow-inner"
                value={newAsset.status}
                onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value as any })}
              >
                <option value="Storage">In Storage</option>
                <option value="Deployed">Active Deployment</option>
                <option value="Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest ml-2">
              Asset Metadata / Specifications
            </label>
            <textarea
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.25rem] px-8 py-5 font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner resize-none"
              placeholder="Provide technical signature or specs..."
              value={newAsset.specifications}
              onChange={(e) => setNewAsset({ ...newAsset, specifications: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full py-6 bg-blue-600 text-white rounded-[1.75rem] font-black uppercase text-[0.75rem] tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            Hash Node to Ledger
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProvisionAssetModal;

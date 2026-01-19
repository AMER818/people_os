import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Asset, AssetCategory } from '../../types';

interface AssetTableProps {
  assets: Asset[];
  getCategoryIcon: (cat: AssetCategory) => React.ReactNode;
  onSelectAsset: (asset: Asset) => void;
}

const AssetTable: React.FC<AssetTableProps> = ({ assets, getCategoryIcon, onSelectAsset }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-sans">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-950/30 text-[0.6875rem] font-black uppercase text-slate-400 tracking-[0.25em]">
            <th className="px-14 py-8">Resource Identity</th>
            <th className="px-8 py-8">Current Custodian</th>
            <th className="px-8 py-8">Serial Vector</th>
            <th className="px-8 py-8">Lifecycle State</th>
            <th className="px-14 py-8 text-right">Audit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="group hover:bg-blue-600/5 transition-all cursor-pointer"
              onClick={() => onSelectAsset(asset)}
            >
              <td className="px-14 py-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all shadow-inner">
                    {getCategoryIcon(asset.category)}
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none antialiased">
                      {asset.name}
                    </p>
                    <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-3 flex items-center gap-2">
                      <ShieldCheck size={12} /> {asset.id} • {asset.category}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-8">
                <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                  {asset.custodianName}
                </p>
                <p className="text-[0.625rem] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                  Assigned: {asset.assignedDate}
                </p>
              </td>
              <td className="px-8 py-8 font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                {asset.serialNumber}
              </td>
              <td className="px-8 py-8">
                <span
                  className={`px-5 py-2 rounded-2xl text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                    asset.status === 'Deployed'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                      : asset.status === 'Maintenance'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-lg shadow-orange-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {asset.status}
                </span>
              </td>
              <td className="px-14 py-8 text-right">
                <button
                  aria-label={`Audit asset ${asset.name}`}
                  className="p-4 bg-white dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all active:scale-90"
                >
                  <ArrowUpRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;

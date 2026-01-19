import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { VibrantBadge } from '../../components/ui/VibrantBadge';
import { Asset, AssetCategory } from '../../types';

interface AssetGridProps {
  assets: Asset[];
  getCategoryIcon: (cat: AssetCategory) => React.ReactNode;
  onSelectAsset: (asset: Asset) => void;
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets, getCategoryIcon, onSelectAsset }) => {
  return (
    <div className="p-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 h-full bg-muted/20">
      {assets.map((asset) => (
        <div
          key={asset.id}
          onClick={() => onSelectAsset(asset)}
          role="button"
          aria-label={`View details for ${asset.name}`}
          className="bg-card p-8 rounded-[3rem] border border-border shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
            {React.cloneElement(
              getCategoryIcon(asset.category) as React.ReactElement<{ size: number }>,
              {
                size: 120,
              }
            )}
          </div>
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <div className="w-14 h-14 bg-background dark:bg-card rounded-[1.25rem] flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
              {getCategoryIcon(asset.category)}
            </div>
            <VibrantBadge>{asset.status}</VibrantBadge>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 leading-none antialiased">
            {asset.name}
          </h3>
          <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mb-8">
            {asset.id} • S/N: {asset.serialNumber}
          </p>
          <div className="pt-8 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest mb-1">
                Custodian
              </p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                {asset.custodianName}
              </p>
            </div>
            <button
              aria-label="View details"
              className="p-3 bg-muted rounded-xl text-slate-400 group-hover:text-blue-600 transition-all"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetGrid;

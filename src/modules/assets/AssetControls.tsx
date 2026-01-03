import React from 'react';
import { Search, List, LayoutGrid, Download } from 'lucide-react';

interface AssetControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  view: 'grid' | 'list';
  setView: (view: 'grid' | 'list') => void;
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  categories: readonly string[];
}

const AssetControls: React.FC<AssetControlsProps> = ({
  searchTerm,
  setSearchTerm,
  view,
  setView,
  filterCategory,
  setFilterCategory,
  categories,
}) => {
  return (
    <div className="p-14 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-slate-50/50 dark:bg-slate-950/20 backdrop-blur-3xl">
      <div className="flex-1 max-w-4xl space-y-8">
        <div className="flex gap-4">
          <div className="relative group flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input
              aria-label="Search assets"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500/20 pl-16 pr-8 py-4 rounded-[1.5rem] text-lg font-black outline-none text-slate-900 dark:text-white shadow-inner transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
              placeholder="Query ID, S/N, or Custodian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex p-2 bg-slate-100 dark:bg-slate-800 rounded-[1.375rem] border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setView('list')}
              aria-label="Switch to list view"
              className={`px-6 py-2.5 rounded-xl transition-all font-black text-[0.625rem] uppercase tracking-widest flex items-center gap-2 ${view === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} /> Table
            </button>
            <button
              onClick={() => setView('grid')}
              aria-label="Switch to grid view"
              className={`px-6 py-2.5 rounded-xl transition-all font-black text-[0.625rem] uppercase tracking-widest flex items-center gap-2 ${view === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} /> Matrix
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              aria-label={`Filter by ${cat}`}
              className={`px-6 py-2 rounded-full text-[0.625rem] font-black uppercase tracking-widest transition-all border ${filterCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-500/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <button aria-label="Download assets report" className="p-5 bg-slate-950 dark:bg-slate-800 text-white rounded-[1.5rem] shadow-xl hover:scale-105 transition-all">
        <Download size={24} />
      </button>
    </div>
  );
};

export default AssetControls;

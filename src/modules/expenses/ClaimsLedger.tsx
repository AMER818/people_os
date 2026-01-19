import React from 'react';
import { Search, Filter, Landmark, ArrowUpRight, FileText, FileSpreadsheet } from 'lucide-react';
import { VibrantBadge } from '../../components/ui/VibrantBadge';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/formatting';
// import { exportToExcel, exportToPDF } from '../../utils/exportUtils'; // Lazy loaded

interface ClaimsLedgerProps {
  expenses: Expense[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectClaim: (claim: Expense) => void;
}

const ClaimsLedger: React.FC<ClaimsLedgerProps> = ({
  expenses,
  searchTerm,
  setSearchTerm,
  onSelectClaim,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-card rounded-xl border border-border shadow-xl overflow-hidden min-h-[31.25rem] flex flex-col">
        <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-muted/50 backdrop-blur-3xl">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
              Claims Registry
            </h3>
            <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Landmark size={10} className="text-success" /> Fiscal Disbursement Logic Active
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 group-focus-within:text-success transition-colors" />
              <input
                className="bg-card border border-border pl-10 pr-4 py-2 rounded-lg text-xs font-black outline-none w-48 shadow-sm"
                placeholder="Query Node UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 bg-muted rounded-lg text-slate-500 hover:text-emerald-600 transition-all shadow-sm">
              <Filter size={16} />
            </button>
            <button
              onClick={async () => {
                const { exportToPDF } = await import('../../utils/exportUtils');
                const headers = ['ID', 'Employee', 'Category', 'Amount', 'Date', 'Status'];
                const data = expenses.map((e) => ({
                  ID: e.id,
                  Employee: e.employeeName,
                  Category: e.category,
                  Amount: e.amount,
                  Date: e.date,
                  Status: e.status,
                }));
                exportToPDF(data, headers, 'Claims_Registry');
              }}
              className="p-2.5 bg-muted rounded-xl text-slate-500 hover:text-danger transition-all shadow-sm"
              title="Export PDF"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={async () => {
                const { exportToExcel } = await import('../../utils/exportUtils');
                const data = expenses.map((e) => ({
                  ID: e.id,
                  Employee: e.employeeName,
                  Category: e.category,
                  Amount: e.amount,
                  Date: e.date,
                  Status: e.status,
                  Currency: e.currency,
                }));
                exportToExcel(data, 'Claims_Registry');
              }}
              className="p-2.5 bg-muted rounded-xl text-slate-500 hover:text-success transition-all shadow-sm"
              title="Export Excel"
            >
              <FileSpreadsheet size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="bg-muted text-[0.625rem] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">
                <th className="px-6 py-3">Personnel Node</th>
                <th className="px-6 py-3">Category Cluster</th>
                <th className="px-6 py-3">Amount Vector</th>
                <th className="px-6 py-3">Current Phase</th>
                <th className="px-6 py-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="group hover:bg-success/5 transition-all cursor-pointer"
                  onClick={() => onSelectClaim(exp)}
                >
                  <td className="px-6 py-3">
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none antialiased">
                      {exp.employeeName}
                    </p>
                    <p className="text-[0.5625rem] font-black text-success uppercase mt-1 tracking-widest">
                      {exp.id} • {exp.date}
                    </p>
                  </td>
                  <td className="px-6 py-3">
                    <VibrantBadge>{exp.category}</VibrantBadge>
                  </td>
                  <td className="px-6 py-3 text-sm font-black text-slate-900 dark:text-white antialiased font-mono">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="px-6 py-3">
                    <VibrantBadge>{exp.status}</VibrantBadge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      aria-label="View claim details"
                      className="p-1.5 bg-card text-slate-400 hover:text-emerald-600 rounded-md shadow-sm border border-border transition-all"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClaimsLedger;

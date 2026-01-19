import React from 'react';
import { Search, Fingerprint, ArrowUpRight, FileText, FileSpreadsheet } from 'lucide-react';
import { VibrantBadge } from '../../components/ui/VibrantBadge';
import { formatCurrency } from '../../utils/formatting';
// import { exportToExcel, exportToPDF } from '../../utils/exportUtils'; // Lazy loaded

interface PayrollLedgerProps {
  ledger: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectTx: (tx: any) => void;
}

const PayrollLedger: React.FC<PayrollLedgerProps> = ({
  ledger,
  searchTerm,
  setSearchTerm,
  onSelectTx,
}) => {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-md overflow-hidden min-h-[31.25rem] flex flex-col">
      <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-muted-bg/30 backdrop-blur-3xl">
        <div>
          <h3 className="text-lg font-black text-text-primary tracking-tight uppercase leading-none">
            Payroll History
          </h3>
          <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest mt-2 flex items-center gap-2">
            <Fingerprint size={10} className="text-primary" /> Compliance Verified
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              aria-label="Search employees"
              className="bg-app border border-border pl-10 pr-4 py-2 rounded-lg text-xs font-black outline-none w-56 shadow-inner focus:w-64 transition-all duration-300 text-text-primary"
              placeholder="Search Employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const { exportToPDF } = await import('../../utils/exportUtils');
                const headers = [
                  'ID',
                  'Name',
                  'Department',
                  'Gross Salary',
                  'Status',
                  'Payment Mode',
                ];
                const data = ledger.map((tx) => ({
                  ID: tx.id,
                  Name: tx.name,
                  Department: tx.dept,
                  'Gross Salary': tx.gross,
                  Status: tx.status,
                  'Payment Mode': tx.paymentMode,
                }));
                exportToPDF(data, headers, 'Payroll_Ledger');
              }}
              className="p-2 bg-primary text-surface rounded-lg shadow-md hover:scale-105 hover:bg-danger transition-all"
              title="Export PDF"
              aria-label="Export to PDF"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={async () => {
                const { exportToExcel } = await import('../../utils/exportUtils');
                const data = ledger.map((tx) => ({
                  ID: tx.id,
                  Name: tx.name,
                  Department: tx.dept,
                  'Gross Salary': tx.gross,
                  Status: tx.status,
                  'Payment Mode': tx.paymentMode,
                  Bank: tx.bankName,
                  Account: tx.accountNumber,
                }));
                exportToExcel(data, 'Payroll_Ledger');
              }}
              className="p-2 bg-primary text-surface rounded-lg shadow-md hover:scale-105 hover:bg-success transition-all"
              title="Export Excel"
              aria-label="Export to Excel"
            >
              <FileSpreadsheet size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-sm">
          <thead>
            <tr className="bg-muted text-[0.625rem] font-black uppercase text-text-muted tracking-[0.25em] font-sans">
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Gross Salary</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans">
            {ledger.map((tx, index) => (
              <tr
                key={tx.id}
                className="group hover:bg-primary-soft/50 transition-all cursor-pointer animate-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onSelectTx(tx)}
              >
                <td className="px-6 py-3">
                  <p className="text-sm font-black text-text-primary leading-none antialiased">
                    {tx.name}
                  </p>
                  <p className="text-[0.5625rem] font-black text-primary uppercase mt-1 tracking-widest">
                    {tx.id}
                  </p>
                  {tx.paymentMode === 'Bank Transfer' && tx.bankName && (
                    <div className="mt-1 flex items-center gap-2 text-[0.5625rem] font-bold text-text-muted uppercase tracking-wider">
                      <span className="text-success">{tx.bankName}</span>
                      <span>•</span>
                      <span className="font-mono">{tx.accountNumber}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-3">
                  <VibrantBadge variant="outline">{tx.dept}</VibrantBadge>
                </td>
                <td className="px-6 py-3 text-sm font-black text-text-primary antialiased font-mono">
                  {formatCurrency(tx.gross)}
                </td>
                <td className="px-6 py-3 text-center">
                  <VibrantBadge>{tx.status}</VibrantBadge>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    aria-label="View details"
                    className="p-1.5 bg-muted-bg text-text-muted hover:text-primary rounded-md shadow-sm border border-border transition-all"
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
  );
};

export default PayrollLedger;

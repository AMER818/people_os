import React from 'react';
import { Search, SearchCode, Plus, Sparkles, Filter as FilterIcon, FileText, FileSpreadsheet } from 'lucide-react';
import EmployeeStats from './EmployeeStats';
import EmployeeList from './EmployeeList';
import { Employee as EmployeeType } from '../../types';
// import { exportToExcel, exportToPDF } from '../../utils/exportUtils'; // Lazy loaded

interface EmployeeDashboardProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdd: () => void;
  onSelect: (emp: EmployeeType) => void;
  onEdit: (emp: EmployeeType) => void;
  onExit: (emp: EmployeeType) => void;
  onDelete: (id: string) => void;
  filteredEmployees: EmployeeType[];
  upcomingEvents: any[];
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  searchTerm,
  setSearchTerm,
  onAdd,
  onSelect,
  onEdit,
  onExit,
  onDelete,
  filteredEmployees,
  upcomingEvents,
}) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Premium Hero Section */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
          <div>
            <h1 className="text-4xl font-black text-slate-100 tracking-tighter leading-none uppercase">Identity Register</h1>
            <p className="text-blue-400 mt-4 font-black uppercase tracking-[0.4em] text-[0.6rem] flex items-center gap-3">
              <span className="w-10 h-[2px] bg-blue-500/50"></span>
              Workforce Lifecycle Management
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Search & Command Center */}
      <div className="p-8 bg-[#0f172a] border border-border/40 rounded-2xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none transition-opacity group-hover:opacity-70"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-500/20 shadow-sm">
              <SearchCode size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight uppercase">Employee Directory</h2>
              <p className="text-[0.6rem] font-black uppercase text-slate-500 tracking-[0.15em] mt-1">Global workspace orchestration and talent monitoring</p>
            </div>
          </div>

          <div className="flex gap-4 items-center flex-col md:flex-row">
            <div className="flex-1 flex gap-3 p-3 bg-slate-900/40 border border-slate-700/30 rounded-xl focus-within:border-blue-500/50 transition-all shadow-inner">
              <Search className="w-4 h-4 text-slate-500 my-auto" />
              <input
                placeholder="Query by Name, Identification, or Node..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-2 py-1 font-black text-slate-200 text-[0.8rem] outline-none placeholder:text-slate-600 uppercase tracking-tight"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="h-11 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-black uppercase text-[0.6rem] tracking-[0.15em] rounded-xl transition-all flex items-center gap-2 flex-1 md:flex-none justify-center shadow-lg">
                <FilterIcon size={14} /> Filter
              </button>
              <button
                onClick={onAdd}
                className="h-11 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[0.6rem] tracking-[0.15em] rounded-xl flex items-center gap-2 shadow-xl shadow-blue-600/20 transition-all flex-1 md:flex-none justify-center"
              >
                <Plus size={16} strokeWidth={3} /> Add Identity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <EmployeeStats
        upcomingEvents={upcomingEvents}
        totalEmployees={filteredEmployees.length}
        activeEmployees={filteredEmployees.filter(e => e.status === 'Active').length}
        onLeave={filteredEmployees.filter(e => e.status === 'On Leave').length}
        departments={new Set(filteredEmployees.map(e => e.department)).size}
      />

      {/* Employee List Section */}
      <section className="p-1 border-t border-border/10 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2">
          <div>
            <h3 className="text-xl font-black text-slate-200 tracking-tight uppercase flex items-center gap-3">
              Active Workforce
              <span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 text-[0.55rem] tracking-widest border border-blue-500/20 rounded-md">
                LIVE
              </span>
            </h3>
            <p className="text-slate-500 font-black uppercase text-[0.6rem] tracking-[0.15em] flex items-center gap-2 mt-2">
              <Sparkles className="w-3 h-3 text-blue-400" /> Authorized Identity Registry
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const { exportToPDF } = await import('../../utils/exportUtils');
                const headers = ['ID', 'Name', 'Role', 'Department', 'Status', 'Salary'];
                const data = filteredEmployees.map(e => ({
                  ID: e.id,
                  Name: e.name,
                  Role: e.designation,
                  Department: e.department,
                  Status: e.status,
                  Salary: e.grossSalary
                }));
                exportToPDF(data, headers, 'Employee_Directory');
              }}
              className="px-4 py-2 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700/50 transition-all flex items-center gap-2 font-black text-[0.55rem] uppercase tracking-widest"
              aria-label="Export to PDF"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={async () => {
                const { exportToExcel } = await import('../../utils/exportUtils');
                const data = filteredEmployees.map(e => ({
                  'Employee ID': e.id,
                  'Full Name': e.name,
                  'Designation': e.designation,
                  'Department': e.department,
                  'Status': e.status,
                  'Gross Salary': e.grossSalary,
                  'Email': e.officialEmail || e.personalEmail || '',
                  'Phone': e.officialCellNumber || e.personalCellNumber || '',
                  'Join Date': e.joiningDate
                }));
                exportToExcel(data, 'Employee_Directory');
              }}
              className="px-4 py-2 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg border border-slate-700/50 transition-all flex items-center gap-2 font-black text-[0.55rem] uppercase tracking-widest"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> EXCEL
            </button>
          </div>
        </div>
        <EmployeeList
          employees={filteredEmployees}
          onSelect={onSelect}
          onEdit={onEdit}
          onExit={onExit}
          onDelete={onDelete}
        />
      </section>
    </div>
  );
};

export default EmployeeDashboard;

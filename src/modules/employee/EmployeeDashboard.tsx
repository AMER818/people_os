import React from 'react';
import {
  Search,
  SearchCode,
  Plus,
  Sparkles,
  Filter as FilterIcon,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import EmployeeStats from './EmployeeStats';
import EmployeeList from './EmployeeList';
import { Employee as EmployeeType } from '../../types';
import { formatDate } from '../../utils/formatting';
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
      {/* Premium Hero Section Removed (Handled in toggle view in parent) */}

      {/* Enhanced Search & Command Center */}
      {/* Enhanced Search & Command Center */}
      <div className="p-8 bg-surface/40 backdrop-blur-2xl border border-border/60 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:shadow-primary/5 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none transition-opacity group-hover:opacity-100"></div>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <SearchCode size={28} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-primary tracking-tighter uppercase leading-none">
                Workforce Command
              </h2>
              <p className="text-[0.65rem] font-bold uppercase text-text-muted tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                Active Directory
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center flex-col md:flex-row">
            <div className="flex-1 flex gap-4 p-2 bg-background/50 border border-border/40 rounded-2xl focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner backdrop-blur-sm group/search">
              <div className="pl-4 flex items-center justify-center">
                <Search className="w-5 h-5 text-text-muted group-focus-within/search:text-primary transition-colors" />
              </div>
              <input
                placeholder="SEARCH PERSONNEL (NAME / ID / DEPT)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-2 py-3 font-bold text-text-primary text-sm outline-none placeholder:text-text-muted/50 tracking-wide"
              />
              <div className="pr-2 flex items-center">
                <span className="px-2 py-1 rounded-lg bg-surface border border-border text-[0.5rem] font-black text-text-muted uppercase tracking-widest hidden md:block">
                  CMD+K
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button className="h-[3.25rem] px-8 bg-surface hover:bg-muted-bg text-text-primary border border-border/50 font-black uppercase text-[0.6rem] tracking-[0.2em] rounded-xl transition-all flex items-center gap-3 flex-1 md:flex-none justify-center shadow-lg hover:-translate-y-0.5">
                <FilterIcon size={16} /> Filter
              </button>
              <button
                onClick={onAdd}
                className="h-[3.25rem] px-10 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-500 text-white font-black uppercase text-[0.6rem] tracking-[0.2em] rounded-xl flex items-center gap-3 shadow-xl shadow-primary/30 transition-all flex-1 md:flex-none justify-center hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/40 active:scale-95 duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                <Plus size={18} strokeWidth={3} className="relative z-10" />
                <span className="relative z-10">Onboard Talent</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <EmployeeStats
        upcomingEvents={upcomingEvents}
        totalEmployees={filteredEmployees.length}
        activeEmployees={filteredEmployees.filter((e) => e.status === 'Active').length}
        onLeave={filteredEmployees.filter((e) => e.status === 'On Leave').length}
        departments={new Set(filteredEmployees.map((e) => e.department)).size}
      />

      {/* Employee List Section */}
      <section className="p-1 border-t border-border/10 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2">
          <div>
            <h3 className="text-xl font-black text-text-primary tracking-tight uppercase flex items-center gap-3">
              Active Employees
            </h3>
            <p className="text-text-muted font-black uppercase text-[0.6rem] tracking-[0.15em] flex items-center gap-2 mt-2">
              <Sparkles className="w-3 h-3 text-primary" /> Employee List
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const { exportToPDF } = await import('../../utils/exportUtils');
                const headers = ['ID', 'Name', 'Role', 'Department', 'Status', 'Salary'];
                const data = filteredEmployees.map((e) => ({
                  ID: e.id,
                  Name: e.name,
                  Role: e.designation,
                  Department: e.department,
                  Status: e.status,
                  Salary: e.grossSalary,
                }));
                exportToPDF(data, headers, 'Employee_Directory');
              }}
              className="px-4 py-2 bg-surface/90/50 hover:bg-muted-bg text-text-secondary hover:text-rose-400 rounded-lg border border-border/50 transition-all flex items-center gap-2 font-black text-[0.55rem] uppercase tracking-widest"
              aria-label="Export to PDF"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={async () => {
                const { exportToExcel } = await import('../../utils/exportUtils');
                const data = filteredEmployees.map((e) => ({
                  'Employee ID': e.id,
                  'Full Name': e.name,
                  Designation: e.designation,
                  Department: e.department,
                  Status: e.status,
                  'Gross Salary': e.grossSalary,
                  Email: e.officialEmail || e.personalEmail || '',
                  Phone: e.officialCellNumber || e.personalCellNumber || '',
                  'Join Date': formatDate(e.joiningDate),
                }));
                exportToExcel(data, 'Employee_Directory');
              }}
              className="px-4 py-2 bg-surface/90/50 hover:bg-muted-bg text-text-secondary hover:text-emerald-400 rounded-lg border border-border/50 transition-all flex items-center gap-2 font-black text-[0.55rem] uppercase tracking-widest"
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

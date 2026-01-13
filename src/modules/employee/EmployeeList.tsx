import React from 'react';
import { Edit, LogOut, Trash2 } from 'lucide-react';
import { Employee as EmployeeType } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

interface EmployeeListProps {
  employees: EmployeeType[];
  onSelect: (emp: EmployeeType) => void;
  onEdit: (emp: EmployeeType) => void;
  onExit: (emp: EmployeeType) => void;
  onDelete: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onSelect,
  onEdit,
  onExit,
  onDelete,
}) => {
  return (
    <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-900/50 hover:bg-slate-900/50 border-b border-border/40">
            <TableHead className="w-[18.75rem] text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.2em] py-5 px-8">
              IDENTITY PROFILE
            </TableHead>
            <TableHead className="text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.2em] py-5 px-8">
              ROLE HIERARCHY
            </TableHead>
            <TableHead className="text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.2em] py-5 px-8">
              SCHEDULE
            </TableHead>
            <TableHead className="text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.2em] py-5 px-8">
              OPERATIONAL STATUS
            </TableHead>
            <TableHead className="text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.2em] py-5 px-8">
              COMPENSATION
            </TableHead>
            <TableHead className="text-right text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.2em] py-5 px-8">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/20">
          {employees.map((emp) => (
            <TableRow
              key={emp.id}
              className="group hover:bg-slate-800/30 transition-all cursor-pointer"
              onClick={() => onSelect(emp)}
              role="button"
              tabIndex={0}
              aria-label={`View ${emp.name}'s profile`}
            >
              <TableCell className="py-5 px-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      className="w-10 h-10 rounded-full border border-blue-500/30 shadow-sm object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full shadow-sm"></div>
                  </div>
                  <div>
                    <p className="text-[0.75rem] font-black text-slate-100 uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                      {emp.name}
                    </p>
                    <p className="text-blue-400/70 font-black font-mono text-[0.55rem] uppercase tracking-widest mt-1">
                      {emp.employeeCode}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-5 px-8">
                <p className="text-[0.7rem] font-black text-slate-300 uppercase tracking-tight antialiased">
                  {emp.designation}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-1.5 py-0.5 bg-slate-800/50 border border-border/30 rounded text-[0.55rem] font-black text-slate-400 uppercase tracking-wider">
                    {emp.department}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-emerald-400/80 font-black text-[0.55rem] uppercase tracking-wider">
                    GRADE: {emp.grade}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-5 px-8">
                <span className="px-2.5 py-1 bg-blue-600/10 border border-blue-500/20 rounded-md text-[0.6rem] font-black text-blue-400 uppercase tracking-tighter shadow-sm">
                  {emp.shift || 'FIXED FRAME'}
                </span>
              </TableCell>
              <TableCell className="py-5 px-8">
                <div
                  className={`inline-flex items-center px-2 py-0.5 rounded-full border ${
                    emp.status === 'Active'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <span className="text-[0.55rem] font-black uppercase tracking-widest">
                    {emp.status}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-5 px-8 tabular-nums">
                <span className="text-[0.75rem] font-black text-slate-200">
                  {formatCurrency(emp.grossSalary || 0)}
                </span>
              </TableCell>
              <TableCell className="py-5 px-8 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(emp);
                    }}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-all"
                    title="Edit Identity"
                    aria-label={`Edit ${emp.name}`}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExit(emp);
                    }}
                    className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-md transition-all"
                    title="Process Separation"
                    aria-label={`Process exit for ${emp.name}`}
                  >
                    <LogOut size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(emp.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                    title="Purge Record"
                    aria-label={`Delete ${emp.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeList;

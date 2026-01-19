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
import { VibrantBadge } from '../../components/ui/VibrantBadge';

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
    <div className="bg-surface border border-border/40 rounded-xl overflow-hidden shadow-2xl glass-panel">
      <Table>
        <TableHeader>
          <TableRow className="bg-bg/50 hover:bg-bg/50 border-b border-border/40">
            <TableHead className="w-[18.75rem] text-[0.55rem] font-black text-text-muted uppercase tracking-[0.2em] py-5 px-8">
              IDENTITY PROFILE
            </TableHead>
            <TableHead className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.2em] py-5 px-8">
              ROLE HIERARCHY
            </TableHead>
            <TableHead className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.2em] py-5 px-8">
              SCHEDULE
            </TableHead>
            <TableHead className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.2em] py-5 px-8">
              OPERATIONAL STATUS
            </TableHead>
            <TableHead className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.2em] py-5 px-8">
              COMPENSATION
            </TableHead>
            <TableHead className="text-right text-[0.55rem] font-black text-text-muted uppercase tracking-[0.2em] py-5 px-8">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/20">
          {employees.map((emp) => (
            <TableRow
              key={emp.id}
              className="group hover:bg-primary/5 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5 duration-300 border-l-2 border-l-transparent hover:border-l-primary"
              onClick={() => onSelect(emp)}
              role="button"
              tabIndex={0}
              aria-label={`View ${emp.name}'s profile`}
            >
              <TableCell className="py-3 px-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img
                      src={emp.avatar}
                      className="w-10 h-10 rounded-2xl border-2 border-surface shadow-sm object-cover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success border-2 border-surface rounded-full shadow-sm z-20 animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-primary uppercase tracking-tight group-hover:text-primary transition-colors">
                      {emp.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded-md bg-surface border border-border text-[0.5rem] font-black text-text-muted uppercase tracking-widest font-mono">
                        {emp.employeeCode}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 px-6">
                <p className="text-xs font-black text-text-secondary uppercase tracking-tight antialiased">
                  {emp.designation}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <VibrantBadge>{emp.department}</VibrantBadge>
                  <div className="w-1 h-1 rounded-full bg-text-muted/30" />
                  <span className="text-success/80 font-black text-[0.55rem] uppercase tracking-wider">
                    GRADE: {emp.grade}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3 px-6">
                <span className="px-2.5 py-1 bg-surface border border-border rounded-lg text-[0.6rem] font-black text-text-secondary uppercase tracking-widest shadow-sm group-hover:border-primary/30 transition-colors">
                  {emp.shift || 'FIXED FRAME'}
                </span>
              </TableCell>
              <TableCell className="py-3 px-6">
                <VibrantBadge>{emp.status}</VibrantBadge>
              </TableCell>
              <TableCell className="py-3 px-6 tabular-nums">
                <span className="text-sm font-black text-text-primary font-mono bg-surface/50 px-2 py-1 rounded-md border border-transparent group-hover:border-border/50 transition-all">
                  {formatCurrency(emp.grossSalary || 0)}
                </span>
              </TableCell>
              <TableCell className="py-3 px-6 text-right">
                <div className="flex items-center justify-end gap-2 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(emp);
                    }}
                    className="p-2 bg-surface hover:bg-primary hover:text-white text-text-muted rounded-lg border border-border/50 hover:border-primary shadow-sm transition-all"
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
                    className="p-2 bg-surface hover:bg-orange-500 hover:text-white text-text-muted rounded-lg border border-border/50 hover:border-orange-500 shadow-sm transition-all"
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
                    className="p-2 bg-surface hover:bg-destructive hover:text-white text-text-muted rounded-lg border border-border/50 hover:border-destructive shadow-sm transition-all"
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

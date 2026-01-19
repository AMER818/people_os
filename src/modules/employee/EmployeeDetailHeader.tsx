import React from 'react';
import {
  Edit3,
  AlertCircle,
  Building2,
  UserCircle,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Employee as EmployeeType } from '../../types';
import { Button } from '@components/ui/Button';

interface EmployeeDetailHeaderProps {
  employee: Partial<EmployeeType> | null;
  aiSuggestions?: any[];
}

const EmployeeDetailHeader: React.FC<EmployeeDetailHeaderProps> = ({
  employee,
  aiSuggestions = [],
}) => {
  // Logic helpers
  const hasAuditEntries = employee?.increments && employee.increments.length > 0;

  const calculateTenure = (dateStr?: string) => {
    if (!dateStr) {
      return null;
    }
    try {
      const join = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - join.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays}d Tenured`;
      }
      if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)}m Tenured`;
      }
      return `${(diffDays / 365).toFixed(1)}y Seniority`;
    } catch {
      return null;
    }
  };

  const tenure = calculateTenure(employee?.joiningDate);

  return (
    <div className="bg-surface p-10 px-16 flex items-center justify-between border-b border-border/40 relative overflow-hidden group/header shadow-xl">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 transition-all duration-1000 group-hover/header:opacity-80"></div>
      <div className="flex items-center gap-12 relative z-10 w-full">
        {/* Circular Avatar Section */}
        <div className="relative shrink-0">
          <div
            className={`absolute -inset-1.5 rounded-full blur-md opacity-20 transition-all duration-500 group-hover/header:opacity-40 ${hasAuditEntries ? 'bg-emerald-500' : 'bg-amber-500'}`}
          ></div>
          <div className="relative">
            <img
              src={
                employee?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name || 'Node')}&background=random`
              }
              className="w-32 h-32 rounded-full border-2 border-blue-500/20 shadow-2xl object-cover transition-all duration-500"
              alt={employee?.name}
            />
            <Button
              className="absolute bottom-1 right-1 bg-blue-600 p-2.5 rounded-full shadow-lg text-white border-4 border-surface hover:bg-blue-500 active:scale-95 transition-all h-auto w-auto"
              aria-label="Edit Profile Picture"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Identity Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-5 mb-4">
            <h3 className="text-3xl font-black text-text-primary tracking-tighter antialiased leading-tight truncate uppercase">
              {employee?.name || 'Unknown Employee'}
            </h3>
            {tenure && (
              <div className="px-3 py-1 bg-muted-bg/80 border border-border/30 rounded-md flex items-center gap-2 shadow-inner mb-1">
                <Calendar className="w-2.5 h-2.5 text-primary" />
                <span className="text-[0.55rem] font-black text-text-secondary uppercase tracking-widest">
                  {tenure}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Primary ID Badge */}
            <div className="bg-blue-600/10 border border-blue-500/30 px-4 py-2 rounded-lg flex items-center transition-all hover:bg-blue-600/20">
              <span className="text-blue-400 font-black font-mono text-[0.7rem] tracking-[0.25em] uppercase">
                {employee?.employeeCode}
              </span>
            </div>

            {/* Department/Role Context */}
            {(employee?.department || employee?.designation) && (
              <div className="flex items-center gap-3 px-5 py-2 bg-surface/90 border border-border/50 rounded-lg shadow-sm">
                <Building2 className="w-4 h-4 text-text-muted" />
                <span className="text-[0.625rem] font-black text-text-primary uppercase tracking-[0.15em]">
                  {employee?.department || 'GENERAL'}
                  {employee?.designation ? ` • ${employee.designation}` : ''}
                </span>
              </div>
            )}

            {/* Verification & Alerts */}
            <div className="flex items-center gap-4 ml-auto">
              {!hasAuditEntries ? (
                <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-lg border border-amber-500/30 animate-pulse transition-all">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-black text-[0.6rem] uppercase tracking-[0.1em]">
                    Pending Verification
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/30 transition-all hover:bg-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 shadow-sm" />
                  <span className="font-black text-[0.6rem] uppercase tracking-[0.1em] shadow-sm">
                    Verified
                  </span>
                </div>
              )}

              {aiSuggestions.length > 0 && (
                <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/40 shadow-lg shadow-blue-500/5">
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </div>
                  <span className="font-black text-[0.6rem] uppercase tracking-[0.1em] whitespace-nowrap">
                    {aiSuggestions.length} INSIGHT{aiSuggestions.length > 1 ? 'S' : ''}
                  </span>
                </div>
              )}

              <div className="hidden xl:flex items-center gap-2 bg-muted-bg text-text-secondary px-4 py-2 rounded-lg border border-border shadow-sm">
                <UserCircle className="w-4 h-4" />
                <span className="font-black text-[0.6rem] uppercase tracking-widest leading-none">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailHeader;

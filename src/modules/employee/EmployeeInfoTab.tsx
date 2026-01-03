import React, { useEffect, useState } from 'react';
import {
  User,
  UserRoundPen,
  Fingerprint,
  Calendar,
  Phone,
  Mail,
  CalendarCheck,
  Building,
  MapPin,
  ShieldCheck,
  HeartPulse,
  CreditCard,
  Clock,
  BrainCircuit,
  RefreshCw,
  Briefcase,
  Award,
  Star,
  AlertCircle,
  Factory,
  ChevronRight,
  Sun,
  Zap,
} from 'lucide-react';
import { formatCNIC, formatCell } from '../../utils/formatting';
import { Employee as EmployeeType } from '../../types';
import { useOrgStore } from '../../store/orgStore';

import { Input } from '../../components/ui/Input';
import { RELIGIONS, WEEK_DAYS, LEAVING_TYPES } from './constants';

interface EmployeeInfoTabProps {
  employee: Partial<EmployeeType> | null;
  updateField: (field: keyof EmployeeType, value: any) => void;
  isAnalyzing: boolean;
  aiSuggestions: any[];
}

const EmployeeInfoTab: React.FC<EmployeeInfoTabProps> = ({
  employee,
  updateField,
  isAnalyzing: propIsAnalyzing,
  aiSuggestions: propAiSuggestions,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(propIsAnalyzing || false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>(propAiSuggestions || []);
  const {
    shifts,
    employmentLevels,
    departments,
    designations,
    grades,
    subDepartments,
    plants,
    profile,
  } = useOrgStore();

  useEffect(() => {
    // Master Data is now fetched globally in App.tsx
  }, []);

  // Logic: Social Security vs Medical (Exclusive)
  const handleBenefitChange = (type: 'ss' | 'medical', val: boolean) => {
    if (type === 'ss') {
      updateField('socialSecurityStatus', val);
      if (val) {
        updateField('medicalStatus', !val);
      } // If SS is Yes, Medical must be No
    } else {
      updateField('medicalStatus', val);
      if (val) {
        updateField('socialSecurityStatus', !val);
      } // If Medical is Yes, SS must be No
    }
  };

  // AI Analysis Handler
  const handleAIAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiSuggestions([
        { icon: Award, message: 'High performance track record', type: 'success' },
        { icon: Star, message: 'Eligible for promotion review', type: 'info' },
        { icon: AlertCircle, message: 'CNIC expiring soon', type: 'warning' },
      ]);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-700">
      {/* AI Intelligence Hub */}
      {(aiSuggestions.length > 0 || isAnalyzing) && (
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border border-blue-500/20 rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                <BrainCircuit className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-100 uppercase tracking-tight">
                  Intelligence Hub
                </h4>
                <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mt-1">
                  Heuristic analysis and workforce insights
                </p>
              </div>
            </div>
            <button
              onClick={handleAIAnalysis}
              aria-label="Refresh AI analysis"
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl flex items-center gap-3 transition-all border border-slate-700 shadow-lg group-active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : 'text-blue-400'}`} />
              <span className="text-[0.65rem] font-black uppercase tracking-[0.15em]">
                {isAnalyzing ? 'Processing...' : 'Sync Heuristics'}
              </span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {aiSuggestions.map((suggestion, idx) => {
              const Icon = suggestion.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/60 rounded-xl p-5 flex items-center gap-4 border border-border/20 group/insight hover:border-blue-500/40 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50 group-hover/insight:bg-blue-600/10 transition-colors">
                    <Icon className="w-5 h-5 text-blue-400 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.7rem] font-black text-slate-300 group-hover/insight:text-white transition-colors uppercase tracking-tight leading-snug">
                      {suggestion.message}
                    </p>
                    <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-2/3 group-hover/insight:w-full transition-all duration-700"></div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 ml-auto opacity-0 group-hover/insight:opacity-100 transition-all transform group-hover/insight:translate-x-1" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Identity Registry */}
      <div className="space-y-12">
        <div className="flex items-center gap-5 px-4 border-l-4 border-blue-600">
          <Fingerprint className="text-blue-500" size={28} />
          <div>
            <h4 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
              Identity Registry
            </h4>
            <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
              Core identification and bio-metrics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 px-4">
          {/* Employee ID (Read Only) */}
          <div className="space-y-3 opacity-60">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              Authority ID
            </label>
            <div className="relative">
              <Fingerprint
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                size={16}
              />
              <div className="w-full bg-slate-900 border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.85rem] font-black text-blue-400 font-mono tracking-widest uppercase">
                {employee?.employeeCode || 'NODE_PENDING'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              LEGAL NAME *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                value={employee?.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-[#0f172a] border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-slate-200 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all transition-all uppercase placeholder:text-slate-700"
                placeholder="UNIDENTIFIED NODE"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              PATERNAL ENTITY *
            </label>
            <div className="relative">
              <UserRoundPen
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                value={employee?.fatherName || ''}
                onChange={(e) => updateField('fatherName', e.target.value)}
                className="w-full bg-[#0f172a] border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-slate-200 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all uppercase placeholder:text-slate-700"
                placeholder="FATHER NAME"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              CNIC IDENTITY # *
            </label>
            <div className="relative">
              <CreditCard
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="text"
                value={employee?.cnic || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('cnic', formatCNIC(e.target.value))
                }
                placeholder="00000-0000000-0"
                className="w-full bg-[#0f172a] border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.85rem] font-black text-slate-200 font-mono tracking-wider outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              BIRTH DATE *
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="date"
                value={employee?.dateOfBirth || ''}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className="w-full bg-[#0f172a] border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-slate-200 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              RELIGIOUS AFFILIATION
            </label>
            <div className="relative">
              <Sun className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select
                className="w-full bg-[#0f172a] border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-slate-200 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                value={employee?.religion || ''}
                onChange={(e) => updateField('religion', e.target.value)}
              >
                <option value="">SELECT RELIGION</option>
                {RELIGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/20 mx-4" />

      {/* 2. Contact Matrix */}
      <div className="space-y-12">
        <div className="flex items-center gap-5 px-4 border-l-4 border-emerald-600">
          <Phone className="text-emerald-500" size={28} />
          <div>
            <h4 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
              Contact Matrix
            </h4>
            <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
              Global communication and address nodes
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-10 px-4">
          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              Primary Mobile *
            </label>
            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                value={employee?.personalCellNumber || ''}
                onChange={(e) => updateField('personalCellNumber', formatCell(e.target.value))}
                className="w-full bg-[#0f172a] border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-700"
                placeholder="0000-0000000"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              Official Identification Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                value={employee?.officialEmail || ''}
                onChange={(e) => updateField('officialEmail', e.target.value)}
                className="w-full bg-[#0f172a] border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-700"
                placeholder="OFFICIAL@ORG.COM"
              />
            </div>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
              Current Physical Location
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                value={employee?.presentAddress || ''}
                onChange={(e) => updateField('presentAddress', e.target.value)}
                className="w-full bg-[#0f172a] border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all uppercase placeholder:text-slate-700"
                placeholder="SPECIFY CURRENT RESIDENCE BLOCK / LOCATION"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* 3. Organizational Structure */}
      <div className="space-y-12">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <Building className="text-primary" size={24} />
            <h4 className="text-2xl font-black text-text-primary uppercase tracking-tight">
              Organizational Structure
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-text-muted" />
            <Briefcase className="w-4 h-4 text-text-muted" />
            <Sun className="w-4 h-4 text-text-muted" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
              Organization Name *
            </label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
              value={employee?.orgName || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                updateField('orgName', e.target.value)
              }
            >
              <option value="">Select Organization</option>
              {profile.name && <option value={profile.name}>{profile.name}</option>}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
              HR Plant *
            </label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
              value={employee?.hrPlant || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const name = e.target.value;
                updateField('hrPlant', name);
                const obj = plants.find((p) => p.name === name);
                if (obj) {
                  updateField('plant_id', obj.id);
                }
              }}
            >
              <option value="">Select Plant</option>
              {[...plants]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
              Division
            </label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
              value={employee?.division || 'Nil'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                updateField('division', e.target.value as any)
              }
            >
              {(() => {
                // Dynamic Divisions Logic
                const selectedPlant = plants.find((p) => p.name === employee?.hrPlant);
                const dynamicDivisions =
                  selectedPlant?.divisions && selectedPlant.divisions.length > 0
                    ? ['Nil', ...selectedPlant.divisions.map((d) => d.name)]
                    : ['Nil'];

                // Deduplicate just in case
                const uniqueDivisions = Array.from(new Set(dynamicDivisions));

                return uniqueDivisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ));
              })()}
            </select>
          </div>

          {/* Employment Level */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Employment Level
            </label>
            <div className="relative">
              <select
                value={employee?.employmentLevel || ''}
                onChange={(e) => updateField('employmentLevel', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Select Level</option>
                {employmentLevels.length > 0 &&
                  employmentLevels.map((t) => (
                    <option key={t.id} value={t.code || t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <Briefcase
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
              Designation *
            </label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
              value={employee?.designation || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const desigName = e.target.value;
                updateField('designation', desigName);
                const desigObj = designations.find((d) => d.name === desigName);
                if (desigObj) {
                  updateField('designation_id', desigObj.id);
                  if (desigObj.gradeId) {
                    const gradeObj = grades.find((g) => g.id === desigObj.gradeId);
                    if (gradeObj) {
                      updateField('grade', gradeObj.name);
                      updateField('grade_id', gradeObj.id);
                    }
                  }
                } else {
                  // No fallback
                }
              }}
            >
              <option value="">Select Designation</option>
              {[...designations]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
              Grade * (Auto)
            </label>
            <div className="w-full bg-surface/50 border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary opacity-70">
              {employee?.grade || 'Auto Selected'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
              Department *
            </label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
              value={employee?.department || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const name = e.target.value;
                updateField('department', name);
                const obj = departments.find((d) => d.name === name);
                if (obj) {
                  updateField('department_id', obj.id);
                }
              }}
            >
              <option value="">Select Department</option>
              {[...departments]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>

          {employee?.department && (
            <div className="space-y-2">
              <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
                Sub Department *
              </label>
              <select
                className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
                value={employee?.subDepartment || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updateField('subDepartment', e.target.value)
                }
              >
                <option value="">Select Sub Department</option>
                {subDepartments
                  .filter((s) => {
                    const parent = departments.find((d) => d.name === employee.department);
                    return parent ? s.parentDepartmentId === parent.id : true;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <Input
            label="Line Manager"
            placeholder="Search Manager"
            value={employee?.line_manager_id || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('line_manager_id', e.target.value)
            }
            icon={User}
          />

          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2 flex items-center gap-2">
              Shift *
              <Zap className="w-3 h-3 text-warning" />
            </label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
              value={employee?.shift || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const name = e.target.value;
                updateField('shift', name);
                const obj = shifts.find((s) => s.name === name);
                if (obj) {
                  updateField('shift_id', obj.id);
                }
              }}
            >
              <option value="">Select Shift</option>
              {[...shifts]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
              Rest Day *
            </label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
              value={employee?.restDay || 'Sunday'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                updateField('restDay', e.target.value)
              }
            >
              {WEEK_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* 4. Lifecycle & Benefits */}
      <div className="space-y-12">
        <div className="flex items-center gap-4 px-2">
          <HeartPulse className="text-primary" size={24} />
          <h4 className="text-2xl font-black text-text-primary uppercase tracking-tight">
            Lifecycle & Benefits
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Input
            label="Joining Date *"
            type="date"
            value={employee?.joiningDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('joiningDate', e.target.value)
            }
            icon={CalendarCheck}
          />
          <Input
            label="Probation Period *"
            value={employee?.probationPeriod || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('probationPeriod', e.target.value)
            }
            icon={Clock}
            placeholder="e.g. 3 Months"
          />
          <Input
            label="Confirmation Date"
            type="date"
            value={employee?.confirmationDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('confirmationDate', e.target.value)
            }
            icon={CalendarCheck}
          />

          <div className="space-y-2">
            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">
              Leaving Type
            </label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-[0.75rem] font-bold text-text-primary outline-none"
              value={employee?.leavingType || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                updateField('leavingType', e.target.value)
              }
            >
              <option value="">Select (If Left)</option>
              {LEAVING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Leaving Date"
            type="date"
            value={employee?.leavingDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('leavingDate', e.target.value)
            }
            icon={CalendarCheck}
          />

          {/* Logic: EOBI Status */}
          <div className="bg-surface/30 p-4 rounded-xl space-y-4 border border-border">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={employee?.eobiStatus || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('eobiStatus', e.target.checked)
                }
              />
              <span className="text-xs font-bold uppercase tracking-wide">EOBI Registered</span>
            </div>
            {employee?.eobiStatus && (
              <Input
                label="EOBI Number"
                value={employee?.eobiNumber || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('eobiNumber', e.target.value)
                }
                icon={ShieldCheck}
              />
            )}
          </div>

          {/* Logic: SS vs Medical Exclusivity */}
          <div className="bg-surface/30 p-4 rounded-xl space-y-4 border border-border md:col-span-2">
            <p className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted mb-2">
              Coverage (Exclusive)
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={employee?.socialSecurityStatus || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleBenefitChange('ss', e.target.checked)
                  }
                />
                <span className="text-xs font-bold uppercase tracking-wide">Social Security</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={employee?.medicalStatus || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleBenefitChange('medical', e.target.checked)
                  }
                />
                <span className="text-xs font-bold uppercase tracking-wide">Medical Allowance</span>
              </div>
            </div>
            {employee?.socialSecurityStatus && (
              <Input
                label="SS Number"
                value={employee?.socialSecurityNumber || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('socialSecurityNumber', e.target.value)
                }
                icon={ShieldCheck}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoTab;

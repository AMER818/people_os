import React, { useEffect, useState } from 'react';
import {
  User,
  UserRoundPen,
  Fingerprint,
  Phone,
  Mail,
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
  ChevronDown,
} from 'lucide-react';
import { formatCNIC, formatCell } from '../../utils/formatting';
import { Employee as EmployeeType } from '../../types';
import { useOrgStore } from '../../store/orgStore';
import { useUIStore } from '../../store/uiStore';

import { Input } from '../../components/ui/Input';
import { DateInput } from '../../components/ui/DateInput';
import { Card } from '../../components/ui/Card';
import {
  RELIGIONS,
  WEEK_DAYS,
  LEAVING_TYPES,
  BLOOD_GROUPS,
  GENDERS,
  MARITAL_STATUSES,
  PAKISTAN_DISTRICTS,
} from './constants';

interface EmployeeInfoTabProps {
  employee: Partial<EmployeeType> | null;
  updateField: (field: keyof EmployeeType, value: any) => void;
  isAnalyzing: boolean;
  aiSuggestions: any[];
}

const EmployeeInfoTab: React.FC<EmployeeInfoTabProps> = ({
  employee,
  updateField,
  isAnalyzing,
  aiSuggestions,
}) => {
  const [internalSuggestions, setInternalSuggestions] = useState<any[]>([]);
  const [internalAnalyzing, setInternalAnalyzing] = useState(false);

  const suggestions = aiSuggestions.length > 0 ? aiSuggestions : internalSuggestions;
  const analyzing = isAnalyzing || internalAnalyzing;

  const { setActiveModule } = useUIStore();

  const { shifts, jobLevels, departments, designations, grades, subDepartments, plants, profile } =
    useOrgStore();

  useEffect(() => {
    // Master Data is now fetched globally in App.tsx

    // Auto-select Organization if only one exists (Current Profile)
    if (profile?.name && !employee?.orgName) {
      updateField('orgName', profile.name);
    }

    // Auto-select Plant if only one ACTIVE plant exists
    const activePlants = plants.filter((p) => p.isActive !== false);
    if (activePlants.length === 1 && !employee?.hrPlant) {
      updateField('hrPlant', activePlants[0].name);
      updateField('plant_id', activePlants[0].id);
    }
  }, [profile, plants, employee?.orgName, employee?.hrPlant, updateField]);

  // Logic: Auto-resolve IDs from Names (Self-Healing for Legacy Data)
  useEffect(() => {
    // 1. Plant
    if (employee?.hrPlant && !employee?.plant_id) {
      const p = plants.find((x) => x.name === employee.hrPlant);
      if (p) {
        updateField('plant_id', p.id);
      }
    }

    // 2. Department
    if (employee?.department && !employee?.department_id) {
      const d = departments.find((x) => x.name === employee.department);
      if (d) {
        updateField('department_id', d.id);
      }
    }

    // 3. Designation
    if (employee?.designation && !employee?.designation_id) {
      const deg = designations.find((x) => x.name === employee.designation);
      if (deg) {
        updateField('designation_id', deg.id);
      }
    }

    // 4. Sub Department
    if (employee?.subDepartment && !employee?.sub_department_id) {
      const sd = subDepartments.find((x) => x.name === employee.subDepartment);
      if (sd) {
        updateField('sub_department_id', sd.id);
      }
    }

    // 5. Shift
    if (employee?.shift && !employee?.shift_id) {
      const sh = shifts.find((x) => x.name === employee.shift);
      if (sh) {
        updateField('shift_id', sh.id);
      }
    }
  }, [
    employee?.hrPlant,
    employee?.plant_id,
    employee?.department,
    employee?.department_id,
    employee?.designation,
    employee?.designation_id,
    employee?.subDepartment,
    employee?.sub_department_id,
    employee?.shift,
    employee?.shift_id,
    plants,
    departments,
    designations,
    subDepartments,
    shifts,
    updateField,
  ]);

  // Auto-select Division if only 1 exists for the selected plant
  useEffect(() => {
    if (employee?.plant_id || employee?.hrPlant) {
      const selectedPlant =
        plants.find((p) => p.id === employee?.plant_id) ||
        plants.find((p) => p.name === employee?.hrPlant);

      if (selectedPlant?.divisions) {
        const activeDivisions = selectedPlant.divisions.filter((d) => d.isActive !== false);
        // If only 1 active division exists and current division is not set (or is Nil)
        if (activeDivisions.length === 1 && (!employee?.division || employee.division === 'Nil')) {
          updateField('division', activeDivisions[0].name);
        }
      }
    }
  }, [employee?.plant_id, employee?.hrPlant, employee?.division, plants, updateField]);

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
    setInternalAnalyzing(true);
    setTimeout(() => {
      setInternalSuggestions([
        { icon: Award, message: 'High performance track record', type: 'success' },
        { icon: Star, message: 'Eligible for promotion review', type: 'info' },
        { icon: AlertCircle, message: 'CNIC expiring soon', type: 'warning' },
      ]);
      setInternalAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-700">
      {/* AI Intelligence Hub */}
      {(suggestions.length > 0 || analyzing) && (
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border border-blue-500/20 rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                <BrainCircuit className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xl font-black text-text-primary uppercase tracking-tight">
                  AI Insights
                </h4>
                <p className="text-[0.6rem] font-black text-text-muted uppercase tracking-widest mt-1">
                  Automated insights and recommendations
                </p>
              </div>
            </div>
            <button
              onClick={handleAIAnalysis}
              aria-label="Refresh AI analysis"
              className="px-6 py-2.5 bg-muted-bg hover:bg-muted-bg/80 text-text-primary rounded-xl flex items-center gap-3 transition-all border border-border shadow-lg group-active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : 'text-primary'}`} />
              <span className="text-[0.65rem] font-black uppercase tracking-[0.15em]">
                {analyzing ? 'Processing...' : 'Refresh Insights'}
              </span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {suggestions.map((suggestion, idx) => {
              const Icon = suggestion.icon;
              return (
                <div
                  key={idx}
                  className="bg-surface/90/60 rounded-xl p-5 flex items-center gap-4 border border-border/20 group/insight hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted-bg flex items-center justify-center border border-border/50 group-hover/insight:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.7rem] font-black text-text-primary group-hover/insight:text-white transition-colors uppercase tracking-tight leading-snug">
                      {suggestion.message}
                    </p>
                    <div className="w-full bg-muted-bg h-1 mt-3 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-2/3 group-hover/insight:w-full transition-all duration-700"></div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted ml-auto opacity-0 group-hover/insight:opacity-100 transition-all transform group-hover/insight:translate-x-1" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Organizational Structure */}
      <Card className="p-8 space-y-8">
        <div className="flex items-center gap-5 px-4 border-l-4 border-blue-600">
          <Building className="text-primary" size={28} />
          <div>
            <h4 className="text-2xl font-black text-text-primary uppercase tracking-tight">
              Organizational Structure
            </h4>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em]">
                Employment & Position Details
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-5 px-4">
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              HR Plant *
            </label>
            <div className="relative">
              <Factory
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                value={employee?.plant_id || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const id = e.target.value;
                  updateField('plant_id', id);
                  const obj = plants.find((p) => p.id === id);
                  if (obj) {
                    updateField('hrPlant', obj.name);
                  }
                  // Cascade reset: Clear division when plant changes
                  updateField('division', 'Nil');
                }}
              >
                <option value="">Select Plant</option>
                {[...plants]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Division
            </label>
            <select
              className="w-full bg-surface border border-border/40 rounded-xl px-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={employee?.division || 'Nil'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                updateField('division', e.target.value as any)
              }
            >
              {(() => {
                // Dynamic Divisions Logic
                // 1. Try finding by ID first (Robust), then Name (Legacy)
                const selectedPlant =
                  plants.find((p) => p.id === employee?.plant_id) ||
                  plants.find((p) => p.name === employee?.hrPlant);

                // 2. Filter Active Divisions
                const params =
                  selectedPlant?.divisions
                    ?.filter((d) => d.isActive !== false) // Handle optional isActive
                    .map((d) => d.name) || [];

                const dynamicDivisions = params.length > 0 ? ['Nil', ...params] : ['Nil'];
                const uniqueDivisions = Array.from(new Set(dynamicDivisions));

                // 3. Auto-select if only one division (plus Nil) and nothing selected yet
                // Note: We can't do side-effects (updateField) directly in render.
                // We'll rely on the user to select, or add a useEffect if needed.
                // For now, valid rendering is the priority.

                return uniqueDivisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ));
              })()}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Designation *
            </label>
            <div className="relative">
              <Briefcase
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                value={employee?.designation_id || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const id = e.target.value;
                  updateField('designation_id', id);
                  const desigObj = designations.find((d) => d.id === id);

                  if (desigObj) {
                    updateField('designation', desigObj.name);
                    if (desigObj.gradeId) {
                      const gradeObj = grades.find((g) => g.id === desigObj.gradeId);
                      if (gradeObj) {
                        updateField('grade', gradeObj.name);
                        updateField('grade_id', gradeObj.id);

                        // Auto-select Job Level from Grade
                        if (gradeObj.jobLevelId) {
                          const levelObj = jobLevels.find((l) => l.id === gradeObj.jobLevelId);
                          if (levelObj) {
                            updateField('employmentLevel', levelObj.name);
                          }
                        }
                      }
                    }
                  }
                }}
              >
                <option value="">Select Designation</option>
                {[...designations]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Grade * (Auto)
            </label>
            <div className="w-full bg-surface border border-border/40 rounded-xl px-4 py-3.5 text-[0.8rem] font-black text-text-primary opacity-60 cursor-not-allowed">
              {employee?.grade || 'Auto Selected'}
            </div>
          </div>
          {/* Job Level */}
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Job Level * (Auto)
            </label>
            <div className="w-full bg-surface border border-border/40 rounded-xl px-4 py-3.5 text-[0.8rem] font-black text-text-primary opacity-60 cursor-not-allowed">
              {employee?.employmentLevel || 'Auto Selected'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Department *
            </label>
            <div className="relative">
              <Building
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                value={employee?.department_id || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const id = e.target.value;
                  updateField('department_id', id);
                  const obj = departments.find((d) => d.id === id);
                  if (obj) {
                    updateField('department', obj.name);
                  }
                }}
              >
                <option value="">Select Department</option>
                {[...departments]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>
          {employee?.department_id && (
            <div className="space-y-2">
              <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
                Sub Department *
              </label>
              <div className="relative">
                <Building
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  size={16}
                />
                <select
                  className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                  value={employee?.sub_department_id || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const id = e.target.value;
                    updateField('sub_department_id', id);
                    const obj = subDepartments.find((s) => s.id === id);
                    if (obj) {
                      updateField('subDepartment', obj.name);
                    }
                  }}
                >
                  <option value="">Select Sub Department</option>
                  {subDepartments
                    .filter((s) => {
                      const parent = departments.find((d) => d.id === employee.department_id);
                      return parent ? s.parentDepartmentId === parent.id : true;
                    })
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  size={16}
                />
              </div>
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
            <div className="flex items-center justify-between">
              <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1 flex items-center gap-2">
                Shift *
                <Zap className="w-3 h-3 text-warning" />
              </label>
              <button
                type="button"
                onClick={() => setActiveModule('attendance')}
                className="text-[0.6rem] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
                title="Go to Shift Management"
              >
                Manage <ChevronRight size={10} />
              </button>
            </div>
            <div className="relative">
              <Clock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                value={employee?.shift_id || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const id = e.target.value;
                  updateField('shift_id', id);
                  const obj = shifts.find((s) => s.id === id);
                  if (obj) {
                    updateField('shift', obj.name);
                  }
                }}
              >
                <option value="">Select Shift</option>
                {shifts.length === 0 && (
                  <option value="" disabled>
                    No Shifts Configured
                  </option>
                )}
                {[...shifts]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Rest Day *
            </label>
            <select
              className="w-full bg-surface border border-border/40 rounded-xl px-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
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
          <DateInput
            label="Joining Date *"
            value={employee?.joiningDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('joiningDate', e.target.value)
            }
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
          <DateInput
            label="Confirmation Date"
            value={employee?.confirmationDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('confirmationDate', e.target.value)
            }
          />
          <div className="space-y-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Leaving Type
            </label>
            <select
              className="w-full bg-surface border border-border/40 rounded-xl px-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
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
          <DateInput
            label="Leaving Date"
            value={employee?.leavingDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('leavingDate', e.target.value)
            }
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
      </Card>

      {/* Identity Registry */}
      <Card className="p-8 space-y-8">
        <div className="flex items-center gap-5 px-4 border-l-4 border-blue-600">
          <Fingerprint className="text-primary" size={28} />
          <div>
            <h4 className="text-2xl font-black text-text-primary uppercase tracking-tight">
              Personal Information
            </h4>
            <p className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] mt-1">
              Official Identification Details
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-5 px-4">
          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Full Name *
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <input
                value={employee?.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all uppercase placeholder:text-text-secondary"
                placeholder="Enter Full Name"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Father's Name *
            </label>
            <div className="relative">
              <UserRoundPen
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <input
                value={employee?.fatherName || ''}
                onChange={(e) => updateField('fatherName', e.target.value)}
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all uppercase placeholder:text-text-secondary"
                placeholder="FATHER NAME"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              CNIC Number *
            </label>
            <div className="relative">
              <CreditCard
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <input
                type="text"
                value={employee?.cnic || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('cnic', formatCNIC(e.target.value))
                }
                placeholder="00000-0000000-0"
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.85rem] font-black text-text-primary font-mono tracking-wider outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-text-secondary"
              />
            </div>
          </div>

          <div className="space-y-3">
            <DateInput
              label="BIRTH DATE *"
              value={employee?.dateOfBirth || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('dateOfBirth', e.target.value)
              }
            />
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Religion
            </label>
            <div className="relative">
              <Sun
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
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
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Gender *
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                value={employee?.gender || ''}
                onChange={(e) => updateField('gender', e.target.value)}
              >
                <option value="">SELECT GENDER</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Marital Status *
            </label>
            <div className="relative">
              <UserRoundPen
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                value={employee?.maritalStatus || ''}
                onChange={(e) => updateField('maritalStatus', e.target.value as any)}
              >
                <option value="">SELECT STATUS</option>
                {MARITAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Blood Group
            </label>
            <div className="relative">
              <HeartPulse
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none uppercase"
                value={employee?.bloodGroup || ''}
                onChange={(e) => updateField('bloodGroup', e.target.value)}
              >
                <option value="">SELECT Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Nationality *
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={16}
              />
              <input
                value={employee?.nationality || 'Pakistani'}
                onChange={(e) => updateField('nationality', e.target.value)}
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all uppercase placeholder:text-text-secondary"
                placeholder="NATIONALITY"
              />
            </div>
          </div>

          <div className="space-y-3">
            <DateInput
              label="CNIC Issued *"
              value={employee?.cnicIssueDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('cnicIssueDate', e.target.value)
              }
            />
          </div>

          <div className="space-y-3">
            <DateInput
              label="CNIC Expiry *"
              value={employee?.cnicExpiryDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('cnicExpiryDate', e.target.value)
              }
            />
          </div>
        </div>
      </Card>

      {/* Contact Matrix */}
      <Card className="p-8 space-y-8">
        <div className="flex items-center gap-5 px-4 border-l-4 border-emerald-600">
          <Phone className="text-emerald-500" size={28} />
          <div>
            <h4 className="text-2xl font-black text-text-primary uppercase tracking-tight">
              Contact Information
            </h4>
            <p className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] mt-1">
              Communication and Address Details
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-5 px-4">
          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Primary Mobile *
            </label>
            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={16}
              />
              <input
                value={employee?.personalCellNumber || ''}
                onChange={(e) => updateField('personalCellNumber', formatCell(e.target.value))}
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-text-secondary"
                placeholder="0000-0000000"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Official Identification Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={16}
              />
              <input
                value={employee?.officialEmail || ''}
                onChange={(e) => updateField('officialEmail', e.target.value)}
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-text-secondary"
                placeholder="OFFICIAL@ORG.COM"
              />
            </div>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Current Address
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={16}
              />
              <input
                value={employee?.presentAddress || ''}
                onChange={(e) => updateField('presentAddress', e.target.value)}
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all uppercase placeholder:text-text-secondary"
                placeholder="SPECIFY CURRENT RESIDENCE BLOCK / LOCATION"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Current District
            </label>
            <div className="relative">
              <Building
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none uppercase"
                value={employee?.presentDistrict || ''}
                onChange={(e) => updateField('presentDistrict', e.target.value)}
              >
                <option value="">SELECT DISTRICT</option>
                {PAKISTAN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Permanent Address
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <input
                value={employee?.permanentAddress || ''}
                onChange={(e) => updateField('permanentAddress', e.target.value)}
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all uppercase placeholder:text-text-secondary"
                placeholder="PERMANENT RESIDENCE ADDRESS"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Permanent District
            </label>
            <div className="relative">
              <Building
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <select
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-10 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none uppercase"
                value={employee?.permanentDistrict || ''}
                onChange={(e) => updateField('permanentDistrict', e.target.value)}
              >
                <option value="">SELECT DISTRICT</option>
                {PAKISTAN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted px-1">
              Official Cell
            </label>
            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
              <input
                value={employee?.officialCellNumber || ''}
                onChange={(e) => updateField('officialCellNumber', formatCell(e.target.value))}
                className="w-full bg-surface border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-[0.8rem] font-black text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-text-secondary"
                placeholder="OFFICIAL MOBILE"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeInfoTab;

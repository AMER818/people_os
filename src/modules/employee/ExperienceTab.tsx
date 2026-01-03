import React from 'react';
import { History as HistoryIcon, Building2, Trash2 } from 'lucide-react';
import { Employee as EmployeeType } from '../../types';
import { Button } from '../../components/ui/button';

interface ExperienceTabProps {
  employee: Partial<EmployeeType> | null;
  updateField: (field: keyof EmployeeType, value: any) => void;
}

const ExperienceTab: React.FC<ExperienceTabProps> = ({ employee, updateField }) => {
  const addExp = () => {
    updateField('experience', [
      ...(employee?.experience || []),
      { orgName: '', from: '', to: '', designation: '', grossSalary: 0, remarks: '' },
    ]);
  };

  const removeExp = (index: number) => {
    updateField(
      'experience',
      employee?.experience?.filter((_, i) => i !== index)
    );
  };

  const updateExp = (index: number, field: string, value: string | number) => {
    const newExp = [...(employee?.experience || [])];
    newExp[index] = { ...newExp[index], [field]: value };
    updateField('experience', newExp);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-black text-text-primary antialiased">
          Professional Chronology
        </h4>
        <Button onClick={addExp} icon={HistoryIcon} size="sm">
          Add Org
        </Button>
      </div>
      <div className="space-y-6">
        {employee?.experience?.map((exp, i) => (
          <div
            key={i}
            className="p-8 bg-muted-bg rounded-md border border-border flex items-start gap-8 relative group"
          >
            <div className="w-16 h-16 bg-surface rounded-md flex items-center justify-center text-text-muted shrink-0 shadow-sm">
              <Building2 />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                    Company
                  </p>
                  <input
                    value={exp.orgName}
                    onChange={(e) => updateExp(i, 'orgName', e.target.value)}
                    className="bg-transparent border-none font-bold text-text-primary outline-none w-full"
                    placeholder="Prev Organization..."
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                    Designation
                  </p>
                  <input
                    value={exp.designation}
                    onChange={(e) => updateExp(i, 'designation', e.target.value)}
                    className="bg-transparent border-none font-bold text-text-primary outline-none w-full"
                    placeholder="Role..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                    Tenure
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={exp.from}
                      onChange={(e) => updateExp(i, 'from', e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-text-secondary outline-none"
                    />
                    <span className="text-text-muted">to</span>
                    <input
                      type="date"
                      value={exp.to}
                      onChange={(e) => updateExp(i, 'to', e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-text-secondary outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                    Last Gross Salary
                  </p>
                  <input
                    type="number"
                    value={exp.grossSalary}
                    onChange={(e) => updateExp(i, 'grossSalary', Number(e.target.value))}
                    className="bg-transparent border-none font-bold text-text-primary outline-none w-full"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2 pt-4 border-t border-border/50">
                <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">Remarks</p>
                <input
                  value={exp.remarks}
                  onChange={(e) => updateExp(i, 'remarks', e.target.value)}
                  className="bg-transparent border-none text-xs text-text-secondary outline-none w-full placeholder:text-text-muted"
                  placeholder="Reason for leaving, achievements..."
                />
              </div>
            </div>
            <button
              onClick={() => removeExp(i)}
              aria-label="Remove experience"
              className="text-danger opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceTab;

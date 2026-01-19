import React from 'react';
import { GraduationCap, BookOpen, X } from 'lucide-react';
import { Employee as EmployeeType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface EducationTabProps {
  employee: Partial<EmployeeType> | null;
  updateField: (field: keyof EmployeeType, value: any) => void;
}

const EducationTab: React.FC<EducationTabProps> = ({ employee, updateField }) => {
  const addEdu = () => {
    updateField('education', [
      ...(employee?.education || []),
      { degree: '', institute: '', year: '', gradeGpa: '', marksObtained: 0, totalMarks: 0 },
    ]);
  };

  const removeEdu = (index: number) => {
    updateField(
      'education',
      employee?.education?.filter((_, i) => i !== index)
    );
  };

  const updateEdu = (index: number, field: string, value: any) => {
    const newEdu = [...(employee?.education || [])];
    newEdu[index] = { ...newEdu[index], [field]: value };
    updateField('education', newEdu);
  };

  return (
    <Card className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 p-8">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-black text-text-primary antialiased">Education History</h4>
        <Button onClick={addEdu} icon={BookOpen} size="sm">
          Add Degree
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {employee?.education?.map((edu, i) => (
          <div
            key={i}
            className="p-8 bg-muted-bg rounded-md border border-border space-y-6 relative group"
          >
            <button
              onClick={() => removeEdu(i)}
              aria-label="Remove degree"
              className="absolute top-6 right-6 text-text-muted hover:text-danger transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface rounded-md flex items-center justify-center text-primary shadow-sm">
                <GraduationCap />
              </div>
              <input
                value={edu.degree}
                onChange={(e) => updateEdu(i, 'degree', e.target.value)}
                className="bg-transparent border-none text-xl font-black text-text-primary outline-none w-full"
                placeholder="Degree / Certification"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                  Institute
                </p>
                <input
                  value={edu.institute}
                  onChange={(e) => updateEdu(i, 'institute', e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-text-secondary outline-none w-full"
                  placeholder="University..."
                />
              </div>
              <div className="space-y-1">
                <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                  Year
                </p>
                <input
                  value={edu.year}
                  onChange={(e) => updateEdu(i, 'year', e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-text-secondary outline-none w-full"
                  placeholder="20XX"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                  GPA / Grade
                </p>
                <input
                  value={edu.gradeGpa}
                  onChange={(e) => updateEdu(i, 'gradeGpa', e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-text-primary w-full outline-none"
                  placeholder="A+ / 3.5"
                />
              </div>
              <div>
                <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                  Marks Obtained
                </p>
                <input
                  type="number"
                  value={edu.marksObtained}
                  onChange={(e) => updateEdu(i, 'marksObtained', Number(e.target.value))}
                  className="bg-transparent border-none text-xs font-bold text-text-primary w-full outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                  Total Marks
                </p>
                <input
                  type="number"
                  value={edu.totalMarks}
                  onChange={(e) => updateEdu(i, 'totalMarks', Number(e.target.value))}
                  className="bg-transparent border-none text-xs font-bold text-text-primary w-full outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EducationTab;

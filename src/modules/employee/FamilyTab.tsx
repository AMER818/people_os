import React from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { Employee as EmployeeType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { RELATIONSHIPS } from './constants';
import { DateInput } from '../../components/ui/DateInput';

interface FamilyTabProps {
  employee: Partial<EmployeeType> | null;
  updateField: (field: keyof EmployeeType, value: any) => void;
}

const FamilyTab: React.FC<FamilyTabProps> = ({ employee, updateField }) => {
  const addMember = () => {
    updateField('family', [
      ...(employee?.family || []),
      { name: '', relationship: 'Child', dob: '' },
    ]);
  };

  const removeMember = (index: number) => {
    updateField(
      'family',
      employee?.family?.filter((_, i) => i !== index)
    );
  };

  const updateMember = (index: number, field: string, value: string) => {
    const newFamily = [...(employee?.family || [])];
    newFamily[index] = { ...newFamily[index], [field]: value };
    updateField('family', newFamily);
  };

  return (
    <Card className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 p-8">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-black text-text-primary">Family Members</h4>
        <Button onClick={addMember} icon={Plus} size="sm">
          Add Dependent
        </Button>
      </div>
      <div className="overflow-hidden rounded-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted-bg text-[0.625rem] font-black uppercase text-text-muted tracking-widest">
              <th className="px-10 py-6">Full Name</th>
              <th className="px-6 py-6">Relationship</th>
              <th className="px-6 py-6">Date of Birth</th>
              <th className="px-6 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employee?.family?.map((member, i) => (
              <tr key={i} className="hover:bg-primary-soft transition-colors group">
                <td className="px-10 py-4">
                  <input
                    value={member.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                    className="bg-transparent border-none font-bold text-text-primary w-full outline-none placeholder:text-text-muted/50"
                    placeholder="Member Name"
                  />
                </td>
                <td className="px-6 py-4">
                  <select
                    value={member.relationship}
                    onChange={(e) => updateMember(i, 'relationship', e.target.value)}
                    className="bg-transparent border-none font-bold text-primary outline-none w-full cursor-pointer"
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Calendar size={14} className="text-text-muted" />
                    <DateInput
                      value={member.dob}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateMember(i, 'dob', e.target.value)
                      }
                      className="bg-transparent border-none font-bold outline-none h-auto p-0 text-[0.75rem]"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => removeMember(i)}
                    aria-label="Remove dependent"
                    className="text-danger opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!employee?.family || employee.family.length === 0) && (
          <div className="p-12 text-center text-text-muted text-xs font-bold uppercase tracking-widest">
            No family members registered
          </div>
        )}
      </div>
    </Card>
  );
};

export default FamilyTab;

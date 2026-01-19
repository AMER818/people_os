import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Employee as EmployeeType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DateInput } from '../../components/ui/DateInput';

interface DisciplineTabProps {
  employee: Partial<EmployeeType> | null;
  updateField: (field: keyof EmployeeType, value: any) => void;
}

const DisciplineTab: React.FC<DisciplineTabProps> = ({ employee, updateField }) => {
  const addAction = () => {
    updateField('discipline', [
      ...(employee?.discipline || []),
      {
        id: `DA-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: '',
        outcome: '',
      },
    ]);
  };

  const removeAction = (index: number) => {
    updateField(
      'discipline',
      employee?.discipline?.filter((_, i) => i !== index)
    );
  };

  const updateAction = (index: number, field: string, value: string) => {
    const newLogs = [...(employee?.discipline || [])];
    newLogs[index] = { ...newLogs[index], [field]: value };
    updateField('discipline', newLogs);
  };

  return (
    <Card className="space-y-10 animate-in slide-in-from-bottom-8 duration-700 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-3xl font-black text-text-primary tracking-tight antialiased uppercase">
            Disciplinary History
          </h4>
          <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-[0.25em] mt-2">
            Record of disciplinary actions
          </p>
        </div>
        <Button
          variant="danger"
          onClick={addAction}
          icon={Plus}
          className="shadow-xl hover:scale-105"
          aria-label="Log new disciplinary incident"
        >
          Add Incident
        </Button>
      </div>

      <div className="rounded-md overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted-bg text-[0.625rem] font-black uppercase text-text-muted tracking-[0.25em]">
              <th className="px-12 py-8">Date</th>
              <th className="px-10 py-8">Description</th>
              <th className="px-10 py-8">Outcome</th>
              <th className="px-12 py-8 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(employee?.discipline || []).map((action, i) => (
              <tr key={action.id} className="hover:bg-danger-soft/20 transition-all">
                <td className="px-12 py-6">
                  <DateInput
                    value={action.date}
                    onChange={(e) => updateAction(i, 'date', e.target.value)}
                    className="bg-transparent border-none font-bold text-text-primary outline-none h-auto p-0"
                  />
                </td>
                <td className="px-10 py-6">
                  <textarea
                    value={action.description}
                    placeholder="Description..."
                    onChange={(e) => updateAction(i, 'description', e.target.value)}
                    className="bg-transparent border-none font-semibold text-sm text-text-secondary outline-none w-full resize-none h-12 py-2"
                  />
                </td>
                <td className="px-10 py-6">
                  <select
                    value={action.outcome}
                    onChange={(e) => updateAction(i, 'outcome', e.target.value)}
                    className="bg-muted-bg px-6 py-3 rounded-md font-black text-[0.625rem] uppercase text-danger outline-none cursor-pointer"
                  >
                    <option value="">Select Outcome...</option>
                    <option value="Verbal Warning">Verbal Warning</option>
                    <option value="Written Warning">Written Warning</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Termination">Termination</option>
                    <option value="Exonerated">Exonerated</option>
                  </select>
                </td>
                <td className="px-12 py-6 text-right">
                  <button onClick={() => removeAction(i)} className="text-danger">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {(employee?.discipline || []).length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-20 text-center text-text-muted font-black uppercase text-xs tracking-widest"
                >
                  No disciplinary records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DisciplineTab;

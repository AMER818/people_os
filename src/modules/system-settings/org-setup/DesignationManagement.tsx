import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Award, Star, TrendingUp } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { Grade, Designation, EmploymentLevel } from '@/types';
import { useToast } from '@components/ui/toast';
import { useModal } from '@hooks/useModal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { FormModal } from '@components/ui/FormModal';

interface DesignationManagementProps {
  onSync: () => void;
}

const DesignationManagement: React.FC<DesignationManagementProps> = React.memo(({ onSync }) => {
  const {
    profile,
    grades,
    designations,
    employmentLevels,
    addGrade,
    updateGrade,
    deleteGrade,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    addEmploymentLevel,
    updateEmploymentLevel,
    deleteEmploymentLevel,
    loadingEntities,
  } = useOrgStore();

  const { success, error: toastError } = useToast();

  // Modals
  const gradeModal = useModal();
  const desigModal = useModal();
  const empLevelModal = useModal();
  const deleteModal = useModal();

  // State
  const [gradeData, setGradeData] = useState<Partial<Grade>>({ name: '', level: undefined });
  const [desigData, setDesigData] = useState<Partial<Designation>>({ name: '', gradeId: '' });
  const [empLevelData, setEmpLevelData] = useState<Partial<EmploymentLevel>>({
    name: '',
    code: '',
    description: '',
  });
  const [deleteData, setDeleteData] = useState<{
    type: 'grade' | 'designation' | 'employmentLevel';
    id: string;
    name: string;
  }>({ type: 'grade', id: '', name: '' });

  // --- Grade Handlers ---
  const handleAddGrade = () => {
    setGradeData({ name: '', level: undefined, employmentLevelId: '' });
    gradeModal.open();
  };

  const handleEditGrade = (grade: Grade) => {
    setGradeData(grade);
    gradeModal.open();
  };

  const handleDeleteGrade = (id: string, name: string) => {
    const hasDesigs = designations.some((desig) => desig.gradeId === id);
    if (hasDesigs) {
      toastError('Cannot delete grade with designations. Please remove designations first.');
      return;
    }
    setDeleteData({ type: 'grade', id, name });
    deleteModal.open();
  };

  const handleSaveGrade = async () => {
    if (
      !gradeData.name ||
      gradeData.level === undefined ||
      gradeData.level === undefined ||
      !gradeData.employmentLevelId
    ) {
      toastError('Please enter Name, Numeric Level, and select an Employment Level');
      return;
    }

    try {
      if (gradeData.id) {
        await updateGrade(gradeData.id, gradeData);
        success('Grade updated successfully');
      } else {
        await addGrade({
          ...gradeData,
          organizationId: profile.id,
          isActive: true,
        } as any);
        success('Grade added successfully');
      }
      gradeModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to save grade: ${error.message}`);
    }
  };

  // --- Designation Handlers ---
  const handleAddDesignation = () => {
    setDesigData({ name: '', gradeId: '' });
    desigModal.open();
  };

  const handleEditDesignation = (desig: Designation) => {
    setDesigData(desig);
    desigModal.open();
  };

  const handleDeleteDesignation = (id: string, name: string) => {
    setDeleteData({ type: 'designation', id, name });
    deleteModal.open();
  };

  const handleSaveDesignation = async () => {
    if (!desigData.name || !desigData.gradeId) {
      toastError('Please enter Name and select a Grade');
      return;
    }

    try {
      if (desigData.id) {
        await updateDesignation(desigData.id, desigData);
        success('Designation updated successfully');
      } else {
        await addDesignation({
          ...desigData,
          organizationId: profile.id,
          isActive: true,
        } as any);
        success('Designation added successfully');
      }
      desigModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to save designation: ${error.message}`);
    }
  };

  // --- Employment Level Handlers ---
  const handleAddEmpLevel = () => {
    setEmpLevelData({ name: '', code: '', description: '' });
    empLevelModal.open();
  };

  const handleEditEmpLevel = (level: EmploymentLevel) => {
    setEmpLevelData({ ...level });
    empLevelModal.open();
  };

  const handleDeleteEmpLevel = (id: string, name: string) => {
    setDeleteData({ type: 'employmentLevel', id, name });
    deleteModal.open();
  };

  const handleSaveEmpLevel = async () => {
    if (!empLevelData.name || !empLevelData.code) {
      toastError('Please enter Name and Code');
      return;
    }

    // Uniqueness Check
    const duplicate = employmentLevels.some(
      (l) =>
        (l.name.toLowerCase() === empLevelData.name!.toLowerCase() ||
          l.code.toLowerCase() === empLevelData.code!.toLowerCase()) &&
        l.id !== empLevelData.id
    );

    if (duplicate) {
      toastError(
        `Error: Level Name '${empLevelData.name}' or Code '${empLevelData.code}' already exists.`
      );
      return;
    }

    try {
      if (empLevelData.id) {
        await updateEmploymentLevel(empLevelData.id, empLevelData as EmploymentLevel);
        success('Employment Level updated successfully');
      } else {
        await addEmploymentLevel({ ...empLevelData } as EmploymentLevel);
        success('Employment Level added successfully');
      }
      empLevelModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to save employment level: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    try {
      switch (deleteData.type) {
        case 'grade':
          await deleteGrade(deleteData.id);
          break;
        case 'designation':
          await deleteDesignation(deleteData.id);
          break;
        case 'employmentLevel':
          await deleteEmploymentLevel(deleteData.id);
          break;
      }
      success('Item deleted successfully');
      deleteModal.close();
    } catch (error) {
      toastError('Failed to delete item');
    }
  };

  if (loadingEntities['grades'] || loadingEntities['designations']) {
    return <div className="p-8 text-center text-text-muted">Loading designations...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Employment Types Section */}
      <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-3">
              <Briefcase size={20} className="text-primary-soft shadow-sm" />
              Engagement Models
            </h3>
            <p className="text-[0.625rem] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
              Define contractual frameworks for the workforce
            </p>
          </div>
          <Button
            onClick={handleAddEmpLevel}
            size="sm"
            className="h-9 px-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 text-[0.6rem] font-black uppercase tracking-[0.15em] gap-2 rounded-lg"
          >
            <Plus size={14} strokeWidth={3} /> Add Type
          </Button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employmentLevels.map((level) => (
            <div
              key={level.id}
              className="p-4 border border-border/20 rounded-xl bg-slate-900/40 hover:bg-slate-800/30 transition-all group border-l-2 border-l-emerald-500/50"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Briefcase size={14} />
                  </div>
                  <div>
                    <h4 className="text-[0.75rem] font-black text-slate-200 uppercase tracking-tight">
                      {level.name}
                    </h4>
                    <span className="text-[0.55rem] font-black font-mono text-emerald-400 uppercase tracking-widest opacity-70">
                      {level.code}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-slate-800"
                    onClick={() => handleEditEmpLevel(level)}
                  >
                    <Edit2 size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-500 hover:text-danger hover:bg-danger/10"
                    onClick={() => handleDeleteEmpLevel(level.id, level.name)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grades Section */}
        <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-8 py-5 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
            <div>
              <h3 className="font-black text-xs text-white uppercase tracking-widest flex items-center gap-2">
                <Award size={18} className="text-primary-soft shadow-sm" />
                Grade Matrix
              </h3>
            </div>
            <Button
              onClick={handleAddGrade}
              size="sm"
              className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[0.55rem] font-black uppercase tracking-wider gap-2 rounded-md border border-slate-700"
            >
              <Plus size={12} strokeWidth={3} /> Add Grade
            </Button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 text-[0.55rem] uppercase text-slate-500 font-black tracking-[0.2em] border-b border-border/40 sticky top-0">
                <tr>
                  <th className="px-8 py-4">GRADE IDENTITY</th>
                  <th className="px-8 py-4 text-center">LEVEL</th>
                  <th className="px-8 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {grades
                  .sort((a, b) => a.level - b.level)
                  .map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-800/20 group transition-colors">
                      <td className="px-8 py-4">
                        <span className="text-[0.65rem] font-black text-slate-300 uppercase tracking-tight">
                          {grade.name}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <div className="inline-block px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 rounded text-blue-400 font-mono text-[0.6rem] font-black">
                          {grade.level}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-white"
                            onClick={() => handleEditGrade(grade)}
                          >
                            <Edit2 size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-danger"
                            onClick={() => handleDeleteGrade(grade.id, grade.name)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Designations Section */}
        <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-8 py-5 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
            <div>
              <h3 className="font-black text-xs text-white uppercase tracking-widest flex items-center gap-2">
                <Star size={18} className="text-primary-soft shadow-sm" />
                Position Ledger
              </h3>
            </div>
            <Button
              onClick={handleAddDesignation}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-500 text-white text-[0.55rem] font-black uppercase tracking-wider gap-2 rounded-md shadow-lg shadow-blue-500/10"
            >
              <Plus size={12} strokeWidth={3} /> Add Position
            </Button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 text-[0.55rem] uppercase text-slate-300 font-black tracking-[0.2em] border-b border-border/40 sticky top-0">
                <tr>
                  <th className="px-8 py-4">POSITION TITLE</th>
                  <th className="px-8 py-4">GRADE COUPLING</th>
                  <th className="px-8 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {designations.map((desig) => {
                  const grade = grades.find((g) => g.id === desig.gradeId);
                  return (
                    <tr key={desig.id} className="hover:bg-slate-800/20 group transition-colors">
                      <td className="px-8 py-4">
                        <span className="text-[0.65rem] font-black text-slate-100 uppercase tracking-tight">
                          {desig.name}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        {grade ? (
                          <div className="flex items-center gap-2">
                            <TrendingUp size={10} className="text-blue-500/50" />
                            <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                              {grade.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[0.55rem] font-black text-danger/50 uppercase tracking-widest italic">
                            Unlinked
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-white"
                            onClick={() => handleEditDesignation(desig)}
                          >
                            <Edit2 size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-danger"
                            onClick={() => handleDeleteDesignation(desig.id, desig.name)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FormModal
        isOpen={gradeModal.isOpen}
        onClose={gradeModal.close}
        title={gradeData.id ? 'Edit Grade' : 'Add Grade'}
        onSave={handleSaveGrade}
        saveLabel="Save"
      >
        <div className="space-y-4">
          <Input
            label="Grade Name"
            placeholder="e.g. Officer"
            value={gradeData.name}
            onChange={(e) => setGradeData({ ...gradeData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Level (Numeric)"
              type="number"
              placeholder="e.g. 1"
              value={gradeData.level ?? ''}
              onChange={(e) => setGradeData({ ...gradeData, level: parseInt(e.target.value) || 0 })}
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Employment Type
              </label>
              <select
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                value={gradeData.employmentLevelId || ''}
                onChange={(e) => setGradeData({ ...gradeData, employmentLevelId: e.target.value })}
              >
                <option value="">-- Select Type --</option>
                {employmentLevels.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={desigModal.isOpen}
        onClose={desigModal.close}
        title={desigData.id ? 'Edit Designation' : 'Add Designation'}
        onSave={handleSaveDesignation}
        saveLabel="Save"
      >
        <div className="space-y-4">
          <Input
            label="Designation Title"
            placeholder="e.g. Senior Developer"
            value={desigData.name}
            onChange={(e) => setDesigData({ ...desigData, name: e.target.value })}
            required
          />
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Associated Grade
            </label>
            <select
              className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              value={desigData.gradeId || ''}
              onChange={(e) => setDesigData({ ...desigData, gradeId: e.target.value })}
            >
              <option value="">-- Select Grade --</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (Level {g.level})
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={empLevelModal.isOpen}
        onClose={empLevelModal.close}
        title={empLevelData.id ? 'Edit Employment Type' : 'Add Employment Type'}
        onSave={handleSaveEmpLevel}
        saveLabel="Save"
      >
        <div className="space-y-4">
          <Input
            label="Type Name"
            placeholder="e.g. Permanent"
            value={empLevelData.name}
            onChange={(e) => setEmpLevelData({ ...empLevelData, name: e.target.value })}
            required
          />
          <Input
            label="Code"
            placeholder="e.g. PERM"
            value={empLevelData.code}
            onChange={(e) =>
              setEmpLevelData({ ...empLevelData, code: e.target.value.toUpperCase() })
            }
            required
          />
          <Input
            label="Description"
            placeholder="e.g. Full-time employees with benefits"
            value={empLevelData.description || ''}
            onChange={(e) => setEmpLevelData({ ...empLevelData, description: e.target.value })}
          />
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete <strong>{deleteData.name}</strong>? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={deleteModal.close}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default DesignationManagement;

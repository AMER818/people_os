import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Award } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { Designation } from '@/types';
import { useToast } from '@components/ui/Toast';
import { useModal } from '@hooks/useModal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { FormModal } from '@/components/ui/FormModal';
import { VibrantBadge } from '@/components/ui/VibrantBadge';

interface DesignationManagementProps {
  onSync: () => void;
}

const DesignationManagement: React.FC<DesignationManagementProps> = React.memo(({ onSync }) => {
  const {
    grades,
    jobLevels, // Added for grouping
    designations,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    loadingEntities,
  } = useOrgStore();

  const { success, error: toastError } = useToast();

  // Modals
  const desigModal = useModal();
  const deleteModal = useModal();

  // State
  const [desigData, setDesigData] = useState<Partial<Designation>>({
    name: '',
    gradeId: '',
    departmentId: '',
  });

  const [deleteData, setDeleteData] = useState<{
    id: string;
    name: string;
  }>({ id: '', name: '' });

  // --- Designation Handlers ---
  const handleAddDesig = () => {
    setDesigData({ name: '', gradeId: '', departmentId: '' });
    desigModal.open();
  };

  const handleAddDesigToGrade = (gradeId: string) => {
    setDesigData({ name: '', gradeId: gradeId, departmentId: '' });
    desigModal.open();
  };

  const handleEditDesig = (desig: Designation) => {
    setDesigData(desig);
    desigModal.open();
  };

  const handleDeleteDesig = (id: string, name: string) => {
    setDeleteData({ id, name });
    deleteModal.open();
  };

  const handleSaveDesig = async () => {
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

  const confirmDelete = async () => {
    if (!deleteData.id) {
      return;
    }
    try {
      await deleteDesignation(deleteData.id);
      success('Designation deleted successfully');
      deleteModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to delete: ${error.message}`);
    }
  };

  if (loadingEntities['designations']) {
    return <div className="p-8 text-center text-text-muted">Loading designations...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Designations Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Designations (Job Titles)
            </h2>
            <p className="text-sm text-text-muted">Create job titles for your employees.</p>
          </div>
          <Button
            onClick={handleAddDesig}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Designation
          </Button>
        </div>

        <div className="space-y-10">
          {jobLevels?.map((level) => {
            const levelGrades = grades
              .filter((g) => g.jobLevelId === level.id)
              .sort((a, b) => a.level - b.level);

            if (levelGrades.length === 0) {
              return null;
            }

            return (
              <div key={level.id} className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                  <h3 className="text-lg font-bold text-vibrant">{level.name}</h3>
                  {level.code && (
                    <VibrantBadge color="blue" className="font-mono text-xs">
                      {level.code}
                    </VibrantBadge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {levelGrades.map((grade) => {
                    const gradeDesignations = designations.filter((d) => d.gradeId === grade.id);

                    return (
                      <div className="card-vibrant p-5 relative group flex flex-col h-full">
                        {/* Grade Header */}
                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-border">
                          <div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-mono text-primary border border-primary/20"
                                title="Grade Level"
                              >
                                {grade.level}
                              </div>
                              <h3 className="font-semibold text-text-primary text-lg">
                                {grade.name}
                              </h3>
                            </div>
                            {grade.code && (
                              <p className="text-xs text-text-muted mt-1 font-mono">{grade.code}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleAddDesigToGrade(grade.id)}
                            title="Add Designation to this Grade"
                            aria-label={`Add Designation to ${grade.name}`}
                          >
                            <Plus size={16} className="text-primary" />
                          </Button>
                        </div>

                        {/* Designations List */}
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                              <Briefcase size={12} />
                              Job Titles
                            </h4>
                            <VibrantBadge variant="outline" className="text-[10px] px-2 py-0.5">
                              {gradeDesignations.length}
                            </VibrantBadge>
                          </div>

                          <div className="space-y-2">
                            {gradeDesignations.length > 0 ? (
                              gradeDesignations.map((desig) => (
                                <div
                                  key={desig.id}
                                  className="card-vibrant p-3 flex items-center justify-between group/item hover:border-primary/50"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm text-text-primary font-medium">
                                      {desig.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditDesig(desig)}
                                      className="h-6 w-6 p-0 hover:bg-surface rounded"
                                      aria-label={`Edit ${desig.name}`}
                                    >
                                      <Edit2 size={12} className="text-primary" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteDesig(desig.id, desig.name)}
                                      className="h-6 w-6 p-0 hover:bg-surface rounded"
                                      aria-label={`Delete ${desig.name}`}
                                    >
                                      <Trash2 size={12} className="text-danger" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-xs text-text-muted italic bg-bg/20 rounded border border-dashed border-border">
                                No job titles
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Fallback for empty state logic or unassigned could go here, but omitted to prevent clutter as per request to focus on sorting */}
          {(!jobLevels || jobLevels.length === 0) && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
              <Award className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary font-medium">No Job Levels configured</p>
            </div>
          )}

          {/* Unassigned Designations (Safety Net) */}
          {designations.filter((d) => !grades.find((g) => g.id === d.gradeId)).length > 0 && (
            <div className="mt-8 p-4 border border-warning/30 bg-warning/5 rounded-xl">
              <h3 className="font-bold text-warning mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" /> Unassigned Generic Designations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {designations
                  .filter((d) => !grades.find((g) => g.id === d.gradeId))
                  .map((desig) => (
                    <div
                      key={desig.id}
                      className="bg-surface p-3 rounded border border-border flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{desig.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDesig(desig)}
                          className="h-6 w-6 p-0"
                          aria-label={`Edit ${desig.name}`}
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDesig(desig.id, desig.name)}
                          className="h-6 w-6 p-0"
                          aria-label={`Delete ${desig.name}`}
                        >
                          <Trash2 size={12} className="text-danger" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Designation Modal */}
      <FormModal
        isOpen={desigModal.isOpen}
        onClose={desigModal.close}
        title={desigData.id ? 'Edit Designation' : 'Add Designation'}
        onSave={handleSaveDesig}
        saveLabel="Save Designation"
      >
        <div className="space-y-4">
          <Input
            label="Designation Name"
            value={desigData.name || ''}
            onChange={(e) => setDesigData({ ...desigData, name: e.target.value })}
            placeholder="e.g. Senior Developer"
            required
            autoFocus
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">Grade</label>
            <select
              value={desigData.gradeId || ''}
              onChange={(e) => setDesigData({ ...desigData, gradeId: e.target.value })}
              className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" className="bg-surface text-text-primary">
                Select Grade
              </option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id} className="bg-surface text-text-primary">
                  {grade.name} (Level {grade.level})
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormModal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title={`Delete Designation`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete <strong>{deleteData.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
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

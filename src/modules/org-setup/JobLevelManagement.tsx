import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOrgStore } from '@/store/orgStore';
import { JobLevel, Grade } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Briefcase, Award } from 'lucide-react';
import { useModal } from '@/hooks/useModal';
import { FormModal } from '@/components/ui/FormModal';
import { Modal } from '@/components/ui/Modal';
import { VibrantBadge } from '@/components/ui/VibrantBadge';

const JobLevelManagement: React.FC<{ onSync: () => void }> = ({ onSync }) => {
  const {
    jobLevels,
    grades,
    fetchGrades,
    addJobLevel,
    updateJobLevel,
    deleteJobLevel,
    addGrade,
    updateGrade,
    deleteGrade,
    isLoading,
  } = useOrgStore();
  const { success, error: toastError } = useToast();

  React.useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  // --- Job Level State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<JobLevel | null>(null);
  const deleteModal = useModal();
  const [levelToDelete, setLevelToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobLevel>();

  // --- Grade State ---
  const gradeModal = useModal();
  const deleteGradeModal = useModal();
  const [editingGrade, setEditingGrade] = useState<Partial<Grade>>({});
  const [gradeToDelete, setGradeToDelete] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  // --- Level Handlers ---
  const onSubmit = async (data: JobLevel) => {
    try {
      if (editingLevel) {
        await updateJobLevel(editingLevel.id, { ...editingLevel, ...data });
        success('Job level updated successfully');
      } else {
        await addJobLevel(data);
        success('Job level added successfully');
      }
      setIsModalOpen(false);
      reset();
      setEditingLevel(null);
      onSync();
    } catch {
      toastError('Failed to save job level');
    }
  };

  const handleEdit = (level: JobLevel) => {
    setEditingLevel(level);
    reset(level);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setLevelToDelete(id);
    deleteModal.open();
  };

  const confirmDelete = async () => {
    if (!levelToDelete) {
      return;
    }
    try {
      await deleteJobLevel(levelToDelete);
      success('Job level deleted');
      deleteModal.close();
      onSync();
    } catch {
      toastError('Failed to delete job level');
    }
  };

  // --- Grade Handlers ---
  const handleAddGrade = (levelId: string) => {
    setSelectedLevelId(levelId);
    setEditingGrade({ name: '', level: undefined, jobLevelId: levelId });
    gradeModal.open();
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setSelectedLevelId(grade.jobLevelId || null);
    gradeModal.open();
  };

  const handleDeleteGradeClick = (gradeId: string) => {
    setGradeToDelete(gradeId);
    deleteGradeModal.open();
  };

  const saveGrade = async () => {
    if (!editingGrade.name || editingGrade.level === undefined || !selectedLevelId) {
      toastError('Please enter Grade Name and Numeric Level');
      return;
    }

    try {
      if (editingGrade.id) {
        await updateGrade(editingGrade.id, editingGrade);
        success('Grade updated');
      } else {
        await addGrade({
          ...editingGrade,
          jobLevelId: selectedLevelId,
          isActive: true,
        } as any);
        success('Grade added');
      }
      gradeModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to save grade: ${error.message}`);
    }
  };

  const confirmDeleteGrade = async () => {
    if (!gradeToDelete) {
      return;
    }
    try {
      await deleteGrade(gradeToDelete);
      success('Grade deleted');
      deleteGradeModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to delete grade: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Job Levels
          </h2>
          <p className="text-sm text-text-muted">Manage seniority levels.</p>
        </div>
        <Button
          onClick={() => {
            setEditingLevel(null);
            reset({});
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Job Level
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobLevels?.map((level) => {
          const levelGrades =
            grades?.filter((g) => g.jobLevelId === level.id).sort((a, b) => a.level - b.level) ||
            [];

          return (
            <div
              key={level.id}
              className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full glass-panel"
            >
              {/* Level Header */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-vibrant text-lg">{level.name}</h3>
                    <VibrantBadge color="cyan" className="font-mono text-xs">
                      {level.code}
                    </VibrantBadge>
                  </div>
                  {level.description && (
                    <p className="text-xs text-text-muted mt-1">{level.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(level)}
                    aria-label={`Edit ${level.name}`}
                  >
                    <Pencil size={14} className="text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteClick(level.id)}
                    aria-label={`Delete ${level.name}`}
                  >
                    <Trash2 size={14} className="text-danger" />
                  </Button>
                </div>
              </div>

              {/* Grades Section */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={12} />
                    Associated Grades
                  </h4>
                  <button
                    onClick={() => handleAddGrade(level.id)}
                    className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded flex items-center gap-1 transition-colors border border-primary/20"
                  >
                    <Plus size={10} /> Add Grade
                  </button>
                </div>

                <div className="space-y-2">
                  {levelGrades.length > 0 ? (
                    levelGrades.map((grade) => (
                      <div
                        key={grade.id}
                        className="card-vibrant p-2 flex items-center justify-between group/grade hover:border-primary/50"
                      >
                        <div className="flex items-center gap-3">
                          <VibrantBadge
                            variant="outline"
                            className="font-mono text-[10px] w-6 h-6 justify-center p-0"
                          >
                            {grade.level}
                          </VibrantBadge>
                          <span className="text-sm text-text-primary font-medium">
                            {grade.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGrade(grade)}
                            className="h-6 w-6 p-0 hover:bg-surface rounded"
                            aria-label={`Edit ${grade.name}`}
                          >
                            <Pencil size={12} className="text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGradeClick(grade.id)}
                            className="h-6 w-6 p-0 hover:bg-surface rounded"
                            aria-label={`Delete ${grade.name}`}
                          >
                            <Trash2 size={12} className="text-danger" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-text-muted italic bg-bg/20 rounded border border-dashed border-border">
                      No grades defined
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {jobLevels?.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
            <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No job levels defined</p>
            <p className="text-text-muted text-sm mt-1">
              Create your first job level to get started
            </p>
          </div>
        )}
      </div>

      {/* Delete Level Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Job Level"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete this job level? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={deleteModal.close}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="danger">
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Grade Modal */}
      <FormModal
        isOpen={gradeModal.isOpen}
        onClose={gradeModal.close}
        title={editingGrade?.id ? 'Edit Grade' : 'Add Grade'}
        onSave={saveGrade}
        isLoading={isLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Grade Name</label>
            <input
              value={editingGrade.name || ''}
              onChange={(e) => setEditingGrade({ ...editingGrade, name: e.target.value })}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. G1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Numeric Level
            </label>
            <input
              type="number"
              value={editingGrade.level || ''}
              onChange={(e) =>
                setEditingGrade({ ...editingGrade, level: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. 1"
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Grade Modal */}
      <Modal
        isOpen={deleteGradeModal.isOpen}
        onClose={deleteGradeModal.close}
        title="Delete Grade"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Are you sure you want to delete this grade?</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={deleteGradeModal.close}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteGrade} variant="danger">
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Level Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSubmit(onSubmit)}
        title={editingLevel ? 'Edit Job Level' : 'Add Job Level'}
        isLoading={isLoading}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Job Level Name
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Permanent"
            />
            {errors.name && <span className="text-danger text-xs mt-1">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Code</label>
            <input
              {...register('code', { required: 'Code is required' })}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono uppercase"
              placeholder="e.g. PERM"
            />
            {errors.code && <span className="text-danger text-xs mt-1">{errors.code.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="e.g. Full-time employees with benefits"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isActive')}
              defaultChecked={true}
              className="w-4 h-4 rounded border-border bg-transparent text-primary focus:ring-primary/20"
            />
            <label className="text-sm text-text-secondary">Active</label>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
export default JobLevelManagement;

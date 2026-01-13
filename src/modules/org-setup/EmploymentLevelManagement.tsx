import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOrgStore } from '@/store/orgStore';
import { EmploymentLevel } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Briefcase, Info } from 'lucide-react';

const EmploymentLevelManagement: React.FC<{ onSync: () => void }> = ({ onSync }) => {
  const {
    employmentLevels,
    addEmploymentLevel,
    updateEmploymentLevel,
    deleteEmploymentLevel,
    isLoading,
  } = useOrgStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EmploymentLevel | null>(null);
  const { success, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmploymentLevel>();

  const onSubmit = async (data: EmploymentLevel) => {
    try {
      if (editingLevel) {
        await updateEmploymentLevel(editingLevel.id, { ...editingLevel, ...data });
        success('Employment level updated successfully');
      } else {
        await addEmploymentLevel(data);
        success('Employment level added successfully');
      }
      setIsModalOpen(false);
      reset();
      setEditingLevel(null);
      onSync();
    } catch (error) {
      toastError('Failed to save employment level');
    }
  };

  const handleEdit = (level: EmploymentLevel) => {
    setEditingLevel(level);
    reset(level);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employment level?')) {
      try {
        await deleteEmploymentLevel(id);
        success('Employment level deleted');
        onSync();
      } catch (error) {
        toastError('Failed to delete employment level');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            Employment Levels
          </h2>
          <p className="text-sm text-slate-400">
            Define employment categories (e.g., Permanent, Contract, Intern).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLevel(null);
            reset({});
            setIsModalOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Level
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employmentLevels?.map((level) => (
          <div
            key={level.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-slate-800/80 backdrop-blur-sm rounded-bl-xl">
              <button
                onClick={() => handleEdit(level)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(level.id)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${level.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}
              >
                {level.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-slate-100 mb-1">{level.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-mono mb-3">
              <span className="bg-slate-700/50 px-1.5 py-0.5 rounded text-xs">{level.code}</span>
            </div>

            {level.description && (
              <div className="flex items-start gap-2 text-sm text-slate-500 border-t border-slate-700/50 pt-3 mt-1">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="line-clamp-2">{level.description}</p>
              </div>
            )}
          </div>
        ))}

        {employmentLevels?.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No employment levels defined</p>
            <p className="text-slate-500 text-sm mt-1">
              Create your first employment level to get started
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLevel ? 'Edit Employment Level' : 'Add Employment Level'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Level Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Permanent"
            />
            {errors.name && (
              <span className="text-red-400 text-xs mt-1">{errors.name.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Code</label>
            <input
              {...register('code', { required: 'Code is required' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono uppercase"
              placeholder="e.g. PERM"
            />
            {errors.code && (
              <span className="text-red-400 text-xs mt-1">{errors.code.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="e.g. Full-time employees with benefits"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isActive')}
              defaultChecked={true}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-sm text-slate-300">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmploymentLevelManagement;

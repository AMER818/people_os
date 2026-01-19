import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Factory,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  User,
  X,
  PlusCircle,
} from 'lucide-react';
import { useOrgStore } from '@/store/orgStore';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Plant } from '@/types';
import { useModal } from '@/hooks/useModal';

const PlantManagement: React.FC = () => {
  const { plants, addPlant, updatePlant, deletePlant } = useOrgStore();
  const { success, error } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deleteModal = useModal();
  const [plantToDelete, setPlantToDelete] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Plant>({
    defaultValues: {
      divisions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'divisions',
  });

  const openAddModal = () => {
    setEditingPlant(null);
    reset({
      name: '',
      code: '',
      location: '',
      headOfPlant: '',
      contactNumber: '',
      isActive: true,
      divisions: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plant: Plant) => {
    setEditingPlant(plant);
    reset(plant);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Plant) => {
    try {
      if (editingPlant) {
        await updatePlant(editingPlant.id, data);
        success('Location updated successfully');
      } else {
        await addPlant({ ...data, id: crypto.randomUUID() });
        success('Location added successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      error('Failed to save location');
      console.error(err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPlantToDelete(id);
    deleteModal.open();
  };

  const onConfirmDelete = async () => {
    if (!plantToDelete) {
      return;
    }

    try {
      await deletePlant(plantToDelete);
      success('Location deleted successfully');
      deleteModal.close();
      setPlantToDelete(null);
    } catch (err) {
      console.error(err);
      error('Failed to delete location');
    }
  };

  const filteredPlants = plants.filter(
    (plant) =>
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Factory className="text-primary" size={20} />
            Locations
          </h3>
          <p className="text-xs text-text-muted mt-1">Manage your office locations.</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          <Plus size={16} className="mr-2" />
          Add Location
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border/50 glass-panel shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search locations, codes or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlants.map((plant) => (
          <div key={plant.id} className="card-vibrant p-5 group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Factory size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-vibrant">{plant.name}</h4>
                  <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-bg text-text-secondary border border-border">
                    {plant.code}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(plant)}
                  className="h-8 w-8 p-0 text-text-muted hover:text-primary"
                  aria-label={`Edit ${plant.name}`}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(plant.id)}
                  className="h-8 w-8 p-0 text-text-muted hover:text-danger"
                  aria-label={`Delete ${plant.name}`}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <MapPin size={14} className="text-text-muted shrink-0" />
                <span className="truncate">{plant.location || 'No address set'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <User size={14} className="text-text-muted shrink-0" />
                <span className="truncate">{plant.headOfPlant || 'No Head assigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Phone size={14} className="text-text-muted shrink-0" />
                <span>{plant.contactNumber || 'No contact'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/30 flex justify-between items-center text-xs">
              <span
                className={`flex items-center gap-1.5 font-semibold ${
                  plant.isActive ? 'text-success' : 'text-text-muted'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${plant.isActive ? 'bg-success' : 'bg-text-muted'}`}
                />
                {plant.isActive ? 'Active' : 'Inactive'}
              </span>
              {plant.divisions && plant.divisions.length > 0 && (
                <span className="text-text-muted">{plant.divisions.length} Divisions</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Location"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-xl text-text-primary">
            <Trash2 className="w-5 h-5 text-danger" />
            <p className="text-sm font-medium">Are you sure you want to delete this location?</p>
          </div>
          <p className="text-xs text-text-muted">
            This action cannot be undone. Any departments assigned to this plant will need to be
            re-assigned.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={deleteModal.close}>
              Cancel
            </Button>
            <Button onClick={onConfirmDelete} variant="danger">
              Delete Location
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlant ? 'Edit Location' : 'Add New Location'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Location Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. Lahore Plant 1"
              />
              {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Location Code
              </label>
              <input
                {...register('code', { required: 'Code is required' })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. LHR-01"
              />
              {errors.code && <p className="text-danger text-xs mt-1">{errors.code.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">
              Address / Location
            </label>
            <input
              {...register('location', { required: 'Location is required' })}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Full address of the facility"
            />
            {errors.location && (
              <p className="text-danger text-xs mt-1">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Location Manager
              </label>
              <input
                {...register('headOfPlant')}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Name of person in charge"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Contact Number
              </label>
              <input
                {...register('contactNumber')}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="+92..."
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Divisions
              </label>
              <button
                type="button"
                onClick={() => append({ name: '', code: '', isActive: true })}
                className="text-xs flex items-center gap-1 text-primary hover:text-primary-light font-medium"
              >
                <PlusCircle size={14} /> Add Division
              </button>
            </div>

            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <input
                      {...register(`divisions.${index}.name` as const, { required: true })}
                      placeholder="Division Name"
                      className="w-full bg-bg border border-border rounded p-2 text-xs text-text-primary focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                    <input
                      {...register(`divisions.${index}.code` as const, { required: true })}
                      placeholder="Code"
                      className="w-full bg-bg border border-border rounded p-2 text-xs text-text-primary focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition"
                    aria-label="Remove Division"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-xs text-slate-500 text-center italic py-2">
                  No divisions added yet.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 rounded border-border bg-transparent text-primary focus:ring-primary/20"
            />
            <label
              htmlFor="isActive"
              className="text-sm text-text-secondary select-none cursor-pointer"
            >
              Active Location
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="primary">
              {isSubmitting ? 'Saving...' : editingPlant ? 'Update Location' : 'Create Location'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlantManagement;

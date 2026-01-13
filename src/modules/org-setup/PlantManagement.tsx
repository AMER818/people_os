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

const PlantManagement: React.FC = () => {
  const { plants, addPlant, updatePlant, deletePlant } = useOrgStore();
  const { success, error } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deletePlant(id);
        success('Location deleted successfully');
      } catch (err) {
        error('Failed to delete location');
      }
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
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Factory className="text-primary" size={20} />
            Plants & Locations
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage production units, offices, and physical locations.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
        >
          <Plus size={16} className="mr-2" />
          Add Location
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search locations, codes or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-border rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="group bg-slate-800/50 hover:bg-slate-800 border border-border/50 hover:border-primary/50 rounded-xl p-5 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Factory size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{plant.name}</h4>
                  <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                    {plant.code}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(plant)}
                  className="p-1.5 hover:bg-slate-700/50 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(plant.id)}
                  className="p-1.5 hover:bg-slate-700/50 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin size={14} className="text-slate-500 shrink-0" />
                <span className="truncate">{plant.location || 'No address set'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <User size={14} className="text-slate-500 shrink-0" />
                <span className="truncate">{plant.headOfPlant || 'No Head assigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Phone size={14} className="text-slate-500 shrink-0" />
                <span>{plant.contactNumber || 'No contact'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/30 flex justify-between items-center text-xs">
              <span
                className={`flex items-center gap-1.5 font-semibold ${
                  plant.isActive ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${plant.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}
                />
                {plant.isActive ? 'Active' : 'Inactive'}
              </span>
              {plant.divisions && plant.divisions.length > 0 && (
                <span className="text-slate-500">{plant.divisions.length} Divisions</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlant ? 'Edit Location' : 'Add New Location'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Plant Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="e.g. Lahore Plant 1"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Plant Code</label>
              <input
                {...register('code', { required: 'Code is required' })}
                className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="e.g. LHR-01"
              />
              {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Address / Location
            </label>
            <input
              {...register('location', { required: 'Location is required' })}
              className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Full address of the facility"
            />
            {errors.location && (
              <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Head of Plant
              </label>
              <input
                {...register('headOfPlant')}
                className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="Name of person in charge"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Contact Number
              </label>
              <input
                {...register('contactNumber')}
                className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="+92..."
              />
            </div>
          </div>

          <div className="border-t border-border/30 pt-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                      className="w-full bg-slate-900 border border-border rounded p-2 text-xs text-white focus:ring-1 focus:ring-primary/50 outline-none"
                    />
                    <input
                      {...register(`divisions.${index}.code` as const, { required: true })}
                      placeholder="Code"
                      className="w-full bg-slate-900 border border-border rounded p-2 text-xs text-white focus:ring-1 focus:ring-primary/50 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition"
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
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary/50"
            />
            <label htmlFor="isActive" className="text-sm text-slate-300 select-none cursor-pointer">
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

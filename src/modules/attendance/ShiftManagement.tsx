import React, { useState, useEffect } from 'react';
import { DEFAULT_SHIFT_COLOR } from '../../utils/themeColors';
import { Clock, Plus, Edit2, Trash2, Zap, Users } from 'lucide-react';
import { useOrgStore } from '../../store/orgStore';
import { Shift } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { useModal } from '../../hooks/useModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { FormModal } from '../../components/ui/FormModal';
import { VibrantBadge } from '../../components/ui/VibrantBadge';

interface ShiftManagementProps {
  onSync: () => void;
}

const ShiftManagement: React.FC<ShiftManagementProps> = React.memo(({ onSync }) => {
  const {
    shifts,
    employees,
    addShift,
    updateShift,
    deleteShift,
    loadingEntities,
    fetchShifts,
    fetchEmployees,
  } = useOrgStore();

  // Fetch shifts and employees on mount
  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, [fetchShifts, fetchEmployees]);

  const { success, error: toastError } = useToast();

  // Modals
  const shiftModal = useModal();
  const deleteModal = useModal();

  // State
  const [shiftData, setShiftData] = useState<Partial<Shift>>({
    name: '',
    code: '',
    type: 'Fixed',
    startTime: '09:00',
    endTime: '17:00',
    gracePeriod: 15,
    breakDuration: 60,
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    color: DEFAULT_SHIFT_COLOR, // Default Blue
    description: '',
  });
  const [deleteData, setDeleteData] = useState<{ id: string; name: string }>({ id: '', name: '' });

  // --- Shift Handlers ---
  const handleAddShift = () => {
    setShiftData({
      name: '',
      code: '',
      type: 'Fixed',
      startTime: '09:00',
      endTime: '17:00',
      gracePeriod: 15,
      breakDuration: 60,
      workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      color: DEFAULT_SHIFT_COLOR,
      description: '',
    });
    shiftModal.open();
  };

  const handleEditShift = (shift: Shift) => {
    setShiftData({ ...shift });
    shiftModal.open();
  };

  const handleDeleteShift = (id: string, name: string) => {
    setDeleteData({ id, name });
    deleteModal.open();
  };

  const handleSaveShift = async () => {
    if (!shiftData.name || !shiftData.code) {
      toastError('Name and Code are required');
      return;
    }

    // Uniqueness Check
    const duplicate = shifts.some(
      (s) => s.code.toLowerCase() === shiftData.code!.toLowerCase() && s.id !== shiftData.id
    );

    if (duplicate) {
      toastError(`Error: Shift Code '${shiftData.code}' already exists.`);
      return;
    }

    // Standard Code Validation
    const type = shiftData.type;
    const code = shiftData.code?.toUpperCase();

    // Rotating, Reliever, Flexible shifts: Clear times
    const isFlexibleTiming = ['Rotating', 'Reliever', 'Flexible'].includes(type || '');
    const finalShiftData = {
      ...shiftData,
      startTime: isFlexibleTiming ? '00:00' : shiftData.startTime,
      endTime: isFlexibleTiming ? '00:00' : shiftData.endTime,
    };

    if (type === 'Fixed' && code !== 'G') {
      if (shiftData.name?.toLowerCase().includes('general') && code !== 'G') {
        toastError('General shift must have code "G"');
        return;
      }
    }
    if (type === 'Reliever' && code !== 'R') {
      toastError('Reliever shift must have code "R"');
      return;
    }
    if (type === 'Flexible' && code !== 'F') {
      toastError('Flexible shift must have code "F"');
      return;
    }
    if (type === 'Rotating' && !['A', 'B', 'C'].includes(code || '')) {
      toastError('Rotating shifts must have code A, B, or C');
      return;
    }

    try {
      if (shiftData.id) {
        await updateShift(shiftData.id, finalShiftData as Shift);
        success('Shift updated successfully');
      } else {
        await addShift(finalShiftData as any);
        success('Shift saved successfully');
      }
      shiftModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to save shift: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteShift(deleteData.id);
      success('Shift deleted successfully');
      deleteModal.close();
    } catch {
      toastError('Failed to delete shift');
    }
  };

  // --- Roster Logic ---
  const renderRosterOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      {/* Shift Cards - now 3 columns */}
      {shifts.length === 0 ? (
        <div className="lg:col-span-3 bg-surface border border-dashed border-border p-8 rounded-lg text-center">
          <div className="w-12 h-12 bg-muted-bg rounded-md flex items-center justify-center mx-auto mb-3">
            <Clock className="text-text-muted" size={20} />
          </div>
          <p className="text-text-muted font-medium text-sm">No shifts configured yet.</p>
          <Button onClick={handleAddShift} variant="outline" size="sm" className="mt-3">
            Create First Shift
          </Button>
        </div>
      ) : (
        <>
          {shifts.map((s, i) => {
            const employeeCount = employees.filter(
              (e) => e.shift_id === s.id || e.shift === s.name
            ).length;

            return (
              <div
                key={s.id || i}
                className="bg-surface rounded-lg border border-border p-3 hover:border-primary/50 transition-all relative overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                onClick={() => handleEditShift(s)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEditShift(s);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 w-full h-0.5"
                  style={{ backgroundColor: s.color || DEFAULT_SHIFT_COLOR }}
                ></div>

                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                      backgroundColor: `${s.color || DEFAULT_SHIFT_COLOR}15`,
                      color: s.color || DEFAULT_SHIFT_COLOR,
                    }}
                  >
                    {s.code}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-text-primary text-xs truncate">{s.name}</h4>
                    <p className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock size={9} />{' '}
                      {s.type === 'Rotating'
                        ? 'Weekly Rotation'
                        : ['Reliever', 'Flexible'].includes(s.type)
                          ? 'Flexible Timing'
                          : `${s.startTime} - ${s.endTime}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users size={11} className="text-primary" />
                    <span className="text-[10px] font-medium text-text-secondary">
                      {employeeCount}
                    </span>
                  </div>
                  <VibrantBadge className="text-[9px] px-1.5 py-0.5">{s.type}</VibrantBadge>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* AI Optimisation Card - compact */}
      <div className="bg-gradient-to-br from-surface to-surface/80 p-3 rounded-lg text-text-primary relative overflow-hidden border border-primary/20 hover:border-primary/40 transition-all">
        <div className="absolute -top-6 -right-6 opacity-5">
          <Zap size={80} />
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <h4 className="text-[9px] font-bold uppercase tracking-wider text-primary">
            AI Optimization
          </h4>
        </div>
        <p className="text-xs font-medium leading-snug mb-2">
          <span className="text-primary">High demand</span> predicted for Morning Shift
        </p>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-[9px] font-medium text-text-muted">
            <span>Load</span>
            <span className="text-primary">92%</span>
          </div>
          <div className="h-1 bg-muted-bg rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[92%]"></div>
          </div>
        </div>
        <Button size="sm" className="w-full h-7 text-[10px] bg-primary text-white border-none">
          Run Optimizer
        </Button>
      </div>
    </div>
  );

  if (loadingEntities['shifts']) {
    return (
      <div className="p-8 text-center text-text-muted flex items-center justify-center gap-2">
        <Clock className="animate-spin" size={16} /> Loading shifts...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Roster Overview Section */}
      <div>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Shift Roster</h2>
            <p className="text-text-muted text-xs font-medium mt-1">
              Overview of active shifts and personnel distribution
            </p>
          </div>
          <Button onClick={handleAddShift} className="gap-2 shadow-md">
            <Plus size={16} strokeWidth={3} /> New Shift
          </Button>
        </div>
        {renderRosterOverview()}
      </div>

      <div className="w-full h-px bg-border/60 my-8"></div>

      {/* Configuration Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted-bg rounded-md">
            <Edit2 size={16} className="text-text-secondary" />
          </div>
          <h3 className="text-lg font-black text-text-primary tracking-tight">Configuration</h3>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted-bg/50 text-[0.6rem] uppercase text-text-muted font-black tracking-[0.2em] border-b border-border">
                <tr>
                  <th className="px-6 py-4">Color</th>
                  <th className="px-6 py-4">Shift Name</th>
                  <th className="px-6 py-4">Timings</th>
                  <th className="px-6 py-4">Grace Time</th>
                  <th className="px-6 py-4">Break Time</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-muted-bg/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: shift.color || DEFAULT_SHIFT_COLOR }}
                      ></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary">{shift.name}</span>
                        <span className="text-[10px] font-black font-mono text-text-muted uppercase tracking-widest mt-0.5">
                          CODE: {shift.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-text-secondary">
                        {shift.type === 'Rotating' ? (
                          <span className="text-primary font-bold">Weekly Rotation</span>
                        ) : ['Reliever', 'Flexible'].includes(shift.type) ? (
                          <span className="text-info font-bold">Flexible Timing</span>
                        ) : (
                          <>
                            <span>{shift.startTime}</span>
                            <span className="text-text-muted/50">-</span>
                            <span>{shift.endTime}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-secondary">
                        {shift.gracePeriod}m
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-secondary">
                        {shift.breakDuration}m
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <p className="text-xs text-text-muted truncate" title={shift.description}>
                        {shift.description || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditShift(shift)}
                          aria-label={`Edit ${shift.name}`}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-danger hover:bg-danger/10"
                          onClick={() => handleDeleteShift(shift.id, shift.name)}
                          aria-label={`Delete ${shift.name}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shift Modal */}
      <FormModal
        isOpen={shiftModal.isOpen}
        onClose={shiftModal.close}
        title={shiftData.id ? 'Edit Shift' : 'Add Shift'}
        onSave={handleSaveShift}
        saveLabel="Save Configuration"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Shift Name"
              placeholder="e.g. Morning Shift"
              value={shiftData.name}
              onChange={(e) => setShiftData({ ...shiftData, name: e.target.value })}
              required
            />
            <Input
              label="Shift Code"
              placeholder="e.g. G, R, A"
              value={shiftData.code}
              onChange={(e) => setShiftData({ ...shiftData, code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          {/* Color Picker & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Shift Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={shiftData.color}
                  onChange={(e) => setShiftData({ ...shiftData, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-text-muted font-mono">{shiftData.color}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Shift Type
              </label>
              <select
                className="w-full bg-bg border border-border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={shiftData.type || 'Fixed'}
                onChange={(e) => setShiftData({ ...shiftData, type: e.target.value as any })}
              >
                <option value="Fixed">Fixed (General)</option>
                <option value="Rotating">Rotating (A/B/C)</option>
                <option value="Reliever">Reliever</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
              placeholder="Additional details about this shift..."
              value={shiftData.description || ''}
              onChange={(e) => setShiftData({ ...shiftData, description: e.target.value })}
            />
          </div>

          {!['Rotating', 'Reliever', 'Flexible'].includes(shiftData.type || '') && (
            <div className="grid grid-cols-2 gap-5 animate-in slide-in-from-top-1 duration-300">
              <Input
                label="Start Time"
                type="time"
                value={shiftData.startTime}
                onChange={(e) => setShiftData({ ...shiftData, startTime: e.target.value })}
                required
              />
              <Input
                label="End Time"
                type="time"
                value={shiftData.endTime}
                onChange={(e) => setShiftData({ ...shiftData, endTime: e.target.value })}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-5 p-4 bg-muted-bg/30 rounded-lg border border-border/50">
            <Input
              label="Grace Period (mins)"
              type="number"
              value={shiftData.gracePeriod}
              onChange={(e) =>
                setShiftData({ ...shiftData, gracePeriod: parseInt(e.target.value) })
              }
            />
            <Input
              label="Break Duration (mins)"
              type="number"
              value={shiftData.breakDuration}
              onChange={(e) =>
                setShiftData({ ...shiftData, breakDuration: parseInt(e.target.value) })
              }
            />
          </div>
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

export default ShiftManagement;

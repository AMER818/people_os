import React, { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, Save, X, Timer, AlertCircle } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { Shift } from '@/types';
import { useToast } from '@components/ui/Toast';
import { useModal } from '@hooks/useModal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { FormModal } from '@components/ui/FormModal';
import { api } from '@services/api';

interface ShiftManagementProps {
  onSync: () => void;
}

const ShiftManagement: React.FC<ShiftManagementProps> = React.memo(({ onSync }) => {
  const {
    shifts,
    payrollSettings,
    addShift,
    updateShift,
    deleteShift,
    updatePayrollSettings,
    loadingEntities,
  } = useOrgStore();

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
  });
  const [deleteData, setDeleteData] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [isEditingOvertime, setIsEditingOvertime] = useState(false);

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
      (s) =>
        (s.name.toLowerCase() === shiftData.name!.toLowerCase() ||
          s.code.toLowerCase() === shiftData.code!.toLowerCase()) &&
        s.id !== shiftData.id
    );

    if (duplicate) {
      toastError(
        `Error: Shift Name '${shiftData.name}' or Code '${shiftData.code}' already exists.`
      );
      return;
    }

    try {
      if (shiftData.id) {
        await updateShift(shiftData.id, shiftData as Shift);
        success('Shift updated successfully');
      } else {
        await addShift(shiftData as any);
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
    } catch (error) {
      toastError('Failed to delete shift');
    }
  };

  // --- Overtime Handlers ---
  const handleSaveOvertime = async () => {
    try {
      // Optimistic update done in UI, now syncing to backend if needed
      // Actually, we should probably save via API here
      await api.savePayrollSettings(payrollSettings);
      setIsEditingOvertime(false);
      success('Overtime rules saved successfully');
    } catch (error: any) {
      toastError(`Failed to save overtime rules: ${error.message}`);
    }
  };

  const handleCancelOvertimeEdit = async () => {
    try {
      const settings = await api.getPayrollSettings();
      updatePayrollSettings(settings);
      setIsEditingOvertime(false);
    } catch (error) {
      console.error('Failed to revert settings:', error);
    }
  };

  if (loadingEntities['shifts']) {
    return <div className="p-8 text-center text-text-muted">Loading shifts...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shifts List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-3">
                  <Clock size={20} className="text-primary-soft shadow-sm" />
                  Work Ledger
                </h3>
                <p className="text-[0.625rem] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
                  Chronological frameworks for operational continuity
                </p>
              </div>
              <Button
                onClick={handleAddShift}
                size="sm"
                className="h-9 px-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 text-[0.6rem] font-black uppercase tracking-[0.15em] gap-2 rounded-lg"
              >
                <Plus size={14} strokeWidth={3} /> Add Shift
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-[0.55rem] uppercase text-slate-300 font-black tracking-[0.2em] border-b border-border/40">
                  <tr>
                    <th className="px-8 py-5">SHIFT IDENTITY</th>
                    <th className="px-8 py-5">TIMINGS</th>
                    <th className="px-8 py-5">GOVERNANCE</th>
                    <th className="px-8 py-5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {shifts.map((shift) => (
                    <tr key={shift.id} className="hover:bg-slate-800/30 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[0.75rem] font-black text-slate-200 uppercase tracking-tight">
                            {shift.name}
                          </span>
                          <span className="text-[0.55rem] font-black font-mono text-blue-400 uppercase tracking-widest opacity-70 mt-0.5">
                            {shift.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 rounded text-slate-300 font-mono text-[0.65rem] font-black uppercase">
                            {shift.startTime}
                          </div>
                          <span className="text-slate-600 font-black">-</span>
                          <div className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 rounded text-slate-300 font-mono text-[0.65rem] font-black uppercase">
                            {shift.endTime}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-2">
                          <div className="px-2.5 py-1 rounded-[4px] bg-blue-500/10 border border-blue-500/30">
                            <span className="text-[10px] font-black text-blue-400 tracking-tighter uppercase whitespace-nowrap">
                              GRACE: {shift.gracePeriod}M
                            </span>
                          </div>
                          <div className="px-2.5 py-1 rounded-[4px] bg-amber-500/10 border border-amber-500/30">
                            <span className="text-[10px] font-black text-amber-400 tracking-tighter uppercase whitespace-nowrap">
                              BREAK: {shift.breakDuration}M
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-white"
                            onClick={() => handleEditShift(shift)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-danger hover:bg-danger/10"
                            onClick={() => handleDeleteShift(shift.id, shift.name)}
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

        {/* Overtime Settings */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl h-full">
            <div className="px-8 py-6 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-3">
                  <Timer size={20} className="text-primary-soft shadow-sm" />
                  Overtime Policy
                </h3>
                <p className="text-[0.625rem] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
                  Global computation logic
                </p>
              </div>
              {!isEditingOvertime ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-slate-800"
                  onClick={() => setIsEditingOvertime(true)}
                >
                  <Edit2 size={14} />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelOvertimeEdit}
                    className="h-8 w-8 p-0 text-danger hover:bg-danger/10 rounded-full"
                  >
                    <X size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveOvertime}
                    className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-400/10 rounded-full"
                  >
                    <Save size={14} />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-border/10">
                <div className="space-y-1">
                  <label className="text-[0.7rem] font-black text-slate-200 uppercase tracking-wider">
                    Enable Overtime
                  </label>
                  <p className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">
                    Activate OT computation logic
                  </p>
                </div>
                <button
                  role="checkbox"
                  aria-checked={payrollSettings.overtimeEnabled}
                  disabled={!isEditingOvertime}
                  className={`relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in rounded-full border-2 ${payrollSettings.overtimeEnabled ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-800 border-slate-700'} ${!isEditingOvertime ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  onClick={() =>
                    isEditingOvertime &&
                    updatePayrollSettings({
                      ...payrollSettings,
                      overtimeEnabled: !payrollSettings.overtimeEnabled,
                    })
                  }
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 shadow-lg ${payrollSettings.overtimeEnabled ? 'right-0.5 bg-blue-400' : 'left-0.5 bg-slate-500'}`}
                  />
                </button>
              </div>

              <div className="p-5 bg-slate-900/60 rounded-xl border border-border/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <AlertCircle size={48} className="text-primary-soft" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-sm mt-1">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <h4 className="text-[0.65rem] font-black text-slate-300 uppercase tracking-widest">
                      Policy Governance
                    </h4>
                    <p className="text-[0.6rem] text-slate-500 font-bold mt-2 leading-relaxed uppercase tracking-wider">
                      OT metrics are derived from assigned shift parameters. Validate Grace Period
                      and Break Duration to ensure precise accumulation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Modal */}
      <FormModal
        isOpen={shiftModal.isOpen}
        onClose={shiftModal.close}
        title={shiftData.id ? 'Edit Shift' : 'Add Shift'}
        onSave={handleSaveShift}
        saveLabel="Save"
      >
        <div className="space-y-4">
          <Input
            label="Shift Name"
            placeholder="e.g. Morning Shift"
            value={shiftData.name}
            onChange={(e) => setShiftData({ ...shiftData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              placeholder="e.g. MSA"
              value={shiftData.code}
              onChange={(e) => setShiftData({ ...shiftData, code: e.target.value.toUpperCase() })}
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Type
              </label>
              <select
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                value={shiftData.type || 'Fixed'}
                onChange={(e) => setShiftData({ ...shiftData, type: e.target.value as any })}
              >
                <option value="Fixed">Fixed</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

import React, { useState } from 'react';
import { Network, Plus, Edit2, Trash2, FolderTree, Building } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { Department, SubDepartment, MasterDepartment } from '@/types';
import { useToast } from '@components/ui/Toast';
import { useModal } from '@hooks/useModal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { FormModal } from '@components/ui/FormModal';

interface DepartmentManagementProps {
  onSync: () => void;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = React.memo(({ onSync }) => {
  const {
    profile,
    masterDepartments,
    departments,
    subDepartments,
    addMasterDepartment,
    updateMasterDepartment,
    deleteMasterDepartment,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addSubDepartment,
    updateSubDepartment,
    deleteSubDepartment,
    loadingEntities,
  } = useOrgStore();

  const { success, error: toastError } = useToast();

  // Modals
  const masterDeptModal = useModal();
  const deptModal = useModal();
  const deleteModal = useModal();

  // State
  const [masterDeptData, setMasterDeptData] = useState<Partial<MasterDepartment>>({
    name: '',
    code: '',
  });
  const [deptData, setDeptData] = useState<
    Partial<Department | SubDepartment> & { parentDepartmentId?: string }
  >({ name: '', code: '' });
  const [isSubDept, setIsSubDept] = useState(false);
  const [deleteData, setDeleteData] = useState<{
    type: 'display_department' | 'structural_department' | 'sub_department';
    id: string;
    name: string;
  }>({ type: 'display_department', id: '', name: '' });

  // --- Master Department Handlers ---
  const handleAddMasterDept = () => {
    setMasterDeptData({ name: '', code: '' });
    masterDeptModal.open();
  };

  const handleEditMasterDept = (dept: MasterDepartment) => {
    setMasterDeptData(dept);
    masterDeptModal.open();
  };

  const handleDeleteMasterDept = (id: string, name: string) => {
    setDeleteData({ type: 'display_department', id, name });
    deleteModal.open();
  };

  const handleSaveMasterDept = async () => {
    if (!masterDeptData.name || !masterDeptData.code) {
      toastError('Name and Code are required');
      return;
    }
    try {
      if (masterDeptData.id) {
        await updateMasterDepartment(masterDeptData.id, masterDeptData);
        success('Global Department updated');
      } else {
        await addMasterDepartment({
          ...masterDeptData,
          id: Date.now().toString(),
          isActive: true,
        } as MasterDepartment);
        success('Global Department added');
      }
      masterDeptModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to save: ${error.message}`);
    }
  };

  // --- Department Handlers ---
  const handleAddDepartment = () => {
    setDeptData({ name: '', code: '' });
    setIsSubDept(false);
    deptModal.open();
  };

  const handleAddSubDepartment = () => {
    setDeptData({ name: '', code: '', parentDepartmentId: '' });
    setIsSubDept(true);
    deptModal.open();
  };

  const handleEditDepartment = (dept: Department) => {
    setDeptData(dept);
    setIsSubDept(false);
    deptModal.open();
  };

  const handleEditSubDepartment = (subDept: SubDepartment) => {
    setDeptData(subDept);
    setIsSubDept(true);
    deptModal.open();
  };

  const handleDeleteDepartment = (id: string, name: string) => {
    // Check for dependencies (sub-departments)
    const hasSubs = subDepartments.some((sub) => sub.parentDepartmentId === id);
    if (hasSubs) {
      toastError(
        'Cannot delete department with sub-departments. Please remove sub-departments first.'
      );
      return;
    }
    setDeleteData({ type: 'structural_department', id, name });
    deleteModal.open();
  };

  const handleDeleteSubDepartment = (id: string, name: string) => {
    setDeleteData({ type: 'sub_department', id, name });
    deleteModal.open();
  };

  const handleSaveDepartment = async () => {
    if (!deptData.name || !deptData.code) {
      toastError('Please enter both name and code');
      return;
    }

    // Check for unique code
    const isDuplicateCode = isSubDept
      ? subDepartments.some((d) => d.code === deptData.code && d.id !== deptData.id)
      : departments.some((d) => d.code === deptData.code && d.id !== deptData.id);

    if (isDuplicateCode) {
      toastError(`Code '${deptData.code}' already exists.`);
      return;
    }

    try {
      if (isSubDept) {
        if (!deptData.parentDepartmentId) {
          toastError('Please select a parent department');
          return;
        }
        if (deptData.id) {
          await updateSubDepartment(deptData.id, deptData);
          success('Sub-department updated successfully');
        } else {
          await addSubDepartment({
            ...deptData,
            organizationId: profile.id,
            isActive: true,
          } as any);
          success('Sub-department added successfully');
        }
      } else {
        if (deptData.id) {
          await updateDepartment(deptData.id, deptData);
          success('Department updated successfully');
        } else {
          await addDepartment({
            ...deptData,
            organizationId: profile.id,
            isActive: true,
          } as any);
          success('Department added successfully');
        }
      }
      deptModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to save: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    try {
      switch (deleteData.type) {
        case 'display_department':
          await deleteMasterDepartment(deleteData.id);
          break;
        case 'structural_department':
          await deleteDepartment(deleteData.id);
          break;
        case 'sub_department':
          await deleteSubDepartment(deleteData.id);
          break;
      }
      success('Item deleted successfully');
      deleteModal.close();
    } catch (error) {
      toastError('Failed to delete item');
    }
  };

  if (loadingEntities['departments']) {
    return <div className="p-8 text-center text-text-muted">Loading hierarchy...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Global Departments Section */}
      <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-3">
              <Building size={20} className="text-primary-soft shadow-sm" />
              Global Departments
            </h3>
            <p className="text-[0.625rem] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
              Standardized reporting nodes across the enterprise
            </p>
          </div>
          <Button
            onClick={handleAddMasterDept}
            size="sm"
            className="h-9 px-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 text-[0.6rem] font-black uppercase tracking-[0.15em] gap-2 rounded-lg"
          >
            <Plus size={14} strokeWidth={3} /> Add Global Dept
          </Button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterDepartments.map((dept) => (
            <div
              key={dept.id}
              className="p-4 border border-border/20 rounded-xl bg-slate-900/40 hover:bg-slate-800/30 transition-all group border-l-2 border-l-blue-500/50"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Building size={14} />
                  </div>
                  <div>
                    <h4 className="text-[0.75rem] font-black text-slate-200 uppercase tracking-tight">
                      {dept.name}
                    </h4>
                    <span className="text-[0.55rem] font-black font-mono text-blue-400 uppercase tracking-widest opacity-70">
                      {dept.code}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-slate-800"
                    onClick={() => handleEditMasterDept(dept)}
                  >
                    <Edit2 size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-500 hover:text-danger hover:bg-danger/10"
                    onClick={() => handleDeleteMasterDept(dept.id, dept.name)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {masterDepartments.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-500 text-[0.625rem] font-bold uppercase tracking-widest">
              No global display departments configured.
            </div>
          )}
        </div>
      </div>

      {/* Structural Departments Section */}
      <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-3">
              <Network size={20} className="text-primary-soft shadow-sm" />
              Organizational Structure
            </h3>
            <p className="text-[0.625rem] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
              Functional hierarchy defining operational reporting lines
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAddDepartment}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white text-[0.65rem] font-black uppercase tracking-[0.15em] gap-2 rounded-lg shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} strokeWidth={3} /> Add Department
            </Button>
            <Button
              onClick={handleAddSubDepartment}
              variant="secondary"
              className="h-10 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[0.65rem] font-black uppercase tracking-[0.15em] gap-2 rounded-lg border border-slate-700"
            >
              <FolderTree size={16} /> Add Sub-Dept
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 text-[0.6rem] uppercase text-slate-300 font-black tracking-[0.2em] border-b border-border/40">
              <tr>
                <th scope="col" className="px-8 py-5">
                  DEPARTMENT IDENTITY
                </th>
                <th scope="col" className="px-8 py-5 text-center">
                  DEPT CODE
                </th>
                <th scope="col" className="px-8 py-5">
                  INTERNAL HIERARCHY
                </th>
                <th scope="col" className="px-8 py-5 text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {departments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-slate-500 text-[0.625rem] font-bold uppercase tracking-widest"
                  >
                    No structural departments found.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const subs = subDepartments.filter((s) => s.parentDepartmentId === dept.id);
                  return (
                    <tr key={dept.id} className="hover:bg-slate-800/30 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-sm">
                            <Network size={16} />
                          </div>
                          <span className="text-[0.75rem] font-black text-slate-100 uppercase tracking-tight">
                            {dept.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="inline-block px-3 py-1 bg-slate-800/50 border border-border/30 rounded-md">
                          <span className="font-mono text-[0.65rem] font-black text-blue-400 tracking-wider">
                            {dept.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-2">
                          {subs.length > 0 ? (
                            subs.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between bg-slate-800/20 px-3 py-1.5 rounded-lg border border-slate-700/30 group/sub"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                                  <span className="text-[0.65rem] font-black text-slate-300 uppercase tracking-tight">
                                    {sub.name}
                                  </span>
                                  <span className="text-[0.55rem] font-black font-mono text-slate-500 uppercase tracking-widest ml-1">
                                    {sub.code}
                                  </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-all">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-slate-500 hover:text-white"
                                    onClick={() => handleEditSubDepartment(sub)}
                                  >
                                    <Edit2 size={10} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-slate-500 hover:text-danger"
                                    onClick={() => handleDeleteSubDepartment(sub.id, sub.name)}
                                  >
                                    <Trash2 size={10} />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-[0.6rem] text-slate-500 font-bold italic uppercase tracking-widest opacity-50">
                              No sub-departments
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-slate-800"
                            onClick={() => handleEditDepartment(dept)}
                            aria-label={`Edit ${dept.name}`}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-danger hover:bg-danger/10"
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                            aria-label={`Delete ${dept.name}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Master Department Modal */}
      <FormModal
        isOpen={masterDeptModal.isOpen}
        onClose={masterDeptModal.close}
        title={masterDeptData.id ? 'Edit Global Department' : 'Add Global Department'}
        onSave={handleSaveMasterDept}
        saveLabel="Save Department"
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Finance"
            value={masterDeptData.name}
            onChange={(e) => setMasterDeptData({ ...masterDeptData, name: e.target.value })}
            required
          />
          <Input
            label="Department Code"
            placeholder="e.g. FIN"
            value={masterDeptData.code}
            onChange={(e) =>
              setMasterDeptData({ ...masterDeptData, code: e.target.value.toUpperCase() })
            }
            required
          />
        </div>
      </FormModal>

      {/* Structural Department Modal */}
      <FormModal
        isOpen={deptModal.isOpen}
        onClose={deptModal.close}
        title={
          isSubDept
            ? deptData.id
              ? 'Edit Sub-Department'
              : 'Add Sub-Department'
            : deptData.id
              ? 'Edit Department'
              : 'Add Department'
        }
        onSave={handleSaveDepartment}
        saveLabel="Save"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder={isSubDept ? 'Sub-Department Name' : 'Department Name'}
            value={deptData.name}
            onChange={(e) => setDeptData({ ...deptData, name: e.target.value })}
            required
          />
          <Input
            label="Code"
            placeholder="e.g. HR-REC"
            value={deptData.code}
            onChange={(e) => setDeptData({ ...deptData, code: e.target.value.toUpperCase() })}
            required
          />
          {isSubDept && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Parent Department
              </label>
              <select
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                value={deptData.parentDepartmentId || ''}
                onChange={(e) => setDeptData({ ...deptData, parentDepartmentId: e.target.value })}
              >
                <option value="">-- Select Parent Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}
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

export default DepartmentManagement;

import React, { useState } from 'react';
import {
  Network,
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useOrgStore } from '@/store/orgStore';
import { Department, SubDepartment } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { FormModal } from '@/components/ui/FormModal';
import { VibrantBadge } from '@/components/ui/VibrantBadge';

interface DepartmentManagementProps {
  onSync: () => void;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = React.memo(({ onSync }) => {
  const {
    departments,
    subDepartments,
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
  const deptModal = useModal();
  const deleteModal = useModal();

  // State
  const [deptData, setDeptData] = useState<
    Partial<Department | SubDepartment> & { parentDepartmentId?: string }
  >({ name: '', code: '' });
  const [isSubDept, setIsSubDept] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [deleteData, setDeleteData] = useState<{
    type: 'structural_department' | 'sub_department';
    id: string;
    name: string;
  }>({ type: 'structural_department', id: '', name: '' });

  // --- Department Handlers ---
  const handleAddDepartment = () => {
    setDeptData({ name: '', code: '' });
    setIsSubDept(false);
    deptModal.open();
  };

  const handleEditDepartment = (dept: Department) => {
    setDeptData(dept);
    setIsSubDept(false);
    deptModal.open();
  };

  const handleDeleteDepartment = (id: string, name: string) => {
    setDeleteData({ type: 'structural_department', id, name });
    deleteModal.open();
  };

  // --- Sub-Department Handlers ---
  const handleAddSubDepartment = (parentId: string) => {
    const parent = departments.find((d) => d.id === parentId);
    const parentCode = parent?.code || 'DEPT';
    const subCount = subDepartments.filter((sd) => sd.parentDepartmentId === parentId).length;
    const nextCode = `${parentCode}-${String(subCount + 1).padStart(2, '0')}`;

    setDeptData({
      name: '',
      code: nextCode,
      parentDepartmentId: parentId,
    });
    setIsSubDept(true);
    deptModal.open();
  };

  const handleEditSubDepartment = (subDept: SubDepartment) => {
    setDeptData(subDept);
    setIsSubDept(true);
    deptModal.open();
  };

  const handleDeleteSubDepartment = (id: string, name: string) => {
    setDeleteData({ type: 'sub_department', id, name });
    deleteModal.open();
  };

  const handleSaveDepartment = async () => {
    if (!deptData.name || !deptData.code) {
      toastError('Name and Code are required');
      return;
    }

    // Ensure code is uppercase
    const finalData = {
      ...deptData,
      code: deptData.code.toUpperCase(),
    };

    try {
      if (isSubDept) {
        if (deptData.id) {
          await updateSubDepartment(deptData.id, finalData);
          success('Sub-Department updated');
        } else {
          if (!deptData.parentDepartmentId) {
            toastError('Parent Department is required');
            return;
          }
          await addSubDepartment({
            ...finalData,
          } as any);
          success('Sub-Department added');
        }
      } else {
        if (deptData.id) {
          await updateDepartment(deptData.id, finalData);
          success('Department updated');
        } else {
          await addDepartment({
            ...finalData,
            plantId: departments[0]?.plantId || null, // Allow global department
          } as any);
          success('Department added');
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
      if (deleteData.type === 'structural_department') {
        await deleteDepartment(deleteData.id);
      } else {
        await deleteSubDepartment(deleteData.id);
      }
      success('Deleted successfully');
      deleteModal.close();
      onSync();
    } catch (error: any) {
      toastError(`Failed to delete: ${error.message}`);
    }
  };

  // --- Expand/Collapse Handlers ---
  const toggleExpand = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(departments.map((d) => d.id));
    setExpandedDepts(allIds);
  };

  const collapseAll = () => {
    setExpandedDepts(new Set());
  };

  if (loadingEntities['departments']) {
    return <div className="p-8 text-center text-text-muted">Loading hierarchy...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Organizational Structure (Functional) */}
      <div className="card-vibrant p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Network className="text-primary animate-pulse" size={24} />
              <h2 className="text-lg font-bold text-vibrant uppercase tracking-widest">
                Organizational Structure
              </h2>
            </div>
            <p className="text-xs font-medium text-text-muted pl-9 uppercase tracking-wider">
              Define departments and sub-departments.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-bg rounded-lg border border-border p-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="h-7 px-2 text-[10px] uppercase font-bold text-text-secondary hover:text-primary hover:bg-surface"
                title="Expand All"
              >
                <Maximize2 size={12} className="mr-1" /> Expand
              </Button>
              <div className="w-px bg-border my-1 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="h-7 px-2 text-[10px] uppercase font-bold text-text-secondary hover:text-primary hover:bg-surface"
                title="Collapse All"
              >
                <Minimize2 size={12} className="mr-1" /> Collapse
              </Button>
            </div>
            <Button
              onClick={() => handleAddDepartment()}
              variant="primary"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Plus size={16} className="mr-2" />
              Add Department
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {departments.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-surface/30 rounded-xl border border-dashed border-border">
              No departments found.
            </div>
          ) : (
            departments.map((dept) => {
              const subDepts = subDepartments.filter((sd) => sd.parentDepartmentId === dept.id);
              const isExpanded = expandedDepts.has(dept.id);
              const hasSubDepts = subDepts.length > 0;

              return (
                <div key={dept.id} className="card-vibrant p-0 overflow-visible group/row">
                  <div className="flex items-center justify-between p-4 pl-4">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleExpand(dept.id)}
                        className={`p-1 rounded-md transition-colors ${
                          hasSubDepts
                            ? 'hover:bg-primary/10 text-text-secondary hover:text-primary cursor-pointer'
                            : 'text-border cursor-default opacity-50'
                        }`}
                        disabled={!hasSubDepts}
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/row:scale-110 transition-transform shadow-sm">
                          <Network size={18} />
                        </div>
                        <div>
                          <span className="font-bold text-lg text-vibrant block">{dept.name}</span>
                          <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                            Department Info
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mr-4">
                      <VibrantBadge color="purple" className="font-mono text-xs px-3 py-1">
                        {dept.code}
                      </VibrantBadge>

                      <div className="flex items-center gap-2 text-text-muted text-xs font-medium bg-bg/30 px-3 py-1.5 rounded-lg border border-border/50">
                        <FolderTree size={12} className="text-secondary" />
                        <span>{subDepts.length} Sub-Depts</span>
                      </div>

                      <div className="flex gap-1 pl-4 border-l border-border/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-success hover:text-success/80 hover:bg-success/10"
                          onClick={() => handleAddSubDepartment(dept.id)}
                          title="Add Sub-Department"
                        >
                          <Plus size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-primary hover:text-primary/80 hover:bg-primary/10"
                          onClick={() => handleEditDepartment(dept)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-danger hover:text-danger/80 hover:bg-danger/10"
                          onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sub Departments Render */}
                  {isExpanded && hasSubDepts && (
                    <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-bg/40 rounded-xl border border-border/50 p-2 space-y-1 mt-1">
                        {subDepts.map((subDept) => (
                          <div
                            key={subDept.id}
                            className="card-vibrant p-3 flex items-center justify-between group/sub hover:border-primary/50"
                          >
                            <div className="flex items-center gap-3 pl-4">
                              <div className="w-1.5 h-1.5 bg-primary/50 rounded-full"></div>
                              <span className="text-text-primary text-sm font-medium">
                                {subDept.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <VibrantBadge
                                variant="outline"
                                className="font-mono text-[0.6rem] opacity-70 group-hover/sub:opacity-100"
                              >
                                {subDept.code}
                              </VibrantBadge>

                              <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-text-muted hover:text-primary"
                                  onClick={() => handleEditSubDepartment(subDept)}
                                >
                                  <Edit2 size={12} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-text-muted hover:text-danger"
                                  onClick={() =>
                                    handleDeleteSubDepartment(subDept.id, subDept.name)
                                  }
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <FormModal
        isOpen={deptModal.isOpen}
        onClose={deptModal.close}
        title={
          deptData.id
            ? isSubDept
              ? 'Edit Sub-Department'
              : 'Edit Department'
            : isSubDept
              ? 'Add Sub-Department'
              : 'Add Department'
        }
        onSave={handleSaveDepartment}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={deptData.name}
            onChange={(e) => setDeptData({ ...deptData, name: e.target.value })}
            placeholder="e.g. Human Resources"
            required
            autoFocus
          />
          <Input
            label="Code"
            value={deptData.code}
            onChange={(e) => setDeptData({ ...deptData, code: e.target.value.toUpperCase() })}
            placeholder={isSubDept ? 'Auto-generated' : 'e.g. HR01'}
            required
            disabled={isSubDept} // Read-only for sub-departments
          />
        </div>
      </FormModal>

      <FormModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title={`Delete ${deleteData.type === 'structural_department' ? 'Department' : 'Sub-Department'}`}
        onSave={confirmDelete}
        saveLabel="Delete"
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
      </FormModal>
    </div>
  );
});

export default DepartmentManagement;

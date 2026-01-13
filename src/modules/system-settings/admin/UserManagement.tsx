import React, { useState } from 'react';
import { ShieldCheck, Users, Check, X, Plus, Trash2, Edit2 } from 'lucide-react';
import { useOrgStore, Permission, ROLE_HIERARCHY } from '@store/orgStore';
import { useToast } from '@components/ui/Toast';
import { useModal } from '@hooks/useModal';
import { useSaveEntity } from '@hooks/useSaveEntity';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';

export interface AdminUserForm {
  id?: string;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isSystemUser: boolean;
  password?: string;
}

const PermissionMatrix = React.memo(() => {
  const columns: { label: string; permission: Permission }[] = [
    { label: 'Create', permission: 'create_users' },
    { label: 'Edit', permission: 'edit_users' },
    { label: 'Delete', permission: 'delete_users' },
    { label: 'Users', permission: 'manage_employees' }, // Updated from employee_management
    { label: 'Master Data', permission: 'manage_master_data' },
    { label: 'System Config', permission: 'system_config' },
    { label: 'Audit Logs', permission: 'view_audit_logs' },
  ];

  const { rolePermissions, togglePermission } = useOrgStore();

  return (
    <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden mb-8 shadow-2xl">
      <div className="px-6 py-5 border-b border-border/40 bg-slate-900/50">
        <h3 className="font-black text-sm text-white flex items-center gap-3 uppercase tracking-wider">
          <ShieldCheck size={20} className="text-primary-soft shadow-sm" />
          PERMISSION MATRIX
        </h3>
        <p className="text-[0.65rem] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
          ROLE-BASED ACCESS CONTROL DEFINITIONS
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900/80 text-[0.6rem] uppercase text-slate-300 font-black tracking-[0.2em] border-b border-border/40">
            <tr>
              <th scope="col" className="px-6 py-4">
                ROLE
              </th>
              {columns.map((col) => (
                <th key={col.permission} scope="col" className="px-6 py-4 text-center">
                  {col.label.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {ROLE_HIERARCHY.slice()
              .reverse()
              .map((role) => (
                <tr key={role} className="hover:bg-slate-800/60 transition-all duration-300 group">
                  <td
                    scope="row"
                    className="px-6 py-4 font-black text-slate-200 text-xs tracking-tight group-hover:text-white transition-colors"
                  >
                    {role}
                  </td>
                  {columns.map((col) => {
                    const localPerms = rolePermissions[role] || [];
                    const hasWildcard = localPerms.includes('*');
                    const hasAccess = hasWildcard || localPerms.includes(col.permission);

                    return (
                      <td
                        key={col.permission}
                        className="px-6 py-4 text-center"
                        onClick={() => !hasWildcard && togglePermission(role, col.permission)}
                        title={hasWildcard ? 'Full System Access (Wildcard)' : undefined}
                      >
                        <div
                          className={`
                            inline-flex items-center justify-center transition-all duration-200 
                            ${!hasWildcard ? 'hover:scale-125 cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default opacity-50'}
                          `}
                        >
                          {hasAccess ? (
                            <Check
                              size={18}
                              className="text-success drop-shadow-md"
                              strokeWidth={3}
                            />
                          ) : (
                            <X size={18} className="text-red-500" strokeWidth={3} />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

interface UserManagementProps {
  onSync: () => void;
}

/**
 * UserManagement Component
 * @description Manages system administrators, roles, and permissions within the organization.
 * Key features:
 * - Admin list management (Add/Edit/Delete)
 * - Permission matrix visualization
 * - Security policy enforcement (MFA, Session limits)
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSync - Callback after data modification
 * @param {boolean} props.isSaving - Loading state for persistence operations
 */
const UserManagement: React.FC<UserManagementProps> = ({ onSync: syncCallback }) => {
  const { users, addUser, updateUser, deleteUser, addAuditLog, fetchUsers } = useOrgStore();
  const { success, error } = useToast();
  const adminUserModal = useModal();
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // Initial Fetch
  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      await deleteUser(userToDelete.id);
      addAuditLog({
        action: `Revoked access: ${userToDelete.username}`,
        user: 'Current Admin',
        status: 'Warning',
      });
      success('User access revoked successfully');
    } catch (err: any) {
      const errorMessage = err?.message || err?.detail || 'Failed to delete user';
      error(errorMessage);
    } finally {
      setUserToDelete(null);
    }
  };

  const {
    formData,
    updateField,
    handleSave,
    isSaving: isFormSaving,
    setFormData,
  } = useSaveEntity<AdminUserForm>({
    initialState: {
      username: '',
      name: '',
      email: '',
      role: 'SystemAdmin',
      status: 'Active',
      isSystemUser: false,
    },
    onSave: async (data) => {
      if (data.id) {
        updateUser(data.id, { ...data, role: data.role as any } as any); // Force cast to avoid strict union mismatch
        addAuditLog({
          action: `Updated admin user: ${data.username}`,
          user: 'Current Admin',
          status: 'Success',
        });
      } else {
        addUser({ ...data, id: Date.now().toString() } as any);
        addAuditLog({
          action: `Added admin user: ${data.username}`,
          user: 'Current Admin',
          status: 'Success',
        });
      }
      syncCallback?.();
      adminUserModal.close();
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Admin Management Section */}
      <div
        className="bg-[#0f172a] border border-border/40 rounded-2xl shadow-2xl overflow-hidden"
        role="region"
        aria-label="Administrator Management"
      >
        <div className="px-8 py-6 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-white uppercase tracking-wider">
              Access Control List
            </h3>
            <p className="text-[0.625rem] text-slate-400 font-bold mt-1.5 uppercase tracking-[0.2em]">
              Manage root and administrative credentials
            </p>
          </div>
          <Button
            size="sm"
            className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white text-[0.65rem] font-black uppercase tracking-[0.15em] gap-3 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => {
              setFormData({
                username: '',
                name: '',
                email: '',
                role: 'SystemAdmin',
                status: 'Active',
                isSystemUser: false,
              });
              adminUserModal.open();
            }}
            aria-label="Add New Administrator"
          >
            <Plus size={16} strokeWidth={3} /> Add Administrator
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 text-[0.6rem] uppercase text-slate-300 font-black tracking-[0.25em] border-b border-border/40">
              <tr>
                <th scope="col" className="px-8 py-5">
                  IDENTITY
                </th>
                <th scope="col" className="px-8 py-5">
                  ROLE / ACCESS
                </th>
                <th scope="col" className="px-8 py-5 text-center">
                  SECURITY STATUS
                </th>
                <th scope="col" className="px-8 py-5 text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users.map((user: any) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[0.7rem] font-black border border-blue-500/30">
                        {(user.name || user.username || 'U')
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-black text-slate-100">{user.username}</p>
                        <p className="text-[0.625rem] text-slate-400 font-medium tracking-tight mt-0.5">
                          {user.name || 'No Name Set'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-block px-4 py-2 bg-[#1e293b] border border-slate-700/50 rounded-lg shadow-inner">
                      <span className="font-black text-[0.625rem] tracking-[0.2em] text-blue-400 uppercase">
                        {user.role === 'SystemAdmin' ? 'SYSTEMADMIN' : user.role.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {user.isSystemUser && (
                        <div className="px-2.5 py-1 rounded-[4px] bg-blue-500/20 border border-blue-500/40">
                          <span className="text-[10px] font-black text-blue-400 tracking-tighter">
                            SYS
                          </span>
                        </div>
                      )}
                      {user.mfa_enabled && (
                        <div className="px-2.5 py-1 rounded-[4px] bg-emerald-500/20 border border-emerald-500/40">
                          <span className="text-[10px] font-black text-emerald-400 tracking-tighter">
                            MFA
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-slate-800"
                        onClick={() => {
                          setFormData(user);
                          adminUserModal.open();
                        }}
                        aria-label={`Edit ${user.name}`}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-danger hover:bg-danger/10"
                        onClick={() => setUserToDelete(user)}
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-muted-bg rounded-full flex items-center justify-center text-text-muted">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-text-primary uppercase tracking-tight">
                          No system administrators found
                        </p>
                        <p className="text-[0.6rem] text-text-muted font-bold mt-1 antialiased">
                          Start by provisioning a new administrative node.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Matrix Area */}
      <PermissionMatrix />

      {/* Delete Confirmation Dialog */}
      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Revoke Access?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will permanently remove the administrator{' '}
            <span className="font-bold text-text-primary">{userToDelete?.username}</span> and revoke
            all their system privileges.
            <br />
            <br />
            <span className="text-danger font-bold">This action cannot be undone.</span>
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Revoke Access
            </Button>
          </div>
        </div>
      </Modal>

      {/* User Modal */}
      <Modal
        isOpen={adminUserModal.isOpen}
        onClose={adminUserModal.close}
        title={formData.id ? 'Edit Administrator' : 'Provision New Admin'}
      >
        <div className="space-y-4 py-2">
          <p className="text-[0.6rem] text-slate-400 font-medium -mt-2 mb-2">
            <span className="text-red-500">*</span> All fields are required
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Username *"
              value={formData.username}
              onChange={(e) => updateField('username', e.target.value)}
              placeholder="e.g. root_admin"
              required
            />
            <Input
              label="Full Name *"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <Input
            label="Email Address *"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="admin@enterprise.com"
            type="email"
            required
          />
          <div className="space-y-1.5">
            <label className="text-[0.6rem] font-black text-text-muted uppercase tracking-widest ml-1">
              Administrative Role <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full bg-muted-bg border-none rounded-lg p-2.5 font-black text-xs text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.role}
              onChange={(e) => updateField('role', e.target.value)}
              required
            >
              {ROLE_HIERARCHY.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          {!formData.id && (
            <Input
              label="Temporary Password *"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="••••••••"
              required
            />
          )}

          <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <input
              type="checkbox"
              id="isSystemUser"
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
              checked={formData.isSystemUser}
              onChange={(e) => updateField('isSystemUser', e.target.checked)}
            />
            <label htmlFor="isSystemUser" className="flex flex-col cursor-pointer">
              <span className="text-[0.7rem] font-black text-blue-400 uppercase tracking-tight">
                System User Status
              </span>
              <span className="text-[0.6rem] text-slate-400 font-bold">
                Grants special system privileges and protection from deletion.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={adminUserModal.close}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isFormSaving}>
              {formData.id ? 'Update Node' : 'Initialize Admin'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;

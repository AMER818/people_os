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
    <div className="card-vibrant rounded-xl overflow-hidden mb-8 shadow-sm">
      <div className="px-6 py-5 border-b border-border bg-bg/50">
        <h3 className="font-black text-sm text-vibrant flex items-center gap-3 uppercase tracking-wider">
          <ShieldCheck size={20} className="text-primary" />
          PERMISSIONS
        </h3>
        <p className="text-[0.65rem] text-text-muted mt-1.5 font-bold uppercase tracking-widest">
          Role Permissions
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-bg/80 text-[0.6rem] uppercase text-text-muted font-black tracking-[0.2em] border-b border-border/40">
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
          <tbody className="divide-y divide-border">
            {ROLE_HIERARCHY.slice()
              .reverse()
              .map((role) => (
                <tr key={role} className="hover:bg-primary/5 transition-all duration-300 group">
                  <td
                    scope="row"
                    className="px-6 py-4 font-black text-text-secondary text-xs tracking-tight group-hover:text-text-primary transition-colors"
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
                            <X size={18} className="text-danger" strokeWidth={3} />
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
  const { users, addUser, updateUser, deleteUser, addAuditLog, fetchUsers, errorEntities } =
    useOrgStore();
  const { success, error } = useToast();
  const adminUserModal = useModal();
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // Initial Fetch
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
        className="card-vibrant rounded-2xl shadow-sm overflow-hidden"
        role="region"
        aria-label="Administrator Management"
      >
        <div className="px-8 py-6 border-b border-border bg-bg/50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-vibrant uppercase tracking-wider">
              Admin Users
            </h3>
            <p className="text-[0.625rem] text-text-muted font-bold mt-1.5 uppercase tracking-[0.2em]">
              Manage system administrators
            </p>
          </div>
          <Button
            size="sm"
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-[0.65rem] font-black uppercase tracking-[0.15em] gap-3 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
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
            <thead className="bg-bg/80 text-[0.6rem] uppercase text-text-muted font-black tracking-[0.25em] border-b border-border">
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
            <tbody className="divide-y divide-border">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-primary/5 transition-all duration-200 group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[0.7rem] font-black border border-primary/20">
                        {(user.name || user.username || 'U')
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-black text-text-primary">
                          {user.username}
                        </p>
                        <p className="text-[0.625rem] text-text-muted font-medium tracking-tight mt-0.5">
                          {user.name || 'No Name Set'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-block px-4 py-2 bg-bg border border-border rounded-lg shadow-sm">
                      <span className="font-black text-[0.625rem] tracking-[0.2em] text-primary uppercase">
                        {user.role === 'SystemAdmin' ? 'SYSTEMADMIN' : user.role.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {user.isSystemUser && (
                        <div className="px-2.5 py-1 rounded-[4px] bg-primary/20 border border-primary/40">
                          <span className="text-[10px] font-black text-primary tracking-tighter">
                            SYS
                          </span>
                        </div>
                      )}
                      {user.mfa_enabled && (
                        <div className="px-2.5 py-1 rounded-[4px] bg-success/20 border border-success/40">
                          <span className="text-[10px] font-black text-success tracking-tighter">
                            MFA
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 transition-all">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-text-muted hover:text-primary hover:bg-primary/10"
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
                        className="h-8 w-8 p-0 text-text-muted hover:text-danger hover:bg-danger/10"
                        onClick={() => setUserToDelete(user)}
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {errorEntities?.users && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center bg-danger/10">
                    <p className="text-xs font-bold text-danger">
                      Failed to load users: {errorEntities.users}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchUsers()}
                      className="mt-2 text-danger hover:text-danger/80"
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              )}
              {!errorEntities?.users && users.length === 0 && (
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
                          Start by adding a new administrator.
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
        title={formData.id ? 'Edit Administrator' : 'Add New Administrator'}
      >
        <div className="space-y-4 py-2">
          <p className="text-[0.6rem] text-text-muted font-medium -mt-2 mb-2">
            <span className="text-danger">*</span> All fields are required
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
              Administrative Role <span className="text-danger">*</span>
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

          <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
            <input
              type="checkbox"
              id="isSystemUser"
              className="w-4 h-4 rounded border-border bg-transparent text-primary focus:ring-primary/20"
              checked={formData.isSystemUser}
              onChange={(e) => updateField('isSystemUser', e.target.checked)}
            />
            <label htmlFor="isSystemUser" className="flex flex-col cursor-pointer">
              <span className="text-[0.7rem] font-black text-primary uppercase tracking-tight">
                System User
              </span>
              <span className="text-[0.6rem] text-text-muted font-bold">
                Prevents this user from being deleted.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={adminUserModal.close}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isFormSaving}>
              {formData.id ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;

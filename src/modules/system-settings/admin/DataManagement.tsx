import React, { useState } from 'react';
import {
  Database,
  RotateCcw,
  Download,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useModal } from '@hooks/useModal';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { useToast } from '@components/ui/Toast';
import { api } from '@services/api';
import { formatDate, formatTime } from '@utils/formatting';
import { useOrgStore } from '@store/orgStore';

interface DataManagementProps {
  onSync?: () => void; // Optional prop for syncing data, if needed
}

/**
 * DataManagement Component
 * @description Controls enterprise data retention, backup schedules, and storage optimization.
 * Features:
 * - Data retention policy configuration (GDPR/Compliance)
 * - Automated backup scheduling and verification
 * - Bulk data purging and archive management
 */
const DataManagement: React.FC<DataManagementProps> = React.memo(() => {
  const { success, error: toastError } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const restoreModal = useModal();
  const serverRestoreModal = useModal();
  const [fileToRestore, setFileToRestore] = useState<File | null>(null);
  const [serverBackupToRestore, setServerBackupToRestore] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { backups, fetchBackups, restoreFromServer } = useOrgStore();

  React.useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      // Trigger server-side backup generation
      const blob = await api.downloadBackup();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `people-os-backup-${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success('System backup downloaded successfully');
      // Refresh list
      await fetchBackups();
    } catch (error) {
      toastError('Backup failed: ' + (error as Error).message);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToRestore(file);
      restoreModal.open();
    }
    // Reset input
    e.target.value = '';
  };

  const confirmUploadRestore = async () => {
    if (!fileToRestore) {
      return;
    }

    try {
      success('Uploading and restoring system data...');
      restoreModal.close(); // Close immediately to show progress/success

      await api.restoreSystem(fileToRestore);

      success('System restored successfully. Reloading...');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toastError('Restore failed: ' + (err as Error).message);
      setFileToRestore(null);
    }
  };

  const handleServerRestoreClick = (filename: string) => {
    setServerBackupToRestore(filename);
    serverRestoreModal.open();
  };

  const confirmServerRestore = async () => {
    if (!serverBackupToRestore) {
      return;
    }

    try {
      success('Restoring system from server backup...');
      serverRestoreModal.close();

      await restoreFromServer(serverBackupToRestore);

      success('System restored successfully. Reloading...');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toastError('Restore failed: ' + (err as Error).message);
    } finally {
      setServerBackupToRestore(null);
    }
  };

  const cancelRestore = () => {
    setFileToRestore(null);
    restoreModal.close();
    setServerBackupToRestore(null);
    serverRestoreModal.close();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
      role="region"
      aria-label="Data Management Section"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div
          className="bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          role="region"
          aria-label="System Backup"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-info/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Backup Data</h3>
                <p className="text-xs text-text-muted">Download a copy of your data</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary mb-4 min-h-[2.5rem]">
              Create a complete snapshot of your organization data from the server database.
            </p>
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              aria-label="Create System Backup"
            >
              {isBackingUp ? (
                <>
                  <div
                    className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    role="status"
                    aria-label="Backing up"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download Backup
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className="bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          role="region"
          aria-label="System Restore"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-danger/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Restore Data</h3>
                <p className="text-xs text-text-muted">Upload backup file to restore</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary mb-4 min-h-[2.5rem]">
              Restore your system state from a previously generated backup file.
              <span className="block mt-1 font-medium text-warning text-[0.6rem]">
                ⚠️ CAUTION: THIS WILL WIPE ALL CURRENT DATA.
              </span>
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".db,.json" // Accepted types
                className="hidden"
                id="restore-upload"
                ref={fileInputRef}
                onChange={handleFileSelect}
                aria-label="Upload Backup File"
              />
              <label
                htmlFor="restore-upload"
                className="flex items-center justify-center w-full px-4 py-2 bg-surface border border-border rounded-lg text-xs font-medium text-text-primary hover:bg-muted-bg cursor-pointer transition-colors shadow-sm"
              >
                <ArrowUpRight className="w-3.5 h-3.5 mr-2" />
                Upload Backup File
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Available Backups Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted-bg/30">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Available Backups
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted-bg text-text-secondary font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {backups?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-muted italic">
                    No backups found on server.
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-muted-bg/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-text-primary">{backup.filename}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatDate(backup.created_at)} {formatTime(backup.created_at)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{formatSize(backup.size)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleServerRestoreClick(backup.filename)}
                        className="text-warning hover:text-warning-hover hover:bg-warning/10 h-7 text-[0.65rem] px-2"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restore
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800"
        role="note"
        aria-label="Data Security Note"
      >
        <h4 className="flex items-center gap-2 text-xs font-medium text-neutral-900 dark:text-white mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          Important Note
        </h4>
        <p className="text-[0.65rem] text-neutral-500 dark:text-neutral-400">
          Backups contain sensitive organizational data including employee records and financial
          settings. Ensure exported files are stored securely and only shared with authorized
          personnel.
        </p>
      </div>

      {/* Upload Restore Confirmation */}
      <Modal
        isOpen={restoreModal.isOpen}
        onClose={cancelRestore}
        title="Confirm System Restore"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">Warning: Data Loss</p>
              <p className="text-xs opacity-90">Current database will be completely overwritten.</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <p>
              You are about to restore from file:{' '}
              <span className="text-text-primary font-mono bg-surface p-1 rounded border border-border">
                {fileToRestore?.name}
              </span>
            </p>
            <p>
              This action will overwrite your current data and cannot be undone. Please confirm that
              you want to:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Delete all current data.</li>
              <li>Replace with backup data.</li>
              <li>Reload system after restore.</li>
            </ul>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={cancelRestore} className="text-text-muted">
              Cancel Operation
            </Button>
            <Button
              onClick={confirmUploadRestore}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 border border-red-500/50"
            >
              Confirm Restore
            </Button>
          </div>
        </div>
      </Modal>

      {/* Server Restore Confirmation */}
      <Modal
        isOpen={serverRestoreModal.isOpen}
        onClose={cancelRestore}
        title="Confirm Server Restore"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">Warning: Data Loss</p>
              <p className="text-xs opacity-90">Current database will be replaced.</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <p>
              You are about to restore from server backup:{' '}
              <span className="text-text-primary font-mono bg-surface p-1 rounded border border-border">
                {serverBackupToRestore}
              </span>
            </p>
            <p>
              This will roll back the system to the state captured in this backup. All changes made
              since this backup will be lost.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={cancelRestore} className="text-text-muted">
              Cancel Operation
            </Button>
            <Button
              onClick={confirmServerRestore}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 border border-red-500/50"
            >
              Confirm Server Restore
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default DataManagement;

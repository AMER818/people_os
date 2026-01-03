import React, { useState } from 'react';
import { Database, RotateCcw, Download, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useToast } from '@components/ui/toast';
import { api } from '@services/api';

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

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      // Trigger server-side backup generation
      const blob = await api.downloadBackup();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hcm-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success('System backup downloaded successfully');
    } catch (error) {
      toastError('Backup failed: ' + (error as Error).message);
    } finally {
      setIsBackingUp(false);
    }
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
                <h3 className="text-base font-semibold text-text-primary">System Backup</h3>
                <p className="text-xs text-text-muted">Export full system state (JSON)</p>
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
                <h3 className="text-base font-semibold text-text-primary">System Restore</h3>
                <p className="text-xs text-text-muted">Import data from backup file</p>
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
                accept=".json"
                className="hidden"
                id="restore-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  if (
                    !window.confirm(
                      'Are you sure you want to restore from this file? THIS WILL WIPEOUT ALL EXISTING DATA IN THE DATABASE. This action cannot be undone.'
                    )
                  ) {
                    e.target.value = '';
                    return;
                  }

                  try {
                    success('Uploading and restoring system data...');
                    await api.restoreSystem(file);
                    success('System restored successfully. Reloading...');
                    setTimeout(() => window.location.reload(), 2000);
                  } catch (err) {
                    toastError('Restore failed: ' + (err as Error).message);
                  }
                  e.target.value = '';
                }}
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

      <div
        className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800"
        role="note"
        aria-label="Data Security Note"
      >
        <h4 className="flex items-center gap-2 text-xs font-medium text-neutral-900 dark:text-white mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          Data Security Note
        </h4>
        <p className="text-[0.65rem] text-neutral-500 dark:text-neutral-400">
          Backups contain sensitive organizational data including employee records and financial
          settings. Ensure exported files are stored securely and only shared with authorized
          personnel.
        </p>
      </div>
    </div>
  );
});

export default DataManagement;

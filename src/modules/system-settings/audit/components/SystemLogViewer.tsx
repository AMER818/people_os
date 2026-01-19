import React, { useState } from 'react';
import { History, Search, User, Clock, FileText, AlertCircle } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';

export const SystemLogViewer: React.FC = () => {
  const { auditLogs, fetchAuditLogs } = useOrgStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType] = useState<'All' | 'User' | 'System'>('All');

  React.useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Filter logs based on search
  const filteredLogs = (auditLogs || []).filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'All') {
      return matchesSearch;
    }
    // Simple logic placeholder: assume 'System' user means automated
    if (filterType === 'System') {
      return matchesSearch && log.user === 'System';
    }
    if (filterType === 'User') {
      return matchesSearch && log.user !== 'System';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
            <History size={20} className="text-primary" />
            Change History
          </h3>
          <p className="text-xs text-text-muted">
            Mandatory audit trail with user and timestamp details.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              aria-label="Search logs"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted-bg/50 text-xs uppercase text-text-muted font-black tracking-wider">
              <tr>
                <th className="px-6 py-4 font-black">Timestamp</th>
                <th className="px-6 py-4 font-black">User / Actor</th>
                <th className="px-6 py-4 font-black">Action Details</th>
                <th className="px-6 py-4 font-black text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted-bg/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-text-primary font-mono">
                        <Clock size={14} className="text-text-muted" />
                        {log.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User size={12} />
                        </div>
                        <span className="text-sm font-bold text-text-primary">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-text-muted" />
                        <span className="text-sm text-text-secondary">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.65rem] font-black uppercase tracking-wider ${
                          log.status === 'Hashed'
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-warning/10 text-warning border border-warning/20'
                        }`}
                      >
                        {log.status === 'Hashed' ? (
                          <>
                            Verified{' '}
                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                          </>
                        ) : (
                          <>
                            Flagged <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-muted-bg rounded-full flex items-center justify-center">
                        <Search size={24} className="opacity-50" />
                      </div>
                      <p className="text-sm font-medium">
                        No system logs found matching your criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-muted-bg/30 border-t border-border flex justify-between items-center text-xs text-text-muted">
          <span>Total Records: {filteredLogs.length}</span>
          <span className="flex items-center gap-1">
            <AlertCircle size={12} /> Immutable Ledger Active
          </span>
        </div>
      </div>
    </div>
  );
};

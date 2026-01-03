import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  User,
  Search,
  Filter,
  Fingerprint,
  Camera,
  AlertTriangle,
  Download,
  Zap,
  ShieldCheck,
  ScanFace,
  Globe,
  MapPin,
  RefreshCw,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { AttendanceRecord } from '../../types';
import { HorizontalTabs } from '../../components/ui/HorizontalTabs';

type AttendanceTab = 'daily' | 'matrix' | 'roster' | 'corrections';

const Attendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AttendanceTab>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth] = useState('July 2024');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await api.getAttendanceRecords();
    setAttendanceRecords(data);
    setIsLoading(false);
  };

  const stats = [
    {
      label: 'Present Employees',
      value: '238',
      change: '+2',
      trend: 'up',
      icon: User,
      color: 'primary',
    },
    {
      label: 'Late Arrivals',
      value: '12',
      change: '-5',
      trend: 'down',
      icon: Clock,
      color: 'warning',
    },
    {
      label: 'Missing Out-Time',
      value: '4',
      change: '+1',
      trend: 'up',
      icon: AlertTriangle,
      color: 'destructive',
    },
    {
      label: 'Shift Coverage',
      value: '98.2%',
      change: 'Stable',
      trend: 'neutral',
      icon: Zap,
      color: 'success',
    },
  ];

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(
      (record) =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attendanceRecords, searchTerm]);

  const renderDailyLog = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-surface rounded-md border border-border shadow-md overflow-hidden min-h-[37.5rem] flex flex-col">
        <div className="p-12 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-muted-bg/30 backdrop-blur-3xl">
          <div>
            <h3 className="text-3xl font-black text-text-primary tracking-tight">
              Daily Attendance Log
            </h3>
            <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2 flex items-center gap-2">
              <Camera size={12} className="text-primary" /> Facial Verification Active
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                aria-label="Search employees"
                className="bg-app border border-border pl-10 pr-6 py-3 rounded-md text-sm font-black outline-none w-64 text-text-primary shadow-inner"
                placeholder="Search Employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              aria-label="Filter records"
              className="flex items-center gap-3 px-6 py-3 bg-muted-bg rounded-md text-text-muted hover:text-primary transition-all shadow-sm font-black uppercase text-[0.625rem] tracking-widest"
            >
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted-bg/50">
                <th className="px-14 py-8 text-[0.6875rem] font-black text-text-muted uppercase tracking-[0.25em]">
                  Employee
                </th>
                <th className="px-8 py-8 text-[0.6875rem] font-black text-text-muted uppercase tracking-[0.25em]">
                  Shift
                </th>
                <th className="px-8 py-8 text-[0.6875rem] font-black text-text-muted uppercase tracking-[0.25em]">
                  Time Log
                </th>
                <th className="px-8 py-8 text-[0.6875rem] font-black text-text-muted uppercase tracking-[0.25em]">
                  Status
                </th>
                <th className="px-8 py-8 text-[0.6875rem] font-black text-text-muted uppercase tracking-[0.25em]">
                  Verification
                </th>
                <th className="px-14 py-8 text-right text-[0.6875rem] font-black text-text-muted uppercase tracking-[0.25em]">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-14 py-8 text-center text-text-muted">
                    Loading attendance records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-14 py-8 text-center text-text-muted">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row, index) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-primary-soft/50 transition-all cursor-pointer font-mono animate-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-14 py-8 font-sans">
                      <p className="text-lg font-black text-text-primary leading-none">
                        {row.name}
                      </p>
                      <p className="text-[0.625rem] font-black text-primary uppercase tracking-widest mt-2">
                        {row.code}
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-xs font-black bg-muted-bg px-3 py-1 rounded-sm text-text-muted uppercase tracking-widest border border-border">
                        Shift {row.shift}
                      </span>
                    </td>
                    <td className="px-8 py-8 space-y-1">
                      <p className="text-sm font-black text-text-muted">
                        In: <span className="text-primary">{row.inTime}</span>
                      </p>
                      <p className="text-sm font-black text-text-muted">
                        Out: <span className="text-primary">{row.outTime}</span>
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <span
                        className={`px-5 py-2 rounded-md text-[0.625rem] font-black uppercase tracking-widest border transition-all ${
                          row.status === 'Present'
                            ? 'bg-success-soft text-success border-success/20'
                            : row.status === 'Late'
                              ? 'bg-warning-soft text-warning border-warning/20'
                              : 'bg-danger-soft text-danger border-danger/20'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2">
                        {row.verification === 'Facial' ? (
                          <ScanFace className="text-primary" size={16} />
                        ) : (
                          <Globe className="text-success" size={16} />
                        )}
                        <span className="text-[0.625rem] font-black uppercase text-text-muted">
                          {row.verification} ID
                        </span>
                      </div>
                    </td>
                    <td className="px-14 py-8 text-right font-sans">
                      <div className="flex items-center justify-end gap-3 text-[0.625rem] font-black text-text-muted uppercase">
                        <MapPin className="w-4 h-4 text-primary" />
                        {row.location}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMonthlyMatrix = () => (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-surface rounded-md border border-border shadow-md p-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-3xl font-black text-text-primary tracking-tight antialiased">
              Attendance Matrix
            </h3>
            <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2">
              {currentMonth} Cycle
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              {[
                { label: 'Present', color: 'bg-success' },
                { label: 'Late', color: 'bg-warning' },
                { label: 'Absent', color: 'bg-danger' },
                { label: 'Leave', color: 'bg-primary' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${l.color}`}></div>
                  <span className="text-[0.5625rem] font-black uppercase text-text-muted">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
            <button
              aria-label="Download attendance report"
              className="p-3 bg-muted-bg rounded-md text-text-muted hover:text-text-primary"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted-bg/50">
                <th className="px-6 py-4 sticky left-0 bg-muted-bg/50 text-[0.625rem] font-black uppercase text-text-muted z-10">
                  Employee
                </th>
                {Array.from({ length: 31 }, (_, i) => (
                  <th
                    key={i}
                    className="px-2 py-4 text-center text-[0.625rem] font-black text-text-muted min-w-[2rem]"
                  >
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record, idx) => (
                  <tr key={idx} className="group hover:bg-muted-bg/30">
                    <td className="px-6 py-4 sticky left-0 bg-surface group-hover:bg-muted-bg/30 font-black text-sm text-text-primary z-10 border-r border-border">
                      {record.name}
                    </td>
                    {Array.from({ length: 31 }, (_, i) => {
                      const random = Math.random();
                      const color =
                        random > 0.9
                          ? 'bg-danger'
                          : random > 0.8
                            ? 'bg-warning'
                            : random > 0.7
                              ? 'bg-primary'
                              : 'bg-success';
                      return (
                        <td key={i} className="px-1 py-4 text-center">
                          <div
                            className={`w-2.5 h-2.5 rounded-full mx-auto ${color} shadow-sm transition-transform hover:scale-150 cursor-pointer`}
                            title={`Day ${i + 1}: Present`}
                          ></div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={32} className="px-6 py-4 text-center text-text-muted">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderShiftRoster = () => (
    <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-surface rounded-md border border-border shadow-md p-12">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black text-text-primary tracking-tight">
              Shift Assignments
            </h3>
            <button
              aria-label="Assign new shift"
              className="bg-primary text-white px-8 py-3 rounded-md font-black uppercase text-[0.625rem] tracking-widest flex items-center gap-3"
            >
              <Plus size={16} /> Assign Shift
            </button>
          </div>
          <div className="space-y-6">
            {[
              { shift: 'A', timing: '06:00 AM - 02:00 PM', nodes: 42, color: 'primary' },
              { shift: 'B', timing: '02:00 PM - 10:00 PM', nodes: 38, color: 'primary' },
              { shift: 'C', timing: '10:00 PM - 06:00 AM', nodes: 15, color: 'danger' },
              { shift: 'G', timing: '09:00 AM - 05:30 PM', nodes: 140, color: 'success' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-8 bg-muted-bg/30 rounded-md border border-border group hover:border-primary/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <div
                    className={`w-16 h-16 bg-${s.color}-soft text-${s.color} rounded-md flex items-center justify-center font-black text-2xl shadow-inner`}
                  >
                    {s.shift}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-text-primary tracking-tight">
                      Shift {s.shift}
                    </h4>
                    <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2 flex items-center gap-3">
                      <Clock size={12} /> {s.timing}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-text-primary antialiased">{s.nodes}</p>
                  <p className="text-[0.5625rem] font-black text-text-muted uppercase tracking-widest">
                    Employees
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-10">
          <div className="bg-surface p-12 rounded-md text-text-primary shadow-md relative overflow-hidden group border border-border">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Zap size={140} />
            </div>
            <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-primary mb-8">
              Shift Optimization
            </h4>
            <p className="text-xl font-black leading-tight antialiased mb-10">
              AI suggests a{' '}
              <span className="text-primary underline decoration-primary/30 underline-offset-8">
                shift rebalance
              </span>{' '}
              for Karachi Port Units due to upcoming peak load cycles.
            </p>
            <div className="space-y-4 mb-10">
              <div className="flex justify-between text-[0.625rem] font-black uppercase text-text-muted">
                <span>Shift A Demand</span>
                <span className="text-primary">92%</span>
              </div>
              <div className="h-1.5 bg-muted-bg rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[92%] shadow-sm"></div>
              </div>
            </div>
            <button
              aria-label="Launch shift rebalancer"
              className="w-full py-5 bg-primary text-surface rounded-md font-black uppercase text-[0.625rem] tracking-widest shadow-md hover:scale-105 transition-all"
            >
              Launch Rebalancer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCorrections = () => (
    <div className="space-y-10 animate-in slide-in-from-left-8 duration-700">
      <div className="bg-surface rounded-md border border-border shadow-md overflow-hidden min-h-[31.25rem]">
        <div className="p-12 border-b border-border bg-muted-bg/30 backdrop-blur-3xl flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-text-primary tracking-tight">
              Manual Corrections
            </h3>
            <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2">
              Attendance Correction Requests
            </p>
          </div>
          <span className="px-6 py-2 bg-danger-soft text-danger rounded-full text-[0.625rem] font-black uppercase tracking-widest border border-danger/20">
            4 Pending Approvals
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted-bg/50 text-[0.6875rem] font-black uppercase text-text-muted tracking-[0.25em]">
                <th className="px-14 py-8">Employee</th>
                <th className="px-8 py-8">Date</th>
                <th className="px-8 py-8">Type</th>
                <th className="px-8 py-8">Reason</th>
                <th className="px-14 py-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  name: 'Alex Rivera',
                  date: 'Jul 18, 2024',
                  type: 'Missing Punch',
                  reason: 'Biometric hardware failure at Site-B gate.',
                  status: 'Pending',
                },
                {
                  name: 'Maria Garcia',
                  date: 'Jul 20, 2024',
                  type: 'Shift Swap',
                  reason: 'Emergency family medical protocol.',
                  status: 'Pending',
                },
              ].map((req, i) => (
                <tr key={i} className="group hover:bg-danger-soft/20 transition-all">
                  <td className="px-14 py-8">
                    <p className="text-lg font-black text-text-primary">{req.name}</p>
                    <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-2">
                      LHR-NODE-99
                    </p>
                  </td>
                  <td className="px-8 py-8 text-sm font-bold text-text-muted uppercase">
                    {req.date}
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-xs font-black text-primary uppercase tracking-tighter">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-8 py-8 max-w-xs text-xs font-medium text-text-muted leading-relaxed italic">
                    "{req.reason}"
                  </td>
                  <td className="px-14 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        aria-label="Approve request"
                        className="p-4 bg-success text-white rounded-md shadow-md hover:scale-110 active:scale-90 transition-all"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        aria-label="Reject request"
                        className="p-4 bg-danger text-white rounded-md shadow-md hover:scale-110 active:scale-90 transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none">
            Attendance
          </h1>
          <p className="text-text-muted mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
            <span className="w-8 h-[0.125rem] bg-primary"></span>
            Biometric & Geofenced Tracking
          </p>
        </div>
        <div className="flex gap-4 p-4 bg-surface rounded-md shadow-md border border-border">
          <button
            aria-label="Refresh data"
            className="bg-muted-bg p-4 rounded-md text-text-muted hover:text-primary transition-all shadow-sm"
          >
            <RefreshCw size={20} />
          </button>
          <button
            aria-label="Force synchronization"
            className="bg-primary text-white px-10 py-4 rounded-md font-black uppercase text-[0.6875rem] tracking-widest flex items-center gap-4 shadow-md shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
          >
            <Fingerprint size={18} /> Forced Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-surface p-10 rounded-md border border-border shadow-sm relative overflow-hidden group hover:shadow-md hover:scale-[1.02] transition-all duration-300"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-soft blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-md bg-${s.color}-soft text-${s.color} shadow-inner`}>
                <s.icon size={24} />
              </div>
              <span
                className={`text-[0.625rem] font-black px-3 py-1.5 rounded-md border ${s.trend === 'up' ? 'text-success bg-success-soft border-success/10' : s.trend === 'down' ? 'text-danger bg-danger-soft border-danger/10' : 'text-text-muted bg-muted-bg border-border'}`}
              >
                {s.change}
              </span>
            </div>
            <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-text-primary tracking-tighter">{s.value}</h4>
          </div>
        ))}
      </div>

      <HorizontalTabs
        tabs={[
          { id: 'daily', label: 'Daily Log' },
          { id: 'matrix', label: 'Attendance Matrix' },
          { id: 'roster', label: 'Shift Roster' },
          { id: 'corrections', label: 'Corrections' },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => setActiveTab(id as AttendanceTab)}
        wrap={true}
        disabled={isLoading}
      />

      <main>
        {activeTab === 'daily' && renderDailyLog()}
        {activeTab === 'matrix' && renderMonthlyMatrix()}
        {activeTab === 'roster' && renderShiftRoster()}
        {activeTab === 'corrections' && renderCorrections()}
      </main>

      <div className="bg-surface p-20 rounded-md text-text-primary shadow-md relative overflow-hidden group border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-20">
          <div className="w-32 h-32 bg-primary text-white rounded-md flex items-center justify-center shadow-md animate-pulse shrink-0">
            <ShieldCheck className="w-16 h-16" />
          </div>
          <div className="flex-1">
            <h3 className="text-4xl font-black tracking-tighter antialiased leading-none">
              Compliance Audit
            </h3>
            <p className="text-text-muted mt-8 text-xl max-w-4xl leading-relaxed antialiased">
              Every timestamp is securely logged. Discrepancies trigger automatic alerts, ensuring
              100% legal compliance.
            </p>
          </div>
          <button
            aria-label="View full audit logs"
            className="px-16 py-6 bg-primary text-surface rounded-md font-black uppercase text-[0.75rem] tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
          >
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

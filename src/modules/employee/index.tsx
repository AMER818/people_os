import React, { useState, useMemo, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Employee as EmployeeType, AISuggestion } from '../../types';
import { api } from '../../services/api';
import { LEAVING_TYPES } from './constants';

// UI Components
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useModal } from '../../hooks/useModal';
import { FormModal } from '../../components/ui/FormModal';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

// Constants
import { EMPLOYEE_CODE } from '../../config/constants';

// Sub-components
import EmployeeDashboard from './EmployeeDashboard';
import EmployeeMaster from './EmployeeMaster';

import { useOrgStore } from '../../store/orgStore';
import { getWorkforceOptimization } from '../../services/geminiService';

const Employee: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [viewMode, setViewMode] = useState<'dashboard' | 'master'>('dashboard');
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState<Partial<EmployeeType> | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { success, error: toastError } = useToast();
  const exitModal = useModal();
  const deleteModal = useModal();

  const [exitTargetEmployee, setExitTargetEmployee] = useState<EmployeeType | null>(null);
  const [exitData, setExitData] = useState({
    leavingDate: new Date().toISOString().split('T')[0],
    leavingType: 'Resignation',
    remarks: '',
  });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      const data = await api.getEmployees();
      setEmployees(data);
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    if (viewMode === 'master' && activeTab === 0 && currentEmployee) {
      const analyze = async () => {
        setIsAnalyzing(true);
        const result = await getWorkforceOptimization(currentEmployee);
        setAiSuggestions(result.suggestions || []);
        setIsAnalyzing(false);
      };
      analyze();
    }
  }, [viewMode, activeTab, currentEmployee?.id]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) {
      return employees;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerSearch) ||
        e.employeeCode.toLowerCase().includes(lowerSearch) ||
        e.department.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, employees]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rangeEnd = new Date();
    rangeEnd.setDate(today.getDate() + 7);

    const events: Array<{
      id: string;
      employee: EmployeeType;
      type: string;
      date: Date;
      daysRemaining: number;
      originalDate: string;
    }> = [];

    employees.forEach((emp) => {
      const processDate = (dateStr: string | undefined, type: 'Birthday' | 'Anniversary') => {
        if (!dateStr) {
          return;
        }
        const d = new Date(dateStr);
        const eventThisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate());

        if (eventThisYear < today) {
          eventThisYear.setFullYear(today.getFullYear() + 1);
        }

        if (eventThisYear >= today && eventThisYear <= rangeEnd) {
          const diffTime = eventThisYear.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          events.push({
            id: `${emp.id}-${type}`,
            employee: emp,
            type,
            date: eventThisYear,
            daysRemaining: diffDays,
            originalDate: dateStr,
          });
        }
      };

      processDate(emp.dateOfBirth, 'Birthday');
      if (emp.maritalStatus === 'Married' && emp.weddingAnniversaryDate) {
        processDate(emp.weddingAnniversaryDate, 'Anniversary');
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [employees]);

  const handleAdd = () => {
    const code = `${EMPLOYEE_CODE.PREFIX}-${String(employees.length + 1).padStart(4, '0')}`;
    const newEmp: Partial<EmployeeType> = {
      id: code,
      employeeCode: code,
      name: '',
      status: 'Active',
      avatar: `https://picsum.photos/seed/${code}/200`,
      family: [],
      education: [],
      experience: [],
      increments: [],
      discipline: [],
      maritalStatus: 'Single',
      grossSalary: 0,
      joiningDate: new Date().toISOString().split('T')[0],
    };
    setCurrentEmployee(newEmp);
    setViewMode('master');
    setActiveTab(0);
  };

  const handleSave = async () => {
    if (!currentEmployee || !currentEmployee.id) {
      return;
    }
    setIsSaving(true);
    try {
      await api.saveEmployee(currentEmployee as EmployeeType);

      // Auto-sync linked user status if status changed
      const syncProfileStatus = useOrgStore.getState().syncProfileStatus;
      syncProfileStatus(
        currentEmployee.id!,
        currentEmployee.status === 'Active' ? 'Active' : 'Inactive'
      );

      const data = await api.getEmployees();
      setEmployees(data);
      alert('Employee changes saved successfully!');
      setViewMode('dashboard');
    } catch (error) {
      console.error('Failed to save employee:', error);
      alert('Failed to save employee changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectEmployee = (emp: EmployeeType) => {
    setCurrentEmployee(emp);
    setViewMode('master');
    setActiveTab(0);
  };

  const updateField = (field: keyof EmployeeType, value: unknown) => {
    if (!currentEmployee) {
      return;
    }

    const update = { ...currentEmployee, [field]: value };
    // if (field === 'designation') { update.grade = DESIGNATION_TO_GRADE[value as string] || 'M9'; }
    setCurrentEmployee(update);
  };

  const handleEdit = (emp: EmployeeType) => {
    handleSelectEmployee(emp);
  };

  const handleExit = (emp: EmployeeType) => {
    setExitTargetEmployee(emp);
    setExitData({
      leavingDate: new Date().toISOString().split('T')[0],
      leavingType: 'Resignation',
      remarks: '',
    });
    exitModal.open();
  };

  const handleConfirmExit = async () => {
    if (!exitTargetEmployee) {
      return;
    }

    try {
      const updatedEmp = {
        ...exitTargetEmployee,
        status: 'Resigned' as const,
        leavingDate: exitData.leavingDate,
        leavingType: exitData.leavingType as any,
      };

      await api.saveEmployee(updatedEmp);
      const employeesData = await api.getEmployees();
      setEmployees(employeesData);

      // Sync linked OrgUser's profileStatus to Inactive
      const syncProfileStatus = useOrgStore.getState().syncProfileStatus;
      syncProfileStatus(exitTargetEmployee.id, 'Inactive');

      success(`Offboarding initiated for ${exitTargetEmployee.name}. Status updated to Resigned.`);
      exitModal.close();
    } catch (error) {
      console.error('Failed to process exit:', error);
      toastError('Failed to update employee status.');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) {
      return;
    }

    try {
      await api.deleteEmployee(deleteTargetId);
      const data = await api.getEmployees();
      setEmployees(data);
      success('Employee record deleted successfully.');
      deleteModal.close();
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toastError('Failed to delete employee');
    }
  };

  return (
    <div className="max-w-[100rem] mx-auto space-y-14 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none antialiased">
            {viewMode === 'dashboard' ? 'Employee Management' : 'Employee Profile'}
          </h1>
          <p className="text-text-secondary mt-4 font-black uppercase tracking-[0.4em] text-[0.75rem] flex items-center gap-4">
            <span className="w-10 h-[0.125rem] bg-primary"></span>
            Employee Lifecycle Management
          </p>
        </div>
        {viewMode === 'master' && (
          <div className="flex gap-4 p-4 bg-surface rounded-lg shadow-md border border-border">
            <button
              onClick={() => setViewMode('dashboard')}
              disabled={isSaving}
              className="px-10 py-4 text-text-secondary font-black uppercase text-[0.6875rem] tracking-widest hover:bg-muted-bg rounded-md transition-all disabled:opacity-50"
            >
              Discard
            </button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              icon={Save}
              className="px-14 py-4 bg-primary text-white hover:bg-primary-hover"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {viewMode === 'dashboard' ? (
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700">
          <EmployeeDashboard
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAdd={handleAdd}
            onSelect={handleSelectEmployee}
            onEdit={handleEdit}
            onExit={handleExit}
            onDelete={handleDelete}
            filteredEmployees={filteredEmployees}
            upcomingEvents={upcomingEvents}
          />
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 fade-in duration-700">
          <EmployeeMaster
            currentEmployee={currentEmployee}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            updateField={updateField}
            isAnalyzing={isAnalyzing}
            aiSuggestions={aiSuggestions}
            isDisabled={isSaving}
          />
        </div>
      )}

      {/* Exit Process Modal */}
      <FormModal
        title="Initiate Exit Process"
        isOpen={exitModal.isOpen}
        onClose={exitModal.close}
        onSave={handleConfirmExit}
        saveLabel="Confirm Exit"
      >
        {exitTargetEmployee && (
          <div className="space-y-6">
            <p className="text-sm text-text-secondary">
              Offboarding workflow for{' '}
              <span className="font-bold text-primary">{exitTargetEmployee.name}</span> (
              {exitTargetEmployee.employeeCode}).
            </p>
            <div className="space-y-4">
              <Input
                label="Last Working Day"
                type="date"
                value={exitData.leavingDate}
                onChange={(e) => setExitData({ ...exitData, leavingDate: e.target.value })}
              />
              <div className="space-y-2">
                <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest">
                  Exit Type
                </label>
                <select
                  value={exitData.leavingType}
                  onChange={(e) => setExitData({ ...exitData, leavingType: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-bold text-sm"
                  aria-label="Exit Type"
                >
                  {LEAVING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest">
                  Remarks / Reason
                </label>
                <textarea
                  value={exitData.remarks}
                  onChange={(e) => setExitData({ ...exitData, remarks: e.target.value })}
                  className="w-full min-h-[6.25rem] bg-surface border border-border rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter details about the exit..."
                  aria-label="Remarks"
                />
              </div>
            </div>
          </div>
        )}
      </FormModal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-text-secondary">
            Are you sure you want to permanently delete this employee record? This action cannot be
            undone and will remove all associated records.
          </p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={deleteModal.close} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} className="flex-1">
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employee;

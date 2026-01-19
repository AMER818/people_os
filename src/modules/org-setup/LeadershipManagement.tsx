import React, { useState, useMemo } from 'react';
import { Users, Building2, Factory, Crown, Briefcase, MapPin } from 'lucide-react';
import { useOrgStore } from '@/store/orgStore';
import { useToast } from '@/components/ui/Toast';

const LeadershipManagement: React.FC = () => {
  const {
    profile,
    plants,
    departments,
    employees,
    updateProfile,
    updatePlant,
    updateDepartment,
    saveProfile,
  } = useOrgStore();
  const { success, error: toastError } = useToast();
  const [savingId, setSavingId] = useState<string | null>(null);

  // Group departments by Plant ID (undefined/null went to 'Corporate')
  const groupedDepartments = useMemo(() => {
    const corporate: typeof departments = [];
    const byPlant: Record<string, typeof departments> = {};

    departments.forEach((dept) => {
      if (dept.plantId) {
        if (!byPlant[dept.plantId]) {
          byPlant[dept.plantId] = [];
        }
        byPlant[dept.plantId].push(dept);
      } else {
        corporate.push(dept);
      }
    });

    return { corporate, byPlant };
  }, [departments]);

  // Handlers
  const handleOrgHeadChange = async (newHeadId: string) => {
    if (!profile) return;
    setSavingId('org-root');
    try {
      updateProfile({ ...profile, headId: newHeadId });
      await saveProfile();
      success('Organization Head updated');
    } catch (err) {
      console.error(err);
      toastError('Failed to update Organization Head');
    } finally {
      setSavingId(null);
    }
  };

  const handlePlantHeadChange = async (plantId: string, payload: any, newHeadId: string) => {
    setSavingId(plantId);
    try {
      await updatePlant(plantId, { ...payload, headOfPlant: newHeadId });
      success('Plant Manager updated');
    } catch (err) {
      console.error(err);
      toastError('Failed to update Plant Manager');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeptHeadChange = async (deptId: string, payload: any, newHeadId: string) => {
    setSavingId(deptId);
    try {
      await updateDepartment(deptId, { ...payload, hodId: newHeadId });
      success('Department Head updated');
    } catch (err) {
      console.error(err);
      toastError('Failed to update HOD');
    } finally {
      setSavingId(null);
    }
  };

  // Helper to render Employee Select
  const EmployeeSelect = ({
    value,
    onChange,
    label,
    id,
  }: {
    value?: string;
    onChange: (val: string) => void;
    label?: string;
    id: string;
  }) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          className={`appearance-none block w-full pl-3 pr-8 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all hover:bg-surface disabled:opacity-50 ${
            savingId === id ? 'animate-pulse' : ''
          }`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={savingId === id}
        >
          <option value="" className="text-text-muted">
            Select Leader...
          </option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} {emp.employeeCode ? `(${emp.employeeCode})` : ''} - {emp.designation}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
          <Users className="h-4 w-4" />
        </div>
      </div>
      {savingId === id && <p className="text-[10px] text-primary mt-1">Saving...</p>}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-vibrant tracking-tight flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Leadership Team
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Assign managers to departments and locations.
          </p>
        </div>
      </div>

      {/* 1. Organization Level */}
      {profile && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Building2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Company Leadership
            </h3>
          </div>

          <div className="card-vibrant p-6 shadow-sm relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Org Head */}
              <div className="lg:col-span-1 space-y-4 border-r border-border/50 pr-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{profile.name}</h3>
                    <p className="text-xs text-text-muted">Headquarters</p>
                  </div>
                </div>

                <div className="bg-bg/50 p-4 rounded-lg border border-border">
                  <EmployeeSelect
                    id="org-root"
                    label="Head of Organization (CEO/MD)"
                    value={profile.headId}
                    onChange={(id) => handleOrgHeadChange(id)}
                  />
                </div>
              </div>

              {/* Corporate Departments */}
              <div className="lg:col-span-2">
                <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-secondary" />
                  Corporate Departments
                </h4>

                {groupedDepartments.corporate.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedDepartments.corporate.map((dept) => (
                      <div
                        key={dept.id}
                        className="card-vibrant p-3 flex items-center justify-between group hover:border-primary/50"
                      >
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-medium text-text-primary">{dept.name}</p>
                          <p className="text-[10px] text-text-muted">{dept.code}</p>
                        </div>
                        <div className="w-48">
                          <EmployeeSelect
                            id={dept.id}
                            value={dept.hodId}
                            onChange={(val) => handleDeptHeadChange(dept.id, dept, val)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted bg-bg/20 rounded-lg border border-dashed border-border">
                    No corporate departments found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Plant Level */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5 mt-8">
          <Factory className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Plant Operations Leadership
          </h3>
        </div>

        {plants.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {plants.map((plant) => {
              const plantDepts = groupedDepartments.byPlant[plant.id] || [];

              return (
                <div
                  key={plant.id}
                  className="card-vibrant p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  {/* Plant Header */}
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                        <Factory size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-text-primary">{plant.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <MapPin size={10} />
                          {plant.location}
                        </div>
                      </div>
                    </div>
                    <div className="w-56">
                      <EmployeeSelect
                        id={plant.id}
                        label="Plant Manager"
                        value={plant.headOfPlant}
                        onChange={(val) => handlePlantHeadChange(plant.id, plant, val)}
                      />
                    </div>
                  </div>

                  {/* Plant Departments */}
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={12} />
                      Departmental HODs
                    </h4>
                    {plantDepts.length > 0 ? (
                      <div className="space-y-3">
                        {plantDepts.map((dept) => (
                          <div
                            key={dept.id}
                            className="card-vibrant p-2 group flex items-center gap-3 hover:border-primary/50"
                          >
                            <div className="w-1 h-8 bg-border group-hover:bg-primary rounded-full transition-colors" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">{dept.name}</p>
                              {dept.budgetCode && (
                                <p className="text-[10px] text-text-muted font-mono">
                                  {dept.budgetCode}
                                </p>
                              )}
                            </div>
                            <div className="w-48">
                              <EmployeeSelect
                                id={dept.id}
                                value={dept.hodId}
                                onChange={(val) => handleDeptHeadChange(dept.id, dept, val)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-text-muted italic bg-bg/20 rounded border border-dashed border-border">
                        No departments assigned to this plant.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted bg-surface rounded-xl border border-dashed border-border">
            <Factory className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No Plants Configured</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default LeadershipManagement;

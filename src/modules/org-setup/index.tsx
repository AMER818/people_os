import React, { useState } from 'react';
import { Building2, Building, Users, Clock, Factory, Briefcase } from 'lucide-react';
import { HorizontalTabs } from '@/components/ui/HorizontalTabs';

// Components
import OrgProfile from './OrgProfile';
import DepartmentManagement from './DepartmentManagement';
import DesignationManagement from './DesignationManagement';
import ShiftManagement from './ShiftManagement';
import PlantManagement from './PlantManagement';
import EmploymentLevelManagement from './EmploymentLevelManagement';

const OrganizationSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Define tabs with RBAC checks if necessary
  const tabs = [
    {
      id: 'profile',
      label: 'Org Profile',
      icon: Building2,
    },
    {
      id: 'plants',
      label: 'Locations',
      icon: Factory,
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building,
    },
    {
      id: 'designations',
      label: 'Job Titles',
      icon: Users,
    },
    {
      id: 'employment-levels',
      label: 'Employment Levels',
      icon: Briefcase,
    },
    {
      id: 'shifts',
      label: 'Work Shifts',
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">
            Organization Setup
          </h1>
          <p className="text-slate-400 font-medium mt-2">
            Manage your company structure, hierarchy, and operating parameters.
          </p>
        </div>
      </div>

      <HorizontalTabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        className="mb-8"
      />

      <div className="min-h-[500px]">
        {activeTab === 'profile' && <OrgProfile />}
        {activeTab === 'plants' && <PlantManagement />}
        {activeTab === 'departments' && <DepartmentManagement onSync={() => {}} />}
        {activeTab === 'designations' && <DesignationManagement onSync={() => {}} />}
        {activeTab === 'employment-levels' && <EmploymentLevelManagement onSync={() => {}} />}
        {activeTab === 'shifts' && <ShiftManagement onSync={() => {}} />}
      </div>
    </div>
  );
};

export default OrganizationSetup;

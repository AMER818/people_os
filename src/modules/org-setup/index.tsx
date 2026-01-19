import React, { useState } from 'react';
import { Building2, Building, Users, Factory, Briefcase, Network } from 'lucide-react';
import { HorizontalTabs } from '@/components/ui/HorizontalTabs';
import { DetailLayout } from '@/components/layout/DetailLayout';

// Components
import OrgProfile from './OrgProfile';
import DepartmentManagement from './DepartmentManagement';
import DesignationManagement from './DesignationManagement';
import PlantManagement from './PlantManagement';
import JobLevelManagement from './JobLevelManagement';
import HierarchyChart from './HierarchyChart';
import LeadershipManagement from './LeadershipManagement';

const OrganizationSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Define tabs with RBAC checks if necessary
  const tabs = [
    {
      id: 'profile',
      label: 'Company Profile',
      icon: Building2,
    },
    {
      id: 'hierarchy',
      label: 'Org Chart',
      icon: Network,
    },
    {
      id: 'leadership',
      label: 'Leadership',
      icon: Users,
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
      id: 'job-levels',
      label: 'Job Levels',
      icon: Briefcase,
    },
    {
      id: 'designations',
      label: 'Job Titles',
      icon: Users,
    },
  ];

  return (
    <DetailLayout
      className="animate-in fade-in duration-500"
      containerClassName="max-w-[1600px]"
      header={
        <div className="max-w-[1600px] mx-auto px-6 pt-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">
                Organization Setup
              </h1>
              <p className="text-text-muted font-medium mt-2">
                Manage your company structure and settings.
              </p>
            </div>
          </div>
        </div>
      }
      tabs={
        <div className="max-w-[1600px] mx-auto px-6 mb-8">
          <HorizontalTabs
            tabs={tabs}
            activeTabId={activeTab}
            onTabChange={setActiveTab}
            className="mb-0"
            wrap
          />
        </div>
      }
    >
      <div className="min-h-[500px]">
        {activeTab === 'profile' && <OrgProfile />}
        {activeTab === 'hierarchy' && <HierarchyChart />}
        {activeTab === 'leadership' && <LeadershipManagement />}
        {activeTab === 'plants' && <PlantManagement />}
        {activeTab === 'departments' && <DepartmentManagement onSync={() => {}} />}
        {activeTab === 'designations' && <DesignationManagement onSync={() => {}} />}
        {activeTab === 'job-levels' && <JobLevelManagement onSync={() => {}} />}
      </div>
    </DetailLayout>
  );
};

export default OrganizationSetup;

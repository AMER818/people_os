import React from 'react';
import EmployeeDetailHeader from './EmployeeDetailHeader';
import EmployeeTabs from './EmployeeTabs';
import EmployeeInfoTab from './EmployeeInfoTab';
import PayrollTab from './PayrollTab';
import FamilyTab from './FamilyTab';
import EducationTab from './EducationTab';
import ExperienceTab from './ExperienceTab';

import DisciplineTab from './DisciplineTab';
import { Employee as EmployeeType } from '../../types';

interface EmployeeMasterProps {
  currentEmployee: Partial<EmployeeType> | null;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  updateField: (field: keyof EmployeeType, value: any) => void;
  isAnalyzing: boolean;
  aiSuggestions: any[];
  isDisabled?: boolean;
}

const EmployeeMaster: React.FC<EmployeeMasterProps> = ({
  currentEmployee,
  activeTab,
  setActiveTab,
  updateField,
  isAnalyzing,
  aiSuggestions,
  isDisabled,
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <EmployeeInfoTab
            employee={currentEmployee}
            updateField={updateField}
            isAnalyzing={isAnalyzing}
            aiSuggestions={aiSuggestions}
          />
        );
      case 1:
        return <PayrollTab employee={currentEmployee} updateField={updateField} />;
      case 2:
        return <FamilyTab employee={currentEmployee} updateField={updateField} />;
      case 3:
        return <EducationTab employee={currentEmployee} updateField={updateField} />;
      case 4:
        return <ExperienceTab employee={currentEmployee} updateField={updateField} />;
      case 5:
        return <DisciplineTab employee={currentEmployee} updateField={updateField} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-md overflow-hidden min-h-[62.5rem] flex flex-col">
      <EmployeeDetailHeader employee={currentEmployee} aiSuggestions={aiSuggestions} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <EmployeeTabs activeTab={activeTab} onTabChange={setActiveTab} disabled={isDisabled} />
        <main role="main" aria-label="Employee details content" className="flex-1 p-8 lg:p-12 overflow-y-auto bg-app custom-scrollbar">
          <div className="max-w-7xl mx-auto">{renderTabContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeMaster;

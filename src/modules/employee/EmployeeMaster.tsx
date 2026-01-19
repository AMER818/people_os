import React from 'react';
import EmployeeDetailHeader from './EmployeeDetailHeader';
import EmployeeTabs from './EmployeeTabs';
import EmployeeInfoTab from './EmployeeInfoTab';
import PayrollTab from './PayrollTab';
import FamilyTab from './FamilyTab';
import EducationTab from './EducationTab';
import ExperienceTab from './ExperienceTab';

import DisciplineTab from './DisciplineTab';
import { DetailLayout } from '../../components/layout/DetailLayout';
import { Employee as EmployeeType } from '../../types';

interface EmployeeMasterProps {
  currentEmployee: Partial<EmployeeType> | null;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  updateField: (field: keyof EmployeeType, value: any) => void;
  isAnalyzing: boolean;
  aiSuggestions: any[];
  isDisabled?: boolean;
  isNewRecord?: boolean;
}

const EmployeeMaster: React.FC<EmployeeMasterProps> = ({
  currentEmployee,
  activeTab,
  setActiveTab,
  updateField,
  isAnalyzing,
  aiSuggestions,
  isDisabled,
  isNewRecord = false,
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
        return (
          <PayrollTab
            employee={currentEmployee}
            updateField={updateField}
            isNewRecord={isNewRecord}
          />
        );
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
    <DetailLayout
      aria-label="Employee Details"
      header={<EmployeeDetailHeader employee={currentEmployee} aiSuggestions={aiSuggestions} />}
      tabs={<EmployeeTabs activeTab={activeTab} onTabChange={setActiveTab} disabled={isDisabled} />}
    >
      {renderTabContent()}
    </DetailLayout>
  );
};

export default EmployeeMaster;

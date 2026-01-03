import React from 'react';
import {
  UserRoundPen,
  Wallet,
  Heart,
  GraduationCap,
  History as HistoryIcon,
  Gavel,
} from 'lucide-react';
import { HorizontalTabs, TabNode } from '../../components/ui/HorizontalTabs';

export const MASTER_TABS: TabNode[] = [
  { id: 'employee_info', label: 'Employee Info', icon: UserRoundPen },
  { id: 'payroll', label: 'Benefits', icon: Wallet },
  { id: 'family', label: 'Family', icon: Heart },
  { id: 'education', label: 'Academic', icon: GraduationCap },
  { id: 'experience', label: 'Career', icon: HistoryIcon },
  { id: 'discipline', label: 'Compliance', icon: Gavel },
];

interface EmployeeTabsProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  disabled?: boolean;
}

const EmployeeTabs: React.FC<EmployeeTabsProps> = ({ activeTab, onTabChange, disabled }) => {
  const activeTabId = MASTER_TABS[activeTab].id;

  const handleTabChange = (id: string) => {
    const index = MASTER_TABS.findIndex((t) => t.id === id);
    if (index !== -1) {
      onTabChange(index);
    }
  };

  return (
    <HorizontalTabs
      tabs={MASTER_TABS}
      activeTabId={activeTabId}
      onTabChange={handleTabChange}
      className="mb-8"
      aria-label="Employee sections"
      disabled={disabled}
      wrap={true}
    />
  );
};

export default EmployeeTabs;

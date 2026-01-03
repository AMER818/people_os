import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import EmployeeMaster from './EmployeeMaster';

// Mock child components
vi.mock('./EmployeeDetailHeader', () => ({
    default: () => <div data-testid="employee-detail-header">Header</div>,
}));
vi.mock('./EmployeeTabs', () => ({
    default: ({ activeTab }: any) => <div data-testid="employee-tabs">Tabs: {activeTab}</div>,
}));
vi.mock('./EmployeeInfoTab', () => ({
    default: () => <div data-testid="employee-info-tab">Info Tab</div>,
}));
vi.mock('./PayrollTab', () => ({
    default: () => <div data-testid="payroll-tab">Payroll Tab</div>,
}));
vi.mock('./FamilyTab', () => ({
    default: () => <div data-testid="family-tab">Family Tab</div>,
}));
vi.mock('./EducationTab', () => ({
    default: () => <div data-testid="education-tab">Education Tab</div>,
}));
vi.mock('./ExperienceTab', () => ({
    default: () => <div data-testid="experience-tab">Experience Tab</div>,
}));
vi.mock('./IncrementsTab', () => ({
    default: () => <div data-testid="increments-tab">Increments Tab</div>,
}));
vi.mock('./DisciplineTab', () => ({
    default: () => <div data-testid="discipline-tab">Discipline Tab</div>,
}));

describe('EmployeeMaster', () => {
    const mockProps = {
        currentEmployee: { id: 'EMP-1', name: 'John Doe' },
        activeTab: 0,
        setActiveTab: vi.fn(),
        updateField: vi.fn(),
        isAnalyzing: false,
        aiSuggestions: [],
    };

    it('renders the main layout correctly', () => {
        render(<EmployeeMaster {...mockProps} />);
        expect(screen.getByTestId('employee-detail-header')).toBeDefined();
        expect(screen.getByTestId('employee-tabs')).toBeDefined();
    });

    it('renders EmployeeInfoTab when activeTab is 0', () => {
        render(<EmployeeMaster {...mockProps} activeTab={0} />);
        expect(screen.getByTestId('employee-info-tab')).toBeDefined();
    });

    it('renders PayrollTab when activeTab is 1', () => {
        render(<EmployeeMaster {...mockProps} activeTab={1} />);
        expect(screen.getByTestId('payroll-tab')).toBeDefined();
    });

    it('renders FamilyTab when activeTab is 2', () => {
        render(<EmployeeMaster {...mockProps} activeTab={2} />);
        expect(screen.getByTestId('family-tab')).toBeDefined();
    });

    it('renders EducationTab when activeTab is 3', () => {
        render(<EmployeeMaster {...mockProps} activeTab={3} />);
        expect(screen.getByTestId('education-tab')).toBeDefined();
    });

    it('renders ExperienceTab when activeTab is 4', () => {
        render(<EmployeeMaster {...mockProps} activeTab={4} />);
        expect(screen.getByTestId('experience-tab')).toBeDefined();
    });

    it('renders DisciplineTab when activeTab is 5', () => {
        render(<EmployeeMaster {...mockProps} activeTab={5} />);
        expect(screen.getByTestId('discipline-tab')).toBeDefined();
    });

    it('renders nothing for invalid tab', () => {
        const { container } = render(<EmployeeMaster {...mockProps} activeTab={99} />);
        // Should only have header and tabs, no content in the main area
        // We can check that none of the specific tabs are present
        expect(screen.queryByTestId('employee-info-tab')).toBeNull();
        expect(screen.queryByTestId('payroll-tab')).toBeNull();
    });
});

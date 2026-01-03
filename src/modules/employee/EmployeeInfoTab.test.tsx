import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import EmployeeInfoTab from './EmployeeInfoTab';
import { useOrgStore } from '../../store/orgStore';

// Mock lucide-react
vi.mock('lucide-react', () => {
    const icons = [
        'User', 'UserRoundPen', 'Fingerprint', 'Calendar', 'Phone', 'Mail',
        'CalendarCheck', 'Building', 'MapPin', 'ShieldCheck', 'HeartPulse',
        'Globe', 'CreditCard', 'Car', 'Clock', 'BrainCircuit', 'RefreshCw',
        'Briefcase', 'Award', 'Star', 'AlertCircle', 'Factory', 'ChevronRight',
        'Sun', 'Zap'
    ];
    const mock: any = {};
    icons.forEach((icon) => {
        mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
    });
    return mock;
});

// Mock useOrgStore
vi.mock('../../store/orgStore', () => ({
    useOrgStore: vi.fn(),
}));

describe('EmployeeInfoTab', () => {
    const mockUpdateField = vi.fn();
    const mockEmployee: any = {
        name: 'CYBER NODE X',
        fatherName: 'RICHARD NODE',
        cnic: '12345-6789012-3',
        dateOfBirth: '1990-01-01',
        nationality: 'Pakistani',
        religion: 'Islam',
        personalCellNumber: '0300-1234567',
        officialEmail: 'node@enterprise.com',
        presentAddress: 'SECTOR-7, NEURAL CITY',
        orgName: 'Tech Corp',
        hrPlant: 'Plant A',
        designation: 'Software Engineer',
        grade: 'G1',
        department: 'Technical',
        shift: 'Morning',
        joiningDate: '2023-01-01',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useOrgStore as any).mockReturnValue({
            shifts: [{ id: 'S1', name: 'Morning' }],
            employmentLevels: [],
            departments: [{ id: 'D1', name: 'Technical' }],
            designations: [{ id: 'DS1', name: 'Software Engineer', gradeId: 'G1' }],
            grades: [{ id: 'G1', name: 'G1' }],
            subDepartments: [],
            plants: [{ id: 'P1', name: 'Plant A', divisions: [] }],
            profile: { name: 'Tech Corp' },
        });
    });

    it('renders Identity Registry and Intelligence Hub correctly', () => {
        render(
            <EmployeeInfoTab
                employee={mockEmployee}
                updateField={mockUpdateField}
                isAnalyzing={false}
                aiSuggestions={[{ icon: 'Star', message: 'Optimized node state' }]}
            />
        );

        expect(screen.getByText('Intelligence Hub')).toBeDefined();
        expect(screen.getByText('Identity Registry')).toBeDefined();
        expect(screen.getByText('LEGAL NAME *')).toBeDefined();
        expect(screen.getByDisplayValue('CYBER NODE X')).toBeDefined();
    });

    it('updates text fields with premium styling', () => {
        render(
            <EmployeeInfoTab
                employee={mockEmployee}
                updateField={mockUpdateField}
                isAnalyzing={false}
                aiSuggestions={[]}
            />
        );

        const nameInput = screen.getByDisplayValue('CYBER NODE X');
        fireEvent.change(nameInput, { target: { value: 'UPDATED NODE' } });
        expect(mockUpdateField).toHaveBeenCalledWith('name', 'UPDATED NODE');
    });

    it('renders Contact Matrix section correctly', () => {
        render(
            <EmployeeInfoTab
                employee={mockEmployee}
                updateField={mockUpdateField}
                isAnalyzing={false}
                aiSuggestions={[]}
            />
        );

        expect(screen.getByText('Contact Matrix')).toBeDefined();
        expect(screen.getByText('Primary Mobile *')).toBeDefined();
        expect(screen.getByDisplayValue('0300-1234567')).toBeDefined();
    });

    it('shows premium analysis state', () => {
        render(
            <EmployeeInfoTab
                employee={mockEmployee}
                updateField={mockUpdateField}
                isAnalyzing={true}
                aiSuggestions={[]}
            />
        );

        expect(screen.getByText('Processing...')).toBeDefined();
    });
});

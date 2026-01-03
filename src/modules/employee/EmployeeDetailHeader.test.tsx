import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import EmployeeDetailHeader from './EmployeeDetailHeader';

// Mock lucide-react
vi.mock('lucide-react', () => {
    const icons = ['Edit3', 'Calendar', 'Building2', 'AlertCircle', 'CheckCircle2', 'ShieldCheck', 'UserCircle'];
    const mock: any = {};
    icons.forEach((icon) => {
        mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
    });
    return mock;
});

describe('EmployeeDetailHeader', () => {
    const mockEmployee = {
        id: '1',
        employeeCode: 'EMP-999',
        name: 'CYBER NODE ONE',
        designation: 'SYSTEM ARCHITECT',
        department: 'CORE NEURAL',
        avatar: '',
        joiningDate: '2020-01-01',
        increments: [{}], // This ensures hasAuditEntries is true
    };

    const mockProps = {
        employee: mockEmployee,
        aiSuggestions: [{}, {}], // 2 suggestions
    };

    it('renders the Identity Bar with premium styling', () => {
        const { container } = render(<EmployeeDetailHeader {...mockProps} />);

        // Verify premium background
        const header = container.querySelector('.bg-\\[\\#0f172a\\]');
        expect(header).toBeDefined();

        // Verify all-caps name
        expect(screen.getByText('CYBER NODE ONE')).toBeDefined();
        expect(screen.getByText('CYBER NODE ONE').className).toContain('uppercase');
    });

    it('renders a large circular avatar', () => {
        render(<EmployeeDetailHeader {...mockProps} />);
        const avatar = screen.getByAltText('CYBER NODE ONE');
        expect(avatar.className).toContain('rounded-full');
        expect(avatar.className).toContain('w-32');
        expect(avatar.className).toContain('h-32');
    });

    it('displays verified status with premium badge', () => {
        render(<EmployeeDetailHeader {...mockProps} />);
        expect(screen.getByText('Identity Verified')).toBeDefined();
        const badge = screen.getByText('Identity Verified').parentElement;
        expect(badge?.className).toContain('bg-emerald-500/10');
    });

    it('displays AI heuristics count', () => {
        render(<EmployeeDetailHeader {...mockProps} />);
        expect(screen.getByText('2 HEURISTICS')).toBeDefined();
    });
});

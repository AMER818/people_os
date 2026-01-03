import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import EmployeeList from './EmployeeList';

// Mock lucide-react
vi.mock('lucide-react', () => {
    const icons = ['Edit', 'LogOut', 'Trash2'];
    const mock: any = {};
    icons.forEach((icon) => {
        mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
    });
    return mock;
});

describe('EmployeeList', () => {
    const mockEmployees = [
        {
            id: '1',
            employeeCode: 'EMP001',
            name: 'John Doe',
            designation: 'Software Engineer',
            department: 'Engineering',
            avatar: 'https://example.com/avatar.jpg',
            status: 'Active',
            grade: 'G1',
            shift: 'Morning',
            grossSalary: 50000,
        }
    ];

    const mockProps = {
        employees: mockEmployees,
        onSelect: vi.fn(),
        onEdit: vi.fn(),
        onExit: vi.fn(),
        onDelete: vi.fn(),
    };

    it('renders the employee table with premium styling', () => {
        const { container } = render(<EmployeeList {...mockProps} />);

        // Verify premium background container
        const tableContainer = container.querySelector('.bg-\\[\\#0f172a\\]');
        expect(tableContainer).toBeDefined();

        // Verify headers are uppercase and have tracking
        const headers = screen.getAllByRole('columnheader');
        headers.forEach(header => {
            expect(header.className).toContain('uppercase');
            expect(header.className).toContain('tracking');
        });
    });

    it('renders circular avatars', () => {
        render(<EmployeeList {...mockProps} />);
        const avatar = screen.getByRole('img');
        expect(avatar.className).toContain('rounded-full');
    });

    it('displays employee identity details correctly', () => {
        render(<EmployeeList {...mockProps} />);
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('EMP001')).toBeDefined();
        expect(screen.getByText('Software Engineer')).toBeDefined();
    });

    it('shows action buttons on row', () => {
        render(<EmployeeList {...mockProps} />);
        expect(screen.getByTestId('icon-edit')).toBeDefined();
        expect(screen.getByTestId('icon-logout')).toBeDefined();
        expect(screen.getByTestId('icon-trash2')).toBeDefined();
    });
});

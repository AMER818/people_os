import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EmployeeDashboard from './EmployeeDashboard';

// Mock lucide-react
vi.mock('lucide-react', () => {
    const icons = ['Search', 'SearchCode', 'Plus', 'Download', 'Sparkles', 'Filter', 'FileText', 'FileSpreadsheet'];
    const mock: any = {};
    icons.forEach((icon) => {
        mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
    });
    return mock;
});

// Mock child components
vi.mock('./EmployeeStats', () => ({
    default: () => <div data-testid="employee-stats">Stats</div>,
}));
vi.mock('./EmployeeList', () => ({
    default: () => <div data-testid="employee-list">List</div>,
}));

describe('EmployeeDashboard', () => {
    const mockProps = {
        searchTerm: '',
        setSearchTerm: vi.fn(),
        onAdd: vi.fn(),
        onSelect: vi.fn(),
        onEdit: vi.fn(),
        onExit: vi.fn(),
        onDelete: vi.fn(),
        filteredEmployees: [],
        upcomingEvents: [],
    };

    it('renders the premium Identity Register correctly', () => {
        render(<EmployeeDashboard {...mockProps} />);
        expect(screen.getByText('Identity Register')).toBeDefined();
        expect(screen.getByText('Employee Directory')).toBeDefined();
        expect(screen.getByPlaceholderText('Query by Name, Identification, or Node...')).toBeDefined();
        expect(screen.getByTestId('employee-stats')).toBeDefined();
        expect(screen.getByTestId('employee-list')).toBeDefined();
    });

    it('calls setSearchTerm on input change', () => {
        render(<EmployeeDashboard {...mockProps} />);
        const input = screen.getByPlaceholderText('Query by Name, Identification, or Node...');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(mockProps.setSearchTerm).toHaveBeenCalledWith('test');
    });

    it('calls onAdd when Add Identity button is clicked', () => {
        render(<EmployeeDashboard {...mockProps} />);
        const addButton = screen.getByText('Add Identity');
        fireEvent.click(addButton);
        expect(mockProps.onAdd).toHaveBeenCalled();
    });

    it('renders the active workforce section with premium labels', () => {
        render(<EmployeeDashboard {...mockProps} />);
        expect(screen.getByText('Active Workforce')).toBeDefined();
        expect(screen.getByText('Authorized Identity Registry')).toBeDefined();
    });
});

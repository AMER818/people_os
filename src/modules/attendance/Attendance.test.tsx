import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Attendance from '.';
import { api } from '../../services/api';

// Mock API
vi.mock('../../services/api', () => ({
  api: {
    getAttendanceRecords: vi.fn(),
  },
}));

// Mock lucide-react
vi.mock('lucide-react', () => {
  const icons = [
    'Clock',
    'User',
    'Search',
    'Filter',
    'Fingerprint',
    'Camera',
    'AlertTriangle',
    'Download',
    'Users',
    'Zap',
    'LayoutGrid',
    'ShieldCheck',
    'ScanFace',
    'Globe',
    'Activity',
    'MapPin',
    'RefreshCw',
    'Plus',
    'Check',
    'X',
    'FileEdit',
  ];
  const mock: any = {};
  icons.forEach((icon) => {
    mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
  });
  return mock;
});

describe('Attendance Module', () => {
  const mockRecords = [
    {
      id: 'ATT-1',
      name: 'John Doe',
      code: 'EMP001',
      shift: 'A',
      inTime: '09:00',
      outTime: '17:00',
      status: 'Present',
      verification: 'Facial',
      location: 'Office',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getAttendanceRecords as any).mockResolvedValue(mockRecords);
  });

  it('renders correctly and loads data', async () => {
    render(<Attendance />);
    expect(screen.getByText('Attendance')).toBeDefined();
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeDefined();
    });
  });

  it('switches tabs correctly', async () => {
    render(<Attendance />);

    // Default is Daily Log
    await waitFor(() => expect(screen.getByText('Daily Attendance Log')).toBeDefined());

    // Switch to Monthly Matrix
    fireEvent.click(screen.getByText('Monthly Matrix'));
    await waitFor(() => expect(screen.getByText('Attendance Matrix')).toBeDefined());

    // Switch to Shift Roster
    fireEvent.click(screen.getByText('Shift Roster'));
    await waitFor(() => expect(screen.getByText('Shift Assignments')).toBeDefined());

    // Switch to Corrections
    fireEvent.click(screen.getByText('Corrections'));
    await waitFor(() => expect(screen.getByText('Manual Corrections')).toBeDefined());
  });
});

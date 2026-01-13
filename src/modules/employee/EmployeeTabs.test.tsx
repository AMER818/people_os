import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import DisciplineTab from './DisciplineTab';
import FamilyTab from './FamilyTab';
import EducationTab from './EducationTab';
import ExperienceTab from './ExperienceTab';
// import IncrementsTab from './IncrementsTab'; // File doesn't exist yet

// Mock lucide-react
vi.mock('lucide-react', () => {
  const icons = [
    'BookOpen',
    'User',
    'Mail',
    'Phone',
    'CreditCard',
    'MapPin',
    'HeartPulse',
    'Clock',
    'Factory',
    'Sun',
    'UserPlus',
    'UserX',
    'Target',
    'Settings',
    'Eye',
    'Edit3',
    'AlertCircle',
    'Building2',
    'UserCircle',
    'CheckCircle2',
    'ShieldCheck',
    'Edit',
    'LogOut',
    'Trash2',
    'Plus',
    'Search',
    'SearchCode',
    'Filter',
    'Sparkles',
    'FileText',
    'FileSpreadsheet',
    'PartyPopper',
    'Cake',
    'Users',
    'UserCheck',
    'UserMinus',
    'Briefcase',
    'Calendar',
    'CalendarCheck',
    'Fingerprint',
    'CheckCircle',
    'Info',
    'AlertTriangle',
    'X',
    'Save',
    'UserRoundPen',
    'Wallet',
    'Heart',
    'GraduationCap',
    'History',
    'Gavel',
    'Zap',
    'Hash',
    'Printer',
    'Download',
    'Send',
    'Banknote',
    'TrendingUp',
    'ArrowUp',
    'Building',
    'ChevronRight',
    'BrainCircuit',
    'RefreshCw',
    'Award',
    'Star',
    'LayoutDashboard',
    'Bell',
    'Menu',
    'ChevronLeft',
    'Moon',
    'CalendarDays',
    'Clock3',
    'ClipboardCheck',
    'Coins',
    'Receipt',
    'Landmark',
    'PieChart',
    'Activity',
    'FileCheck',
    'ScanFace',
    'Globe',
    'Camera',
    'LayoutGrid',
    'Layout',
    'List',
    'CalendarRange',
    'Ban',
    'Gauge',
    'Loader2',
    'Coffee',
    'FileEdit',
    'Check',
    'Edit2',
    'Bot',
    'Cpu',
    'ExternalLink',
    'Globe2',
    'Smartphone',
    'Wand2',
    'Key',
    'Cloud',
    'EyeOff',
    'Copy',
    'Database',
    'HardDrive',
    'Server',
    'Network',
    'Shield',
    'FileJson',
    'FileDown',
    'RotateCcw',
    'ArrowUpRight',
    'ShieldCheck',
    'MessageSquare',
  ];
  const mock: any = {};
  icons.forEach((icon) => {
    mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
  });
  return mock;
});

// Mock Button component
vi.mock('../../components/ui/Button', () => ({
  Button: ({ onClick, children, icon: Icon }: any) => (
    <button onClick={onClick}>
      {Icon && <Icon />}
      {children}
    </button>
  ),
}));

describe('Employee Tabs', () => {
  const mockUpdateField = vi.fn();
  const mockEmployee = {
    discipline: [],
    family: [],
    education: [],
    experience: [],
    increments: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DisciplineTab', () => {
    it('renders correctly and adds a log', () => {
      render(<DisciplineTab employee={mockEmployee} updateField={mockUpdateField} />);

      expect(screen.getByText('Discipline Registry')).toBeDefined();
      expect(screen.getByText('Pristine node history.')).toBeDefined();

      fireEvent.click(screen.getByText('Log Incident Signature'));

      expect(mockUpdateField).toHaveBeenCalledWith(
        'discipline',
        expect.arrayContaining([
          expect.objectContaining({
            description: '',
            outcome: '',
          }),
        ])
      );
    });

    it('renders existing logs', () => {
      const empWithDiscipline = {
        ...mockEmployee,
        discipline: [
          { id: '1', date: '2023-01-01', description: 'Test Incident', outcome: 'Verbal Warning' },
        ],
      };
      render(<DisciplineTab employee={empWithDiscipline} updateField={mockUpdateField} />);

      expect(screen.getByDisplayValue('Test Incident')).toBeDefined();
      expect(screen.getByDisplayValue('Verbal Warning')).toBeDefined();
    });

    it('updates and removes a log', () => {
      const emp = {
        ...mockEmployee,
        discipline: [{ id: '1', date: '', description: '', outcome: '' }],
      };
      render(<DisciplineTab employee={emp} updateField={mockUpdateField} />);

      const input = screen.getByPlaceholderText('Incident data...');
      fireEvent.change(input, { target: { value: 'Test' } });
      expect(mockUpdateField).toHaveBeenCalledWith(
        'discipline',
        expect.arrayContaining([expect.objectContaining({ description: 'Test' })])
      );

      fireEvent.click(screen.getByTestId('icon-trash2'));
      expect(mockUpdateField).toHaveBeenCalledWith('discipline', []);
    });
  });

  describe('FamilyTab', () => {
    it('renders correctly and adds a member', () => {
      render(<FamilyTab employee={mockEmployee} updateField={mockUpdateField} />);

      expect(screen.getByText('Family Registry')).toBeDefined();

      fireEvent.click(screen.getByText('Add Dependent'));

      expect(mockUpdateField).toHaveBeenCalledWith(
        'family',
        expect.arrayContaining([expect.objectContaining({ name: '', relationship: 'Child' })])
      );
    });

    it('updates and removes a member', async () => {
      const emp = { ...mockEmployee, family: [{ name: '', relationship: 'Child', dob: '' }] };
      render(<FamilyTab employee={emp} updateField={mockUpdateField} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Spouse' } });
      await waitFor(() => {
        expect(mockUpdateField).toHaveBeenCalledWith(
          'family',
          expect.arrayContaining([expect.objectContaining({ relationship: 'Spouse' })])
        );
      });

      fireEvent.click(screen.getByTestId('icon-trash2'));
      await waitFor(() => {
        expect(mockUpdateField).toHaveBeenCalledWith('family', []);
      });
    }, 10000);
  });

  describe('EducationTab', () => {
    it('renders correctly and adds education', () => {
      render(<EducationTab employee={mockEmployee} updateField={mockUpdateField} />);

      expect(screen.getByText('Academic Credentials')).toBeDefined();

      fireEvent.click(screen.getByText('Add Degree'));

      expect(mockUpdateField).toHaveBeenCalledWith(
        'education',
        expect.arrayContaining([expect.objectContaining({ degree: '', institute: '' })])
      );
    });

    it('updates and removes education', () => {
      const emp = {
        ...mockEmployee,
        education: [
          { degree: '', institute: '', year: '', gradeGpa: '', marksObtained: 0, totalMarks: 0 },
        ],
      };
      render(<EducationTab employee={emp} updateField={mockUpdateField} />);

      const input = screen.getByPlaceholderText('Degree / Certification');
      fireEvent.change(input, { target: { value: 'BSCS' } });
      expect(mockUpdateField).toHaveBeenCalledWith(
        'education',
        expect.arrayContaining([expect.objectContaining({ degree: 'BSCS' })])
      );

      fireEvent.click(screen.getByTestId('icon-x'));
      expect(mockUpdateField).toHaveBeenCalledWith('education', []);
    });
  });

  describe('ExperienceTab', () => {
    it('renders correctly and adds experience', () => {
      render(<ExperienceTab employee={mockEmployee} updateField={mockUpdateField} />);

      expect(screen.getByText('Professional Chronology')).toBeDefined();

      fireEvent.click(screen.getByText('Add Org'));

      expect(mockUpdateField).toHaveBeenCalledWith(
        'experience',
        expect.arrayContaining([expect.objectContaining({ orgName: '', designation: '' })])
      );
    });

    it('updates and removes experience', () => {
      const emp = {
        ...mockEmployee,
        experience: [{ orgName: '', from: '', to: '', designation: '', salary: 0, remarks: '' }],
      };
      render(<ExperienceTab employee={emp} updateField={mockUpdateField} />);

      const input = screen.getByPlaceholderText('Prev Organization...');
      fireEvent.change(input, { target: { value: 'Tech Corp' } });
      expect(mockUpdateField).toHaveBeenCalledWith(
        'experience',
        expect.arrayContaining([expect.objectContaining({ orgName: 'Tech Corp' })])
      );

      fireEvent.click(screen.getByTestId('icon-trash2'));
      expect(mockUpdateField).toHaveBeenCalledWith('experience', []);
    });
  });

  // IncrementsTab tests commented out - component file doesn't exist yet
  /*
    describe('IncrementsTab', () => {
        it('renders correctly and adds increment', () => {
            render(<IncrementsTab employee={mockEmployee} updateField={mockUpdateField} />);

            expect(screen.getByText('Fiscal Evolution')).toBeDefined();
            expect(screen.getByText('No growth history found in node registry.')).toBeDefined();

            fireEvent.click(screen.getByText('Log Growth Step'));

            expect(mockUpdateField).toHaveBeenCalledWith('increments', expect.arrayContaining([
                expect.objectContaining({ newGross: 0, remarks: '' })
            ]));
        });

        it('updates and removes increment', () => {
            const emp = { ...mockEmployee, increments: [{ effectiveDate: '', newGross: 1000, promotion: false, remarks: '' }] };
            render(<IncrementsTab employee={emp} updateField={mockUpdateField} />);

            const input = screen.getByPlaceholderText('Remarks...');
            fireEvent.change(input, { target: { value: 'Good' } });
            expect(mockUpdateField).toHaveBeenCalledWith('increments', expect.arrayContaining([expect.objectContaining({ remarks: 'Good' })]));

            fireEvent.click(screen.getByTestId('icon-trash2'));
            expect(mockUpdateField).toHaveBeenCalledWith('increments', []);
        });
    });
    */
});

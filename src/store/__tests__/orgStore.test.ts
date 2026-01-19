/**
 * Organization Store Test Suite
 * Tests Zustand store logic for organization data management
 * Priority: HIGH (Critical Business Logic)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOrgStore } from '../orgStore';

// Mock modules before importing API
const mockApi = {
  getOrganization: vi.fn(),
  saveOrganization: vi.fn(),
  getDesignations: vi.fn(),
  getGrades: vi.fn(),
  getDepartments: vi.fn(),
  getSubDepartments: vi.fn(),
  getHRPlants: vi.fn(),
  getShifts: vi.fn(),
  getPayrollSettings: vi.fn(),
  getUsers: vi.fn(),
  getJobLevels: vi.fn(),
  getEmployees: vi.fn(),
  getHolidays: vi.fn(),
  getBanks: vi.fn(),
  getPositions: vi.fn(),
  saveDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
  saveSubDepartment: vi.fn(),
  updateSubDepartment: vi.fn(),
  deleteSubDepartment: vi.fn(),
  saveGrade: vi.fn(),
  updateGrade: vi.fn(),
  deleteGrade: vi.fn(),
  savePlant: vi.fn(),
  updatePlant: vi.fn(),
  deletePlant: vi.fn(),
  saveAuditLog: vi.fn(),
  setRateLimit: vi.fn(),
  getRateLimit: vi.fn(() => 100),
};

vi.mock('../../services/api', () => ({
  default: mockApi,
  api: mockApi,
}));

// Global setup - clear session storage before each test
beforeEach(() => {
  sessionStorage.clear();
});

describe('OrgStore - Profile Management', () => {
  beforeEach(() => {
    // Reset store state
    useOrgStore.setState({
      profile: {
        id: '',
        name: '',
        industry: '',
        currency: '',
        taxYearEnd: '',
        country: '',
      },
    });
    vi.clearAllMocks();
  });

  it('should update profile in state', () => {
    // Arrange
    const { result } = renderHook(() => useOrgStore());

    // Act
    act(() => {
      result.current.updateProfile({
        name: 'Test Organization',
        industry: 'Technology',
      });
    });

    // Assert
    expect(result.current.profile.name).toBe('Test Organization');
    expect(result.current.profile.industry).toBe('Technology');
  });

  it('should fetch organization profile from API', async () => {
    // Arrange
    const mockOrg = {
      id: 'org-1',
      name: 'Test Org',
      industry: 'Tech',
      currency: 'USD',
      taxYearEnd: 'December',
      country: 'USA',
    };

    // Import and mock before calling the function
    const apiModule = await import('../../services/api');
    (apiModule.default.getOrganization as any).mockResolvedValueOnce(mockOrg);

    const { result } = renderHook(() => useOrgStore());

    // Act
    await act(async () => {
      await result.current.fetchProfile();
    });

    // Assert
    expect(result.current.profile.name).toBe('Test Org');
    expect(result.current.profile.industry).toBe('Tech');
    expect(apiModule.default.getOrganization).toHaveBeenCalled();
  });

  it('should save profile to API', async () => {
    // Arrange
    const savedOrg = { id: 'org-1', name: 'Saved Org' };

    const apiModule = await import('../../services/api');
    (apiModule.default.saveOrganization as any).mockResolvedValueOnce(savedOrg);

    const { result } = renderHook(() => useOrgStore());

    act(() => {
      result.current.updateProfile({ id: 'org-1', name: 'Test Org' });
    });

    // Act
    await act(async () => {
      await result.current.saveProfile();
    });

    // Assert
    expect(apiModule.default.saveOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Org' })
    );
  });

  it('should handle profile fetch error gracefully', async () => {
    // Arrange
    const apiModule = await import('../../services/api');
    (apiModule.default.getOrganization as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useOrgStore());

    // Act & Assert - should not throw
    await act(async () => {
      await result.current.fetchProfile();
    });

    // Profile should remain in initial state
    expect(result.current.profile.name).toBe('');
  });
});

describe('OrgStore - Master Data Fetching', () => {
  beforeEach(() => {
    useOrgStore.setState({
      designations: [],
      grades: [],
      departments: [],
      loadingEntities: {},
      errorEntities: {},
    });
    vi.clearAllMocks();
  });

  it('should fetch all master data successfully', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    (api.getDesignations as any).mockResolvedValueOnce([{ id: '1', name: 'Manager' }]);
    (api.getGrades as any).mockResolvedValueOnce([{ id: '1', name: 'Grade A' }]);
    (api.getDepartments as any).mockResolvedValueOnce([{ id: '1', name: 'IT' }]);
    (api.getSubDepartments as any).mockResolvedValueOnce([]);
    (api.getHRPlants as any).mockResolvedValueOnce([]);
    (api.getShifts as any).mockResolvedValueOnce([]);
    (api.getPayrollSettings as any).mockResolvedValueOnce({});
    (api.getUsers as any).mockResolvedValueOnce([]);
    (api.getJobLevels as any).mockResolvedValueOnce([]);
    (api.getEmployees as any).mockResolvedValueOnce([]);
    (api.getHolidays as any).mockResolvedValueOnce([]);
    (api.getBanks as any).mockResolvedValueOnce([]);
    (api.getPositions as any).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useOrgStore());

    // Act
    await act(async () => {
      await result.current.fetchMasterData();
    });

    // Assert
    await waitFor(() => {
      expect(result.current.designations).toHaveLength(1);
      expect(result.current.grades).toHaveLength(1);
      expect(result.current.departments).toHaveLength(1);
    });
  });

  it('should handle partial master data fetch failures', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    (api.getDesignations as any).mockResolvedValueOnce([{ id: '1', name: 'Manager' }]);
    (api.getGrades as any).mockRejectedValueOnce(new Error('Grades API failed'));
    (api.getDepartments as any).mockResolvedValueOnce([{ id: '1', name: 'IT' }]);
    (api.getSubDepartments as any).mockResolvedValueOnce([]);
    (api.getHRPlants as any).mockResolvedValueOnce([]);
    (api.getShifts as any).mockResolvedValueOnce([]);
    (api.getPayrollSettings as any).mockResolvedValueOnce({});
    (api.getUsers as any).mockResolvedValueOnce([]);
    (api.getJobLevels as any).mockResolvedValueOnce([]);
    (api.getEmployees as any).mockResolvedValueOnce([]);
    (api.getHolidays as any).mockResolvedValueOnce([]);
    (api.getBanks as any).mockResolvedValueOnce([]);
    (api.getPositions as any).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useOrgStore());

    // Act
    await act(async () => {
      await result.current.fetchMasterData();
    });

    // Assert - should load successful data, skip failed
    await waitFor(() => {
      expect(result.current.designations).toHaveLength(1);
      expect(result.current.departments).toHaveLength(1);
    });
    // Grades should remain empty due to failure
    expect(result.current.grades).toHaveLength(0);
  });
});

describe('OrgStore - Department Management', () => {
  beforeEach(() => {
    useOrgStore.setState({
      departments: [],
      loadingEntities: {},
      errorEntities: {},
    });
    vi.clearAllMocks();
  });

  it('should add department successfully', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    const newDept = { id: 'dept-1', name: 'Engineering', code: 'ENG', isActive: true };
    (api.saveDepartment as any).mockResolvedValueOnce(newDept);

    const { result } = renderHook(() => useOrgStore());

    // Act
    await act(async () => {
      await result.current.addDepartment(newDept);
    });

    // Assert
    await waitFor(() => {
      expect(result.current.departments).toHaveLength(1);
      expect(result.current.departments[0].name).toBe('Engineering');
    });
  });

  it('should update department successfully', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    const existingDept = { id: 'dept-1', name: 'Engineering', code: 'ENG' };
    const updatedDept = { ...existingDept, name: 'Software Engineering' };
    (api.updateDepartment as any).mockResolvedValueOnce(updatedDept);

    const { result } = renderHook(() => useOrgStore());

    // Set initial state
    act(() => {
      useOrgStore.setState({ departments: [existingDept] });
    });

    // Act
    await act(async () => {
      await result.current.updateDepartment('dept-1', { name: 'Software Engineering' });
    });

    // Assert
    await waitFor(() => {
      expect(result.current.departments[0].name).toBe('Software Engineering');
    });
  });

  it('should delete department successfully', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    const existingDept = { id: 'dept-1', name: 'Engineering' };
    (api.deleteDepartment as any).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useOrgStore());

    act(() => {
      useOrgStore.setState({ departments: [existingDept] });
    });

    // Act
    await act(async () => {
      await result.current.deleteDepartment('dept-1');
    });

    // Assert
    await waitFor(() => {
      expect(result.current.departments).toHaveLength(0);
    });
  });

  it('should set loading state during department fetch', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (api.getDepartments as any).mockReturnValueOnce(promise);
    (api.getSubDepartments as any).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useOrgStore());

    // Act - start fetch without awaiting immediately
    let fetchResolve: any;
    const fetchPromise = new Promise((resolve) => {
      fetchResolve = resolve;
    });

    act(async () => {
      result.current.fetchDepartments().then(() => fetchResolve(undefined));
    });

    // Give time for state to update
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Assert - loading should be true
    expect(result.current.loadingEntities.departments).toBe(true);

    // Resolve the API promise
    resolvePromise([{ id: '1', name: 'IT' }]);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.loadingEntities.departments).toBe(false);
    });
  });

  it.skip('should set error state on fetch failure', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    (api.getDepartments as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useOrgStore());

    // Act
    await act(async () => {
      await result.current.fetchDepartments();
    });

    // Assert
    await waitFor(() => {
      expect(result.current.errorEntities.departments).toBeTruthy();
      expect(result.current.errorEntities.departments).toContain('Failed to load');
    });
  });

  it.skip('should clear error state', () => {
    // Arrange
    const { result } = renderHook(() => useOrgStore());
    act(() => {
      useOrgStore.setState({
        errorEntities: { departments: 'Some error' },
      });
    });

    // Act
    act(() => {
      result.current.clearEntityError('departments');
    });

    // Assert
    expect(result.current.errorEntities.departments).toBeNull();
  });
});

describe('OrgStore - Grade Management', () => {
  beforeEach(() => {
    useOrgStore.setState({
      grades: [],
      loadingEntities: {},
      errorEntities: {},
    });
    vi.clearAllMocks();
  });

  it.skip('should add grade successfully', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    const newGrade = { id: 'grade-1', name: 'Grade A', level: 1, code: 'GA' };
    (api.saveGrade as any).mockResolvedValueOnce(newGrade);

    const { result } = renderHook(() => useOrgStore());

    // Act
    await act(async () => {
      await result.current.addGrade(newGrade);
    });

    // Assert
    await waitFor(() => {
      expect(result.current.grades).toHaveLength(1);
      expect(result.current.grades[0].name).toBe('Grade A');
    });
  });

  it.skip('should update grade successfully', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    const existingGrade = { id: 'grade-1', name: 'Grade A', level: 1 };
    const updatedGrade = { ...existingGrade, level: 2 };
    (api.updateGrade as any).mockResolvedValueOnce(updatedGrade);

    const { result } = renderHook(() => useOrgStore());

    act(() => {
      useOrgStore.setState({ grades: [existingGrade] });
    });

    // Act
    await act(async () => {
      await result.current.updateGrade('grade-1', { level: 2 });
    });

    // Assert
    await waitFor(() => {
      expect(result.current.grades[0].level).toBe(2);
    });
  });

  it.skip('should delete grade successfully', async () => {
    // Arrange
    const { api } = await import('../../services/api');
    (api.deleteGrade as any).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useOrgStore());

    act(() => {
      useOrgStore.setState({
        grades: [{ id: 'grade-1', name: 'Grade A', level: 1 }],
      });
    });

    // Act
    await act(async () => {
      await result.current.deleteGrade('grade-1');
    });

    // Assert
    await waitFor(() => {
      expect(result.current.grades).toHaveLength(0);
    });
  });
});

describe('OrgStore - Reset Functionality', () => {
  beforeEach(() => {
    useOrgStore.setState({
      profile: {
        id: '',
        name: '',
        industry: '',
        currency: '',
        taxYearEnd: '',
        country: '',
      },
      departments: [],
      grades: [],
      loadingEntities: {},
      errorEntities: {},
    });
    vi.clearAllMocks();
  });

  it.skip('should reset organization to initial state', () => {
    // Arrange
    const { result } = renderHook(() => useOrgStore());

    act(() => {
      result.current.updateProfile({ name: 'Test Org', industry: 'Tech' });
      useOrgStore.setState({
        departments: [{ id: '1', name: 'IT' }],
        grades: [{ id: '1', name: 'A' }],
      });
    });

    // Act
    act(() => {
      result.current.resetOrganization();
    });

    // Assert
    expect(result.current.profile.name).toBe('');
    expect(result.current.profile.industry).toBe('');
    expect(result.current.departments).toHaveLength(0);
    expect(result.current.grades).toHaveLength(0);
  });
});


import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api } from './api';

describe('ApiService (Stateless Proxy)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Core Data Methods', () => {
    it('should fetch employees', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await api.getEmployees();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/employees'),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        })
      );
    });

    it('should save employee', async () => {
      const data = { name: 'New Emp' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', ...data })
      });

      const result = await api.saveEmployee(data as any);
      expect(result).toEqual({ id: '1', ...data });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/employees'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
    });

    it('should delete employee', async () => {
      await api.deleteEmployee('123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/employees/123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Organization Structure', () => {
    it('should fetch plants/locations', async () => {
      await api.getPlants();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/plants'), expect.anything());
    });

    it('should fetch departments', async () => {
      await api.getDepartments();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/departments'), expect.anything());
    });
  });

  describe('Error Handling', () => {
    it('should return empty array on get failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 500 });
      const result = await api.getEmployees();
      expect(result).toEqual([]); // Fail-safe to empty array
    });

    it('should throw on save failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(api.saveEmployee({} as any)).rejects.toThrow();
    });
  });

  describe('System', () => {
    it('should fetch logs', async () => {
      await api.getAuditLogs();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/audit-logs'), expect.anything());
    });
  });
});

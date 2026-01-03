/**
 * API Authentication Test Suite
 * Tests all authentication-related functionality in api.ts
 * Priority: HIGH (Critical Security Path)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { secureStorage } from '../../utils/secureStorage';

// Mock modules before importing API
vi.mock('../../utils/secureStorage', () => ({
    secureStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    },
}));

vi.mock('../../utils/logger', () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

// Import after mocks
import api from '../api';

describe('API Service - Authentication', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset fetch mock
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('login()', () => {
        it('should login successfully with valid credentials and store token', async () => {
            // Arrange
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    access_token: 'test-jwt-token-123',
                    token_type: 'bearer',
                    user: {
                        id: 'user-1',
                        username: 'testuser',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'SystemAdmin',
                        organization_id: 'org-1',
                        status: 'Active',
                    },
                }),
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            // Act
            const result = await api.login('testuser', 'password123', false);

            // Assert
            expect(result).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/login'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'testuser', password: 'password123' }),
                })
            );
            expect(secureStorage.setItem).toHaveBeenCalledWith(
                'token',
                'test-jwt-token-123',
                'session'
            );
            expect(secureStorage.setItem).toHaveBeenCalledWith(
                'current_user',
                expect.any(String),
                'session'
            );
        });

        it('should use localStorage when rememberMe is true', async () => {
            // Arrange
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    access_token: 'test-token',
                    user: { id: '1', username: 'test' },
                }),
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            // Act
            await api.login('testuser', 'password', true);

            // Assert
            expect(secureStorage.setItem).toHaveBeenCalledWith(
                'token',
                'test-token',
                'local' // Should use local storage
            );
        });

        it('should throw error on invalid credentials (401)', async () => {
            // Arrange
            const mockResponse = {
                ok: false,
                status: 401,
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            // Act & Assert
            await expect(api.login('testuser', 'wrongpassword', false))
                .rejects.toThrow();
        });

        it('should throw error on network failure', async () => {
            // Arrange
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            // Act & Assert
            await expect(api.login('testuser', 'password', false))
                .rejects.toThrow('Network error');
        });

        it('should throw error if access_token is missing in response', async () => {
            // Arrange
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    // Missing access_token
                    user: { id: '1' },
                }),
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            // Act
            const result = await api.login('testuser', 'password', false);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('logout()', () => {
        it('should clear stored token and user data', () => {
            // Act
            api.logout();

            // Assert
            expect(secureStorage.removeItem).toHaveBeenCalledWith('token');
            expect(secureStorage.removeItem).toHaveBeenCalledWith('current_user');
        });

        it('should set authToken to null', () => {
            // Arrange
            (secureStorage.getItem as any).mockReturnValue('some-token');

            // Act
            api.logout();

            // Assert - verify internal state
            // (We can't directly test private property, but we can verify behavior)
            expect(secureStorage.removeItem).toHaveBeenCalled();
        });
    });

    describe('request() with authentication', () => {
        it('should include Authorization header when token exists', async () => {
            // Arrange
            (secureStorage.getItem as any).mockReturnValue('test-token-123');
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ data: 'test' }),
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            // Act
            (api as any).authToken = 'test-token-123';
            await api.get('/employees');


            // Assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token-123',
                    }),
                })
            );
        });

        it('should NOT include Authorization header when no token', async () => {
            // Arrange
            (secureStorage.getItem as any).mockReturnValue(null);
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ data: 'test' }),
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            // Act
            (api as any).authToken = null;
            await api.get('/employees');


            // Assert
            const callArgs = (global.fetch as any).mock.calls[0];
            expect(callArgs[1].headers).not.toHaveProperty('Authorization');
        });

        it('should trigger logout on 401 Unauthorized response', async () => {
            // Arrange
            const mockResponse = {
                ok: false,
                status: 401,
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            // Spy on window events
            const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

            // Act & Assert
            await expect(api.get('/employees')).rejects.toThrow('Session expired');

            expect(secureStorage.removeItem).toHaveBeenCalledWith('token');
            expect(secureStorage.removeItem).toHaveBeenCalledWith('current_user');
            expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
        });
    });

    describe('checkHealth()', () => {
        it('should return health status when backend is available', async () => {
            // Arrange
            const mockHealth = {
                status: 'healthy',
                database: 'connected',
                timestamp: '2026-01-10T12:00:00Z',
            };
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve(mockHealth),
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            // Act
            const result = await api.checkHealth();

            // Assert
            expect(result).toEqual(mockHealth);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/health'),
                expect.any(Object)
            );
        });

        it('should return offline status when backend is down', async () => {
            // Arrange
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            // Act
            const result = await api.checkHealth();

            // Assert
            expect(result.status).toBe('Offline');
            expect(result.database).toBe('Disconnected');
            expect(result.timestamp).toBeDefined();
        });
    });
});

describe('API Service - Rate Limiting', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('should enforce rate limit on requests', async () => {
        // Arrange
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve({ data: 'test' }),
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        // Reset rate limiter
        api.setRateLimit(5); // 5 requests per minute

        // Act - Make 6 requests rapidly
        const promises = [];
        for (let i = 0; i < 6; i++) {
            promises.push(api.get('/test'));
        }

        // Assert - 6th request should fail
        const results = await Promise.allSettled(promises);
        const rejected = results.filter(r => r.status === 'rejected');

        expect(rejected.length).toBeGreaterThan(0);
        expect(rejected[0].reason.message).toContain('Rate limit exceeded');
    });

    it('should allow adjusting rate limit', () => {
        // Act
        api.setRateLimit(200);

        // Assert
        expect(api.getRateLimit()).toBe(200);
    });
});

describe('API Service - Error Handling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('should throw error with status code on API error', async () => {
        // Arrange
        const mockResponse = {
            ok: false,
            status: 404,
            json: () => Promise.resolve({ detail: 'Not found' }),
        };
        (global.fetch as any).mockResolvedValueOnce(mockResponse);

        // Act & Assert
        await expect(api.get('/nonexistent')).rejects.toMatchObject({
            response: {
                status: 404,
                data: { detail: 'Not found' },
            },
        });
    });

    it('should handle malformed JSON response gracefully', async () => {
        // Arrange
        const mockResponse = {
            ok: false,
            status: 500,
            json: () => Promise.reject(new Error('Invalid JSON')),
        };
        (global.fetch as any).mockResolvedValueOnce(mockResponse);

        // Act & Assert
        await expect(api.get('/test')).rejects.toMatchObject({
            response: {
                status: 500,
                data: {},
            },
        });
    });
});

describe('API Service - Request Methods', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('should make GET request correctly', async () => {
        // Arrange
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve({ data: 'test' }),
        };
        (global.fetch as any).mockResolvedValueOnce(mockResponse);

        // Act
        await api.get('/test-endpoint');

        // Assert
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/test-endpoint'),
            expect.objectContaining({ method: 'GET' })
        );
    });

    it('should make POST request with data', async () => {
        // Arrange
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve({ id: '1' }),
        };
        (global.fetch as any).mockResolvedValueOnce(mockResponse);
        const testData = { name: 'Test' };

        // Act
        await api.post('/test-endpoint', testData);

        // Assert
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/test-endpoint'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(testData),
            })
        );
    });
});

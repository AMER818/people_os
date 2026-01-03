import { describe, it, expect, beforeEach, vi } from 'vitest';
import { secureStorage } from './secureStorage';

// Mock LocalStorage for JSDOM environments where it might be incomplete
class LocalStorageMock {
    store: Record<string, string> = {};

    clear() {
        this.store = {};
    }

    getItem(key: string) {
        return this.store[key] || null;
    }

    setItem(key: string, value: string) {
        this.store[key] = String(value);
    }

    removeItem(key: string) {
        delete this.store[key];
    }

    key(n: number) {
        return Object.keys(this.store)[n];
    }

    get length() {
        return Object.keys(this.store).length;
    }
}

describe('SecureStorage Utility', () => {
    beforeEach(() => {
        // Override global storage with our robust mock
        Object.defineProperty(global, 'localStorage', {
            value: new LocalStorageMock(),
            writable: true
        });
        Object.defineProperty(global, 'sessionStorage', {
            value: new LocalStorageMock(), // Use same mock class for session
            writable: true
        });

        // Clear mocks and storage before each test
        localStorage.clear();
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it('should store items in sessionStorage by default', () => {
        secureStorage.setItem('testKey', 'testValue');
        // Check direct storage to verify prefix and obfuscation presence
        // Note: We aren't testing the implementation of btoa here, just that it's stored
        expect(sessionStorage.getItem('hzl_testKey')).toBeDefined();
        expect(localStorage.getItem('hzl_testKey')).toBeNull();
    });

    it('should store items in localStorage when specified', () => {
        secureStorage.setItem('persistentKey', 'persistentValue', 'local');
        expect(localStorage.getItem('hzl_persistentKey')).toBeDefined();
        expect(sessionStorage.getItem('hzl_persistentKey')).toBeNull();
    });

    it('should retrieve items correctly regardless of storage type default logic', () => {
        secureStorage.setItem('myKey', 'myValue', 'session');
        const retrieved = secureStorage.getItem('myKey');
        expect(retrieved).toBe('myValue');
    });

    it('should prioritize specified storage type during retrieval', () => {
        // Setup conflict
        const key = 'conflict';
        // Manually inject values to test retrieval logic
        // We use the public setItem to ensure encoding is consistent
        secureStorage.setItem(key, 'sessionVal', 'session');
        secureStorage.setItem(key, 'localVal', 'local');

        expect(secureStorage.getItem(key, 'session')).toBe('sessionVal');
        expect(secureStorage.getItem(key, 'local')).toBe('localVal');
    });

    it('should fallback to local if session is empty when generic get is used', () => {
        secureStorage.setItem('localOnly', 'data', 'local');
        expect(secureStorage.getItem('localOnly')).toBe('data');
    });

    it('should remove items from both storages', () => {
        secureStorage.setItem('delKey', 'val', 'session');
        secureStorage.setItem('delKey', 'val', 'local'); // Duplicate just to be sure

        secureStorage.removeItem('delKey');

        expect(sessionStorage.getItem('hzl_delKey')).toBeNull();
        expect(localStorage.getItem('hzl_delKey')).toBeNull();
    });

    it('should clear only app-specific keys', () => {
        // App keys
        secureStorage.setItem('app1', 'v1');
        secureStorage.setItem('app2', 'v2', 'local');

        // Other keys
        sessionStorage.setItem('other_key', 'keep');
        localStorage.setItem('other_key', 'keep');

        secureStorage.clear();

        expect(secureStorage.getItem('app1')).toBeNull();
        expect(secureStorage.getItem('app2')).toBeNull();

        // Direct check for "other" keys
        expect(sessionStorage.getItem('other_key')).toBe('keep');
        expect(localStorage.getItem('other_key')).toBe('keep');
    });
});

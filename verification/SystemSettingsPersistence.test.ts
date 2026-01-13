import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing ApiService
vi.mock('../utils/security', () => ({
  RateLimiter: class {
    constructor(limit: number, windowMs: number) {}
    check() {
      return true;
    }
    canMakeRequest() {
      return true;
    }
    setMaxRequests() {}
    getMaxRequests() {
      return 100;
    }
  },
}));

vi.mock('../src/system/GovernanceEngine', () => ({
  GovernanceEngine: {
    evaluate: () => ({ reason: 'Allowed', intercepted: false }),
  },
}));

vi.mock('../src/system/systemStore', () => ({
  useSystemStore: {
    getState: () => ({
      ingestSignal: vi.fn(),
    }),
  },
}));

vi.mock('../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

import { api } from '../src/services/api';

describe('SystemSettingsPersistence', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
    };
  })();

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.clear();

    // Mock Fetch to simulate BACKEND FAILURE
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false, // Simulate 404 or 500
        json: () => Promise.resolve({ error: 'Backend unavailable' }),
      })
    ) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should save System Flags to LocalStorage when backend fails', async () => {
    const flags = { mfa_enforced: true, ip_whitelisting: true };
    await api.updateSystemFlags(flags);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'system_flags',
      expect.stringContaining('"mfa_enforced":true')
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'system_flags',
      expect.stringContaining('"ip_whitelisting":true')
    );
  });

  it('should save Notification Settings to LocalStorage when backend fails', async () => {
    const settings = { email: { smtpServer: 'smtp.fallback.com' } };
    await api.updateNotificationSettings(settings);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'notification_settings',
      expect.stringContaining('smtp.fallback.com')
    );
  });

  it('should save AI Settings to LocalStorage when backend fails', async () => {
    const settings = { provider: 'openai', apiKeys: { openai: 'sk-test' } };
    await api.updateAiSettings(settings);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'ai_settings',
      expect.stringContaining('sk-test')
    );
  });

  it('should create API Key in LocalStorage when backend fails', async () => {
    const result = await api.createApiKey('Test Key');

    expect(result.name).toBe('Test Key');
    expect(result.raw_key).toBeDefined();

    const stored = JSON.parse(localStorageMock.getItem('system_api_keys') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Test Key');
  });

  it('should create Webhook in LocalStorage when backend fails', async () => {
    const result = await api.createWebhook('Slack', 'https://hooks.slack.com', ['user.created']);

    expect(result.name).toBe('Slack');

    const stored = JSON.parse(localStorageMock.getItem('system_webhooks') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].url).toBe('https://hooks.slack.com');
  });
});

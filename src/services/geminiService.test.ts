import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFastInsight,
  getDeepAudit,
  getChatResponse,
  analyzeCandidateProfile,
  predictTurnover,
  testGeminiConnection,
  GEMINI_MODELS,
} from './geminiService';
import { useOrgStore } from '../store/orgStore';

// Mock the store
vi.mock('../store/orgStore', () => ({
  useOrgStore: {
    getState: vi.fn(() => ({
      aiSettings: {
        enabled: true,
        apiKeys: { gemini: 'test-key' },
      },
      updateAiSettings: vi.fn(),
    })),
  },
}));

// Mock GoogleGenAI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
      constructor() { }
    },
    Type: { OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', ARRAY: 'ARRAY' },
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockResolvedValue({
      text: 'Mock AI Response',
    });
  });

  it('getFastInsight should use FLASH_2_5 model', async () => {
    const result = await getFastInsight('Test Prompt', {});
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: GEMINI_MODELS.FLASH_2_5,
      })
    );
    expect(result).toBe('Mock AI Response');
  });

  it('getDeepAudit should use PRO_2_5 model', async () => {
    const result = await getDeepAudit('Test Context', {});
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: GEMINI_MODELS.PRO_2_5,
      })
    );
    expect(result).toBe('Mock AI Response');
  });

  it('getChatResponse should prefer FLASH_3_PREVIEW (as per current config)', async () => {
    await getChatResponse([], 'Hello');
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: GEMINI_MODELS.FLASH_3_PREVIEW,
      })
    );
  });

  it('analyzeCandidateProfile should use PRO_3_PREVIEW (or fallback)', async () => {
    await analyzeCandidateProfile({ name: 'John', skills: [] });
    // Based on my code, it tries PRO_3_PREVIEW first
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: GEMINI_MODELS.PRO_3_PREVIEW,
      })
    );
  });

  it('testGeminiConnection should return success on valid response', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'OK' });
    const result = await testGeminiConnection();
    expect(result.success).toBe(true);
    expect(result.message).toContain('OK');
  });

  it('getFastInsight should fallback to FLASH_2_0 on error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Flash 2.5 failed'));
    mockGenerateContent.mockResolvedValueOnce({ text: 'Fallback Response' });

    const result = await getFastInsight('Test Prompt', {});

    expect(mockGenerateContent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        model: GEMINI_MODELS.FLASH_2_0,
      })
    );
    expect(result).toBe('Fallback Response');
  });

  it('getChatResponse should fallback to FLASH_2_5 on error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Flash 3.0 failed'));
    mockGenerateContent.mockResolvedValueOnce({ text: 'Fallback Chat Response' });

    await getChatResponse([], 'Hello');

    expect(mockGenerateContent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        model: GEMINI_MODELS.FLASH_2_5,
      })
    );
  });

  it('should handle AI initialization failure (missing key)', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');

    // Mock store to return empty key
    vi.mocked(useOrgStore.getState).mockReturnValueOnce({
      aiSettings: { enabled: true, apiKeys: { gemini: '' } },
      updateAiSettings: vi.fn(),
    } as any);

    const result = await getFastInsight('Test', {});
    expect(result).toContain('AI Core Offline');
  });

  it('analyzeCandidateProfile should fallback to PRO_2_5 on error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Pro 3.0 failed'));
    mockGenerateContent.mockResolvedValueOnce({ text: 'Fallback Analysis' });

    const result = await analyzeCandidateProfile({ name: 'John', skills: [] });

    expect(mockGenerateContent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        model: GEMINI_MODELS.PRO_2_5,
      })
    );
    expect(result).toBe('Fallback Analysis');
  });

  it('testGeminiConnection should try multiple models and return success', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('429 Rate Limit'));
    mockGenerateContent.mockResolvedValueOnce({ text: 'OK' });

    const result = await testGeminiConnection();

    expect(result.success).toBe(true);
    expect(result.message).toContain('OK');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('testGeminiConnection should return failure if all models fail', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Connection Failed'));

    const result = await testGeminiConnection();

    expect(result.success).toBe(false);
    expect(result.message).toContain('Connection Failed');
  });

  it('testGeminiConnection should handle Quota Exceeded (429) error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('429 RESOURCE_EXHAUSTED'));

    const result = await testGeminiConnection();

    expect(result.success).toBe(false);
    expect(result.message).toContain('Quota Exceeded (429)');
  });

  it('predictTurnover should return data on success', async () => {
    const mockData = { retentionProb: 85, headcountGrowth: 5, efficiencyDelta: 2, riskFactors: ['Burnout'] };
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockData) });

    const result = await predictTurnover({});
    expect(result).toEqual(mockData);
  });

  it('predictTurnover should return null on failure', async () => {
    mockGenerateContent.mockRejectedValue(new Error('AI Error'));

    const result = await predictTurnover({});
    expect(result).toBeNull();
  });
});

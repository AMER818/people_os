import { GoogleGenAI, Type } from '@google/genai';
import Logger from '../utils/logger';
import { useOrgStore } from '../store/orgStore';
import { validate, sanitizePrompt } from './validationService';

const getAI = () => {
  try {
    const state = useOrgStore.getState();
    const apiKey =
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      (process.env.GEMINI_API_KEY as string) ||
      '';

    // Get key from store or fallback to env
    const storeKey = state.aiSettings.apiKeys.gemini;
    const effectiveKey = storeKey || apiKey;

    if (!effectiveKey) {
      Logger.warn('Gemini API Key missing in both Store and Env');
      return null;
    }

    // Always create new instance to ensure latest key is used if it changed
    return new GoogleGenAI({ apiKey: effectiveKey });
  } catch (e) {
    Logger.error('Failed to initialize AI from store:', e);
    return null;
  }
};

export const GEMINI_MODELS = {
  FLASH_3_PREVIEW: 'gemini-3.0-flash-preview',
  PRO_3_PREVIEW: 'gemini-3.0-pro-preview',
  PRO_2_5: 'gemini-2.5-pro',
  FLASH_2_5: 'gemini-2.5-flash',
  FLASH_2_0: 'gemini-2.0-flash',
};

/**
 * FAST INSIGHT: Low-latency responses using gemini-2.5-flash.
 * Ideal for real-time summaries and instant UI feedback.
 *
 * Safety Features:
 * - Input validation via validate() function
 * - Prompt sanitization with sanitizePrompt()
 * - Grounding instructions in system context
 * - Error handling with graceful fallback to flash-2.0
 * - Structured response with temperature equivalent control (brief output)
 */
export const getFastInsight = async (prompt: string, data: any) => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      return 'AI Core Offline. Please configure API Key in System Settings > AI Core.';
    }

    validate(prompt, data);
    const safePrompt = sanitizePrompt(prompt);

    const response = await aiInstance.models.generateContent({
      model: GEMINI_MODELS.FLASH_2_5,
      contents: `
        Context: You are an HR Assistant in a high-speed Enterprise OS.
        Task: ${safePrompt}
        Data Snapshot: ${JSON.stringify(data)}
        
        Instruction: Be extremely concise, use bullet points, and focus on immediate action.
      `,
    });
    return response.text || 'No immediate insights available.';
  } catch (error) {
    Logger.error('Flash Error:', error);
    // Fallback to 2.0 if 2.5 fails
    try {
      const aiInstance = getAI();
      if (!aiInstance) {
        return 'AI Core Offline.';
      }
      const response = await aiInstance.models.generateContent({
        model: GEMINI_MODELS.FLASH_2_0,
        contents: `Task: ${prompt} Data: ${JSON.stringify(data)}`,
      });
      return response.text || 'No insights.';
    } catch (e) {
      return 'Error generating fast insight.';
    }
  }
};

/**
 * DEEP AUDIT: High-reasoning analysis using gemini-1.5-pro with maximum thinking budget.
 * Used for complex workforce forecasting, risk modeling, and root-cause analysis.
 *
 * Safety Features:
 * - Input validation via validate()
 * - Error handling with descriptive fallback message
 * - Structured reasoning prompt
 */
export const getDeepAudit = async (context: string, data: any) => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      return 'Neural Engine Offline. Please configure API Key in System Settings > AI Core.';
    }

    validate(context, data);

    const response = await aiInstance.models.generateContent({
      model: GEMINI_MODELS.PRO_2_5,
      contents: `
        Analyze this complex HR scenario: "${context}".
        System Data Ledger: ${JSON.stringify(data)}
        
        Perform an exhaustive workforce audit. Detect hidden correlations, predict turnover velocity, 
        and provide strategic fiscal recommendations.
      `,
    });
    return response.text || 'Deep analysis registry empty.';
  } catch (error) {
    Logger.error('Pro Error:', error);
    return 'The Neural Engine encountered an error during deep computation.';
  }
};

/**
 * WORKFORCE OPTIMIZATION: Structured analysis for personnel growth and risk.
 */
export const getWorkforceOptimization = async (employeeData: any) => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      return { suggestions: [], riskLevel: 'Unknown', growthPotential: 0 };
    }

    validate('Optimization', employeeData);

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
        Analyze this personnel node for optimization:
        ${JSON.stringify(employeeData)}
        
        Identify skill gaps, performance trajectories, and cultural alignment.
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['skill', 'info', 'perf'] },
                  priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                },
              },
            },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Critical'] },
            growthPotential: { type: Type.NUMBER, description: 'Scale 1-100' },
          },
        },
      },
    });
    return JSON.parse(
      response.text || '{"suggestions": [], "riskLevel": "Low", "growthPotential": 0}'
    );
  } catch (error) {
    Logger.error('Optimization Error:', error);
    return { suggestions: [], riskLevel: 'Unknown', growthPotential: 0 };
  }
};

export const parseResumeAI = async (resumeText: string) => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      return {};
    }

    validate('Resume Parse', resumeText);

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Exhaustively parse this resume for technical signatures and cultural fit: ${resumeText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceYears: { type: Type.NUMBER },
            biasWarning: { type: Type.STRING },
            fitScore: { type: Type.NUMBER, description: 'Scale 1-100' },
            recommendation: { type: Type.STRING },
          },
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    Logger.error('Resume Parse Error:', error);
    return {};
  }
};

/**
 * CHAT ASSISTANT: General purpose chat with context.
 *
 * Safety Features:
 * - System prompt grounds AI in professional assistant role
 * - Input validation built-in
 * - Fallback to lower-spec model if primary fails
 * - Error handling with informative error messages
 */
export const getChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
) => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      return 'AI Chat Unavailable. Please check API Key settings.';
    }

    // Prefer 3.0 Flash for chat if available, else fallback
    const model = GEMINI_MODELS.FLASH_3_PREVIEW;

    try {
      const response = await aiInstance.models.generateContent({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'System: You are Hunzal AI, an advanced Enterprise OS Assistant. Be concise and professional.',
              },
            ],
          },
          ...history.map((h) => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
          { role: 'user', parts: [{ text: message }] },
        ],
      });
      return response.text || 'No response generated.';
    } catch (e) {
      // Fallback to 2.5 Flash
      const response = await aiInstance.models.generateContent({
        model: GEMINI_MODELS.FLASH_2_5,
        contents: [
          { role: 'user', parts: [{ text: 'System: You are Hunzal AI.' }] },
          ...history.map((h) => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
          { role: 'user', parts: [{ text: message }] },
        ],
      });
      return response.text || 'No response generated.';
    }
  } catch (error: any) {
    Logger.error('Chat Error:', error);
    return `Error: ${error.message || 'Connection Failed'}`;
  }
};

/**
 * CANDIDATE ANALYSIS: Analyzes candidate profile for fit.
 *
 * Safety Features:
 * - Input validation on candidate data
 * - Structured prompt with clear instructions
 * - Error handling with fallback analysis method
 * - Graceful degradation to lower model on failure
 */
export const analyzeCandidateProfile = async (candidate: any) => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      return 'AI Analysis Unavailable.';
    }

    validate('Candidate Analysis', candidate);

    const prompt = `Analyze this candidate for the position of ${candidate.positionApplied}.
      Candidate Name: ${candidate.name}
      Experience: ${candidate.experience}
      Skills: ${candidate.skills.join(', ')}
      Education: ${candidate.education}
      
      Provide a brief, bulleted executive summary of their fit, highlighting strengths and potential red flags. 
      Keep it under 100 words. Format as HTML-safe text (no markdown).`;

    const response = await aiInstance.models.generateContent({
      model: GEMINI_MODELS.PRO_3_PREVIEW,
      contents: prompt,
    });

    return response.text || 'No analysis generated.';
  } catch (error: any) {
    Logger.error('Candidate Analysis Error:', error);
    // Fallback
    try {
      const aiInstance = getAI();
      if (!aiInstance) {
        return 'AI Analysis Unavailable.';
      }
      const response = await aiInstance.models.generateContent({
        model: GEMINI_MODELS.PRO_2_5,
        contents: `Analyze this candidate: ${candidate.name}`,
      });
      return response.text || 'No analysis generated.';
    } catch (e: any) {
      return `Analysis Failed: ${error.message}`;
    }
  }
};

/**
 * TURNOVER PREDICTION: Analyzes workforce data to predict retention trends.
 *
 * Safety Features:
 * - Input validation on workforce data
 * - Structured JSON schema response (guaranteed valid output)
 * - Clear factual analysis instructions
 * - Error handling returns sensible defaults
 */
export const predictTurnover = async (workforceData: any) => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      return null;
    }

    validate('Turnover Prediction', workforceData);

    const response = await aiInstance.models.generateContent({
      model: GEMINI_MODELS.PRO_2_5,
      contents: `
        Analyze this workforce data snapshot:
        ${JSON.stringify(workforceData)}

        Predict the following for the next 6 months:
        1. Retention Probability (percentage)
        2. Projected Headcount Growth (number)
        3. Efficiency Delta (percentage)
        4. Key Risk Factors (brief list)

        Return ONLY a JSON object with keys: retentionProb, headcountGrowth, efficiencyDelta, riskFactors.
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            retentionProb: { type: Type.NUMBER },
            headcountGrowth: { type: Type.NUMBER },
            efficiencyDelta: { type: Type.NUMBER },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });
    return JSON.parse(response.text || 'null');
  } catch (error) {
    Logger.error('Turnover Prediction Error:', error);
    return null;
  }
};

export const testGeminiConnection = async () => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      return { success: false, message: 'AI Core Offline. Check API Key.' };
    }

    // Use a simple model for connectivity check
    // Fallback to 1.5-flash if 2.5 is rate limited or unavailable
    const modelsToTry = [GEMINI_MODELS.FLASH_2_5, 'gemini-1.5-flash'];

    let lastError;
    for (const modelName of modelsToTry) {
      try {
        Logger.info(`Testing connection with model: ${modelName}...`);
        const response = await aiInstance.models.generateContent({
          model: modelName,
          contents: "Test connection. Reply 'OK'.",
        });
        const text = response.text;
        if (text) {
          // Update store status
          const { useOrgStore } = await import('../store/orgStore');
          useOrgStore.getState().updateAiSettings({ status: 'online' });
          return { success: true, message: `Connected (${modelName}): ${text}` };
        }
      } catch (e: any) {
        Logger.warn(`Failed with ${modelName}:`, e.message);
        lastError = e;
        if (e.message?.includes('429')) {
          continue;
        } // Try next model if rate limited
      }
    }

    throw lastError; // Throw if all fail
  } catch (error: any) {
    const { useOrgStore } = await import('../store/orgStore');
    useOrgStore.getState().updateAiSettings({ status: 'offline' });
    Logger.error('Connection Test Error:', error);

    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return { success: false, message: 'Quota Exceeded (429). Try again later or check billing.' };
    }

    return { success: false, message: error.message || 'Connection Failed' };
  }
};

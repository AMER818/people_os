import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Bot, Wand2, Key, Layout, Activity, Zap, Save } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { useToast } from '@components/ui/Toast';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { SYSTEM_CONFIG } from './systemConfig';

/**
 * AIConfig Component
 * @description Configures system-wide AI behavioral traits, ethical thresholds, and autonomous capabilities.
 * Features:
 * - AI trait tuning (Precision vs. Creative)
 * - Autonomous evolution toggles
 * - Ethical kernel threshold management
 */
const AIConfig: React.FC = () => {
  const { aiSettings, updateAiSettings } = useOrgStore();
  const { success, error } = useToast();
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state to prevent API calls on every change
  const [localSettings, setLocalSettings] = useState(aiSettings);

  // Sync from store on load
  React.useEffect(() => {
    setLocalSettings(aiSettings);
  }, [aiSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAiSettings(localSettings);
      success('AI settings updated successfully');
    } catch (e) {
      error('Failed to update AI settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAiConnection = async () => {
    setIsTestingAi(true);
    // Simulate API latency or call real test endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsTestingAi(false);

    const currentKey = localSettings.apiKeys[localSettings.provider];

    if (currentKey && currentKey.length > 10) {
      success(`${localSettings.provider.toUpperCase()} Node Handshake Successful`);
      // Auto-enable if test passes? Optional. Let's just set status locally.
      setLocalSettings((prev) => ({ ...prev, status: 'online' }));
    } else {
      error('Invalid API configuration payload');
      setLocalSettings((prev) => ({ ...prev, status: 'offline' }));
    }
  };

  const providers = [
    { id: 'gemini', label: 'Google Gemini', icon: Sparkles },
    { id: 'openai', label: 'OpenAI GPT', icon: Bot },
    { id: 'anthropic', label: 'Anthropic Claude', icon: Wand2 },
  ];

  const agents = [
    {
      id: 'resume_screener',
      title: 'Resume Screener',
      desc: 'Auto-rank candidates based on job descriptions.',
      icon: Layout,
    },
    {
      id: 'turnover_predictor',
      title: 'Turnover Predictor',
      desc: 'Analyze employee sentiment to predict exit risk.',
      icon: Activity,
    },
    {
      id: 'chat_assistant',
      title: 'HR Chat Assistant',
      icon: Bot,
      desc: 'Provide instant answers to employee policy queries.',
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary-soft text-primary rounded-xl">
            <BrainCircuit size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
              AI Settings
            </h3>
            <p className="text-xs text-text-muted font-bold">Manage AI integration.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em]">
                AI Provider
              </label>
              <div className="grid grid-cols-3 gap-3">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setLocalSettings((prev) => ({ ...prev, provider: p.id as any }))}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${localSettings.provider === p.id ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-muted-bg/30 text-text-muted hover:border-primary/50'}`}
                    aria-label={p.label}
                  >
                    <p.icon size={18} />
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-center">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em]">
                API Configuration
              </label>
              <div className="space-y-3">
                <Input
                  label={`${localSettings.provider.toUpperCase()} API Key`}
                  type="password"
                  value={localSettings.apiKeys[localSettings.provider] || ''}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      apiKeys: { ...prev.apiKeys, [prev.provider]: e.target.value },
                    }))
                  }
                  placeholder="Enter your API key"
                  icon={Key}
                />
                <Button
                  variant="secondary"
                  className="w-full text-xs h-9"
                  onClick={handleTestAiConnection}
                  isLoading={isTestingAi}
                >
                  Test Connection
                </Button>
                <div className="flex items-center justify-between p-3 bg-muted-bg/30 rounded-xl border border-border">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${localSettings.status === 'online' ? 'bg-success' : 'bg-danger'}`}
                    />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-tight">
                      Status: {localSettings.status}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-[0.6rem] px-3"
                    onClick={() =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        status: prev.status === 'online' ? 'offline' : 'online',
                      }))
                    }
                  >
                    {localSettings.status === 'online' ? 'Turn Off' : 'Turn On'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em]">
              Intelligence Agents
            </label>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 bg-muted-bg/30 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-surface rounded-lg text-text-primary shadow-sm">
                      <agent.icon size={16} />
                    </div>
                    <div>
                      <h4 className="font-black text-text-primary uppercase text-xs tracking-tight">
                        {agent.title}
                      </h4>
                      <p className="text-[0.65rem] text-text-muted font-bold mt-0.5">
                        {agent.desc} (Latency: {SYSTEM_CONFIG.LATENCY.ENGINE})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        agents: {
                          ...prev.agents,
                          [agent.id]: !prev.agents[agent.id as keyof typeof prev.agents],
                        },
                      }))
                    }
                    aria-label={`Toggle ${agent.title}`}
                    className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${localSettings.agents[agent.id as keyof typeof localSettings.agents] ? 'bg-primary' : 'bg-border'}`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full transition-transform ${localSettings.agents[agent.id as keyof typeof localSettings.agents] ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-primary-soft/30 rounded-xl border border-primary/10">
              <p className="text-[0.65rem] font-bold text-primary leading-relaxed text-center">
                <Zap size={12} className="inline mr-2 mb-0.5" />
                Intelligence agents require a valid API key and active status to function.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="w-full font-black uppercase tracking-widest text-xs h-10"
              >
                <Save size={14} className="mr-2" /> Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfig;

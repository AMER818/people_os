import Logger from '@/utils/logger';
import React, { useState } from 'react';
// ... existing imports ...
import { Cloud, Plus, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import { useOrgStore } from '@store/orgStore';
import { useToast } from '@components/ui/Toast';
import { useModal } from '@hooks/useModal';
import { useSaveEntity } from '@hooks/useSaveEntity';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Badge } from '@components/ui/Badge';

import { FormModal } from '@components/ui/FormModal';

/**
 * APIManager Component
 * @description Manages external access to the system via API Keys and Webhooks.
 * Features:
 * - API Key generation and scope management
 * - Webhook registration and testing (Event Relay)
 * - Secure token reveal/copy functionality
 */
const APIManager: React.FC = React.memo(() => {
  const { apiKeys, addApiKey, deleteApiKey, webhooks, addWebhook, deleteWebhook } = useOrgStore();
  const { success } = useToast();

  const apiKeyModal = useModal();
  const webhookModal = useModal();

  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const {
    formData: apiKeyForm,
    updateField: updateKeyField,
    isSaving: isSavingKey,
    handleSave: handleSaveKey,
    setFormData: setKeyData,
  } = useSaveEntity<
    { name: string; scope: 'Read-only' | 'Read/Write' | 'Full Admin' },
    { name: string; scope: string }
  >({
    onSave: async (data) => {
      addApiKey(data.name, data.scope);
    },
    onAfterSave: () => {
      apiKeyModal.close();
    },
    successMessage: 'API Key generated successfully.',
    initialState: { name: '', scope: 'Read-only' },
    validate: (data) => !!data.name,
  });

  const {
    formData: webhookForm,
    updateField: updateWebhookField,
    isSaving: isSavingWebhook,
    handleSave: handleSaveWebhook,
    setFormData: setWebhookData,
  } = useSaveEntity<
    { name: string; url: string; events: string[] },
    { name: string; url: string; events: string[] }
  >({
    onSave: async (data) => {
      addWebhook(data);
    },
    onAfterSave: () => {
      webhookModal.close();
    },
    successMessage: 'Webhook added successfully.',
    initialState: { name: '', url: '', events: ['employee.created'] },
    validate: (data) => !!(data.name && data.url),
  });

  const toggleKeyReveal = (id: string) => {
    const next = new Set(revealedKeys);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setRevealedKeys(next);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard`);
  };

  const simulateWebhookDelivery = (id: string) => {
    // This would be an API call in a real app
    Logger.info(`Simulating webhook delivery for ${id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Cloud size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
              Developer Tools
            </h3>
            <p className="text-text-muted text-xs font-bold antialiased">
              Manage API keys and webhooks
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* API Keys */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-black text-text-primary uppercase tracking-tight">
                API Keys
              </h4>
              <Button
                onClick={() => {
                  setKeyData({ name: '', scope: 'Read-only' });
                  apiKeyModal.open();
                }}
                size="sm"
                className="h-8 text-[0.6rem] uppercase tracking-wider font-black"
              >
                <Plus size={14} className="mr-2" />
                Create API Key
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-muted-bg/30 rounded-xl p-4 border border-border group hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-text-primary text-xs">{key.name}</p>
                      <Badge
                        variant="secondary"
                        className="text-[0.45rem] font-black uppercase tracking-widest px-2 py-0.5"
                      >
                        {key.scope}
                      </Badge>
                    </div>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label={`Delete API key ${key.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-border/50">
                    <code
                      className="flex-1 text-[0.6rem] font-mono text-text-primary overflow-hidden"
                      aria-live="polite"
                    >
                      {revealedKeys.has(key.id) ? key.key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => toggleKeyReveal(key.id)}
                      className="p-1.5 text-text-muted hover:text-primary"
                      aria-label={revealedKeys.has(key.id) ? 'Hide API Key' : 'Reveal API Key'}
                    >
                      {revealedKeys.has(key.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key, 'API Key')}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors"
                      aria-label="Copy API Key"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <p className="text-[0.55rem] font-bold text-text-muted mt-3 uppercase tracking-widest flex items-center justify-between">
                    <span>Created: {key.created}</span>
                    <span>Last Hit: {key.lastUsed}</span>
                  </p>
                </div>
              ))}
            </div>
            {apiKeys.length === 0 && (
              <div className="p-10 text-center border-t border-border border-dashed font-bold uppercase text-[0.65rem] text-text-muted tracking-widest bg-muted-bg/10 rounded-xl mt-2">
                No active API keys found
              </div>
            )}
          </section>

          {/* Webhooks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-black text-text-primary uppercase tracking-tight">
                Webhooks
              </h4>
              <Button
                onClick={() => {
                  setWebhookData({ name: '', url: '', events: ['employee.created'] });
                  webhookModal.open();
                }}
                size="sm"
                className="h-8 text-[0.6rem] uppercase tracking-wider font-black"
              >
                <Plus size={14} className="mr-2" />
                Register Webhook
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="bg-muted-bg/30 rounded-xl p-4 border border-border group hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-black text-text-primary text-xs">{webhook.name}</p>
                      <p className="text-[0.55rem] font-mono text-text-muted mt-0.5 truncate max-w-[12.5rem]">
                        {webhook.url}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteWebhook(webhook.id)}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label={`Delete webhook ${webhook.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-1.5">
                      {webhook.events.map((e, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-[0.45rem] font-black uppercase tracking-widest px-1.5 py-0.5"
                        >
                          {e}
                        </Badge>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        simulateWebhookDelivery(webhook.id);
                        success('Simulation request dispatched.');
                      }}
                      className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-primary hover:underline underline-offset-4"
                    >
                      Test Webhook
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {webhooks.length === 0 && (
              <div className="p-10 text-center border-t border-border border-dashed font-bold uppercase text-[0.65rem] text-text-muted tracking-widest bg-muted-bg/10 rounded-xl mt-2">
                No webhooks configured
              </div>
            )}
          </section>
        </div>
      </div>

      <FormModal
        title="Create API Key"
        isOpen={apiKeyModal.isOpen}
        onClose={apiKeyModal.close}
        onSave={handleSaveKey}
        isLoading={isSavingKey}
      >
        <div className="space-y-6">
          <Input
            label="Key Name"
            value={apiKeyForm.name}
            onChange={(e) => updateKeyField('name', e.target.value)}
            placeholder="e.g. Production Mobile App"
          />
          <div className="space-y-2">
            <label className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest ml-1">
              Access Level
            </label>
            <select
              value={apiKeyForm.scope}
              onChange={(e) => updateKeyField('scope', e.target.value as any)}
              className="w-full bg-muted-bg border-none rounded-xl px-4 py-4 font-black text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="Read-only">Read-Only</option>
              <option value="Read/Write">Read/Write</option>
              <option value="Full Admin">Admin Access</option>
            </select>
          </div>
        </div>
      </FormModal>

      <FormModal
        title="Register Event Webhook"
        isOpen={webhookModal.isOpen}
        onClose={webhookModal.close}
        onSave={handleSaveWebhook}
        isLoading={isSavingWebhook}
      >
        <div className="space-y-6">
          <Input
            label="Webhook Name"
            value={webhookForm.name}
            onChange={(e) => updateWebhookField('name', e.target.value)}
            placeholder="e.g. Slack Integration"
          />
          <Input
            label="Callback URL"
            value={webhookForm.url}
            onChange={(e) => updateWebhookField('url', e.target.value)}
            placeholder="https://hooks.external.com/..."
          />
        </div>
      </FormModal>
    </div>
  );
});

export default APIManager;

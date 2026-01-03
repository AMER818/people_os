import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import AIConfig from '../AIConfig';
import React from 'react';

// Mock dependencies using aliases
vi.mock('@store/orgStore', () => ({
    useOrgStore: () => ({
        aiSettings: {
            provider: 'gemini',
            apiKeys: { gemini: 'test-key-long-enough', openai: '', anthropic: '' },
            status: 'online',
            agents: { resume_screener: false, turnover_predictor: false, chat_assistant: false },
        },
        updateAiSettings: vi.fn(),
    }),
}));

vi.mock('@components/ui/toast', () => ({
    useToast: () => ({ success: vi.fn(), toastError: vi.fn(), error: vi.fn() }),
}));

// Mock UI components to simplify DOM for JSDOM
vi.mock('@components/ui/Input', () => ({
    Input: (props: any) => (
        <div data-testid="mock-input">
            <label>{props.label}</label>
            <input {...props} />
        </div>
    ),
    default: (props: any) => (
        <div data-testid="mock-input">
            <label>{props.label}</label>
            <input {...props} />
        </div>
    ),
}));

vi.mock('@components/ui/button', () => ({
    Button: (props: any) => <button {...props}>{props.children}</button>,
    default: (props: any) => <button {...props}>{props.children}</button>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    BrainCircuit: () => <div />,
    Sparkles: () => <div />,
    Bot: () => <div />,
    Wand2: () => <div />,
    Key: () => <div />,
    Layout: () => <div />,
    Activity: () => <div />,
    Zap: () => <div />,
}));

test('renders AIConfig component and all its sections', async () => {
    render(<AIConfig />);

    // High-level sections - use findAllByText for elements that might appear multiple times
    expect((await screen.findAllByText(/AI & Intelligence/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/AI Provider/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/API Configuration/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/Intelligence Agents/i)).length).toBeGreaterThan(0);

    // Provider buttons
    expect(await screen.findByRole('button', { name: /Google Gemini/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /OpenAI GPT/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Anthropic Claude/i })).toBeInTheDocument();

    // Specific buttons/UI from middle of component
    expect(await screen.findByText(/Test Connection/i)).toBeInTheDocument();
    expect(await screen.findByText(/Disable/i)).toBeInTheDocument();

    // Agents at bottom
    expect(await screen.findByText(/Resume Screener/i)).toBeInTheDocument();
    expect(await screen.findByText(/Turnover Predictor/i)).toBeInTheDocument();
});

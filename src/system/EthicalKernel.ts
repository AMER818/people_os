import { SystemSignal } from './types';

export type EthicalRule = {
    id: string;
    name: string;
    description: string;
    evaluate: (signal: SystemSignal) => boolean;
    failMessage: string;
};

export const EthicalKernel = {
    principles: {
        humanPrimacy: true,
        transparency: true,
        privacyFirst: true,
        explainabilityRequired: true,
        humanOverrideAlways: true,
        dignityPreserved: true,
    },

    registry: [
        {
            id: 'rule-human-primacy',
            name: 'Human Primacy Guard',
            description: 'Ensures AI cannot execute terminal personnel actions without human override.',
            failMessage: 'AI is restricted from executing terminal actions (termination/discipline).',
            evaluate: (signal: SystemSignal) => {
                const restrictedWords = ['terminate', 'discipline', 'fire', 'punish'];
                return !restrictedWords.some(word =>
                    signal.message.toLowerCase().includes(word) ||
                    signal.source.toLowerCase().includes(word)
                );
            }
        },
        {
            id: 'rule-privacy-guard',
            name: 'Privacy Protection',
            description: 'Prevents unauthorized exposure or processing of sensitive PII patterns.',
            failMessage: 'Potential PII leakage or unauthorized sensitive data access detected.',
            evaluate: (signal: SystemSignal) => {
                const sensitivePatterns = [/ssn/i, /passport/i, /credit card/i];
                return !sensitivePatterns.some(pattern => pattern.test(signal.message));
            }
        },
        {
            id: 'rule-bias-prevention',
            name: 'Bias Prevention',
            description: 'Flags patterns that might indicate discriminatory ranking or selection.',
            failMessage: 'Potential discriminatory bias detected in system logic.',
            evaluate: (signal: SystemSignal) => {
                const biasTerms = ['rank_humans', 'iq_score', 'gender_bias'];
                return !biasTerms.some(term => signal.message.toLowerCase().includes(term));
            }
        }
    ] as EthicalRule[],

    validateAction(action: string, domain: string): { allowed: boolean; failingRule?: EthicalRule } {
        // Create a temporary signal for validation
        const mockSignal: SystemSignal = { source: domain, message: action, risk: 'low' };

        for (const rule of this.registry) {
            if (!rule.evaluate(mockSignal)) {
                return { allowed: false, failingRule: rule };
            }
        }

        return { allowed: true };
    },

    explainRequirement(action: string): string {
        return `Action "${action}" must be fully explainable to a human reviewer.`;
    },
};

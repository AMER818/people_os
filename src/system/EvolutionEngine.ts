import Logger from '../utils/logger';
import { SystemSignal, EvolutionProposal } from './types';

export const DriftDetector = {
  detect(signals: SystemSignal[]): SystemSignal[] {
    return signals.filter((s) => s.risk === 'medium' || s.risk === 'high');
  },
};

export const EntropyReducer = {
  suggestCleanup(signals: SystemSignal[]): EvolutionProposal[] {
    return signals.map((s) => ({
      id: crypto.randomUUID(),
      title: `Reduce entropy in ${s.source}`,
      description: s.message,
      impact: 'Improves maintainability and clarity',
      effort: 'medium',
      reversible: true,
      createdAt: new Date(),
      remediation: `Consolidate redundant logic in ${s.source} and update documentation.`,
    }));
  },
};

export const EvolutionEngine = {
  analyzeHistory(history: SystemSignal[]): EvolutionProposal[] {
    return history.map((h) => ({
      id: crypto.randomUUID(),
      title: `Evolve ${h.source}`,
      description: `Pattern detected: ${h.message}`,
      impact: 'Architectural resilience',
      effort: 'large',
      reversible: true,
      createdAt: new Date(),
      remediation: `Refactor ${h.source} to use the standard Provider pattern.`,
    }));
  },

  propose(proposals: EvolutionProposal[]) {
    proposals.forEach((p) => {
      Logger.info('[EVOLUTION PROPOSAL]', p);
    });
  },
};

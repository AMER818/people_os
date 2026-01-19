import Logger from '../utils/logger';
import { SystemSignal, SystemDecision, EvolutionProposal, RiskLevel } from './types';
import { AuditEngine } from './AuditEngine';
import { GovernanceEngine } from './GovernanceEngine';
import { EthicalKernel } from './EthicalKernel';
import { DriftDetector, EntropyReducer, EvolutionEngine } from './EvolutionEngine';
import { StrategyEngine } from './StrategyEngine';

export const SystemBrain = {
  ingest(signal: SystemSignal): SystemDecision | null {
    AuditEngine.collect(signal);

    const decision = GovernanceEngine.evaluate(signal);

    if (!EthicalKernel.validateAction(decision.action, decision.domain)) {
      Logger.warn('[BLOCKED BY ETHICS]', decision);
      return decision;
    }

    Logger.info('[DECISION]', decision);
    return decision;
  },

  cycle(signals: SystemSignal[]): { proposals: EvolutionProposal[]; pressure: RiskLevel } {
    const drift = DriftDetector.detect(signals);
    const entropyFixes = EntropyReducer.suggestCleanup(drift);
    const evolution = EvolutionEngine.analyzeHistory(signals);
    const pressure = StrategyEngine.assessPressure(signals);

    const proposals = [...entropyFixes, ...evolution];
    EvolutionEngine.propose(proposals);

    const roadmapAdvice = StrategyEngine.shapeRoadmap(pressure);
    Logger.info('[STRATEGY]', roadmapAdvice);

    return { proposals, pressure };
  },

  simulateScenario(type: string): SystemSignal[] {
    switch (type) {
      case 'MASS_TERMINATION':
        return [
          {
            source: 'HR_API',
            message: 'Initiating bulk termination for 50 employees',
            risk: 'critical',
          },
          {
            source: 'SECURITY',
            message: 'Unauthorized mass account lockout detected',
            risk: 'high',
          },
        ];
      case 'DATA_LEAK':
        return [
          {
            source: 'EXPORT_SERVICE',
            message: 'Bulk export request containing SSN patterns',
            risk: 'critical',
          },
          {
            source: 'NETWORK',
            message: 'Large data upload to unknown external IP',
            risk: 'medium',
          },
        ];
      case 'SYSTEM_ENTROPY':
        return Array(15)
          .fill(null)
          .map((_, i) => ({
            source: `MODULE_${i}`,
            message: `Increasing architectural complexity in component ${i}`,
            risk: 'medium',
          }));
      default:
        return [{ source: 'SIMULATION', message: 'Generic pulse signal', risk: 'low' }];
    }
  },
};

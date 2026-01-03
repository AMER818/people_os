import { SystemSignal, SystemDecision } from './types';
import { EthicalKernel } from './EthicalKernel';

export const GovernanceEngine = {
    evaluate(signal: SystemSignal): SystemDecision {
        const { allowed, failingRule } = EthicalKernel.validateAction(signal.message, signal.source);

        return {
            id: crypto.randomUUID(),
            domain: signal.source,
            action: signal.message,
            reason: allowed
                ? "Action permitted under ethical kernel."
                : `Blocked by rule: ${failingRule?.name}. ${failingRule?.failMessage}`,
            remediation: allowed ? undefined : `Human override required. Review "${failingRule?.name}" constraints or manual approval needed.`,
            confidence: allowed ? 0.9 : 0.2,
            humanOverrideAllowed: true,
            timestamp: new Date(),
            intercepted: signal.metadata?.intercepted || false,
            forensics: {
                principles: allowed ? ["Transparency", "Explainability"] : ["Human Primacy", "Dignity Preserved"],
                ruleId: failingRule?.id,
                logicBranch: allowed ? "PERMISSION_DEFAULT" : "RESTRICTION_TRIGGERED",
            },
        };
    },
};

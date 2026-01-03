import { SystemSignal, RiskLevel } from './types';

export const StrategyEngine = {
    assessPressure(signals: SystemSignal[]): RiskLevel {
        const critical = signals.some((s) => s.risk === "critical");
        if (critical) {return "critical";}
        if (signals.length > 10) {return "high";}
        if (signals.length > 5) {return "medium";}
        return "low";
    },

    shapeRoadmap(risk: RiskLevel): string {
        switch (risk) {
            case "critical":
                return "Stabilize architecture immediately. Freeze feature work.";
            case "high":
                return "Prioritize refactors and reduce scope.";
            case "medium":
                return "Balance delivery with cleanup.";
            default:
                return "Proceed with roadmap as planned.";
        }
    },
};

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type SystemDecision = {
    id: string;
    domain: string;
    action: string;
    reason: string;
    confidence: number; // 0–1
    humanOverrideAllowed: boolean;
    timestamp: Date;
    remediation?: string;
    intercepted?: boolean;
    forensics?: {
        principles: string[];
        ruleId?: string;
        logicBranch: string;
    };
};

export type SystemSignal = {
    source: string;
    message: string;
    risk: RiskLevel;
    metadata?: Record<string, any>;
};

export type EvolutionProposal = {
    id: string;
    title: string;
    description: string;
    impact: string;
    effort: "small" | "medium" | "large";
    reversible: boolean;
    createdAt: Date;
    remediation?: string;
};

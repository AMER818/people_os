export const OrgIntelligence = {
    detectBusFactor(ownershipMap: Record<string, string[]>): string[] {
        return Object.entries(ownershipMap)
            .filter(([_, owners]) => owners.length === 1)
            .map(([module]) => module);
    },

    suggestPairing(busFactorModules: string[]): string[] {
        return busFactorModules.map(
            (m) => `Pair another engineer with owner of ${m}`
        );
    },
};

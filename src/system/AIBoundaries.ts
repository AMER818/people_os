export const AIBoundaries = {
    canSuggest: ["refactor", "restructure", "optimize", "warn", "predict"],
    cannotExecute: ["terminate", "discipline", "fire", "punish", "rank_humans"],

    isAllowed(action: string): boolean {
        return !this.cannotExecute.includes(action);
    },
};

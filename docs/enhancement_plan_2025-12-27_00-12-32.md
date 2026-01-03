# HRMS Web Project Enhancement Plan

Date: 2025-12-27 00:12:32

### Phase 1: Foundation & Refactoring (Short-term)

1.  **Update AI Models**: Transition to current stable Gemini models in `geminiService.ts`.
2.  **Global State**: Introduce Zustand for shared state (User, Theme, Notifications).
3.  **Functional Search**: Implement real-time global search in `App.tsx`.

### Phase 2: Componentization & Data Layer (Mid-term)

1.  **UI Library**: Create reusable components in `components/ui`.
2.  **Module Refactoring**: Break down large modules into smaller, manageable sub-components.
3.  **API Layer**: Centralize data fetching to replace hardcoded mock data.

### Phase 3: Advanced Features & Optimization (Long-term)

1.  **Performance**: Implement dynamic imports and code splitting.
2.  **AI Workflows**: Add automated resume screening and turnover prediction.
3.  **Testing**: Expand Vitest coverage for core business logic.

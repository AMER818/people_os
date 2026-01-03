/**
 * E2E Testing Infrastructure Configuration
 * Comprehensive Playwright setup for critical path testing
 */

export const TEST_CONFIG = {
  // Critical user flows that must be tested
  CRITICAL_PATHS: [
    'authentication',
    'dashboard-load',
    'data-persistence',
    'error-recovery',
    'navigation',
    'forms',
    'accessibility',
    'performance',
    'api-integration',
    'ai-integration',
  ],

  // Test timeout configurations
  TIMEOUTS: {
    NAVIGATION: 15000,
    WAIT_FOR_ELEMENT: 10000,
    WAIT_FOR_NETWORK: 10000,
    PAGE_LOAD: 30000,
    API_RESPONSE: 10000,
  },

  // Performance thresholds
  PERFORMANCE: {
    MAX_INITIAL_LOAD_MS: 10000,
    MAX_INTERACTION_MS: 1000,
    MAX_API_RESPONSE_MS: 5000,
  },

  // Accessibility standards
  ACCESSIBILITY: {
    WCAG_LEVEL: 'AA',
    KEYBOARD_NAVIGATION: true,
    SCREEN_READER_SUPPORT: true,
    COLOR_CONTRAST: 4.5, // Minimum ratio
  },

  // Test data fixtures
  TEST_USERS: {
    ADMIN: {
      username: 'admin',
      password: 'admin',
      role: 'SystemAdmin',
    },
    HR_MANAGER: {
      username: 'hr_manager',
      password: 'password123',
      role: 'HRManager',
    },
    EMPLOYEE: {
      username: 'employee',
      password: 'password123',
      role: 'Employee',
    },
  },

  // Retry policies
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
  },

  // Viewport sizes for responsive testing
  VIEWPORTS: {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1920, height: 1080 },
  },
};

/**
 * Test Coverage Goals
 * Targets for comprehensive test coverage
 */
export const COVERAGE_TARGETS = {
  UNIT_TESTS: {
    STATEMENT: 80,
    BRANCH: 75,
    FUNCTION: 80,
    LINE: 80,
  },
  E2E_TESTS: {
    CRITICAL_PATHS: 100,
    API_ENDPOINTS: 90,
    USER_WORKFLOWS: 85,
    ERROR_CASES: 80,
  },
};

/**
 * Test Categories
 */
export const TEST_CATEGORIES = {
  SMOKE: 'smoke', // Quick sanity checks
  REGRESSION: 'regression', // Prevent bugs
  INTEGRATION: 'integration', // System interactions
  PERFORMANCE: 'performance', // Speed checks
  SECURITY: 'security', // Security validation
  ACCESSIBILITY: 'accessibility', // A11y checks
};

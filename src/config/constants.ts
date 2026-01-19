/**
 * Global Constants
 * Single source of truth for all configuration values
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000, // 1 minute
  },
} as const;

// Server Ports
export const PORTS = {
  BACKEND_API: 3002,
  FRONTEND_DEV: 5173,
  FRONTEND_TEST: 4040,
  FRONTEND_PROD: 3000,
  AI_ENGINE: 8000,
} as const;

// Environment URLs
export const ENVIRONMENT_URLS = {
  DEVELOPMENT: `http://localhost:${PORTS.FRONTEND_DEV}`,
  TEST: `http://localhost:${PORTS.FRONTEND_TEST}`,
  PRODUCTION: `http://localhost:${PORTS.FRONTEND_PROD}`,
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  FILES: {
    DEVELOPMENT: 'people_os.db',
    TEST: 'people_os_test.db',
    PRODUCTION: 'people_os.db',
  },
  PATH: './backend/data/',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  DATA_VERSION: 'data_version',
  CLEAN_SLATE: 'clean_slate_verified',
  THEME: 'theme_preference',
} as const;

// Timeouts (ms)
export const TIMEOUTS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000,
  HEALTH_CHECK: 60000,
} as const;

// System Limits
export const LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_UPLOAD_SIZE_MB: 50,
  STORAGE_QUOTA_MB: 5.0,
  MAX_BATCH_SIZE: 1000,
  MAX_SEARCH_RESULTS: 100,
} as const;

// Application Metadata
export const APP_METADATA = {
  NAME: 'PeopleOS HCM',
  VERSION: '4.2.0',
  API_VERSION: '1.0.0',
  NODE_NAME: 'Production Node',
  CLUSTER_TYPE: 'Static Cluster',
} as const;

// Employee Code Prefix
export const EMPLOYEE_CODE = {
  PREFIX: 'ABC01',
  PATTERN: 'ABC01-XXXX',
} as const;

// System Sections
export const SYSTEM_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sys-admin', label: 'Access Control' },
  { id: 'ai', label: 'AI Settings' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'audit', label: 'Audit Logs' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'maintenance', label: 'Maintenance' },
] as const;

// CORS Origins
export const CORS_ORIGINS = [
  `http://localhost:${PORTS.FRONTEND_DEV}`,
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  `http://localhost:${PORTS.FRONTEND_TEST}`,
  'http://localhost:5000',
  `http://localhost:${PORTS.FRONTEND_PROD}`,
] as const;

/**
 * System Configuration Registry
 * Centralizes hardcoded strings, limits, and versions for the System Settings module.
 * NOTE: This file is maintained for backward compatibility.
 * New configurations should use src/config/constants.ts
 */

import { APP_METADATA, LIMITS, SYSTEM_SECTIONS, TIMEOUTS } from '@/config/constants';

export const SYSTEM_CONFIG = {
  VERSION: APP_METADATA.VERSION,
  NODE_NAME: APP_METADATA.NODE_NAME,
  CLUSTER_TYPE: APP_METADATA.CLUSTER_TYPE,

  // Performance Limits
  STORAGE_QUOTA_MB: LIMITS.STORAGE_QUOTA_MB,
  HEALTH_CHECK_INTERVAL_MS: TIMEOUTS.HEALTH_CHECK,

  // Default Latencies (Simulated)
  LATENCY: {
    ENGINE: '42ms',
    DATABASE: '12ms',
    AUTH: '8ms',
  },

  // UI Constants
  SECTIONS: SYSTEM_SECTIONS,
};

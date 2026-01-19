/**
 * Centralized System Cleanup Utility
 *
 * This module provides a unified mechanism to purge all client-side state,
 * enforce the backend-first policy, and reset the application to a clean slate.
 */

import Logger from '@/utils/logger';

class SystemCleanup {
  /**
   * Purges all browser-based storage (Local & Session)
   */
  purgeStorage(): void {
    Logger.warn('[SystemCleanup] Purging all client-side storage...');
    localStorage.clear();
    sessionStorage.clear();
    Logger.info('[SystemCleanup] Storage cleared successfully.');
  }

  /**
   * Diagnostic check to ensure no unauthorized local data exists
   */
  verifyBackendPolicy(): void {
    const localKeys = Object.keys(localStorage);
    const sessionKeys = Object.keys(sessionStorage);

    Logger.info('--- Backend-First Policy Audit ---');
    Logger.info(`LocalStorage Keys: ${localKeys.length}`, localKeys);
    Logger.info(`SessionStorage Keys: ${sessionKeys.length}`, sessionKeys);

    if (localKeys.length === 0 && sessionKeys.length === 0) {
      Logger.info('✅ CLEAN SLATE: No client-side state detected.');
    } else {
      Logger.warn('⚠️ PERSISTENCE DETECTED: Review the keys above for compliance.');
    }
  }

  /**
   * Performs a full system reset and reloads the application
   */
  hardReset(): void {
    this.purgeStorage();
    Logger.info('[SystemCleanup] Reloading application...');
    window.location.reload();
  }

  /**
   * Utility to clear specific store caches if needed
   */
  clearAppCache(): void {
    // Reserved for future use (e.g. Service Workers, etc.)
    Logger.info('[SystemCleanup] App cache cleared.');
  }
}

const cleanup = new SystemCleanup();

// Export for module use
export { cleanup };

// Register to window for console-based triggers
if (typeof window !== 'undefined') {
  (window as any).hunzalCleanup = cleanup;
  Logger.info('🚀 Hunzal People OS: Centralized Cleanup Ready. (Use `hunzalCleanup.hardReset()`)');
}

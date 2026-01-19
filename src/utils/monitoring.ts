// Basic Sentry Stub for Phase 10
// To enable, install @sentry/react and uncomment

// import * as Sentry from '@sentry/react';

const isProd = import.meta.env.PROD;
const dsn = import.meta.env.VITE_SENTRY_DSN;

import Logger from './logger';

// ... existing code ...

export const initMonitoring = () => {
  if (isProd && dsn) {
    Logger.info('Initialize Sentry with DSN:', dsn);
    /*
        Sentry.init({
            dsn: dsn,
            integrations: [new Sentry.BrowserTracing()],
            tracesSampleRate: 1.0,
        });
        */
  }
};

export const logError = (error: Error, _context?: Record<string, any>) => {
  if (isProd) {
    // Sentry.captureException(error, { extra: context });
    Logger.error('[Monitor] Error:', error);
  } else {
    Logger.error('[Dev] Error:', error);
  }
};

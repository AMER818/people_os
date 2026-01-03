// Basic Sentry Stub for Phase 10
// To enable, install @sentry/react and uncomment 

// import * as Sentry from '@sentry/react';

const isProd = import.meta.env.PROD;
const dsn = import.meta.env.VITE_SENTRY_DSN;

export const initMonitoring = () => {
    if (isProd && dsn) {
        console.log('Initialize Sentry with DSN:', dsn);
        /*
        Sentry.init({
            dsn: dsn,
            integrations: [new Sentry.BrowserTracing()],
            tracesSampleRate: 1.0,
        });
        */
    }
};

export const logError = (error: Error, context?: Record<string, any>) => {
    if (isProd) {
        // Sentry.captureException(error, { extra: context });
        console.error('[Monitor] Error:', error, context);
    } else {
        console.error('[Dev] Error:', error, context);
    }
};

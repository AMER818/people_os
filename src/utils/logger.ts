/**
 * Secure Logger Utility
 * Wraps console methods to prevent information leakage in production.
 * Only logs to console when not in production mode.
 */

const isProduction = import.meta.env.PROD;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private static formatMessage(level: LogLevel, message: string, data?: any): void {
        if (isProduction) {return;}

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        if (data) {
            console[level](prefix, message, data);
        } else {
            console[level](prefix, message);
        }
    }

    static info(message: string, data?: any) {
        this.formatMessage('info', message, data);
    }

    static warn(message: string, data?: any) {
        this.formatMessage('warn', message, data);
    }

    static error(message: string, error?: any) {
        this.formatMessage('error', message, error);
    }

    static debug(message: string, data?: any) {
        this.formatMessage('debug', message, data);
    }
}

export default Logger;

/**
 * Secure Logger Utility
 * Wraps console methods to prevent information leakage in production.
 * Only logs to console when not in production mode.
 */

const isProduction = import.meta.env.PROD;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private static formatMessage(level: LogLevel, message: string, data?: unknown): void {
    if (isProduction) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (data) {
      // eslint-disable-next-line no-console
      console[level](prefix, message, data);
    } else {
      // eslint-disable-next-line no-console
      console[level](prefix, message);
    }
  }

  static info(message: string, data?: unknown) {
    this.formatMessage('info', message, data);
  }

  static warn(message: string, data?: unknown) {
    this.formatMessage('warn', message, data);
  }

  static error(message: string, error?: unknown) {
    this.formatMessage('error', message, error);
  }

  static debug(message: string, data?: unknown) {
    this.formatMessage('debug', message, data);
  }
}

export default Logger;

import { Injectable, LoggerService, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor(context?: string) {
    this.logger = new Logger(context || 'App');
  }

  setContext(context: string): void {
    (this.logger as any).context = context;
  }

  log(message: string, context?: string): void {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, context);
  }

  /**
   * Logs a business operation with structured metadata.
   * Usage: appLogger.logOperation('CreateTransaction', 'success', { reference: 'txn_abc' });
   */
  logOperation(operation: string, status: 'start' | 'success' | 'failure', meta?: Record<string, unknown>): void {
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    const message = `[${operation}] ${status}${metaStr}`;

    if (status === 'failure') {
      this.logger.warn(message);
    } else {
      this.logger.log(message);
    }
  }

  /**
   * Logs an external service call with duration.
   */
  logExternalCall(service: string, operation: string, durationMs: number, success: boolean): void {
    const status = success ? 'OK' : 'FAILED';
    const level = success ? 'log' : 'warn';
    this.logger[level](`[External] ${service}.${operation} -> ${status} (${durationMs}ms)`);
  }
}

export const APP_LOGGER = Symbol('AppLogger');

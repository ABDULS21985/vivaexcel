import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @InjectPinoLogger(LoggerService.name)
    private readonly logger: PinoLogger,
  ) {}

  /**
   * Set context for the logger
   */
  setContext(context: string): void {
    this.logger.setContext(context);
  }

  /**
   * Log at verbose level
   */
  verbose(message: string, context?: LogContext): void {
    this.logger.trace(context || {}, message);
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(context || {}, message);
  }

  /**
   * Log at info level
   */
  log(message: string, context?: LogContext): void {
    this.logger.info(context || {}, message);
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(context || {}, message);
  }

  /**
   * Log at error level
   */
  error(message: string, trace?: string, context?: LogContext): void {
    this.logger.error(
      {
        ...context,
        stack: trace,
      },
      message,
    );
  }

  /**
   * Log at fatal level
   */
  fatal(message: string, context?: LogContext): void {
    this.logger.fatal(context || {}, message);
  }

  /**
   * Log with custom level and structured data
   */
  logWithData(
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    message: string,
    data: Record<string, unknown>,
  ): void {
    this.logger[level](data, message);
  }

  /**
   * Create a child logger with additional context
   */
  child(bindings: Record<string, unknown>): LoggerService {
    const childLogger = new LoggerService(this.logger);
    // In a real implementation, you would create a child pino logger
    // This is a simplified version
    return childLogger;
  }

  /**
   * Log HTTP request start
   */
  logRequestStart(
    method: string,
    url: string,
    correlationId: string,
    userId?: string,
  ): void {
    this.logger.info(
      {
        type: 'http_request_start',
        method,
        url,
        correlationId,
        userId,
      },
      `Incoming ${method} ${url}`,
    );
  }

  /**
   * Log HTTP request completion
   */
  logRequestEnd(
    method: string,
    url: string,
    statusCode: number,
    durationMs: number,
    correlationId: string,
  ): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.logger[level](
      {
        type: 'http_request_end',
        method,
        url,
        statusCode,
        durationMs,
        correlationId,
      },
      `${method} ${url} ${statusCode} - ${durationMs}ms`,
    );
  }

  /**
   * Log database query
   */
  logDatabaseQuery(
    query: string,
    durationMs: number,
    correlationId?: string,
  ): void {
    this.logger.debug(
      {
        type: 'database_query',
        query: query.substring(0, 500), // Truncate long queries
        durationMs,
        correlationId,
      },
      `Database query executed in ${durationMs}ms`,
    );
  }

  /**
   * Log external API call
   */
  logExternalApiCall(
    service: string,
    method: string,
    url: string,
    statusCode: number,
    durationMs: number,
    correlationId?: string,
  ): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.logger[level](
      {
        type: 'external_api_call',
        service,
        method,
        url,
        statusCode,
        durationMs,
        correlationId,
      },
      `External API call to ${service}: ${method} ${url} - ${statusCode} in ${durationMs}ms`,
    );
  }

  /**
   * Log business event
   */
  logBusinessEvent(
    eventName: string,
    data: Record<string, unknown>,
    correlationId?: string,
  ): void {
    this.logger.info(
      {
        type: 'business_event',
        eventName,
        ...data,
        correlationId,
      },
      `Business event: ${eventName}`,
    );
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    eventType: string,
    details: Record<string, unknown>,
    correlationId?: string,
  ): void {
    this.logger.warn(
      {
        type: 'security_event',
        eventType,
        ...details,
        correlationId,
      },
      `Security event: ${eventType}`,
    );
  }
}

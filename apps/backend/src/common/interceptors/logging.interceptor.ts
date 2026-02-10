import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interface for request with correlation ID
 */
interface RequestWithCorrelationId extends Omit<Request, 'correlationId'> {
  correlationId?: string;
}

/**
 * Configuration options for logging interceptor
 */
export interface LoggingInterceptorOptions {
  /** Log slow requests exceeding this threshold (ms) */
  slowRequestThreshold?: number;
  /** Paths to exclude from logging */
  excludePaths?: (string | RegExp)[];
  /** Whether to log request body (sanitized) */
  logRequestBody?: boolean;
  /** Whether to log response body */
  logResponseBody?: boolean;
  /** Maximum body size to log */
  maxBodyLogSize?: number;
}

/**
 * Request/response logging interceptor.
 *
 * Focuses exclusively on logging. Metrics are handled by PerformanceInterceptor.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly options: Required<LoggingInterceptorOptions>;

  constructor(options?: LoggingInterceptorOptions) {
    this.options = {
      slowRequestThreshold: options?.slowRequestThreshold ?? 3000,
      excludePaths: options?.excludePaths ?? ['/health', '/metrics'],
      logRequestBody: options?.logRequestBody ?? false,
      logResponseBody: options?.logResponseBody ?? false,
      maxBodyLogSize: options?.maxBodyLogSize ?? 1000,
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithCorrelationId>();
    const response = ctx.getResponse<Response>();

    // Check if path should be excluded
    if (this.shouldExclude(request.url)) {
      return next.handle();
    }

    const { method, url, correlationId } = request;
    const startTime = Date.now();
    const userAgent = request.headers['user-agent'] || 'unknown';
    const ip = request.ip || request.socket.remoteAddress || 'unknown';

    // Log request start
    this.logger.debug(`--> ${method} ${url}`, {
      correlationId,
      ip,
      userAgent: userAgent.substring(0, 100),
    });

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logResponse(
            method,
            url,
            statusCode,
            duration,
            correlationId,
            responseBody,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          this.logError(method, url, statusCode, duration, correlationId, error);
        },
      }),
    );
  }

  private shouldExclude(url: string): boolean {
    const path = url.split('?')[0];
    return this.options.excludePaths.some((pattern) => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(`${pattern}/`);
      }
      return pattern.test(path);
    });
  }

  private logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    correlationId: string | undefined,
    responseBody?: unknown,
  ): void {
    const logData: Record<string, unknown> = {
      correlationId,
      method,
      url,
      statusCode,
      duration,
    };

    if (this.options.logResponseBody && responseBody) {
      logData.responseBody = this.truncateBody(responseBody);
    }

    const isSlow = duration > this.options.slowRequestThreshold;
    const message = `<-- ${method} ${url} ${statusCode} ${duration}ms${isSlow ? ' [SLOW]' : ''}`;

    if (isSlow) {
      this.logger.warn(message, logData);
    } else if (statusCode >= 400) {
      this.logger.warn(message, logData);
    } else {
      this.logger.log(message, logData);
    }
  }

  private logError(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    correlationId: string | undefined,
    error: Error,
  ): void {
    this.logger.error(
      `<-- ${method} ${url} ${statusCode} ${duration}ms - ${error.message}`,
      {
        correlationId,
        method,
        url,
        statusCode,
        duration,
        error: error.message,
        stack: error.stack,
      },
    );
  }

  private truncateBody(body: unknown): string {
    try {
      const str = JSON.stringify(body);
      if (str.length > this.options.maxBodyLogSize) {
        return `${str.substring(0, this.options.maxBodyLogSize)}... [truncated]`;
      }
      return str;
    } catch {
      return '[non-serializable]';
    }
  }
}

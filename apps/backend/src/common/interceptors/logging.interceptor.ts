import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Optional,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interface for metrics service (optional dependency)
 */
export interface IMetricsService {
  incrementActiveConnections(): void;
  decrementActiveConnections(): void;
  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ): void;
  recordApiError(errorType: string, path: string): void;
}

/**
 * Injection token for metrics service
 */
export const METRICS_SERVICE = 'METRICS_SERVICE';

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
 * Features:
 * - Logs all HTTP requests with timing
 * - Tracks correlation IDs
 * - Integrates with optional metrics service
 * - Highlights slow requests
 * - Configurable exclusion patterns
 *
 * @example
 * // Apply globally in main.ts
 * ```typescript
 * app.useGlobalInterceptors(new LoggingInterceptor());
 * ```
 *
 * @example
 * // With options
 * ```typescript
 * app.useGlobalInterceptors(
 *   new LoggingInterceptor(null, {
 *     slowRequestThreshold: 1000,
 *     excludePaths: ['/health', /^\/metrics/],
 *   }),
 * );
 * ```
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly options: Required<LoggingInterceptorOptions>;

  constructor(
    @Optional() @Inject(METRICS_SERVICE)
    private readonly metricsService?: IMetricsService,
    options?: LoggingInterceptorOptions,
  ) {
    this.options = {
      slowRequestThreshold: options?.slowRequestThreshold ?? 3000,
      excludePaths: options?.excludePaths ?? ['/health', '/metrics'],
      logRequestBody: options?.logRequestBody ?? false,
      logResponseBody: options?.logResponseBody ?? false,
      maxBodyLogSize: options?.maxBodyLogSize ?? 1000,
    };
  }

  /**
   * Intercepts requests and logs timing information
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable of the response
   */
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

    // Increment active connections if metrics service available
    this.metricsService?.incrementActiveConnections();

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

          // Record metrics
          this.metricsService?.recordHttpRequest(
            method,
            this.normalizePath(url),
            statusCode,
            duration / 1000,
          );
          this.metricsService?.decrementActiveConnections();
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          this.logError(method, url, statusCode, duration, correlationId, error);

          // Record metrics
          this.metricsService?.recordHttpRequest(
            method,
            this.normalizePath(url),
            statusCode,
            duration / 1000,
          );
          this.metricsService?.recordApiError(
            error.constructor.name,
            this.normalizePath(url),
          );
          this.metricsService?.decrementActiveConnections();
        },
      }),
    );
  }

  /**
   * Checks if path should be excluded from logging
   * @param url - Request URL
   * @returns True if path should be excluded
   */
  private shouldExclude(url: string): boolean {
    const path = url.split('?')[0]; // Remove query string
    return this.options.excludePaths.some((pattern) => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(`${pattern}/`);
      }
      return pattern.test(path);
    });
  }

  /**
   * Normalizes path for metrics (removes dynamic segments)
   * @param url - Request URL
   * @returns Normalized path
   */
  private normalizePath(url: string): string {
    const path = url.split('?')[0];
    // Replace UUIDs and numeric IDs with placeholders
    return path
      .replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        ':id',
      )
      .replace(/\/\d+(?=\/|$)/g, '/:id');
  }

  /**
   * Logs successful response
   */
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

    // Add truncated response body if enabled
    if (this.options.logResponseBody && responseBody) {
      logData.responseBody = this.truncateBody(responseBody);
    }

    // Determine log level based on status and duration
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

  /**
   * Logs error response
   */
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

  /**
   * Truncates body for logging
   * @param body - Response body
   * @returns Truncated body string
   */
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

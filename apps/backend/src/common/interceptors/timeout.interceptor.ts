import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  SetMetadata,
  applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Metadata key for custom timeout
 */
export const TIMEOUT_KEY = 'request_timeout';

/**
 * Decorator to set custom timeout for a route
 *
 * @example
 * ```typescript
 * @SetTimeout(60000) // 60 seconds
 * @Get('long-operation')
 * longOperation() {}
 * ```
 *
 * @param ms - Timeout in milliseconds
 * @returns Method decorator
 */
export const SetTimeout = (ms: number) =>
  applyDecorators(SetMetadata(TIMEOUT_KEY, ms));

/**
 * Decorator to disable timeout for a route
 *
 * @example
 * ```typescript
 * @NoTimeout()
 * @Get('streaming')
 * streamData() {}
 * ```
 *
 * @returns Method decorator
 */
export const NoTimeout = () => SetMetadata(TIMEOUT_KEY, 0);

/**
 * Request timeout interceptor.
 *
 * Features:
 * - Default 30 second timeout for all requests
 * - Custom timeout via @SetTimeout() decorator
 * - Disable timeout via @NoTimeout() decorator
 * - Throws RequestTimeoutException on timeout
 *
 * @example
 * // Apply globally in main.ts
 * ```typescript
 * app.useGlobalInterceptors(new TimeoutInterceptor());
 * ```
 *
 * @example
 * // Custom default timeout
 * ```typescript
 * app.useGlobalInterceptors(new TimeoutInterceptor(60000)); // 60s
 * ```
 *
 * @example
 * // Per-route timeout
 * ```typescript
 * @SetTimeout(120000) // 2 minutes for this route
 * @Get('report')
 * generateReport() {}
 * ```
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeoutMs: number;

  /**
   * Creates a new TimeoutInterceptor
   * @param defaultTimeoutMs - Default timeout in milliseconds (default: 30000)
   */
  constructor(
    defaultTimeoutMs: number = 30000,
    private readonly reflector?: Reflector,
  ) {
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  /**
   * Intercepts requests and applies timeout
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable of the response
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Check for custom timeout on route
    const customTimeout = this.reflector?.getAllAndOverride<number>(
      TIMEOUT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Timeout of 0 means no timeout
    if (customTimeout === 0) {
      return next.handle();
    }

    const timeoutMs = customTimeout ?? this.defaultTimeoutMs;

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException({
                message: `Request timeout after ${timeoutMs}ms`,
                code: 'SYS_001',
                timeout: timeoutMs,
              }),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}

/**
 * Configurable timeout interceptor with per-path settings
 */
@Injectable()
export class ConfigurableTimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeoutMs: number;
  private readonly pathTimeouts: Map<RegExp, number>;

  /**
   * Creates a new ConfigurableTimeoutInterceptor
   * @param config - Configuration object
   */
  constructor(config: {
    defaultTimeoutMs?: number;
    pathTimeouts?: Record<string, number>;
  }) {
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? 30000;
    this.pathTimeouts = new Map();

    // Convert path patterns to RegExp
    if (config.pathTimeouts) {
      for (const [pattern, timeout] of Object.entries(config.pathTimeouts)) {
        this.pathTimeouts.set(new RegExp(pattern), timeout);
      }
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const path = request.url.split('?')[0];

    // Find matching path timeout
    let timeoutMs = this.defaultTimeoutMs;
    for (const [pattern, pathTimeout] of this.pathTimeouts) {
      if (pattern.test(path)) {
        timeoutMs = pathTimeout;
        break;
      }
    }

    // Timeout of 0 means no timeout
    if (timeoutMs === 0) {
      return next.handle();
    }

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException({
                message: `Request timeout after ${timeoutMs}ms`,
                code: 'SYS_001',
                timeout: timeoutMs,
              }),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { BaseResponseDto, ResponseStatus, ResponseMeta } from '../dto/base-response.dto';

/**
 * Interface for request with correlation ID
 */
interface RequestWithCorrelationId extends Omit<Request, 'correlationId'> {
  correlationId?: string;
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  /** Response status (success or error) */
  status: ResponseStatus;
  /** Human-readable message */
  message: string;
  /** Response data payload */
  data: T;
  /** Response metadata */
  meta?: ResponseMeta;
}

/**
 * Interceptor that wraps all successful responses in a standard format.
 *
 * Features:
 * - Consistent response structure across all endpoints
 * - Adds metadata (timestamp, correlation ID, path)
 * - Preserves already-formatted responses
 * - Skips buffer/stream responses
 *
 * @example
 * // Apply globally in main.ts
 * ```typescript
 * app.useGlobalInterceptors(new TransformResponseInterceptor());
 * ```
 *
 * @example
 * // Response transformation
 * // Controller returns: { id: '1', name: 'John' }
 * // Client receives:
 * // {
 * //   status: 'success',
 * //   message: 'Request successful',
 * //   data: { id: '1', name: 'John' },
 * //   meta: { timestamp: '...', correlationId: '...', path: '/users/1' }
 * // }
 *
 * @template T - Type of the response data
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  private readonly defaultMessage: string;
  private readonly apiVersion: string;

  /**
   * Creates a new TransformResponseInterceptor
   * @param defaultMessage - Default success message
   * @param apiVersion - API version string
   */
  constructor(
    defaultMessage: string = 'Request successful',
    apiVersion: string = 'v1',
  ) {
    this.defaultMessage = defaultMessage;
    this.apiVersion = apiVersion;
  }

  /**
   * Intercepts the response and transforms it to standard format
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable of transformed response
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const request = context.switchToHttp().getRequest<RequestWithCorrelationId>();
    const correlationId =
      request.correlationId ||
      (request.headers['x-correlation-id'] as string) ||
      'unknown';

    return next.handle().pipe(
      map((data) => {
        // Don't transform if already a BaseResponseDto
        if (data instanceof BaseResponseDto) {
          return data as unknown as ApiResponse<T>;
        }

        // Don't transform if already in expected format
        if (this.isAlreadyFormatted(data)) {
          return data as ApiResponse<T>;
        }

        // Don't transform stream responses or buffers
        if (this.isStreamOrBuffer(data)) {
          return data;
        }

        // Don't transform null/undefined differently
        // They become data: null in the response

        // Transform to standard response format
        return this.createResponse(data, correlationId, request.url);
      }),
    );
  }

  /**
   * Checks if response is already in the expected format
   * @param data - Response data
   * @returns True if already formatted
   */
  private isAlreadyFormatted(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const response = data as Record<string, unknown>;
    return (
      'status' in response &&
      (response.status === ResponseStatus.SUCCESS ||
        response.status === ResponseStatus.ERROR ||
        response.status === 'success' ||
        response.status === 'error')
    );
  }

  /**
   * Checks if response is a stream or buffer
   * @param data - Response data
   * @returns True if stream or buffer
   */
  private isStreamOrBuffer(data: unknown): boolean {
    return (
      Buffer.isBuffer(data) ||
      data instanceof ReadableStream ||
      (typeof data === 'object' &&
        data !== null &&
        'pipe' in data &&
        typeof (data as NodeJS.ReadableStream).pipe === 'function')
    );
  }

  /**
   * Creates a standard response object
   * @param data - Response data
   * @param correlationId - Request correlation ID
   * @param path - Request path
   * @returns Standard response object
   */
  private createResponse(
    data: T,
    correlationId: string,
    path: string,
  ): ApiResponse<T> {
    return {
      status: ResponseStatus.SUCCESS,
      message: this.defaultMessage,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId,
        path,
        version: this.apiVersion,
      },
    };
  }
}

/**
 * Interceptor that excludes certain routes from transformation.
 * Useful for health checks, metrics endpoints, etc.
 */
@Injectable()
export class SelectiveTransformInterceptor<T>
  extends TransformResponseInterceptor<T>
{
  private readonly excludedPaths: RegExp[];

  /**
   * Creates a new SelectiveTransformInterceptor
   * @param excludedPaths - Array of path patterns to exclude
   * @param defaultMessage - Default success message
   * @param apiVersion - API version string
   */
  constructor(
    excludedPaths: (string | RegExp)[] = [],
    defaultMessage: string = 'Request successful',
    apiVersion: string = 'v1',
  ) {
    super(defaultMessage, apiVersion);
    this.excludedPaths = excludedPaths.map((p) =>
      typeof p === 'string' ? new RegExp(`^${p}$`) : p,
    );
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const request = context.switchToHttp().getRequest<Request>();

    // Check if path is excluded
    const isExcluded = this.excludedPaths.some((pattern) =>
      pattern.test(request.url),
    );

    if (isExcluded) {
      return next.handle();
    }

    return super.intercept(context, next);
  }
}

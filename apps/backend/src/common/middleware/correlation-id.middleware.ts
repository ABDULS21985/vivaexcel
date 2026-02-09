import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';

/**
 * Express Request extension to include correlationId
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Unique correlation ID for request tracing */
      correlationId: string;
    }
  }
}

/**
 * Header name for correlation ID
 */
export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Alternative header name for request ID (AWS, Azure, etc.)
 */
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Middleware that adds correlation ID to all requests.
 *
 * Features:
 * - Uses existing X-Correlation-ID or X-Request-ID header if present
 * - Generates a new nanoid if no correlation ID is provided
 * - Attaches correlation ID to request object
 * - Sets correlation ID in response header for client tracking
 *
 * This enables distributed tracing across services by propagating
 * a unique identifier through all requests in a transaction.
 *
 * @example
 * // Apply globally in main.ts
 * ```typescript
 * app.use(new CorrelationIdMiddleware().use);
 * ```
 *
 * @example
 * // Apply in module
 * ```typescript
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(CorrelationIdMiddleware).forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example
 * // Access in controller
 * ```typescript
 * @Get()
 * findAll(@Req() req: Request) {
 *   console.log('Correlation ID:', req.correlationId);
 * }
 * ```
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly idLength: number = 21;

  /**
   * Middleware handler
   * @param req - Express request
   * @param res - Express response
   * @param next - Next function
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Get existing correlation ID from headers or generate a new one
    const correlationId = this.extractOrGenerateCorrelationId(req);

    // Attach to request object for use in application code
    req.correlationId = correlationId;

    // Set in request headers for downstream services
    req.headers[CORRELATION_ID_HEADER] = correlationId;

    // Set in response headers for client tracking
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }

  /**
   * Extracts correlation ID from request headers or generates a new one
   * @param req - Express request
   * @returns Correlation ID string
   */
  private extractOrGenerateCorrelationId(req: Request): string {
    // Check for existing correlation ID in various headers
    const existingId =
      (req.headers[CORRELATION_ID_HEADER] as string) ||
      (req.headers[REQUEST_ID_HEADER] as string) ||
      (req.headers['x-amzn-trace-id'] as string) || // AWS trace ID
      (req.headers['x-b3-traceid'] as string); // Zipkin trace ID

    if (existingId) {
      // If it's an AWS trace ID, extract the root ID
      if (existingId.includes('Root=')) {
        const match = existingId.match(/Root=([^;]+)/);
        return match ? match[1] : existingId;
      }
      return existingId;
    }

    // Generate a new correlation ID
    return nanoid(this.idLength);
  }
}

/**
 * Factory function for creating correlation ID middleware
 * Useful for custom configuration
 *
 * @returns Middleware function
 */
export function createCorrelationIdMiddleware(): (
  req: Request,
  res: Response,
  next: NextFunction,
) => void {
  const middleware = new CorrelationIdMiddleware();
  return middleware.use.bind(middleware);
}

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import xss, { IFilterXSSOptions } from 'xss';

/**
 * Configuration options for XSS sanitization
 */
export interface SanitizeOptions {
  /** Whether to sanitize request body */
  sanitizeBody?: boolean;
  /** Whether to sanitize query parameters */
  sanitizeQuery?: boolean;
  /** Whether to sanitize URL parameters */
  sanitizeParams?: boolean;
  /** Fields to exclude from sanitization */
  excludeFields?: string[];
  /** Paths to exclude from sanitization */
  excludePaths?: (string | RegExp)[];
  /** Whether to log sanitization events */
  logSanitization?: boolean;
  /** Custom XSS options */
  xssOptions?: IFilterXSSOptions;
}

/**
 * Default XSS filter options
 */
const DEFAULT_XSS_OPTIONS: IFilterXSSOptions = {
  whiteList: {}, // No HTML tags allowed by default
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

/**
 * Fields that should not be sanitized (passwords, tokens, etc.)
 */
const DEFAULT_EXCLUDE_FIELDS = [
  'password',
  'passwordConfirm',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'signature',
  'hash',
];

/**
 * XSS sanitization middleware.
 *
 * Features:
 * - Sanitizes request body, query params, and URL params
 * - Configurable field and path exclusions
 * - Removes malicious scripts and HTML
 * - Optional logging of sanitization events
 *
 * @example
 * // Apply globally in main.ts
 * ```typescript
 * app.use(new SanitizeMiddleware().use);
 * ```
 *
 * @example
 * // Apply with custom options
 * ```typescript
 * const sanitizeMiddleware = new SanitizeMiddleware({
 *   excludePaths: ['/api/v1/webhooks'],
 *   logSanitization: true,
 * });
 * app.use(sanitizeMiddleware.use.bind(sanitizeMiddleware));
 * ```
 *
 * @example
 * // Apply in module
 * ```typescript
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(SanitizeMiddleware)
 *       .exclude({ path: '/webhooks', method: RequestMethod.POST })
 *       .forRoutes('*');
 *   }
 * }
 * ```
 */
@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SanitizeMiddleware.name);
  private readonly options: Required<SanitizeOptions>;
  private readonly xssFilter: (html: string) => string;

  /**
   * Creates a new SanitizeMiddleware
   * @param options - Sanitization options
   */
  constructor(options?: SanitizeOptions) {
    this.options = {
      sanitizeBody: options?.sanitizeBody ?? true,
      sanitizeQuery: options?.sanitizeQuery ?? true,
      sanitizeParams: options?.sanitizeParams ?? true,
      excludeFields: [
        ...DEFAULT_EXCLUDE_FIELDS,
        ...(options?.excludeFields ?? []),
      ],
      excludePaths: options?.excludePaths ?? [],
      logSanitization: options?.logSanitization ?? false,
      xssOptions: options?.xssOptions ?? DEFAULT_XSS_OPTIONS,
    };

    // Create XSS filter with options
    this.xssFilter = (html: string) => xss(html, this.options.xssOptions);
  }

  /**
   * Middleware handler
   * @param req - Express request
   * @param res - Express response
   * @param next - Next function
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Check if path is excluded
    if (this.shouldExcludePath(req.path)) {
      return next();
    }

    try {
      // Sanitize request body
      if (this.options.sanitizeBody && req.body) {
        req.body = this.sanitizeObject(req.body, 'body', req.path);
      }

      // Sanitize query parameters
      if (this.options.sanitizeQuery && req.query) {
        const sanitizedQuery = this.sanitizeObject(
          req.query as Record<string, unknown>,
          'query',
          req.path,
        );
        // Assign back using any to avoid type issues with ParsedQs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).query = sanitizedQuery;
      }

      // Sanitize URL parameters
      if (this.options.sanitizeParams && req.params) {
        req.params = this.sanitizeObject(req.params, 'params', req.path);
      }
    } catch (error) {
      this.logger.error('Error during sanitization', error);
    }

    next();
  }

  /**
   * Checks if path should be excluded from sanitization
   * @param path - Request path
   * @returns True if path should be excluded
   */
  private shouldExcludePath(path: string): boolean {
    return this.options.excludePaths.some((pattern) => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(`${pattern}/`);
      }
      return pattern.test(path);
    });
  }

  /**
   * Recursively sanitizes an object
   * @param obj - Object to sanitize
   * @param source - Source of the object (body, query, params)
   * @param path - Request path (for logging)
   * @returns Sanitized object
   */
  private sanitizeObject<T extends Record<string, unknown>>(
    obj: T,
    source: string,
    path: string,
  ): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized: Record<string, unknown> = Array.isArray(obj)
      ? ([] as unknown as Record<string, unknown>)
      : {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip excluded fields
      if (this.options.excludeFields.includes(key)) {
        sanitized[key] = value;
        continue;
      }

      sanitized[key] = this.sanitizeValue(value, key, source, path);
    }

    return sanitized as T;
  }

  /**
   * Sanitizes a single value
   * @param value - Value to sanitize
   * @param key - Key name (for logging)
   * @param source - Source of the value
   * @param path - Request path (for logging)
   * @returns Sanitized value
   */
  private sanitizeValue(
    value: unknown,
    key: string,
    source: string,
    path: string,
  ): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      const sanitized = this.xssFilter(value);

      // Log if value was changed
      if (this.options.logSanitization && sanitized !== value) {
        this.logger.warn(
          `XSS content sanitized in ${source}.${key} at ${path}`,
          {
            path,
            source,
            field: key,
            original: value.substring(0, 100),
            sanitized: sanitized.substring(0, 100),
          },
        );
      }

      return sanitized;
    }

    if (Array.isArray(value)) {
      return value.map((item, index) =>
        this.sanitizeValue(item, `${key}[${index}]`, source, path),
      );
    }

    if (typeof value === 'object') {
      return this.sanitizeObject(
        value as Record<string, unknown>,
        source,
        path,
      );
    }

    // Numbers, booleans, etc. pass through unchanged
    return value;
  }
}

/**
 * Factory function for creating sanitize middleware
 * Useful for custom configuration
 *
 * @param options - Sanitization options
 * @returns Middleware function
 */
export function createSanitizeMiddleware(
  options?: SanitizeOptions,
): (req: Request, res: Response, next: NextFunction) => void {
  const middleware = new SanitizeMiddleware(options);
  return middleware.use.bind(middleware);
}

/**
 * Standalone function to sanitize a string
 * @param input - String to sanitize
 * @param options - XSS options
 * @returns Sanitized string
 */
export function sanitizeString(
  input: string,
  options?: IFilterXSSOptions,
): string {
  return xss(input, options ?? DEFAULT_XSS_OPTIONS);
}

/**
 * Standalone function to sanitize an object
 * @param obj - Object to sanitize
 * @param excludeFields - Fields to exclude from sanitization
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  excludeFields: string[] = DEFAULT_EXCLUDE_FIELDS,
): T {
  const middleware = new SanitizeMiddleware({ excludeFields });
  return middleware['sanitizeObject'](obj, 'manual', 'n/a');
}

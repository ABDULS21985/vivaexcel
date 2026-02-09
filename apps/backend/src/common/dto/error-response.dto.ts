import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorCode } from '../constants/error-codes.constant';

/**
 * Validation error detail
 */
export class ValidationErrorDetail {
  @ApiProperty({
    description: 'Field that failed validation',
    example: 'email',
  })
  field!: string;

  @ApiProperty({
    description: 'Validation error message',
    example: 'email must be a valid email address',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Validation constraint that failed',
    example: 'isEmail',
  })
  constraint?: string;

  @ApiPropertyOptional({
    description: 'Invalid value that was provided',
    example: 'invalid-email',
  })
  value?: unknown;

  constructor(partial?: Partial<ValidationErrorDetail>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

/**
 * Error response DTO for API error responses
 *
 * Provides a consistent error response structure:
 * - status: Always 'error'
 * - message: Human-readable error message
 * - code: Machine-readable error code
 * - errors: Array of detailed error information (for validation)
 * - meta: Request metadata (timestamp, correlationId, path)
 *
 * @example
 * ```typescript
 * // Validation error response
 * {
 *   status: 'error',
 *   message: 'Validation failed',
 *   code: 'VAL_001',
 *   errors: [
 *     { field: 'email', message: 'email must be a valid email address' },
 *     { field: 'password', message: 'password must be at least 8 characters' }
 *   ],
 *   meta: {
 *     timestamp: '2024-01-01T00:00:00Z',
 *     correlationId: 'abc-123',
 *     path: '/api/v1/users'
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Authentication error response
 * {
 *   status: 'error',
 *   message: 'Invalid credentials',
 *   code: 'AUTH_001',
 *   meta: {
 *     timestamp: '2024-01-01T00:00:00Z',
 *     correlationId: 'abc-123',
 *     path: '/api/v1/auth/login'
 *   }
 * }
 * ```
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'Response status',
    example: 'error',
    enum: ['error'],
  })
  status: 'error' = 'error';

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Validation failed',
  })
  message!: string;

  @ApiProperty({
    description: 'Machine-readable error code',
    example: 'VAL_001',
  })
  code!: string;

  @ApiPropertyOptional({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode?: number;

  @ApiPropertyOptional({
    description: 'Detailed error information (for validation errors)',
    type: [ValidationErrorDetail],
  })
  errors?: ValidationErrorDetail[];

  @ApiPropertyOptional({
    description: 'Stack trace (only in development)',
    example: 'Error: Validation failed\n    at ...',
  })
  stack?: string;

  @ApiProperty({
    description: 'Response metadata',
    example: {
      timestamp: '2024-01-01T00:00:00Z',
      correlationId: 'abc-123-def',
      path: '/api/v1/users',
    },
  })
  meta!: {
    timestamp: string;
    correlationId?: string;
    path?: string;
  };

  constructor(partial?: Partial<ErrorResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  /**
   * Creates an error response
   * @param message - Error message
   * @param code - Error code
   * @param options - Additional options
   * @returns ErrorResponseDto instance
   */
  static create(
    message: string,
    code: ErrorCode | string,
    options?: {
      statusCode?: number;
      errors?: ValidationErrorDetail[];
      stack?: string;
      correlationId?: string;
      path?: string;
    },
  ): ErrorResponseDto {
    return new ErrorResponseDto({
      status: 'error',
      message,
      code,
      statusCode: options?.statusCode,
      errors: options?.errors,
      stack: options?.stack,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: options?.correlationId,
        path: options?.path,
      },
    });
  }

  /**
   * Creates a validation error response
   * @param errors - Array of validation errors
   * @param correlationId - Request correlation ID
   * @param path - Request path
   * @returns ErrorResponseDto instance
   */
  static validation(
    errors: ValidationErrorDetail[],
    correlationId?: string,
    path?: string,
  ): ErrorResponseDto {
    return ErrorResponseDto.create('Validation failed', 'VAL_001', {
      statusCode: 400,
      errors,
      correlationId,
      path,
    });
  }

  /**
   * Creates an unauthorized error response
   * @param message - Error message
   * @param code - Error code
   * @param correlationId - Request correlation ID
   * @param path - Request path
   * @returns ErrorResponseDto instance
   */
  static unauthorized(
    message: string = 'Unauthorized',
    code: string = 'AUTH_001',
    correlationId?: string,
    path?: string,
  ): ErrorResponseDto {
    return ErrorResponseDto.create(message, code, {
      statusCode: 401,
      correlationId,
      path,
    });
  }

  /**
   * Creates a forbidden error response
   * @param message - Error message
   * @param code - Error code
   * @param correlationId - Request correlation ID
   * @param path - Request path
   * @returns ErrorResponseDto instance
   */
  static forbidden(
    message: string = 'Forbidden',
    code: string = 'AUTH_018',
    correlationId?: string,
    path?: string,
  ): ErrorResponseDto {
    return ErrorResponseDto.create(message, code, {
      statusCode: 403,
      correlationId,
      path,
    });
  }

  /**
   * Creates a not found error response
   * @param resource - Resource type that was not found
   * @param correlationId - Request correlation ID
   * @param path - Request path
   * @returns ErrorResponseDto instance
   */
  static notFound(
    resource: string = 'Resource',
    correlationId?: string,
    path?: string,
  ): ErrorResponseDto {
    return ErrorResponseDto.create(`${resource} not found`, 'RES_001', {
      statusCode: 404,
      correlationId,
      path,
    });
  }

  /**
   * Creates a conflict error response
   * @param message - Error message
   * @param correlationId - Request correlation ID
   * @param path - Request path
   * @returns ErrorResponseDto instance
   */
  static conflict(
    message: string = 'Resource conflict',
    correlationId?: string,
    path?: string,
  ): ErrorResponseDto {
    return ErrorResponseDto.create(message, 'RES_003', {
      statusCode: 409,
      correlationId,
      path,
    });
  }

  /**
   * Creates an internal server error response
   * @param message - Error message
   * @param stack - Stack trace (only included in development)
   * @param correlationId - Request correlation ID
   * @param path - Request path
   * @returns ErrorResponseDto instance
   */
  static internal(
    message: string = 'Internal server error',
    stack?: string,
    correlationId?: string,
    path?: string,
  ): ErrorResponseDto {
    return ErrorResponseDto.create(message, 'SYS_001', {
      statusCode: 500,
      stack: process.env.NODE_ENV !== 'production' ? stack : undefined,
      correlationId,
      path,
    });
  }

  /**
   * Creates a rate limit error response
   * @param retryAfter - Seconds until rate limit resets
   * @param correlationId - Request correlation ID
   * @param path - Request path
   * @returns ErrorResponseDto instance
   */
  static rateLimited(
    retryAfter?: number,
    correlationId?: string,
    path?: string,
  ): ErrorResponseDto {
    const response = ErrorResponseDto.create(
      'Too many requests',
      'RATE_001',
      {
        statusCode: 429,
        correlationId,
        path,
      },
    );
    if (retryAfter) {
      (response.meta as Record<string, unknown>).retryAfter = retryAfter;
    }
    return response;
  }
}

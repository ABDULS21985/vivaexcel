import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response status types
 */
export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Response metadata interface
 */
export interface ResponseMeta {
  /** Request timestamp */
  timestamp?: string;
  /** Request correlation ID */
  correlationId?: string;
  /** Response path */
  path?: string;
  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * Base response DTO for all API responses
 *
 * Provides a consistent response structure across the API:
 * - status: 'success' or 'error'
 * - message: Human-readable message
 * - data: The actual response payload
 * - meta: Optional metadata (timestamps, pagination info, etc.)
 *
 * @example
 * ```typescript
 * // Success response
 * {
 *   status: 'success',
 *   message: 'User retrieved successfully',
 *   data: { id: '123', name: 'John' },
 *   meta: { timestamp: '2024-01-01T00:00:00Z' }
 * }
 * ```
 *
 * @template T - Type of the data payload
 */
export class BaseResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Response status',
    enum: ResponseStatus,
    example: ResponseStatus.SUCCESS,
  })
  status!: ResponseStatus;

  @ApiProperty({
    description: 'Human-readable message',
    example: 'Operation completed successfully',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Response data payload',
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Response metadata',
  })
  meta?: ResponseMeta;

  constructor(partial?: Partial<BaseResponseDto<T>>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  /**
   * Creates a success response
   * @param data - Response data
   * @param message - Success message
   * @param meta - Optional metadata
   * @returns BaseResponseDto instance
   */
  static success<T>(
    data?: T,
    message: string = 'Operation completed successfully',
    meta?: ResponseMeta,
  ): BaseResponseDto<T> {
    return new BaseResponseDto<T>({
      status: ResponseStatus.SUCCESS,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    });
  }

  /**
   * Creates an error response
   * @param message - Error message
   * @param meta - Optional metadata
   * @returns BaseResponseDto instance
   */
  static error(
    message: string = 'An error occurred',
    meta?: ResponseMeta,
  ): BaseResponseDto<null> {
    return new BaseResponseDto<null>({
      status: ResponseStatus.ERROR,
      message,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    });
  }
}

/**
 * Generic success response type
 */
export type SuccessResponse<T> = BaseResponseDto<T> & {
  status: ResponseStatus.SUCCESS;
};

/**
 * Generic error response type
 */
export type ErrorResponse = BaseResponseDto<null> & {
  status: ResponseStatus.ERROR;
};

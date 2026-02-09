import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import {
  ErrorResponseDto,
  ValidationErrorDetail,
} from '../dto/error-response.dto';
import {
  ErrorCode,
  SystemErrorCode,
  ValidationErrorCode,
  getHttpStatusForErrorCode,
  getMessageForErrorCode,
} from '../constants/error-codes.constant';

/**
 * Interface for custom exceptions with error codes
 */
interface CustomException extends Error {
  code?: ErrorCode | string;
  details?: unknown;
}

/**
 * Interface for request with correlation ID
 */
interface RequestWithCorrelationId extends Omit<Request, 'correlationId'> {
  correlationId?: string;
}

/**
 * Global exception filter that catches all exceptions and formats them
 * into a consistent error response structure.
 *
 * Features:
 * - Consistent error response format using ErrorResponseDto
 * - Integration with custom error codes
 * - Sentry error reporting in production
 * - Validation error extraction from class-validator
 * - Stack trace inclusion in development only
 * - Correlation ID tracking
 *
 * @example
 * // In main.ts or app.module.ts
 * ```typescript
 * app.useGlobalFilters(new AllExceptionsFilter());
 * ```
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * Catches and handles all exceptions
   * @param exception - The caught exception
   * @param host - The arguments host containing request/response
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithCorrelationId>();
    const response = ctx.getResponse<Response>();

    const correlationId =
      request.correlationId ||
      (request.headers['x-correlation-id'] as string) ||
      'unknown';
    const path = request.url;

    // Extract error details based on exception type
    const { statusCode, message, code, errors, stack } =
      this.extractErrorDetails(exception);

    // Create standardized error response
    const errorResponse = ErrorResponseDto.create(message, code, {
      statusCode,
      errors,
      stack: !this.isProduction ? stack : undefined,
      correlationId,
      path,
    });

    // Log the error
    this.logError(exception, statusCode, message, correlationId, request as Request);

    // Report to Sentry for server errors in production
    if (this.isProduction && statusCode >= 500) {
      this.reportToSentry(exception, request as Request, correlationId);
    }

    response.status(statusCode).json(errorResponse);
  }

  /**
   * Extracts error details from various exception types
   * @param exception - The exception to extract details from
   * @returns Extracted error details
   */
  private extractErrorDetails(exception: unknown): {
    statusCode: number;
    message: string;
    code: string;
    errors?: ValidationErrorDetail[];
    stack?: string;
  } {
    // Handle HttpException (NestJS built-in exceptions)
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    // Handle custom exceptions with error codes
    if (this.isCustomException(exception)) {
      return this.handleCustomException(exception);
    }

    // Handle standard Error objects
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.isProduction
          ? 'Internal server error'
          : exception.message,
        code: SystemErrorCode.INTERNAL_ERROR,
        stack: exception.stack,
      };
    }

    // Handle unknown exception types
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      code: SystemErrorCode.UNKNOWN_ERROR,
    };
  }

  /**
   * Handles NestJS HttpException
   * @param exception - The HttpException to handle
   * @returns Extracted error details
   */
  private handleHttpException(exception: HttpException): {
    statusCode: number;
    message: string;
    code: string;
    errors?: ValidationErrorDetail[];
    stack?: string;
  } {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let code: string;
    let errors: ValidationErrorDetail[] | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      code = this.getCodeFromStatus(statusCode);
    } else if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as Record<string, unknown>;

      // Handle validation errors from class-validator
      if (exception instanceof BadRequestException && resp.message) {
        const validationErrors = this.extractValidationErrors(resp.message);
        if (validationErrors.length > 0) {
          errors = validationErrors;
          message = 'Validation failed';
          code = ValidationErrorCode.VALIDATION_FAILED;
        } else {
          message = Array.isArray(resp.message)
            ? resp.message[0]
            : (resp.message as string);
          code =
            (resp.code as string) ||
            (resp.error as string) ||
            this.getCodeFromStatus(statusCode);
        }
      } else {
        message =
          (resp.message as string) ||
          (resp.error as string) ||
          exception.message;
        code =
          (resp.code as string) ||
          (resp.error as string) ||
          this.getCodeFromStatus(statusCode);
      }
    } else {
      message = exception.message;
      code = this.getCodeFromStatus(statusCode);
    }

    return {
      statusCode,
      message,
      code,
      errors,
      stack: exception.stack,
    };
  }

  /**
   * Handles custom exceptions with error codes
   * @param exception - The custom exception to handle
   * @returns Extracted error details
   */
  private handleCustomException(exception: CustomException): {
    statusCode: number;
    message: string;
    code: string;
    stack?: string;
  } {
    const code = exception.code || SystemErrorCode.INTERNAL_ERROR;
    const statusCode = getHttpStatusForErrorCode(code as ErrorCode);
    const message = exception.message || getMessageForErrorCode(code as ErrorCode);

    return {
      statusCode,
      message,
      code,
      stack: exception.stack,
    };
  }

  /**
   * Type guard for custom exceptions
   * @param exception - The exception to check
   * @returns True if exception has a code property
   */
  private isCustomException(exception: unknown): exception is CustomException {
    return (
      exception instanceof Error &&
      'code' in exception &&
      typeof (exception as CustomException).code === 'string'
    );
  }

  /**
   * Extracts validation errors from class-validator messages
   * @param message - The message(s) from class-validator
   * @returns Array of ValidationErrorDetail
   */
  private extractValidationErrors(
    message: unknown,
  ): ValidationErrorDetail[] {
    if (!message) return [];

    // Handle array of validation messages
    if (Array.isArray(message)) {
      return message.map((msg) => {
        if (typeof msg === 'string') {
          // Try to extract field name from message like "email must be an email"
          const match = msg.match(/^(\w+)\s/);
          return new ValidationErrorDetail({
            field: match ? match[1] : 'unknown',
            message: msg,
          });
        }
        if (typeof msg === 'object' && msg !== null) {
          const errorObj = msg as Record<string, unknown>;
          return new ValidationErrorDetail({
            field: (errorObj.property as string) || 'unknown',
            message:
              (errorObj.message as string) ||
              Object.values(errorObj.constraints || {}).join(', '),
            constraint: errorObj.constraint as string,
            value: errorObj.value,
          });
        }
        return new ValidationErrorDetail({
          field: 'unknown',
          message: String(msg),
        });
      });
    }

    // Handle single string message
    if (typeof message === 'string') {
      return [
        new ValidationErrorDetail({
          field: 'unknown',
          message,
        }),
      ];
    }

    return [];
  }

  /**
   * Gets an error code from HTTP status
   * @param status - HTTP status code
   * @returns Error code string
   */
  private getCodeFromStatus(status: number): string {
    switch (status) {
      case 400:
        return ValidationErrorCode.VALIDATION_FAILED;
      case 401:
        return 'AUTH_001';
      case 403:
        return 'AUTH_018';
      case 404:
        return 'RES_001';
      case 409:
        return 'RES_003';
      case 429:
        return 'RATE_001';
      case 500:
      default:
        return SystemErrorCode.INTERNAL_ERROR;
    }
  }

  /**
   * Logs the error with appropriate level
   * @param exception - The exception
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param correlationId - Request correlation ID
   * @param request - The request object
   */
  private logError(
    exception: unknown,
    statusCode: number,
    message: string,
    correlationId: string,
    request: Request,
  ): void {
    const logContext = {
      correlationId,
      path: request.url,
      method: request.method,
      statusCode,
    };

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${statusCode} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        logContext,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${statusCode} - ${message}`,
        logContext,
      );
    }
  }

  /**
   * Reports error to Sentry
   * @param exception - The exception to report
   * @param request - The request object
   * @param correlationId - Request correlation ID
   */
  private reportToSentry(
    exception: unknown,
    request: Request,
    correlationId: string,
  ): void {
    if (!process.env.SENTRY_DSN) return;

    try {
      Sentry.withScope((scope) => {
        scope.setTag('correlationId', correlationId);
        scope.setContext('request', {
          method: request.method,
          url: request.url,
          headers: this.sanitizeHeaders(request.headers),
          query: request.query,
          // Don't include body in Sentry to avoid sensitive data leaks
        });

        if (exception instanceof Error) {
          Sentry.captureException(exception);
        } else {
          Sentry.captureMessage(
            `Unknown exception: ${JSON.stringify(exception)}`,
          );
        }
      });
    } catch (sentryError) {
      this.logger.error('Failed to report to Sentry', sentryError);
    }
  }

  /**
   * Sanitizes headers to remove sensitive information
   * @param headers - Request headers
   * @returns Sanitized headers
   */
  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

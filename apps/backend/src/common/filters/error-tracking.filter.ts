import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as Sentry from '@sentry/node';

interface RequestWithCorrelationId extends Request {
  correlationId?: string;
  user?: { sub?: string; id?: string };
}

@Catch()
export class ErrorTrackingFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorTrackingFilter.name);
  private readonly sentryEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.sentryEnabled = !!this.configService.get<string>('SENTRY_DSN');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithCorrelationId>();

    const correlationId =
      request.correlationId ||
      (request.headers['x-correlation-id'] as string) ||
      'unknown';
    const userId = request.user?.sub || request.user?.id;
    const route = (request as any).route?.path || request.url;

    // Log the error with full context
    if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        {
          correlationId,
          userId,
          route,
          method: request.method,
          stack: exception.stack,
        },
      );
    } else {
      this.logger.error('Unhandled non-Error exception', {
        correlationId,
        userId,
        route,
        method: request.method,
        exception: String(exception),
      });
    }

    // Report to Sentry if configured
    if (this.sentryEnabled) {
      try {
        Sentry.withScope((scope) => {
          scope.setTag('correlationId', correlationId);
          scope.setTag('route', route);
          scope.setTag('method', request.method);
          if (userId) {
            scope.setUser({ id: userId });
          }
          scope.setContext('request', {
            correlationId,
            userId,
            route,
            method: request.method,
          });

          if (exception instanceof Error) {
            Sentry.captureException(exception);
          } else {
            Sentry.captureMessage(`Non-Error exception: ${String(exception)}`);
          }
        });
      } catch (sentryError) {
        this.logger.error('Failed to report to Sentry', sentryError);
      }
    }

    // Rethrow so NestJS default filters format the HTTP response
    throw exception;
  }
}

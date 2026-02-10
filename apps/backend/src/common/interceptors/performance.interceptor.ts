import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const startTime = Date.now();
    const { method } = request;
    const route = (request as any).route?.path || request.url;

    this.metricsService.incrementActiveConnections();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode;

          this.metricsService.recordHttpRequest(
            method,
            route,
            statusCode,
            duration,
          );
          this.metricsService.decrementActiveConnections();
        },
        error: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode || 500;

          this.metricsService.recordHttpRequest(
            method,
            route,
            statusCode,
            duration,
          );
          this.metricsService.recordApiError(
            'UnhandledException',
            route,
          );
          this.metricsService.decrementActiveConnections();
        },
      }),
    );
  }
}

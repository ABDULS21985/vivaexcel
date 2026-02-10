import { Params } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';

// Fields to redact from logs
const REDACTED_FIELDS = [
  'password',
  'token',
  'authorization',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'api_key',
  'creditCard',
  'credit_card',
  'ssn',
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

export const getPinoConfig = (): Params => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

      // Generate custom request ID or use existing correlation ID
      genReqId: (req: IncomingMessage) => {
        return (req.headers['x-correlation-id'] as string) ||
          (req.headers['x-request-id'] as string) ||
          generateId();
      },

      // Redact sensitive fields
      redact: {
        paths: REDACTED_FIELDS,
        censor: '[REDACTED]',
      },

      // Custom serializers
      serializers: {
        req: (req: IncomingMessage) => ({
          id: (req as any).id,
          method: req.method,
          url: req.url,
          headers: {
            host: req.headers.host,
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length'],
            'x-correlation-id': req.headers['x-correlation-id'],
            'x-forwarded-for': req.headers['x-forwarded-for'],
          },
          remoteAddress: req.socket?.remoteAddress,
        }),
        res: (res: ServerResponse) => ({
          statusCode: res.statusCode,
          headers: {
            'content-type': res.getHeader?.('content-type'),
            'content-length': res.getHeader?.('content-length'),
          },
        }),
        err: (err: Error) => ({
          type: err.constructor.name,
          message: err.message,
          stack: isProduction ? undefined : err.stack,
        }),
      },

      // Custom log level based on status code
      customLogLevel: (
        _req: IncomingMessage,
        res: ServerResponse,
        err?: Error,
      ): 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'fatal' | 'silent' => {
        if (err || res.statusCode >= 500) {
          return 'error';
        }
        if (res.statusCode >= 400) {
          return 'warn';
        }
        if (res.statusCode >= 300) {
          return 'info';
        }
        return 'info';
      },

      // Custom success message
      customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
        return `${req.method} ${req.url} completed`;
      },

      // Custom error message
      customErrorMessage: (req: IncomingMessage, _res: ServerResponse, err: Error) => {
        return `${req.method} ${req.url} failed: ${err.message}`;
      },

      // Custom attributes to add to the log
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
        responseTime: 'duration',
      },

      // Custom props to add to each log
      customProps: (req: IncomingMessage) => ({
        correlationId: req.headers['x-correlation-id'] || (req as any).id,
        environment: process.env.NODE_ENV || 'development',
        service: process.env.APP_NAME || 'ktblog-backend',
        userId: (req as any).user?.sub || (req as any).user?.id || undefined,
        route: (req as any).route?.path || req.url,
      }),

      // Don't log health check endpoints
      autoLogging: {
        ignore: (req: IncomingMessage) => {
          const ignoredPaths = ['/health', '/ready', '/metrics', '/favicon.ico'];
          return ignoredPaths.some(path => req.url?.startsWith(path));
        },
      },

      // Transport configuration
      transport: isProduction
        ? undefined // Use default JSON output in production
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              levelFirst: true,
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
              ignore: 'pid,hostname',
              singleLine: false,
              messageFormat: '{correlationId} - {msg}',
            },
          },

      // Base configuration
      base: isProduction
        ? {
            pid: process.pid,
            hostname: process.env.HOSTNAME || require('os').hostname(),
          }
        : undefined,

      // Timestamp format
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    },
  };
};

// Simple ID generator (fallback if nanoid not available)
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
}

export default getPinoConfig;

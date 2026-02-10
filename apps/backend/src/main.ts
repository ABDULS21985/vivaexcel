import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  // Create NestJS application with buffer logs enabled for pino
  // rawBody: true enables raw body access for Stripe webhook signature verification
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  // Use Pino logger
  app.useLogger(app.get(PinoLogger));

  const configService = app.get(ConfigService);
  // Environment variables
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const port = configService.get<number>('PORT', 4001);
  const appName = configService.get<string>('APP_NAME', 'ktblog-backend');
  const sentryDsn = configService.get<string>('SENTRY_DSN');

  // Initialize Sentry for error tracking (if DSN is configured)
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: nodeEnv,
      release: configService.get<string>('APP_VERSION', '1.0.0'),
      tracesSampleRate: nodeEnv === 'production' ? 0.1 : 1.0,
      integrations: [
        Sentry.httpIntegration(),
      ],
    });
    logger.log('Sentry initialized');
  }

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Compression for responses
  app.use(compression());

  // CORS configuration
  const corsWhitelist = configService.get<string>('CORS_WHITELIST', '');
  const corsOrigins = corsWhitelist
    ? corsWhitelist.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        corsOrigins.includes(origin) ||
        corsOrigins.includes('*') ||
        nodeEnv === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-Id',
      'X-Request-Id',
    ],
    exposedHeaders: ['X-Correlation-Id'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Global prefix (optional, versioning handles /api/v1)
  // app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  // Note: PerformanceInterceptor is registered via APP_INTERCEPTOR in AppModule
  app.useGlobalInterceptors(
    new TimeoutInterceptor(30000), // 30 second timeout
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );

  // Swagger documentation (skip in production or make optional)
  const enableSwagger =
    configService.get<string>('ENABLE_SWAGGER', 'true') === 'true';
  if (enableSwagger && nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('KTBlog API')
      .setDescription('KTBlog Backend API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Health', 'Health check endpoints')
      .addTag('Metrics', 'Prometheus metrics endpoint')
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Products', 'Product management endpoints')
      .addTag('Services', 'Service management endpoints')
      .addTag('Blog', 'Blog management endpoints')
      .addTag('Contact', 'Contact form endpoints')
      .addTag('Newsletter', 'Newsletter subscription endpoints')
      .addTag('Media', 'Media upload endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });

    logger.log('Swagger documentation available at /docs');
  }

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  // Handle shutdown signals
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, starting graceful shutdown...`);

      try {
        await app.close();
        logger.log('Application closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', (error as Error).stack);
        process.exit(1);
      }
    });
  });

  // Start the server
  await app.listen(port, '0.0.0.0');

  logger.log(`Application "${appName}" is running on: http://localhost:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(`Health check: http://localhost:${port}/api/v1/health`);
  logger.log(`Readiness probe: http://localhost:${port}/api/v1/health/ready`);
  logger.log(`Metrics: http://localhost:${port}/api/v1/metrics`);

  if (enableSwagger && nodeEnv !== 'production') {
    logger.log(`Swagger docs: http://localhost:${port}/docs`);
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

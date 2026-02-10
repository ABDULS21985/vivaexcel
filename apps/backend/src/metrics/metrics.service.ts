import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger = new Logger(MetricsService.name);
  private readonly registry: promClient.Registry;

  // HTTP metrics
  public readonly httpRequestDuration: promClient.Histogram<string>;
  public readonly httpRequestsTotal: promClient.Counter<string>;
  public readonly httpActiveConnections: promClient.Gauge<string>;

  // Database metrics
  public readonly databaseQueryDuration: promClient.Histogram<string>;
  public readonly databaseConnectionPool: promClient.Gauge<string>;

  // Business metrics
  public readonly userRegistrations: promClient.Counter<string>;
  public readonly userLogins: promClient.Counter<string>;
  public readonly apiErrors: promClient.Counter<string>;

  // Cache metrics
  public readonly cacheHits: promClient.Counter<string>;
  public readonly cacheMisses: promClient.Counter<string>;

  // WebSocket metrics
  public readonly activeWebSocketConnections: promClient.Gauge<string>;

  // Stripe metrics
  public readonly stripeWebhookProcessing: promClient.Histogram<string>;

  // Order metrics
  public readonly orderTotalAmount: promClient.Histogram<string>;

  // Cart metrics
  public readonly activeCartCount: promClient.Gauge<string>;

  // Product metrics
  public readonly productViewTotal: promClient.Counter<string>;

  // Redis operation metrics
  public readonly redisOperationsTotal: promClient.Counter<string>;

  // Email metrics
  public readonly emailSentTotal: promClient.Counter<string>;

  // AI metrics
  public readonly aiRequestDuration: promClient.Histogram<string>;

  // Health check metrics
  public readonly healthCheckStatus: promClient.Gauge<string>;
  public readonly healthCheckLatency: promClient.Gauge<string>;

  constructor(private readonly configService: ConfigService) {
    this.registry = new promClient.Registry();

    // Set default labels
    this.registry.setDefaultLabels({
      app: this.configService.get<string>('APP_NAME', 'ktblog-backend'),
      env: this.configService.get<string>('NODE_ENV', 'development'),
    });

    // HTTP Request Duration Histogram
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    // HTTP Requests Total Counter
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // HTTP Active Connections Gauge
    this.httpActiveConnections = new promClient.Gauge({
      name: 'http_active_connections',
      help: 'Number of active HTTP connections',
      registers: [this.registry],
    });

    // Database Query Duration Histogram
    this.databaseQueryDuration = new promClient.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    // Database Connection Pool Gauge
    this.databaseConnectionPool = new promClient.Gauge({
      name: 'database_connection_pool_size',
      help: 'Database connection pool size',
      labelNames: ['state'],
      registers: [this.registry],
    });

    // User Registrations Counter
    this.userRegistrations = new promClient.Counter({
      name: 'user_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['method'],
      registers: [this.registry],
    });

    // User Logins Counter
    this.userLogins = new promClient.Counter({
      name: 'user_logins_total',
      help: 'Total number of user logins',
      labelNames: ['method', 'success'],
      registers: [this.registry],
    });

    // API Errors Counter
    this.apiErrors = new promClient.Counter({
      name: 'api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['type', 'route'],
      registers: [this.registry],
    });

    // Cache Hits Counter
    this.cacheHits = new promClient.Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
      registers: [this.registry],
    });

    // Cache Misses Counter
    this.cacheMisses = new promClient.Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
      registers: [this.registry],
    });

    // WebSocket Connections Gauge
    this.activeWebSocketConnections = new promClient.Gauge({
      name: 'active_websocket_connections',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });

    // Stripe Webhook Processing Histogram
    this.stripeWebhookProcessing = new promClient.Histogram({
      name: 'stripe_webhook_processing_seconds',
      help: 'Duration of Stripe webhook processing in seconds',
      labelNames: ['event_type'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    // Order Total Amount Histogram
    this.orderTotalAmount = new promClient.Histogram({
      name: 'order_total_amount',
      help: 'Distribution of order total amounts',
      labelNames: ['currency'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
      registers: [this.registry],
    });

    // Active Cart Count Gauge
    this.activeCartCount = new promClient.Gauge({
      name: 'active_cart_count',
      help: 'Number of active shopping carts',
      registers: [this.registry],
    });

    // Product View Counter
    this.productViewTotal = new promClient.Counter({
      name: 'product_view_total',
      help: 'Total number of product views',
      labelNames: ['product_type', 'source'],
      registers: [this.registry],
    });

    // Redis Operations Counter
    this.redisOperationsTotal = new promClient.Counter({
      name: 'redis_operations_total',
      help: 'Total number of Redis operations',
      labelNames: ['operation', 'status'],
      registers: [this.registry],
    });

    // Email Sent Counter
    this.emailSentTotal = new promClient.Counter({
      name: 'email_sent_total',
      help: 'Total number of emails sent',
      labelNames: ['template', 'status'],
      registers: [this.registry],
    });

    // AI Request Duration Histogram
    this.aiRequestDuration = new promClient.Histogram({
      name: 'ai_request_duration_seconds',
      help: 'Duration of AI service requests in seconds',
      labelNames: ['operation'],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10, 30, 60],
      registers: [this.registry],
    });

    // Health Check Status Gauge (1 = UP, 0 = DOWN)
    this.healthCheckStatus = new promClient.Gauge({
      name: 'health_check_status',
      help: 'Health check status per service (1=UP, 0=DOWN)',
      labelNames: ['service'],
      registers: [this.registry],
    });

    // Health Check Latency Gauge
    this.healthCheckLatency = new promClient.Gauge({
      name: 'health_check_latency_ms',
      help: 'Health check latency per service in milliseconds',
      labelNames: ['service'],
      registers: [this.registry],
    });
  }

  onModuleInit(): void {
    // Collect default Node.js metrics
    promClient.collectDefaultMetrics({
      register: this.registry,
      prefix: 'nodejs_',
    });

    this.logger.log('Prometheus metrics initialized');
  }

  getRegistry(): promClient.Registry {
    return this.registry;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }

  // Helper methods for common operations
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ): void {
    const labels = {
      method,
      route: this.normalizeRoute(route),
      status_code: statusCode.toString(),
    };

    this.httpRequestDuration.observe(labels, durationSeconds);
    this.httpRequestsTotal.inc(labels);
  }

  incrementActiveConnections(): void {
    this.httpActiveConnections.inc();
  }

  decrementActiveConnections(): void {
    this.httpActiveConnections.dec();
  }

  recordDatabaseQuery(
    operation: string,
    table: string,
    durationSeconds: number,
  ): void {
    this.databaseQueryDuration.observe({ operation, table }, durationSeconds);
  }

  recordUserRegistration(method: string = 'email'): void {
    this.userRegistrations.inc({ method });
  }

  recordUserLogin(method: string, success: boolean): void {
    this.userLogins.inc({ method, success: success.toString() });
  }

  recordApiError(type: string, route: string): void {
    this.apiErrors.inc({ type, route: this.normalizeRoute(route) });
  }

  recordCacheHit(cacheType: string = 'redis'): void {
    this.cacheHits.inc({ cache_type: cacheType });
  }

  recordCacheMiss(cacheType: string = 'redis'): void {
    this.cacheMisses.inc({ cache_type: cacheType });
  }

  recordWebSocketConnection(): void {
    this.activeWebSocketConnections.inc();
  }

  recordWebSocketDisconnection(): void {
    this.activeWebSocketConnections.dec();
  }

  recordStripeWebhook(eventType: string, durationSeconds: number): void {
    this.stripeWebhookProcessing.observe({ event_type: eventType }, durationSeconds);
  }

  recordOrder(amount: number, currency: string): void {
    this.orderTotalAmount.observe({ currency }, amount);
  }

  setActiveCartCount(count: number): void {
    this.activeCartCount.set(count);
  }

  recordProductView(productType: string, source: string): void {
    this.productViewTotal.inc({ product_type: productType, source });
  }

  recordRedisOperation(operation: string, status: 'success' | 'error'): void {
    this.redisOperationsTotal.inc({ operation, status });
  }

  recordEmailSent(template: string, status: 'success' | 'error'): void {
    this.emailSentTotal.inc({ template, status });
  }

  recordAiRequest(operation: string, durationSeconds: number): void {
    this.aiRequestDuration.observe({ operation }, durationSeconds);
  }

  setHealthCheckStatus(service: string, isUp: boolean): void {
    this.healthCheckStatus.set({ service }, isUp ? 1 : 0);
  }

  setHealthCheckLatency(service: string, latencyMs: number): void {
    this.healthCheckLatency.set({ service }, latencyMs);
  }

  private normalizeRoute(route: string): string {
    // Replace dynamic route parameters with placeholders
    return route
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:id')
      .replace(/\?.*$/, '');
  }
}

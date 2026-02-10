import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';

import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import {
  WebhookEndpointStatus,
  WebhookDeliveryStatus,
  WebhookEvent,
} from './enums/webhook.enums';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { DeliveryQueryDto } from './dto/delivery-query.dto';

/** Maximum response body length to store (10 KB) */
const MAX_RESPONSE_BODY_LENGTH = 10240;

/** Maximum number of retry attempts per delivery */
const MAX_RETRY_ATTEMPTS = 5;

/** HTTP request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 10000;

/** Failure count threshold before marking endpoint as FAILING */
const FAILURE_THRESHOLD = 10;

/**
 * Exponential backoff delays for retries (in minutes).
 * Index 0 = delay after 1st failure, index 4 = delay after 5th failure.
 */
const RETRY_DELAYS_MINUTES = [1, 5, 30, 120, 720];

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepository: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepository: Repository<WebhookDelivery>,
  ) {}

  // ---------------------------------------------------------------------------
  // Public API: Endpoint Management
  // ---------------------------------------------------------------------------

  /**
   * Create a new webhook endpoint with an auto-generated HMAC secret.
   */
  async createEndpoint(
    userId: string,
    dto: CreateEndpointDto,
  ): Promise<WebhookEndpoint> {
    const secret = this.generateSecret();

    const endpoint = this.endpointRepository.create({
      userId,
      url: dto.url,
      secret,
      events: dto.events,
      status: WebhookEndpointStatus.ACTIVE,
      failureCount: 0,
      metadata: dto.metadata ?? {},
      lastDeliveryAt: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastFailureReason: null,
    });

    const saved = await this.endpointRepository.save(endpoint);
    this.logger.log(`Created webhook endpoint ${saved.id} for user ${userId}`);
    return saved;
  }

  /**
   * Update an existing webhook endpoint.
   */
  async updateEndpoint(
    id: string,
    userId: string,
    dto: UpdateEndpointDto,
  ): Promise<WebhookEndpoint> {
    const endpoint = await this.findEndpointOrFail(id, userId);

    if (dto.url !== undefined) {
      endpoint.url = dto.url;
    }
    if (dto.events !== undefined) {
      endpoint.events = dto.events;
    }
    if (dto.status !== undefined) {
      endpoint.status = dto.status;
      // Reset failure count when re-enabling
      if (dto.status === WebhookEndpointStatus.ACTIVE) {
        endpoint.failureCount = 0;
        endpoint.lastFailureReason = null;
      }
    }
    if (dto.metadata !== undefined) {
      endpoint.metadata = dto.metadata;
    }

    const updated = await this.endpointRepository.save(endpoint);
    this.logger.log(`Updated webhook endpoint ${id}`);
    return updated;
  }

  /**
   * Soft-delete a webhook endpoint.
   */
  async deleteEndpoint(id: string, userId: string): Promise<void> {
    const endpoint = await this.findEndpointOrFail(id, userId);
    await this.endpointRepository.softRemove(endpoint);
    this.logger.log(`Soft-deleted webhook endpoint ${id}`);
  }

  /**
   * List all webhook endpoints for a user.
   */
  async listEndpoints(userId: string): Promise<WebhookEndpoint[]> {
    return this.endpointRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single webhook endpoint by ID, scoped to a user.
   */
  async getEndpointById(
    id: string,
    userId: string,
  ): Promise<WebhookEndpoint> {
    return this.findEndpointOrFail(id, userId);
  }

  /**
   * Send a test event to a specific endpoint.
   */
  async testEndpoint(id: string, userId: string): Promise<WebhookDelivery> {
    const endpoint = await this.findEndpointOrFail(id, userId);

    const testPayload: Record<string, unknown> = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery.',
        endpointId: endpoint.id,
      },
    };

    return this.executeDelivery(endpoint, 'webhook.test', testPayload);
  }

  // ---------------------------------------------------------------------------
  // Public API: Delivery Management
  // ---------------------------------------------------------------------------

  /**
   * List recent webhook deliveries with filters, scoped to a user's endpoints.
   */
  async getDeliveries(
    userId: string,
    query: DeliveryQueryDto,
  ): Promise<{ items: WebhookDelivery[]; total: number }> {
    const userEndpoints = await this.endpointRepository.find({
      where: { userId },
      select: ['id'],
      withDeleted: false,
    });

    if (userEndpoints.length === 0) {
      return { items: [], total: 0 };
    }

    const endpointIds = userEndpoints.map((e) => e.id);
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    const qb = this.deliveryRepository
      .createQueryBuilder('delivery')
      .where('delivery.endpoint_id IN (:...endpointIds)', { endpointIds })
      .orderBy('delivery.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.endpointId) {
      // Ensure the queried endpoint belongs to the user
      if (!endpointIds.includes(query.endpointId)) {
        return { items: [], total: 0 };
      }
      qb.andWhere('delivery.endpoint_id = :endpointId', {
        endpointId: query.endpointId,
      });
    }

    if (query.event) {
      qb.andWhere('delivery.event = :event', { event: query.event });
    }

    if (query.status) {
      qb.andWhere('delivery.status = :status', { status: query.status });
    }

    if (query.from) {
      qb.andWhere('delivery.created_at >= :from', { from: query.from });
    }

    if (query.to) {
      qb.andWhere('delivery.created_at <= :to', { to: query.to });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /**
   * Manually retry a specific delivery, scoped to a user.
   */
  async retryDelivery(
    deliveryId: string,
    userId: string,
  ): Promise<WebhookDelivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
      relations: ['endpoint'],
    });

    if (!delivery) {
      throw new NotFoundException(
        `Webhook delivery with ID "${deliveryId}" not found`,
      );
    }

    // Verify ownership
    if (delivery.endpoint.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this delivery',
      );
    }

    if (delivery.status === WebhookDeliveryStatus.DELIVERED) {
      throw new ForbiddenException(
        'Cannot retry an already delivered webhook',
      );
    }

    return this.executeDelivery(
      delivery.endpoint,
      delivery.event,
      delivery.payload,
      delivery,
    );
  }

  // ---------------------------------------------------------------------------
  // Public API: Event Delivery (called by other services)
  // ---------------------------------------------------------------------------

  /**
   * Deliver a webhook event to all active endpoints subscribed to the event.
   * This is the primary entry point for other services to trigger webhooks.
   */
  async deliverWebhook(
    event: WebhookEvent | string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const endpoints = await this.endpointRepository
      .createQueryBuilder('endpoint')
      .where('endpoint.status = :status', {
        status: WebhookEndpointStatus.ACTIVE,
      })
      .andWhere('endpoint.events ::jsonb @> :event', {
        event: JSON.stringify([event]),
      })
      .getMany();

    if (endpoints.length === 0) {
      this.logger.debug(`No active endpoints subscribed to event "${event}"`);
      return;
    }

    this.logger.log(
      `Delivering event "${event}" to ${endpoints.length} endpoint(s)`,
    );

    const deliveryPayload: Record<string, unknown> = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    // Deliver to all endpoints concurrently but don't fail if some fail
    const results = await Promise.allSettled(
      endpoints.map((endpoint) =>
        this.executeDelivery(endpoint, event, deliveryPayload),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(
      `Event "${event}" delivery complete: ${succeeded} succeeded, ${failed} failed`,
    );
  }

  // ---------------------------------------------------------------------------
  // CRON: Retry Failed Deliveries
  // ---------------------------------------------------------------------------

  /**
   * Every minute, find deliveries eligible for retry and re-attempt them.
   * Eligible: status in (FAILED, RETRIED), nextRetryAt <= now, attempts < MAX_RETRY_ATTEMPTS.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processRetries(): Promise<void> {
    const now = new Date();

    const deliveries = await this.deliveryRepository.find({
      where: [
        {
          status: WebhookDeliveryStatus.FAILED,
          nextRetryAt: LessThanOrEqual(now),
        },
        {
          status: WebhookDeliveryStatus.RETRIED,
          nextRetryAt: LessThanOrEqual(now),
        },
      ],
      relations: ['endpoint'],
      take: 50, // Process in batches to avoid overwhelming
    });

    if (deliveries.length === 0) {
      return;
    }

    this.logger.log(`Processing ${deliveries.length} webhook retries`);

    for (const delivery of deliveries) {
      if (delivery.attempts >= MAX_RETRY_ATTEMPTS) {
        // Mark as permanently failed
        delivery.status = WebhookDeliveryStatus.FAILED;
        delivery.nextRetryAt = null;
        await this.deliveryRepository.save(delivery);
        continue;
      }

      // Skip if endpoint is no longer active
      if (
        !delivery.endpoint ||
        delivery.endpoint.status === WebhookEndpointStatus.DISABLED
      ) {
        delivery.status = WebhookDeliveryStatus.FAILED;
        delivery.nextRetryAt = null;
        await this.deliveryRepository.save(delivery);
        continue;
      }

      try {
        await this.executeDelivery(
          delivery.endpoint,
          delivery.event,
          delivery.payload,
          delivery,
        );
      } catch (error) {
        this.logger.error(
          `Retry failed for delivery ${delivery.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // CRON: Disable Failing Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Every 10 minutes, find endpoints with consecutive failures >= threshold
   * and set their status to FAILING.
   */
  @Cron('*/10 * * * *')
  async disableFailingEndpoints(): Promise<void> {
    const failingEndpoints = await this.endpointRepository
      .createQueryBuilder('endpoint')
      .where('endpoint.status = :status', {
        status: WebhookEndpointStatus.ACTIVE,
      })
      .andWhere('endpoint.failure_count >= :threshold', {
        threshold: FAILURE_THRESHOLD,
      })
      .getMany();

    if (failingEndpoints.length === 0) {
      return;
    }

    this.logger.warn(
      `Marking ${failingEndpoints.length} endpoint(s) as FAILING due to consecutive failures`,
    );

    for (const endpoint of failingEndpoints) {
      endpoint.status = WebhookEndpointStatus.FAILING;
      await this.endpointRepository.save(endpoint);

      this.logger.warn(
        `Endpoint ${endpoint.id} (${endpoint.url}) marked as FAILING after ${endpoint.failureCount} consecutive failures`,
      );

      // TODO: Send email notification to user about failing endpoint
    }
  }

  // ---------------------------------------------------------------------------
  // Private: Core Delivery Logic
  // ---------------------------------------------------------------------------

  /**
   * Execute a single webhook delivery (or retry an existing delivery).
   * Creates or updates a WebhookDelivery record with the result.
   */
  private async executeDelivery(
    endpoint: WebhookEndpoint,
    event: string,
    payload: Record<string, unknown>,
    existingDelivery?: WebhookDelivery,
  ): Promise<WebhookDelivery> {
    const payloadString = JSON.stringify(payload);
    const signature = this.signPayload(endpoint.secret, payloadString);

    // Create or update delivery record
    let delivery: WebhookDelivery;

    if (existingDelivery) {
      delivery = existingDelivery;
      delivery.attempts += 1;
      delivery.status = WebhookDeliveryStatus.RETRIED;
    } else {
      delivery = this.deliveryRepository.create({
        endpointId: endpoint.id,
        event,
        payload,
        requestHeaders: {},
        responseStatus: null,
        responseBody: null,
        duration: null,
        status: WebhookDeliveryStatus.PENDING,
        attempts: 1,
        nextRetryAt: null,
        deliveredAt: null,
      });
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': event,
      'X-Webhook-ID': delivery.id ?? 'pending',
      'X-Webhook-Timestamp': new Date().toISOString(),
      'User-Agent': 'KTBlog-Webhooks/1.0',
    };

    delivery.requestHeaders = requestHeaders;

    const startTime = Date.now();

    try {
      const response = await this.sendWebhookRequest(
        endpoint.url,
        payloadString,
        requestHeaders,
      );

      const duration = Date.now() - startTime;
      const responseBody = await this.safeReadBody(response);

      delivery.responseStatus = response.status;
      delivery.responseBody = this.truncateBody(responseBody);
      delivery.duration = duration;

      if (response.ok) {
        // Success (2xx)
        delivery.status = WebhookDeliveryStatus.DELIVERED;
        delivery.deliveredAt = new Date();
        delivery.nextRetryAt = null;

        // Update endpoint success tracking
        endpoint.lastDeliveryAt = new Date();
        endpoint.lastSuccessAt = new Date();
        endpoint.failureCount = 0;
        await this.endpointRepository.save(endpoint);

        this.logger.debug(
          `Webhook delivered to ${endpoint.url} (${response.status}) in ${duration}ms`,
        );
      } else {
        // Non-2xx response
        this.handleDeliveryFailure(
          delivery,
          endpoint,
          `HTTP ${response.status}: ${this.truncateBody(responseBody, 200)}`,
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      delivery.duration = duration;
      delivery.responseStatus = null;
      delivery.responseBody = null;

      const reason =
        error instanceof Error ? error.message : String(error);

      this.handleDeliveryFailure(delivery, endpoint, reason);
    }

    // Save delivery record
    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Update the webhook ID header now that we have it
    if (!existingDelivery) {
      savedDelivery.requestHeaders = {
        ...savedDelivery.requestHeaders,
        'X-Webhook-ID': savedDelivery.id,
      };
      await this.deliveryRepository.save(savedDelivery);
    }

    return savedDelivery;
  }

  /**
   * Handle a delivery failure: set status, schedule retry, update endpoint.
   */
  private handleDeliveryFailure(
    delivery: WebhookDelivery,
    endpoint: WebhookEndpoint,
    reason: string,
  ): void {
    delivery.status = WebhookDeliveryStatus.FAILED;

    // Schedule retry if under the max attempts
    if (delivery.attempts < MAX_RETRY_ATTEMPTS) {
      const delayMinutes = this.calculateRetryDelay(delivery.attempts);
      const nextRetry = new Date();
      nextRetry.setMinutes(nextRetry.getMinutes() + delayMinutes);
      delivery.nextRetryAt = nextRetry;
      delivery.status = WebhookDeliveryStatus.RETRIED;
    } else {
      delivery.nextRetryAt = null;
    }

    // Update endpoint failure tracking (fire-and-forget save)
    endpoint.failureCount += 1;
    endpoint.lastDeliveryAt = new Date();
    endpoint.lastFailureAt = new Date();
    endpoint.lastFailureReason = reason.substring(0, 2000);
    this.endpointRepository.save(endpoint).catch((err) => {
      this.logger.error(
        `Failed to update endpoint failure state: ${err instanceof Error ? err.message : String(err)}`,
      );
    });

    this.logger.warn(
      `Webhook delivery to ${endpoint.url} failed (attempt ${delivery.attempts}/${MAX_RETRY_ATTEMPTS}): ${reason}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Private: HTTP & Crypto Helpers
  // ---------------------------------------------------------------------------

  /**
   * Sign a payload string using HMAC-SHA256.
   */
  private signPayload(secret: string, payload: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
  }

  /**
   * Send an HTTP POST to the webhook URL with timeout.
   */
  private async sendWebhookRequest(
    url: string,
    body: string,
    headers: Record<string, string>,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Safely read the response body as text, catching any errors.
   */
  private async safeReadBody(response: Response): Promise<string> {
    try {
      return await response.text();
    } catch {
      return '';
    }
  }

  /**
   * Truncate a response body to a maximum length.
   */
  private truncateBody(
    body: string,
    maxLength: number = MAX_RESPONSE_BODY_LENGTH,
  ): string {
    if (body.length <= maxLength) {
      return body;
    }
    return body.substring(0, maxLength) + '... [truncated]';
  }

  /**
   * Calculate the retry delay in minutes based on the current attempt number.
   * Uses the RETRY_DELAYS_MINUTES array for exponential backoff.
   */
  private calculateRetryDelay(attempts: number): number {
    const index = Math.min(attempts - 1, RETRY_DELAYS_MINUTES.length - 1);
    return RETRY_DELAYS_MINUTES[index];
  }

  /**
   * Generate a cryptographically secure random secret for HMAC signing.
   */
  private generateSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
  }

  // ---------------------------------------------------------------------------
  // Private: Endpoint Lookup
  // ---------------------------------------------------------------------------

  /**
   * Find an endpoint by ID scoped to a user, or throw NotFoundException.
   */
  private async findEndpointOrFail(
    id: string,
    userId: string,
  ): Promise<WebhookEndpoint> {
    const endpoint = await this.endpointRepository.findOne({
      where: { id, userId },
    });

    if (!endpoint) {
      throw new NotFoundException(
        `Webhook endpoint with ID "${id}" not found`,
      );
    }

    return endpoint;
  }
}

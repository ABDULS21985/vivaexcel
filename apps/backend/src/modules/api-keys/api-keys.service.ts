import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';

import { ApiKey } from './entities/api-key.entity';
import { ApiKeyEnvironment, ApiKeyStatus } from './enums/api-key.enums';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { RedisService } from '../../shared/redis/redis.service';

// Grace period (in ms) after rotation during which the old key still works
const ROTATION_GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly redisService: RedisService,
  ) {}

  // ──────────────────────────────────────────────
  //  Key Generation & Hashing
  // ──────────────────────────────────────────────

  /**
   * Generate a random API key string.
   * Format: kt_live_XXXXXXXX... (40 chars total) or kt_test_XXXXXXXX...
   */
  private generateKeyString(environment: ApiKeyEnvironment): string {
    const prefix = environment === ApiKeyEnvironment.LIVE ? 'kt_live_' : 'kt_test_';
    const randomPart = crypto.randomBytes(24).toString('base64url').slice(0, 40 - prefix.length);
    return `${prefix}${randomPart}`;
  }

  /**
   * Hash a key using SHA-256.
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Extract the prefix from a key (first 12 chars).
   */
  private extractPrefix(key: string): string {
    return key.slice(0, 12);
  }

  // ──────────────────────────────────────────────
  //  CRUD Operations
  // ──────────────────────────────────────────────

  /**
   * Generate a new API key for a user.
   * Returns the plain key ONCE — it is never stored.
   */
  async generateApiKey(
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const environment = dto.environment ?? ApiKeyEnvironment.LIVE;
    const plainKey = this.generateKeyString(environment);
    const keyHash = this.hashKey(plainKey);
    const keyPrefix = this.extractPrefix(plainKey);

    const apiKey = this.apiKeyRepository.create({
      userId,
      name: dto.name,
      keyHash,
      keyPrefix,
      environment,
      scopes: dto.scopes as string[],
      rateLimit: dto.rateLimit ?? 60,
      allowedOrigins: dto.allowedOrigins ?? [],
      allowedIPs: dto.allowedIPs ?? [],
      monthlyRequestLimit: dto.monthlyRequestLimit ?? 10000,
      expiresAt: dto.expiresAt ?? null,
      status: ApiKeyStatus.ACTIVE,
      lastUsedAt: null,
      requestCount: 0,
      monthlyRequestCount: 0,
      revokedAt: null,
      revokedReason: null,
    });

    const saved = await this.apiKeyRepository.save(apiKey);

    this.logger.log(
      `API key created: id=${saved.id}, prefix=${keyPrefix}, user=${userId}`,
    );

    return { apiKey: saved, plainKey };
  }

  /**
   * Validate an API key: find by prefix, verify hash, check status/expiry/rate limits.
   * Returns the ApiKey entity or null if invalid.
   */
  async validateApiKey(key: string): Promise<ApiKey | null> {
    if (!key || (!key.startsWith('kt_live_') && !key.startsWith('kt_test_'))) {
      return null;
    }

    const prefix = this.extractPrefix(key);
    const keyHash = this.hashKey(key);

    // Find by prefix first (indexed lookup)
    const apiKey = await this.apiKeyRepository.findOne({
      where: { keyPrefix: prefix },
    });

    if (!apiKey) {
      this.logger.debug(`API key not found for prefix: ${prefix}`);
      return null;
    }

    // Constant-time hash comparison to prevent timing attacks
    const hashBuffer = Buffer.from(apiKey.keyHash, 'hex');
    const incomingBuffer = Buffer.from(keyHash, 'hex');
    if (
      hashBuffer.length !== incomingBuffer.length ||
      !crypto.timingSafeEqual(hashBuffer, incomingBuffer)
    ) {
      this.logger.debug(`API key hash mismatch for prefix: ${prefix}`);
      return null;
    }

    // Check status
    if (apiKey.status !== ApiKeyStatus.ACTIVE) {
      this.logger.debug(`API key is not active: ${apiKey.id} (status=${apiKey.status})`);
      return null;
    }

    // Check expiry
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      this.logger.debug(`API key expired: ${apiKey.id}`);
      return null;
    }

    // Check monthly request limit
    if (apiKey.monthlyRequestCount >= apiKey.monthlyRequestLimit) {
      this.logger.debug(
        `API key monthly limit exceeded: ${apiKey.id} (${apiKey.monthlyRequestCount}/${apiKey.monthlyRequestLimit})`,
      );
      return null;
    }

    // Increment counters and update lastUsedAt
    await this.apiKeyRepository.update(apiKey.id, {
      lastUsedAt: new Date(),
      requestCount: () => 'request_count + 1',
      monthlyRequestCount: () => 'monthly_request_count + 1',
    } as any);

    // Update the in-memory object
    apiKey.requestCount += 1;
    apiKey.monthlyRequestCount += 1;
    apiKey.lastUsedAt = new Date();

    return apiKey;
  }

  /**
   * Revoke an API key.
   */
  async revokeApiKey(
    keyId: string,
    userId: string,
    reason?: string,
  ): Promise<ApiKey> {
    const apiKey = await this.findUserKey(keyId, userId);

    if (apiKey.status === ApiKeyStatus.REVOKED) {
      throw new BadRequestException('API key is already revoked');
    }

    apiKey.status = ApiKeyStatus.REVOKED;
    apiKey.revokedAt = new Date();
    apiKey.revokedReason = reason ?? 'Manually revoked by user';

    const saved = await this.apiKeyRepository.save(apiKey);

    this.logger.log(`API key revoked: id=${keyId}, user=${userId}, reason=${reason ?? 'none'}`);

    return saved;
  }

  /**
   * Rotate an API key: generate a new key and revoke the old one
   * with a grace period during which the old key still works.
   */
  async rotateApiKey(
    keyId: string,
    userId: string,
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const oldKey = await this.findUserKey(keyId, userId);

    if (oldKey.status !== ApiKeyStatus.ACTIVE) {
      throw new BadRequestException('Cannot rotate a non-active API key');
    }

    // Generate a new key with the same settings
    const environment = oldKey.environment;
    const plainKey = this.generateKeyString(environment);
    const keyHash = this.hashKey(plainKey);
    const keyPrefix = this.extractPrefix(plainKey);

    const newApiKey = this.apiKeyRepository.create({
      userId,
      name: oldKey.name,
      keyHash,
      keyPrefix,
      environment,
      scopes: oldKey.scopes,
      rateLimit: oldKey.rateLimit,
      allowedOrigins: oldKey.allowedOrigins,
      allowedIPs: oldKey.allowedIPs,
      monthlyRequestLimit: oldKey.monthlyRequestLimit,
      expiresAt: oldKey.expiresAt,
      status: ApiKeyStatus.ACTIVE,
      lastUsedAt: null,
      requestCount: 0,
      monthlyRequestCount: 0,
      revokedAt: null,
      revokedReason: null,
    });

    const saved = await this.apiKeyRepository.save(newApiKey);

    // Schedule revocation of the old key after grace period
    setTimeout(async () => {
      try {
        const keyToRevoke = await this.apiKeyRepository.findOne({
          where: { id: keyId },
        });
        if (keyToRevoke && keyToRevoke.status === ApiKeyStatus.ACTIVE) {
          keyToRevoke.status = ApiKeyStatus.REVOKED;
          keyToRevoke.revokedAt = new Date();
          keyToRevoke.revokedReason = `Rotated — replaced by key ${saved.id}`;
          await this.apiKeyRepository.save(keyToRevoke);
          this.logger.log(
            `Old API key revoked after rotation grace period: id=${keyId}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to revoke old key ${keyId} after rotation: ${(error as Error).message}`,
        );
      }
    }, ROTATION_GRACE_PERIOD_MS);

    this.logger.log(
      `API key rotated: old=${keyId}, new=${saved.id}, user=${userId}`,
    );

    return { apiKey: saved, plainKey };
  }

  /**
   * Update API key settings (name, scopes, rate limit, origins, IPs, expiration).
   */
  async updateApiKey(
    keyId: string,
    userId: string,
    dto: UpdateApiKeyDto,
  ): Promise<ApiKey> {
    const apiKey = await this.findUserKey(keyId, userId);

    if (apiKey.status !== ApiKeyStatus.ACTIVE) {
      throw new BadRequestException('Cannot update a non-active API key');
    }

    if (dto.name !== undefined) apiKey.name = dto.name;
    if (dto.scopes !== undefined) apiKey.scopes = dto.scopes as string[];
    if (dto.rateLimit !== undefined) apiKey.rateLimit = dto.rateLimit;
    if (dto.allowedOrigins !== undefined) apiKey.allowedOrigins = dto.allowedOrigins;
    if (dto.allowedIPs !== undefined) apiKey.allowedIPs = dto.allowedIPs;
    if (dto.monthlyRequestLimit !== undefined) apiKey.monthlyRequestLimit = dto.monthlyRequestLimit;
    if (dto.expiresAt !== undefined) apiKey.expiresAt = dto.expiresAt;

    const saved = await this.apiKeyRepository.save(apiKey);
    this.logger.log(`API key updated: id=${keyId}, user=${userId}`);
    return saved;
  }

  /**
   * List all API keys for a user.
   */
  async getUserKeys(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single API key by ID (must belong to the user).
   */
  async getKeyById(keyId: string, userId: string): Promise<ApiKey> {
    return this.findUserKey(keyId, userId);
  }

  // ──────────────────────────────────────────────
  //  Rate Limiting (Redis sliding window)
  // ──────────────────────────────────────────────

  /**
   * Check and enforce rate limit using Redis sliding window.
   * Returns { allowed, remaining, resetAt }.
   */
  async checkRateLimit(
    keyPrefix: string,
    limit: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const redisKey = `api_rate:${keyPrefix}`;
    const windowSeconds = 60;

    try {
      const currentCount = await this.redisService.incr(redisKey);

      // If this is the first request in the window, set TTL
      if (currentCount === 1) {
        await this.redisService.expire(redisKey, windowSeconds);
      }

      const ttl = await this.redisService.ttl(redisKey);
      const resetAt = Math.floor(Date.now() / 1000) + Math.max(ttl, 0);
      const remaining = Math.max(limit - currentCount, 0);
      const allowed = currentCount <= limit;

      return { allowed, remaining, resetAt };
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      this.logger.warn(
        `Rate limit check failed for ${keyPrefix}: ${(error as Error).message}`,
      );
      return { allowed: true, remaining: limit, resetAt: 0 };
    }
  }

  /**
   * Check if the request origin is allowed for this key.
   */
  checkOrigin(apiKey: ApiKey, origin: string | undefined): boolean {
    if (!apiKey.allowedOrigins || apiKey.allowedOrigins.length === 0) {
      return true; // No origin restriction
    }

    if (!origin) {
      return false; // Origin required but not provided
    }

    return apiKey.allowedOrigins.some(
      (allowed) => allowed === '*' || allowed === origin,
    );
  }

  /**
   * Check if the request IP is allowed for this key.
   */
  checkIP(apiKey: ApiKey, ip: string | undefined): boolean {
    if (!apiKey.allowedIPs || apiKey.allowedIPs.length === 0) {
      return true; // No IP restriction
    }

    if (!ip) {
      return false; // IP required but not provided
    }

    return apiKey.allowedIPs.some((allowed) => {
      // Simple exact match or CIDR support could be added here
      if (allowed.includes('/')) {
        return this.isIpInCidr(ip, allowed);
      }
      return allowed === ip;
    });
  }

  // ──────────────────────────────────────────────
  //  CRON: Monthly counter reset
  // ──────────────────────────────────────────────

  /**
   * Reset monthly request counters for all API keys.
   * Runs on the 1st of every month at midnight.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlyCounters(): Promise<void> {
    try {
      const result = await this.apiKeyRepository
        .createQueryBuilder()
        .update(ApiKey)
        .set({ monthlyRequestCount: 0 })
        .where('status = :status', { status: ApiKeyStatus.ACTIVE })
        .execute();

      this.logger.log(
        `Monthly API key counters reset: ${result.affected ?? 0} keys updated`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to reset monthly counters: ${(error as Error).message}`,
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Private Helpers
  // ──────────────────────────────────────────────

  /**
   * Find a key by ID and verify it belongs to the given user.
   */
  private async findUserKey(keyId: string, userId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: keyId },
    });

    if (!apiKey) {
      throw new NotFoundException(`API key with ID "${keyId}" not found`);
    }

    if (apiKey.userId !== userId) {
      throw new ForbiddenException('You do not have access to this API key');
    }

    return apiKey;
  }

  /**
   * Simple CIDR check for IPv4.
   */
  private isIpInCidr(ip: string, cidr: string): boolean {
    try {
      const [range, bits] = cidr.split('/');
      const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);
      const ipNum = this.ipToNumber(ip);
      const rangeNum = this.ipToNumber(range);
      return (ipNum & mask) === (rangeNum & mask);
    } catch {
      return false;
    }
  }

  private ipToNumber(ip: string): number {
    return ip
      .split('.')
      .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
  }
}

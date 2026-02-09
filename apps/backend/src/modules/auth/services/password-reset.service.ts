import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PasswordService } from './password.service';

export interface PasswordResetTokenData {
  userId: string;
  email: string;
  createdAt: number;
}

@Injectable()
export class PasswordResetService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly tokenPrefix = 'password_reset:';
  private readonly userTokenPrefix = 'password_reset_user:';
  private readonly rateLimitPrefix = 'password_reset_rate:';
  private readonly tokenTTL: number; // in seconds

  constructor(
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB') || 0,
      keyPrefix: this.configService.get<string>('REDIS_PREFIX') || 'auth:',
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Default: 15 minutes for password reset
    this.tokenTTL =
      this.configService.get<number>('PASSWORD_RESET_TTL') || 15 * 60;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Generate a new password reset token
   */
  async generateToken(userId: string, email: string): Promise<string | null> {
    // Check rate limiting (max 3 requests per hour)
    const canRequest = await this.checkRateLimit(email);
    if (!canRequest) {
      return null;
    }

    // Invalidate any existing token for this user
    await this.invalidateUserToken(userId);

    // Generate new token
    const token = await this.passwordService.generateSecureToken(32);
    const tokenHash = await this.passwordService.hashToken(token);

    const tokenData: PasswordResetTokenData = {
      userId,
      email,
      createdAt: Date.now(),
    };

    const pipeline = this.redis.pipeline();

    // Store token data by hash
    pipeline.setex(
      `${this.tokenPrefix}${tokenHash}`,
      this.tokenTTL,
      JSON.stringify(tokenData),
    );

    // Store hash by user ID (for invalidation)
    pipeline.setex(`${this.userTokenPrefix}${userId}`, this.tokenTTL, tokenHash);

    // Increment rate limit counter
    pipeline.incr(`${this.rateLimitPrefix}${email}`);
    pipeline.expire(`${this.rateLimitPrefix}${email}`, 3600); // 1 hour window

    await pipeline.exec();

    return token;
  }

  /**
   * Verify a password reset token
   */
  async verifyToken(token: string): Promise<PasswordResetTokenData | null> {
    const tokenHash = await this.passwordService.hashToken(token);

    const data = await this.redis.get(`${this.tokenPrefix}${tokenHash}`);
    if (!data) return null;

    try {
      return JSON.parse(data) as PasswordResetTokenData;
    } catch {
      return null;
    }
  }

  /**
   * Consume (use and invalidate) a password reset token
   */
  async consumeToken(token: string): Promise<PasswordResetTokenData | null> {
    const tokenData = await this.verifyToken(token);
    if (!tokenData) return null;

    // Invalidate the token after successful verification
    const tokenHash = await this.passwordService.hashToken(token);
    await this.invalidateToken(tokenHash, tokenData.userId);

    return tokenData;
  }

  /**
   * Invalidate a token by its hash
   */
  private async invalidateToken(
    tokenHash: string,
    userId: string,
  ): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.del(`${this.tokenPrefix}${tokenHash}`);
    pipeline.del(`${this.userTokenPrefix}${userId}`);
    await pipeline.exec();
  }

  /**
   * Invalidate any existing token for a user
   */
  async invalidateUserToken(userId: string): Promise<void> {
    const existingHash = await this.redis.get(
      `${this.userTokenPrefix}${userId}`,
    );

    if (existingHash) {
      const pipeline = this.redis.pipeline();
      pipeline.del(`${this.tokenPrefix}${existingHash}`);
      pipeline.del(`${this.userTokenPrefix}${userId}`);
      await pipeline.exec();
    }
  }

  /**
   * Check rate limiting for password reset requests
   */
  private async checkRateLimit(email: string): Promise<boolean> {
    const count = await this.redis.get(`${this.rateLimitPrefix}${email}`);
    const currentCount = count ? parseInt(count, 10) : 0;

    // Allow max 3 requests per hour
    return currentCount < 3;
  }

  /**
   * Get remaining password reset requests allowed
   */
  async getRemainingRequests(email: string): Promise<number> {
    const count = await this.redis.get(`${this.rateLimitPrefix}${email}`);
    const currentCount = count ? parseInt(count, 10) : 0;
    return Math.max(0, 3 - currentCount);
  }

  /**
   * Get time until rate limit resets
   */
  async getRateLimitResetTime(email: string): Promise<number> {
    const ttl = await this.redis.ttl(`${this.rateLimitPrefix}${email}`);
    return Math.max(0, ttl);
  }

  /**
   * Check if a user has a pending password reset token
   */
  async hasPendingToken(userId: string): Promise<boolean> {
    const exists = await this.redis.exists(`${this.userTokenPrefix}${userId}`);
    return exists === 1;
  }

  /**
   * Get token expiry time remaining
   */
  async getTokenTTL(userId: string): Promise<number> {
    const ttl = await this.redis.ttl(`${this.userTokenPrefix}${userId}`);
    return Math.max(0, ttl);
  }
}

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PasswordService } from './password.service';

export interface VerificationTokenData {
  userId: string;
  email: string;
  createdAt: number;
}

@Injectable()
export class EmailVerificationService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly tokenPrefix = 'email_verification:';
  private readonly userTokenPrefix = 'email_verification_user:';
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

    // Default: 24 hours for email verification
    this.tokenTTL =
      this.configService.get<number>('EMAIL_VERIFICATION_TTL') || 24 * 60 * 60;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Generate a new email verification token
   */
  async generateToken(userId: string, email: string): Promise<string> {
    // Invalidate any existing token for this user
    await this.invalidateUserToken(userId);

    // Generate new token
    const token = await this.passwordService.generateSecureToken(32);
    const tokenHash = await this.passwordService.hashToken(token);

    const tokenData: VerificationTokenData = {
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
    pipeline.setex(
      `${this.userTokenPrefix}${userId}`,
      this.tokenTTL,
      tokenHash,
    );

    await pipeline.exec();

    return token;
  }

  /**
   * Verify an email verification token
   */
  async verifyToken(token: string): Promise<VerificationTokenData | null> {
    const tokenHash = await this.passwordService.hashToken(token);

    const data = await this.redis.get(`${this.tokenPrefix}${tokenHash}`);
    if (!data) return null;

    try {
      const tokenData = JSON.parse(data) as VerificationTokenData;

      // Invalidate the token after successful verification
      await this.invalidateToken(tokenHash);

      return tokenData;
    } catch {
      return null;
    }
  }

  /**
   * Invalidate a token by its hash
   */
  private async invalidateToken(tokenHash: string): Promise<void> {
    const data = await this.redis.get(`${this.tokenPrefix}${tokenHash}`);
    if (data) {
      try {
        const tokenData = JSON.parse(data) as VerificationTokenData;

        const pipeline = this.redis.pipeline();
        pipeline.del(`${this.tokenPrefix}${tokenHash}`);
        pipeline.del(`${this.userTokenPrefix}${tokenData.userId}`);
        await pipeline.exec();
      } catch {
        await this.redis.del(`${this.tokenPrefix}${tokenHash}`);
      }
    }
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
   * Check if a user has a pending verification token
   */
  async hasPendingToken(userId: string): Promise<boolean> {
    const exists = await this.redis.exists(`${this.userTokenPrefix}${userId}`);
    return exists === 1;
  }

  /**
   * Get time until token expires (for rate limiting resend)
   */
  async getTokenTTL(userId: string): Promise<number> {
    const ttl = await this.redis.ttl(`${this.userTokenPrefix}${userId}`);
    return Math.max(0, ttl);
  }

  /**
   * Check if user can request a new verification email (rate limiting)
   * Returns seconds to wait, or 0 if can request immediately
   */
  async canRequestNewToken(userId: string): Promise<number> {
    const ttl = await this.getTokenTTL(userId);
    if (ttl === 0) return 0;

    // Require at least 1 minute between requests
    const minWaitTime = 60;
    const elapsed = this.tokenTTL - ttl;

    if (elapsed < minWaitTime) {
      return minWaitTime - elapsed;
    }

    return 0;
  }
}

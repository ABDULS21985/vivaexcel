import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface LockoutStatus {
  isLocked: boolean;
  attemptsRemaining: number;
  lockoutEndsAt?: Date;
  totalAttempts: number;
}

@Injectable()
export class LockoutService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly lockoutPrefix = 'lockout:';
  private readonly attemptsPrefix = 'login_attempts:';
  private readonly maxAttempts: number;
  private readonly lockoutDuration: number; // in seconds
  private readonly attemptWindow: number; // in seconds

  constructor(private readonly configService: ConfigService) {
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

    // Default: 5 failed attempts
    this.maxAttempts = this.configService.get<number>('LOCKOUT_MAX_ATTEMPTS') || 5;
    // Default: 15 minutes lockout
    this.lockoutDuration =
      this.configService.get<number>('LOCKOUT_DURATION') || 15 * 60;
    // Default: 1 hour window for counting attempts
    this.attemptWindow =
      this.configService.get<number>('LOCKOUT_ATTEMPT_WINDOW') || 60 * 60;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Get the lockout key for an identifier (email or IP)
   */
  private getLockoutKey(identifier: string): string {
    return `${this.lockoutPrefix}${identifier}`;
  }

  /**
   * Get the attempts key for an identifier
   */
  private getAttemptsKey(identifier: string): string {
    return `${this.attemptsPrefix}${identifier}`;
  }

  /**
   * Check if an account is locked out
   */
  async isLockedOut(identifier: string): Promise<LockoutStatus> {
    const lockoutKey = this.getLockoutKey(identifier);
    const attemptsKey = this.getAttemptsKey(identifier);

    const [lockoutTTL, attempts] = await Promise.all([
      this.redis.ttl(lockoutKey),
      this.redis.get(attemptsKey),
    ]);

    const totalAttempts = attempts ? parseInt(attempts, 10) : 0;
    const isLocked = lockoutTTL > 0;

    if (isLocked) {
      const lockoutEndsAt = new Date(Date.now() + lockoutTTL * 1000);
      return {
        isLocked: true,
        attemptsRemaining: 0,
        lockoutEndsAt,
        totalAttempts,
      };
    }

    return {
      isLocked: false,
      attemptsRemaining: Math.max(0, this.maxAttempts - totalAttempts),
      totalAttempts,
    };
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(identifier: string): Promise<LockoutStatus> {
    const attemptsKey = this.getAttemptsKey(identifier);
    const lockoutKey = this.getLockoutKey(identifier);

    // Increment attempt counter
    const attempts = await this.redis.incr(attemptsKey);

    // Set expiry on first attempt
    if (attempts === 1) {
      await this.redis.expire(attemptsKey, this.attemptWindow);
    }

    // Check if we should lock out
    if (attempts >= this.maxAttempts) {
      // Set lockout
      await this.redis.setex(lockoutKey, this.lockoutDuration, '1');

      // Reset attempts counter
      await this.redis.del(attemptsKey);

      const lockoutEndsAt = new Date(Date.now() + this.lockoutDuration * 1000);

      return {
        isLocked: true,
        attemptsRemaining: 0,
        lockoutEndsAt,
        totalAttempts: attempts,
      };
    }

    return {
      isLocked: false,
      attemptsRemaining: this.maxAttempts - attempts,
      totalAttempts: attempts,
    };
  }

  /**
   * Clear failed attempts on successful login
   */
  async clearFailedAttempts(identifier: string): Promise<void> {
    const attemptsKey = this.getAttemptsKey(identifier);
    await this.redis.del(attemptsKey);
  }

  /**
   * Manually unlock an account (admin function)
   */
  async unlock(identifier: string): Promise<boolean> {
    const lockoutKey = this.getLockoutKey(identifier);
    const attemptsKey = this.getAttemptsKey(identifier);

    const pipeline = this.redis.pipeline();
    pipeline.del(lockoutKey);
    pipeline.del(attemptsKey);

    await pipeline.exec();

    return true;
  }

  /**
   * Get remaining lockout time in seconds
   */
  async getRemainingLockoutTime(identifier: string): Promise<number> {
    const lockoutKey = this.getLockoutKey(identifier);
    const ttl = await this.redis.ttl(lockoutKey);
    return Math.max(0, ttl);
  }

  /**
   * Check both email and IP for lockout
   */
  async isLockedOutByEmailOrIP(
    email: string,
    ipAddress?: string,
  ): Promise<{ emailLocked: LockoutStatus; ipLocked: LockoutStatus | null }> {
    const emailStatus = await this.isLockedOut(email);

    let ipStatus: LockoutStatus | null = null;
    if (ipAddress) {
      ipStatus = await this.isLockedOut(`ip:${ipAddress}`);
    }

    return {
      emailLocked: emailStatus,
      ipLocked: ipStatus,
    };
  }

  /**
   * Record failed attempt for both email and IP
   */
  async recordFailedAttemptForEmailAndIP(
    email: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.recordFailedAttempt(email);

    if (ipAddress) {
      await this.recordFailedAttempt(`ip:${ipAddress}`);
    }
  }

  /**
   * Clear attempts for both email and IP
   */
  async clearAttemptsForEmailAndIP(
    email: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.clearFailedAttempts(email);

    if (ipAddress) {
      await this.clearFailedAttempts(`ip:${ipAddress}`);
    }
  }
}

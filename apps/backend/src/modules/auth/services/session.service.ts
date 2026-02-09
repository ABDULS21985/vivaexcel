import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export interface SessionData {
  userId: string;
  email: string;
  correlationId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
  lastAccessedAt: number;
}

@Injectable()
export class SessionService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly sessionPrefix = 'session:';
  private readonly userSessionsPrefix = 'user_sessions:';
  private readonly blacklistPrefix = 'token_blacklist:';
  private readonly sessionTTL: number;

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

    // Session TTL in seconds (default 7 days)
    this.sessionTTL =
      this.configService.get<number>('SESSION_TTL') || 7 * 24 * 60 * 60;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Create a new session for a user
   */
  async createSession(
    userId: string,
    email: string,
    correlationId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const sessionId = uuidv4();
    const now = Date.now();

    const sessionData: SessionData = {
      userId,
      email,
      correlationId,
      ipAddress,
      userAgent,
      createdAt: now,
      lastAccessedAt: now,
    };

    const pipeline = this.redis.pipeline();

    // Store session data
    pipeline.setex(
      `${this.sessionPrefix}${sessionId}`,
      this.sessionTTL,
      JSON.stringify(sessionData),
    );

    // Add session to user's session set
    pipeline.sadd(`${this.userSessionsPrefix}${userId}`, sessionId);
    pipeline.expire(`${this.userSessionsPrefix}${userId}`, this.sessionTTL);

    await pipeline.exec();

    return sessionId;
  }

  /**
   * Get session data by session ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.redis.get(`${this.sessionPrefix}${sessionId}`);
    if (!data) return null;

    try {
      return JSON.parse(data) as SessionData;
    } catch {
      return null;
    }
  }

  /**
   * Update session's last accessed time
   */
  async touchSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    session.lastAccessedAt = Date.now();

    await this.redis.setex(
      `${this.sessionPrefix}${sessionId}`,
      this.sessionTTL,
      JSON.stringify(session),
    );

    return true;
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    const pipeline = this.redis.pipeline();

    // Remove session
    pipeline.del(`${this.sessionPrefix}${sessionId}`);

    // Remove from user's session set
    pipeline.srem(`${this.userSessionsPrefix}${session.userId}`, sessionId);

    await pipeline.exec();

    return true;
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string): Promise<number> {
    const sessionIds = await this.redis.smembers(
      `${this.userSessionsPrefix}${userId}`,
    );

    if (sessionIds.length === 0) return 0;

    const pipeline = this.redis.pipeline();

    // Remove all sessions
    for (const sessionId of sessionIds) {
      pipeline.del(`${this.sessionPrefix}${sessionId}`);
    }

    // Remove the user sessions set
    pipeline.del(`${this.userSessionsPrefix}${userId}`);

    await pipeline.exec();

    return sessionIds.length;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    const sessionIds = await this.redis.smembers(
      `${this.userSessionsPrefix}${userId}`,
    );

    const sessions: SessionData[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Check if a session exists and is valid
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    const exists = await this.redis.exists(`${this.sessionPrefix}${sessionId}`);
    return exists === 1;
  }

  /**
   * Blacklist a token (for logout before expiry)
   */
  async blacklistToken(
    token: string,
    expiresInSeconds: number,
  ): Promise<void> {
    const { createHash } = await import('crypto');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await this.redis.setex(
      `${this.blacklistPrefix}${tokenHash}`,
      expiresInSeconds,
      '1',
    );
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const { createHash } = await import('crypto');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const exists = await this.redis.exists(
      `${this.blacklistPrefix}${tokenHash}`,
    );
    return exists === 1;
  }

  /**
   * Get session count for a user
   */
  async getSessionCount(userId: string): Promise<number> {
    return this.redis.scard(`${this.userSessionsPrefix}${userId}`);
  }
}

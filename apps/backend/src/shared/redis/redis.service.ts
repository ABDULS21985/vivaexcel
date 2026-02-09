import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisConfig: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      retryStrategy: (times: number) => {
        if (times > 10) {
          this.logger.error('Redis connection failed after 10 retries');
          return null;
        }
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    };

    this.client = new Redis(redisConfig);

    this.client.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(`Redis client error: ${error.message}`);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis client connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.log('Redis client reconnecting');
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis client disconnected');
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, 'EX', ttlSeconds);
      }
      return await this.client.set(key, value);
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async del(...keys: string[]): Promise<number> {
    try {
      return await this.client.del(...keys);
    } catch (error) {
      this.logger.error(`Redis DEL error: ${(error as Error).message}`);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Redis TTL error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async exists(...keys: string[]): Promise<number> {
    try {
      return await this.client.exists(...keys);
    } catch (error) {
      this.logger.error(`Redis EXISTS error: ${(error as Error).message}`);
      throw error;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Redis INCR error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async incrBy(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      this.logger.error(`Redis INCRBY error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Redis HGET error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hset(key, field, value);
    } catch (error) {
      this.logger.error(`Redis HSET error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Redis HGETALL error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    try {
      return await this.client.hdel(key, ...fields);
    } catch (error) {
      this.logger.error(`Redis HDEL error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Redis SADD error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      this.logger.error(`Redis SMEMBERS error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.srem(key, ...members);
    } catch (error) {
      this.logger.error(`Redis SREM error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  async sismember(key: string, member: string): Promise<number> {
    try {
      return await this.client.sismember(key, member);
    } catch (error) {
      this.logger.error(`Redis SISMEMBER error for key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  pipeline(): ReturnType<Redis['pipeline']> {
    return this.client.pipeline();
  }

  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      this.logger.error(`Redis PING error: ${(error as Error).message}`);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Redis KEYS error for pattern ${pattern}: ${(error as Error).message}`);
      throw error;
    }
  }

  async flushdb(): Promise<'OK'> {
    try {
      return await this.client.flushdb();
    } catch (error) {
      this.logger.error(`Redis FLUSHDB error: ${(error as Error).message}`);
      throw error;
    }
  }
}

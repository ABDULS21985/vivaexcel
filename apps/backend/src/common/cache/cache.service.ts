import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../shared/redis/redis.service';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export const CACHE_TAGS_PREFIX = 'cache:tags:';
export const DEFAULT_TTL = 300; // 5 minutes

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Get or set a cached value. If the value exists in cache, return it.
   * Otherwise, execute the factory function, cache the result, and return it.
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = DEFAULT_TTL,
  ): Promise<T> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        this.logger.debug(`Cache HIT for key: ${key}`);
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(
        `Cache GET failed for key ${key}: ${(error as Error).message}. Falling back to factory.`,
      );
    }

    this.logger.debug(`Cache MISS for key: ${key}`);

    // Execute factory function
    const value = await factory();

    // Store in cache (don't fail if cache write fails)
    try {
      await this.redis.set(key, JSON.stringify(value), ttl);
      this.logger.debug(`Cached value for key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      this.logger.warn(
        `Cache SET failed for key ${key}: ${(error as Error).message}`,
      );
    }

    return value;
  }

  /**
   * Get a cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        this.logger.debug(`Cache HIT for key: ${key}`);
        return JSON.parse(cached) as T;
      }
      this.logger.debug(`Cache MISS for key: ${key}`);
      return null;
    } catch (error) {
      this.logger.warn(
        `Cache GET failed for key ${key}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Set a cached value
   */
  async set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), ttl);
      this.logger.debug(`Cached value for key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      this.logger.warn(
        `Cache SET failed for key ${key}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Invalidate a specific cache key
   */
  async invalidate(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`Invalidated cache key: ${key}`);
    } catch (error) {
      this.logger.warn(
        `Cache invalidation failed for key ${key}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Invalidate all cache keys matching a pattern
   * WARNING: Use with caution in production as KEYS command can be slow
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(
          `Invalidated ${keys.length} cache keys matching pattern: ${pattern}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Cache invalidation failed for pattern ${pattern}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Wrap a function with caching support, including tag-based invalidation
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const ttl = options?.ttl ?? DEFAULT_TTL;
    const tags = options?.tags ?? [];

    // Check cache first
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        this.logger.debug(`Cache HIT for key: ${key}`);
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(
        `Cache GET failed for key ${key}: ${(error as Error).message}. Falling back to function execution.`,
      );
    }

    this.logger.debug(`Cache MISS for key: ${key}`);

    // Execute function if not cached
    const value = await fn();

    // Store result with TTL
    try {
      await this.redis.set(key, JSON.stringify(value), ttl);
      this.logger.debug(`Cached value for key: ${key} with TTL: ${ttl}s`);

      // Support cache tags for invalidation
      if (tags.length > 0) {
        for (const tag of tags) {
          const tagKey = `${CACHE_TAGS_PREFIX}${tag}`;
          await this.redis.sadd(tagKey, key);
          // Set TTL on tag set slightly longer than the cached item
          await this.redis.expire(tagKey, ttl + 60);
        }
        this.logger.debug(`Added key ${key} to tags: ${tags.join(', ')}`);
      }
    } catch (error) {
      this.logger.warn(
        `Cache SET/tagging failed for key ${key}: ${(error as Error).message}`,
      );
    }

    return value;
  }

  /**
   * Invalidate all cache entries associated with a specific tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    try {
      const tagKey = `${CACHE_TAGS_PREFIX}${tag}`;
      const keys = await this.redis.smembers(tagKey);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(
          `Invalidated ${keys.length} cache keys for tag: ${tag}`,
        );
      }

      // Also delete the tag set
      await this.redis.del(tagKey);
    } catch (error) {
      this.logger.warn(
        `Cache invalidation failed for tag ${tag}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Invalidate multiple tags at once
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    await Promise.all(tags.map((tag) => this.invalidateByTag(tag)));
  }

  /**
   * Generate a cache key from components
   */
  generateKey(...parts: (string | number | object)[]): string {
    return parts
      .map((part) => {
        if (typeof part === 'object') {
          return JSON.stringify(part);
        }
        return String(part);
      })
      .join(':');
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const count = await this.redis.exists(key);
      return count > 0;
    } catch (error) {
      this.logger.warn(
        `Cache EXISTS failed for key ${key}: ${(error as Error).message}`,
      );
      return false;
    }
  }

  /**
   * Get TTL remaining for a cached key
   */
  async getTtl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.warn(
        `Cache TTL failed for key ${key}: ${(error as Error).message}`,
      );
      return -1;
    }
  }
}

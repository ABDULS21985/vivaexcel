import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';
export const CACHE_TAGS = 'cache_tags';
export const SKIP_CACHE = 'skip_cache';

/**
 * Set a custom cache key for the endpoint
 * @param key - The cache key template. Can include :param placeholders
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY, key);

/**
 * Set custom TTL (time to live) in seconds for the cached response
 * @param ttl - TTL in seconds
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL, ttl);

/**
 * Set cache tags for tag-based invalidation
 * @param tags - Array of tags for this cache entry
 */
export const CacheTags = (...tags: string[]) => SetMetadata(CACHE_TAGS, tags);

/**
 * Skip caching for this endpoint
 */
export const SkipCache = () => SetMetadata(SKIP_CACHE, true);

/**
 * Combined decorator for setting all cache options at once
 */
export function Cached(options: {
  key?: string;
  ttl?: number;
  tags?: string[];
}) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    if (options.key) {
      SetMetadata(CACHE_KEY, options.key)(target, propertyKey, descriptor);
    }
    if (options.ttl !== undefined) {
      SetMetadata(CACHE_TTL, options.ttl)(target, propertyKey, descriptor);
    }
    if (options.tags) {
      SetMetadata(CACHE_TAGS, options.tags)(target, propertyKey, descriptor);
    }
    return descriptor;
  };
}

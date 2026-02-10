import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from '@nestjs/cache-manager';
import Redis from 'ioredis';
import { CacheInvalidator } from './interfaces/cache-store.interface';

/**
 * Keyv stores keys as namespace::key. Pattern should match the full Redis key.
 * E.g. for namespace 'collections', keys are stored as collections::collections:cases:kpis
 */
@Injectable()
export class CacheInvalidatorService extends CacheInvalidator implements OnModuleInit, OnModuleDestroy {
  private redis: Redis | null = null;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    super();
  }

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async invalidate(pattern: string): Promise<void> {
    if (this.redis) {
      const keys: string[] = [];
      const stream = this.redis.scanStream({ match: pattern, count: 100 });
      for await (const batch of stream) {
        keys.push(...(batch as string[]));
      }
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return;
    }

    // Fallback when Redis is not configured: clear entire cache (in-memory store).
    // This ensures invalidation works in local dev without Redis.
    if (typeof this.cache.clear === 'function') {
      await this.cache.clear();
    }
  }
}

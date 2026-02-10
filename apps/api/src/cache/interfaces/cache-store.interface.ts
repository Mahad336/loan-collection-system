/**
 * Cache store abstraction (Dependency Inversion).
 * Domain modules depend on this, not concrete Redis/keyv.
 * Abstract class allows NestJS to use it as a DI token.
 */
export abstract class CacheStore {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  abstract del(key: string): Promise<void>;
}

/**
 * Cache invalidation abstraction for pattern-based invalidation.
 * Abstract class allows NestJS to use it as a DI token.
 */
export abstract class CacheInvalidator {
  abstract invalidate(pattern: string): Promise<void>;
}

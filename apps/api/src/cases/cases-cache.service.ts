import { Injectable } from '@nestjs/common';
import { CacheStore, CacheInvalidator } from '../cache/interfaces/cache-store.interface';
import type { ListCasesQueryDto } from '@collections/shared';

const NAMESPACE = 'collections:cases';
const TTL_KPIS_MS = 60_000;
const TTL_LIST_MS = 60_000;

/**
 * Cases domain cache strategy.
 * Owns cases-specific keys, TTLs, and invalidation rules.
 * Depends on infrastructure abstractions (Dependency Inversion).
 */
@Injectable()
export class CasesCacheService {
  constructor(
    private readonly store: CacheStore,
    private readonly invalidator: CacheInvalidator,
  ) {}

  private static listKey(query: Record<string, unknown>): string {
    const str = JSON.stringify(query, Object.keys(query).sort());
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h = h & h;
    }
    return `${NAMESPACE}:list:${Math.abs(h).toString(36)}`;
  }

  async getKpis(): Promise<Record<string, number> | null> {
    return this.store.get<Record<string, number>>(`${NAMESPACE}:kpis`);
  }

  async setKpis(data: Record<string, number>): Promise<void> {
    await this.store.set(`${NAMESPACE}:kpis`, data, TTL_KPIS_MS);
  }

  async getList(query: ListCasesQueryDto): Promise<Record<string, unknown> | null> {
    const key = CasesCacheService.listKey(query as Record<string, unknown>);
    return this.store.get<Record<string, unknown>>(key);
  }

  async setList(query: ListCasesQueryDto, data: Record<string, unknown>): Promise<void> {
    const key = CasesCacheService.listKey(query as Record<string, unknown>);
    await this.store.set(key, data, TTL_LIST_MS);
  }

  /**
   * Invalidate all cases cache. Pattern matches Keyv key format: namespace::key
   */
  async invalidate(): Promise<void> {
    await this.invalidator.invalidate('collections::collections:cases*');
  }
}

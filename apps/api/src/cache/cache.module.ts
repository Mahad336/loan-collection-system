import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { CacheStore } from './interfaces/cache-store.interface';
import { CacheInvalidator } from './interfaces/cache-store.interface';
import { CacheStoreService } from './cache-store.service';
import { CacheInvalidatorService } from './cache-invalidator.service';

const NAMESPACE = 'collections';
const DEFAULT_TTL_MS = 60_000;

function createCacheStores() {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return [createKeyv(redisUrl, { namespace: NAMESPACE })];
  }
  return [];
}

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const stores = createCacheStores();
        return {
          stores: stores.length > 0 ? stores : undefined,
          ttl: DEFAULT_TTL_MS,
        };
      },
    }),
  ],
  providers: [
    { provide: CacheStore, useClass: CacheStoreService },
    { provide: CacheInvalidator, useClass: CacheInvalidatorService },
  ],
  exports: [CacheStore, CacheInvalidator],
})
export class CacheConfigModule {}

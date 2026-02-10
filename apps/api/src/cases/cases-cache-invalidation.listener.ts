import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CasesCacheService } from './cases-cache.service';
import { CASE_EVENTS } from '../constants/events';

/**
 * Event-driven cache invalidation: decouples mutation points from cache layer.
 * Single responsibility: invalidate cases cache when case data changes.
 */
@Injectable()
export class CasesCacheInvalidationListener {
  constructor(private readonly cache: CasesCacheService) {}

  @OnEvent(CASE_EVENTS.MUTATED)
  async handleCaseMutated() {
   const result =  await this.cache.invalidate();
   console.log('invalidating cache', result);
   return result;
  }
}

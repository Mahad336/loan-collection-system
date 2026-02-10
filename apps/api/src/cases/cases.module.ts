import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { CasesRepository } from './cases.repository';
import { CasesCacheService } from './cases-cache.service';
import { CasesCacheInvalidationListener } from './cases-cache-invalidation.listener';

@Module({
  controllers: [CasesController],
  providers: [CasesService, CasesRepository, CasesCacheService, CasesCacheInvalidationListener],
  exports: [CasesService, CasesRepository, CasesCacheService],
})
export class CasesModule {}

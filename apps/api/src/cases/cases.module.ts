import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { CasesRepository } from './cases.repository';

@Module({
  controllers: [CasesController],
  providers: [CasesService, CasesRepository],
  exports: [CasesService, CasesRepository],
})
export class CasesModule {}

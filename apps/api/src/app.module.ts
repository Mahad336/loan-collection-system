import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';
import { CacheConfigModule } from './cache/cache.module';
import { CasesModule } from './cases/cases.module';
import { ActionsModule } from './actions/actions.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { PdfModule } from './pdf/pdf.module';
import { RulesModule } from './rules/rules.module';
import { DpdSchedulerModule } from './scheduler/dpd-scheduler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    CacheConfigModule,
    RulesModule,
    CasesModule,
    ActionsModule,
    AssignmentsModule,
    PdfModule,
    DpdSchedulerModule,
  ],
})
export class AppModule {}

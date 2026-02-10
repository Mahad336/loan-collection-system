import { Module } from '@nestjs/common';
import { DpdSchedulerService } from './dpd-scheduler.service';
import { CaseCreationSchedulerService } from './case-creation.scheduler';
import { CasesModule } from '../cases/cases.module';
import { AssignmentsModule } from '../assignments/assignments.module';

@Module({
  imports: [CasesModule, AssignmentsModule],
  providers: [DpdSchedulerService, CaseCreationSchedulerService],
})
export class DpdSchedulerModule {}

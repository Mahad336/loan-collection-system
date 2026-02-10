import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CasesRepository } from '../cases/cases.repository';
import { AssignmentsService } from '../assignments/assignments.service';

@Injectable()
export class DpdSchedulerService {
  private readonly logger = new Logger(DpdSchedulerService.name);

  constructor(
    private readonly casesRepository: CasesRepository,
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async recalculateDpdAndEscalate() {
    this.logger.log('Starting DPD recalculation job');

    const openCases = await this.casesRepository.findAllOpenForDpdUpdate();
    let updated = 0;
    let escalated = 0;

    for (const c of openCases) {
      const newDpd = this.casesRepository.calculateDpd(c.loan.dueDate);

      if (newDpd !== c.dpd) {
        await this.casesRepository.updateDpd(c.id, newDpd);
        updated++;

        if (!c.assignedTo) {
          try {
            await this.assignmentsService.runAssignment(c.id);
            escalated++;
          } catch (err) {
            this.logger.warn(`Failed to auto-assign case ${c.id}: ${err}`);
          }
        }
      }
    }

    this.logger.log(`DPD job complete: ${updated} cases updated, ${escalated} auto-assigned`);
  }
}

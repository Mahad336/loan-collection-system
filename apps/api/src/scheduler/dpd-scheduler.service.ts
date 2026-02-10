import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CasesRepository } from '../cases/cases.repository';
import { AssignmentsService } from '../assignments/assignments.service';
import { CASE_EVENTS } from '../constants/events';

@Injectable()
export class DpdSchedulerService {
  private readonly logger = new Logger(DpdSchedulerService.name);

  constructor(
    private readonly casesRepository: CasesRepository,
    private readonly assignmentsService: AssignmentsService,
    private readonly eventEmitter: EventEmitter2,
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

    if (updated > 0 || escalated > 0) {
      this.eventEmitter.emit(CASE_EVENTS.MUTATED);
    }

    this.logger.log(`DPD job complete: ${updated} cases updated, ${escalated} auto-assigned`);
  }
}

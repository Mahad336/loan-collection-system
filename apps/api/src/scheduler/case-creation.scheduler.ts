import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { CasesRepository } from '../cases/cases.repository';

@Injectable()
export class CaseCreationSchedulerService {
  private readonly logger = new Logger(CaseCreationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly casesRepository: CasesRepository,
  ) {}

  /**
   * Daily job: create cases for delinquent loans that don't have an open case.
   * Runs at 1:30 AM (before DPD recalculation at 2 AM).
   */
  @Cron('*/2 * * * *') // after every 2 minutes
  async createCasesForDelinquentLoans() {
    this.logger.log('Starting case creation job for delinquent loans');

    const delinquentLoans = await this.prisma.$queryRaw<
      Array<{
        id: number;
        customer_id: number;
        principal: number;
        outstanding: number;
        due_date: Date;
        status: string;
      }>
    >`
      SELECT l.id, l.customer_id, l.principal, l.outstanding, l.due_date, l.status
      FROM loans l
      WHERE l.status = 'DELINQUENT'
      AND NOT EXISTS (
        SELECT 1 FROM cases c
        WHERE c.loan_id = l.id
        AND c.status IN ('OPEN', 'IN_PROGRESS')
      )
    `;

    let created = 0;
    for (const loan of delinquentLoans) {
      try {
        const dpd = this.casesRepository.calculateDpd(loan.due_date);
        await this.prisma.case.create({
          data: {
            customerId: loan.customer_id,
            loanId: loan.id,
            dpd,
            stage: 'SOFT',
            status: 'OPEN',
          },
        });
        created++;
      } catch (err) {
        this.logger.warn(`Failed to create case for loan ${loan.id}: ${err}`);
      }
    }

    this.logger.log(`Case creation job complete: ${created} cases created for ${delinquentLoans.length} delinquent loans`);
  }
}

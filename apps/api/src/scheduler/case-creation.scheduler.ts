import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { CasesRepository } from '../cases/cases.repository';

const DELINQUENT_LOAN_STATUSES = ['DELINQUENT'];

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
  @Cron('30 1 * * *') // 1:30 AM daily
  async createCasesForDelinquentLoans() {
    this.logger.log('Starting case creation job for delinquent loans');

    const loansWithOpenCase = await this.prisma.case.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      select: { loanId: true },
      distinct: ['loanId'],
    });
    const loanIdsWithCase = new Set(loansWithOpenCase.map((c) => c.loanId));

    const delinquentLoans = await this.prisma.loan.findMany({
      where: {
        status: { in: DELINQUENT_LOAN_STATUSES },
        id: { notIn: [...loanIdsWithCase] },
      },
      include: { customer: true },
    });

    let created = 0;
    for (const loan of delinquentLoans) {
      try {
        const dpd = this.casesRepository.calculateDpd(loan.dueDate);
        await this.prisma.case.create({
          data: {
            customerId: loan.customerId,
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

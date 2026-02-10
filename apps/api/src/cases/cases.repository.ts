import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { ListCasesQueryDto } from '@collections/shared';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '@collections/shared';

@Injectable()
export class CasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: number, loanId: number) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: { customer: true },
    });
    if (!loan || loan.customerId !== customerId) {
      return null;
    }

    const dpd = this.calculateDpd(loan.dueDate);

    return this.prisma.case.create({
      data: {
        customerId,
        loanId,
        dpd,
        stage: 'SOFT',
        status: 'OPEN',
      },
      include: { customer: true, loan: true },
    });
  }

  async findMany(query: ListCasesQueryDto) {
    const page = Math.max(1, query.page ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.stage) where.stage = query.stage;
    if (query.assignedTo?.trim()) where.assignedTo = query.assignedTo.trim();
    if (query.dpdMin !== undefined || query.dpdMax !== undefined) {
      where.dpd = {};
      if (query.dpdMin !== undefined) (where.dpd as Record<string, number>).gte = query.dpdMin;
      if (query.dpdMax !== undefined) (where.dpd as Record<string, number>).lte = query.dpdMax;
    }

    const [data, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        include: { customer: true, loan: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.case.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    return this.prisma.case.findUnique({
      where: { id },
      include: {
        customer: true,
        loan: true,
        actionLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
        ruleDecisions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  calculateDpd(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffMs = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  async findAllOpenForDpdUpdate() {
    return this.prisma.case.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: { loan: true },
    });
  }

  async updateDpd(caseId: number, dpd: number) {
    return this.prisma.case.update({
      where: { id: caseId },
      data: { dpd },
    });
  }

  async findLoansAvailableForCase(): Promise<Array<{ id: number; customerId: number; customer: { name: string }; principal: number; outstanding: number; dueDate: Date; status: string }>> {
    const loansWithOpenCase = await this.prisma.case.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      select: { loanId: true },
      distinct: ['loanId'],
    });
    const loanIdsWithCase = new Set(loansWithOpenCase.map((c: { loanId: number }) => c.loanId));

    const DELINQUENT_STATUSES = ['DELINQUENT'];
    const loans = await this.prisma.loan.findMany({
      where: {
        status: { in: DELINQUENT_STATUSES },
        id: { notIn: [...loanIdsWithCase] },
      },
      include: { customer: true },
      orderBy: { dueDate: 'asc' },
    });

    return loans;
  }

  async getKpis() {
    const [openCount, resolvedToday, openCases] = await Promise.all([
      this.prisma.case.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      this.prisma.case.count({
        where: {
          status: 'RESOLVED',
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.case.findMany({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        select: { dpd: true },
      }),
    ]);

    const avgDpd =
      openCases.length > 0
        ? openCases.reduce((s: number, c: { dpd: number }) => s + c.dpd, 0) / openCases.length
        : 0;

    return {
      openCasesCount: openCount,
      resolvedTodayCount: resolvedToday,
      averageDpdOfOpenCases: Math.round(avgDpd * 10) / 10,
    };
  }
}

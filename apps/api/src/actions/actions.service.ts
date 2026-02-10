import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { CASE_EVENTS } from '../constants/events';
import type { CreateActionDto } from '@collections/shared';

@Injectable()
export class ActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addAction(caseId: number, dto: CreateActionDto) {
    const c = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!c) throw new NotFoundException(`Case ${caseId} not found`);

    const actionLog = await this.prisma.$transaction(async (tx) => {
      const log = await tx.actionLog.create({
        data: {
          caseId,
          type: dto.type,
          outcome: dto.outcome,
          notes: dto.notes ?? null,
        },
      });

      if (dto.outcome === 'PAID') {
        await tx.case.update({
          where: { id: caseId },
          data: { status: 'RESOLVED' },
        });
      }

      return log;
    });

    this.eventEmitter.emit(CASE_EVENTS.MUTATED);
    return actionLog;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreateActionDto } from '@collections/shared';

@Injectable()
export class ActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async addAction(caseId: number, dto: CreateActionDto) {
    const c = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!c) throw new NotFoundException(`Case ${caseId} not found`);

    return this.prisma.actionLog.create({
      data: {
        caseId,
        type: dto.type,
        outcome: dto.outcome,
        notes: dto.notes ?? null,
      },
    });
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RulesService } from '../rules/rules.service';
import { RuleEngineService } from '../rules/rule-engine.service';
import type { AssignmentResultDto } from '@collections/shared';

const ASSIGN_GROUP_TO_AGENT: Record<string, string> = {
  Tier1: 'Tier1Agent',
  Tier2: 'Tier2Agent',
  Legal: 'LegalAgent',
};

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rulesService: RulesService,
    private readonly ruleEngine: RuleEngineService,
  ) {}

  async runAssignment(caseId: number, expectedVersion?: number): Promise<AssignmentResultDto> {
    return this.prisma.$transaction(async (tx) => {
      const c = await tx.case.findUnique({
        where: { id: caseId },
        include: { customer: true, loan: true },
      });

      if (!c) throw new NotFoundException(`Case ${caseId} not found`);

      if (expectedVersion !== undefined && c.version !== expectedVersion) {
        throw new ConflictException(
          `Case version mismatch: expected ${expectedVersion}, got ${c.version}`,
        );
      }

      if (c.assignedTo) {
        const decision = await tx.ruleDecision.findFirst({
          where: { caseId },
          orderBy: { createdAt: 'desc' },
        });
        return {
          caseId: c.id,
          stage: c.stage as AssignmentResultDto['stage'],
          assignedTo: c.assignedTo,
          version: c.version,
          decision: {
            matchedRules: (decision?.matchedRules as string[]) ?? [],
            reason: decision?.reason ?? 'Previously assigned',
          },
          alreadyAssigned: true,
        };
      }

      const rules = await this.rulesService.getRules();
      const context = {
        case: { dpd: c.dpd },
        customer: { riskScore: c.customer.riskScore },
        loan: c.loan as Record<string, unknown>,
      };

      const result = this.ruleEngine.evaluate(rules, context);

      let stage = c.stage;
      let assignedTo = c.assignedTo;

      if (result.actions.stage) {
        stage = String(result.actions.stage);
      }
      if (result.actions.assignedTo) {
        assignedTo = String(result.actions.assignedTo);
      } else if (result.actions.assignGroup) {
        assignedTo = ASSIGN_GROUP_TO_AGENT[String(result.actions.assignGroup)] ?? String(result.actions.assignGroup);
      }

      await tx.case.update({
        where: { id: caseId },
        data: {
          stage,
          assignedTo,
          status: 'IN_PROGRESS',
          version: { increment: 1 },
        },
      });

      const updated = await tx.case.findUnique({
        where: { id: caseId },
      });

      await tx.ruleDecision.create({
        data: {
          caseId,
          matchedRules: result.matchedRules,
          reason: result.reason,
        },
      });

      return {
        caseId,
        stage: (updated?.stage ?? stage) as AssignmentResultDto['stage'],
        assignedTo: updated?.assignedTo ?? assignedTo ?? '',
        version: updated?.version ?? c.version + 1,
        decision: {
          matchedRules: result.matchedRules,
          reason: result.reason,
        },
      };
    });
  }
}

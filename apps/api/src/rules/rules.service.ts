import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { RuleDefinition } from '@collections/shared';

@Injectable()
export class RulesService {
  private cachedRules: RuleDefinition[] | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Load rules from DB, cached in memory for performance.
   * Call invalidateCache() when rules are updated.
   */
  async getRules(): Promise<RuleDefinition[]> {
    if (this.cachedRules) return this.cachedRules;

    const rows = await this.prisma.rule.findMany({
      where: { enabled: true },
      orderBy: { priority: 'asc' },
    });

    const rules: RuleDefinition[] = rows.map((r) => ({
      ruleId: r.ruleId,
      priority: r.priority,
      enabled: r.enabled,
      condition: r.condition as unknown as RuleDefinition['condition'],
      actions: r.actions as unknown as RuleDefinition['actions'],
      overridePrevious: r.overridePrevious,
    }));

    this.cachedRules = rules;
    return rules;
  }

  invalidateCache(): void {
    this.cachedRules = null;
  }
}

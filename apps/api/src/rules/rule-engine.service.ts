import { Injectable } from '@nestjs/common';
import type {
  RuleDefinition,
  CaseEvaluationContext,
  EvaluationResult,
  RuleCondition,
} from '@collections/shared';

@Injectable()
export class RuleEngineService {
  /**
   * Evaluates all rules against the case context.
   * Rules are applied in priority order. Override rules clear previous actions.
   */
  evaluate(
    rules: RuleDefinition[],
    context: CaseEvaluationContext,
  ): EvaluationResult {
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
    const actions: Record<string, string | number> = {};
    const matchedRules: string[] = [];

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      const matches = this.evaluateCondition(rule.condition, context);
      if (!matches) continue;

      matchedRules.push(rule.ruleId);

      // When overridePrevious is true, clear the fields this rule sets before applying.
      // This makes override explicit: e.g. RISK_GT_80_OVERRIDE discards DPD-based assignment.
      if (rule.overridePrevious) {
        for (const action of rule.actions) {
          delete actions[action.field];
        }
      }
      for (const action of rule.actions) {
        actions[action.field] = action.value;
      }
    }

    const reason = this.buildReason(matchedRules, context, actions);
    return { actions, matchedRules, reason };
  }

  private evaluateCondition(
    condition: RuleCondition,
    context: CaseEvaluationContext,
  ): boolean {
    const value = this.getFieldValue(condition.field, context);
    if (value === undefined || value === null) return false;

    const numValue = typeof value === 'number' ? value : parseInt(String(value), 10);

    switch (condition.type) {
      case 'between':
        return (
          condition.min !== undefined &&
          condition.max !== undefined &&
          numValue >= condition.min &&
          numValue <= condition.max
        );
      case 'gt':
        return condition.value !== undefined && numValue > (condition.value as number);
      case 'gte':
        return condition.value !== undefined && numValue >= (condition.value as number);
      case 'lt':
        return condition.value !== undefined && numValue < (condition.value as number);
      case 'lte':
        return condition.value !== undefined && numValue <= (condition.value as number);
      case 'eq':
        return condition.value !== undefined && numValue === condition.value;
      case 'in':
        return (
          condition.values !== undefined &&
          condition.values.includes(typeof value === 'number' ? value : String(value))
        );
      default:
        return false;
    }
  }

  private getFieldValue(
    field: string,
    context: CaseEvaluationContext,
  ): number | string | undefined {
    const [entity, key] = field.split('.');
    if (entity === 'case') return (context.case as Record<string, unknown>)[key] as number;
    if (entity === 'customer') return (context.customer as Record<string, unknown>)[key] as number;
    if (entity === 'loan' && context.loan) return (context.loan as Record<string, unknown>)[key] as number;
    return undefined;
  }

  private buildReason(
    matchedRules: string[],
    context: CaseEvaluationContext,
    actions: Record<string, string | number>,
  ): string {
    const parts: string[] = [];
    // Build human-readable reason per spec: "dpd=12 -> Tier2; riskScore=92 -> SeniorAgent override"
    if (context.case.dpd >= 1 && context.case.dpd <= 7) {
      parts.push(`dpd=${context.case.dpd} -> Tier1`);
    } else if (context.case.dpd >= 8 && context.case.dpd <= 30) {
      parts.push(`dpd=${context.case.dpd} -> Tier2`);
    } else if (context.case.dpd > 30) {
      parts.push(`dpd=${context.case.dpd} -> Legal`);
    }
    if (context.customer.riskScore > 80) {
      parts.push(`riskScore=${context.customer.riskScore} -> SeniorAgent override`);
    }
    return parts.length > 0 ? parts.join('; ') : `Matched rules: ${matchedRules.join(', ')}`;
  }
}

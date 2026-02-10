import type { CaseStage, CaseStatus } from './enums';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  country: string;
  riskScore: number;
}

export interface Loan {
  id: number;
  customerId: number;
  principal: number;
  outstanding: number;
  dueDate: Date;
  status: string;
}

export interface Case {
  id: number;
  customerId: number;
  loanId: number;
  dpd: number;
  stage: CaseStage;
  status: CaseStatus;
  assignedTo: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionLog {
  id: number;
  caseId: number;
  type: string;
  outcome: string;
  notes: string | null;
  createdAt: Date;
}

export interface RuleDecision {
  id: number;
  caseId: number;
  matchedRules: string[];
  reason: string;
  createdAt: Date;
}

// Rule engine types
export type RuleConditionType = 'between' | 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'in';

export interface RuleCondition {
  type: RuleConditionType;
  field: string;
  value?: number | string;
  min?: number;
  max?: number;
  values?: (number | string)[];
}

export interface RuleAction {
  field: string;
  value: string | number;
}

export interface RuleDefinition {
  ruleId: string;
  priority: number;
  enabled: boolean;
  condition: RuleCondition;
  actions: RuleAction[];
  overridePrevious: boolean;
}

export interface CaseEvaluationContext {
  case: { dpd: number };
  customer: { riskScore: number };
  loan?: Record<string, unknown>;
}

export interface EvaluationResult {
  actions: Record<string, string | number>;
  matchedRules: string[];
  reason: string;
}

import type { CaseStage } from '../enums';

export interface AssignmentDecisionDto {
  matchedRules: string[];
  reason: string;
}

export interface AssignmentResultDto {
  caseId: number;
  stage: CaseStage;
  assignedTo: string;
  version: number;
  decision: AssignmentDecisionDto;
  alreadyAssigned?: boolean;
}

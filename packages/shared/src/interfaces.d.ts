import type { Case, ActionLog, RuleDecision } from './types';
import type { Customer, Loan } from './types';
export interface CaseWithRelations extends Case {
    customer: Customer;
    loan: Loan;
    actionLogs?: ActionLog[];
    ruleDecisions?: RuleDecision[];
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}

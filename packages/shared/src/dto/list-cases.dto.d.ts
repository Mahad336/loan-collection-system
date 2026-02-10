import type { CaseStage, CaseStatus } from '../enums';
export interface ListCasesQueryDto {
    status?: CaseStatus;
    stage?: CaseStage;
    dpdMin?: number;
    dpdMax?: number;
    assignedTo?: string;
    page?: number;
    limit?: number;
}

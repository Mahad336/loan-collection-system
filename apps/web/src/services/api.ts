import axios from 'axios';
import type {
  CreateCaseDto,
  CreateActionDto,
  ListCasesQueryDto,
  PaginatedResult,
  CaseWithRelations,
  AssignmentResultDto,
} from '@collections/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const client = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export const api = {
  cases: {
    list: (query?: ListCasesQueryDto) =>
      client.get<PaginatedResult<CaseWithRelations>>('/cases', { params: query }),
    create: (dto: CreateCaseDto) => client.post<CaseWithRelations>('/cases', dto),
    getById: (id: number) => client.get<CaseWithRelations>(`/cases/${id}`),
    getAvailableLoans: () =>
      client.get<Array<{ id: number; customerId: number; customer: { name: string }; principal: number; outstanding: number; dueDate: string }>>('/cases/available-loans'),
  },
  kpis: () =>
    client.get<{
      openCasesCount: number;
      resolvedTodayCount: number;
      averageDpdOfOpenCases: number;
    }>('/cases/kpis'),
  actions: {
    add: (caseId: number, dto: CreateActionDto) =>
      client.post(`/cases/${caseId}/actions`, dto),
  },
  assignments: {
    run: (caseId: number, expectedVersion?: number) =>
      client.post<AssignmentResultDto>(`/cases/${caseId}/assign`, {}, {
        params: expectedVersion ? { expectedVersion } : undefined,
      }),
  },
  pdf: {
    getNoticeUrl: (caseId: number) => `${API_URL}/api/cases/${caseId}/notice.pdf`,
  },
};

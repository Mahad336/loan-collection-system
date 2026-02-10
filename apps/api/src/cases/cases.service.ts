import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CasesRepository } from './cases.repository';
import { CasesCacheService } from './cases-cache.service';
import { CASE_EVENTS } from '../constants/events';
import type { CreateCaseDto, ListCasesQueryDto } from '@collections/shared';

@Injectable()
export class CasesService {
  constructor(
    private readonly repository: CasesRepository,
    private readonly cache: CasesCacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateCaseDto) {
    const created = await this.repository.create(dto.customerId, dto.loanId);
    if (!created) {
      throw new BadRequestException(
        'Loan not found or does not belong to the specified customer',
      );
    }
    this.eventEmitter.emit(CASE_EVENTS.MUTATED);
    return created;
  }

  async list(query: ListCasesQueryDto) {
    const cached = await this.cache.getList(query);
    if (cached) return cached as Awaited<ReturnType<CasesRepository['findMany']>>;

    const result = await this.repository.findMany(query);
    await this.cache.setList(query, result);
    return result;
  }

  async getById(id: number) {
    const c = await this.repository.findById(id);
    if (!c) throw new NotFoundException(`Case ${id} not found`);
    return c;
  }

  async getKpis() {
    const cached = await this.cache.getKpis();
    if (cached) return cached;

    const result = await this.repository.getKpis();
    await this.cache.setKpis(result);
    return result;
  }

  async getLoansAvailableForCase() {
    return this.repository.findLoansAvailableForCase();
  }
}

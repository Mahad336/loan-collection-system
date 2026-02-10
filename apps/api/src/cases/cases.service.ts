import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CasesRepository } from './cases.repository';
import type { CreateCaseDto, ListCasesQueryDto } from '@collections/shared';

@Injectable()
export class CasesService {
  constructor(private readonly repository: CasesRepository) {}

  async create(dto: CreateCaseDto) {
    const created = await this.repository.create(dto.customerId, dto.loanId);
    if (!created) {
      throw new BadRequestException(
        'Loan not found or does not belong to the specified customer',
      );
    }
    return created;
  }

  async list(query: ListCasesQueryDto) {
    return this.repository.findMany(query);
  }

  async getById(id: number) {
    const c = await this.repository.findById(id);
    if (!c) throw new NotFoundException(`Case ${id} not found`);
    return c;
  }

  async getKpis() {
    return this.repository.getKpis();
  }

  async getLoansAvailableForCase() {
    return this.repository.findLoansAvailableForCase();
  }
}

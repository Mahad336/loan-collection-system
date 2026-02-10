import { Controller, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { ParseIntPipe } from '@nestjs/common';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class AssignQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  expectedVersion?: number;
}

@ApiTags('Assignments')
@Controller('cases')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post(':id/assign')
  @ApiOperation({ summary: 'Run rules-based assignment for a case' })
  async assign(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: AssignQueryDto,
  ) {
    return this.assignmentsService.runAssignment(id, query.expectedVersion);
  }
}

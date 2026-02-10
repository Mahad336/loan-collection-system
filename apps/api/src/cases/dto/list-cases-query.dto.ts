import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CaseStage, CaseStatus } from '@collections/shared';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '@collections/shared';

export class ListCasesQueryDto {
  @ApiPropertyOptional({ enum: CaseStatus })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiPropertyOptional({ enum: CaseStage })
  @IsOptional()
  @IsEnum(CaseStage)
  stage?: CaseStage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  dpdMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  dpdMax?: number;

  @ApiPropertyOptional({ description: 'Filter by assigned agent (exact match)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' || value == null ? undefined : String(value).trim()))
  assignedTo?: string;

  @ApiPropertyOptional({ default: DEFAULT_PAGE })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  @Type(() => Number)
  limit?: number = DEFAULT_LIMIT;
}

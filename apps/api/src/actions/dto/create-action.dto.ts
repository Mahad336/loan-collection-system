import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActionType, ActionOutcome } from '@collections/shared';

export class CreateActionDto {
  @ApiProperty({ enum: ActionType })
  @IsEnum(ActionType)
  type: ActionType;

  @ApiProperty({ enum: ActionOutcome })
  @IsEnum(ActionOutcome)
  outcome: ActionOutcome;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

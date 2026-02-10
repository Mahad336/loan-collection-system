import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateCaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  customerId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  loanId: number;
}

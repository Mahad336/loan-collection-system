import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { ListCasesQueryDto } from './dto/list-cases-query.dto';

@ApiTags('Cases')
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a delinquency case' })
  create(@Body() dto: CreateCaseDto) {
    return this.casesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List cases with filters and pagination' })
  list(@Query() query: ListCasesQueryDto) {
    return this.casesService.list(query);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get KPI counts for dashboard' })
  kpis() {
    return this.casesService.getKpis();
  }

  @Get('available-loans')
  @ApiOperation({ summary: 'Get delinquent loans without open case (for create case form)' })
  availableLoans() {
    return this.casesService.getLoansAvailableForCase();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case details' })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.getById(id);
  }
}

import { Controller, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';

@ApiTags('Cases')
@Controller('cases')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post(':id/actions')
  @ApiOperation({ summary: 'Add action log to a case' })
  addAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateActionDto,
  ) {
    return this.actionsService.addAction(id, dto);
  }
}

import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@ApiTags('Cases')
@Controller('cases')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':id/notice.pdf')
  @ApiOperation({ summary: 'Generate payment reminder PDF' })
  async getNotice(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generateNotice(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="notice-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}

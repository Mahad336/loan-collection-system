import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generateNotice(caseId: number): Promise<Buffer> {
    const c = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        customer: true,
        loan: true,
        actionLogs: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    });

    if (!c) throw new NotFoundException(`Case ${caseId} not found`);

    const payBeforeDate = new Date();
    payBeforeDate.setDate(payBeforeDate.getDate() + 3);
    const generatedAt = new Date().toISOString();

    const html = this.buildHtml({
      customer: c.customer,
      loan: c.loan,
      case: c,
      lastActions: c.actionLogs,
      payBeforeDate: payBeforeDate.toLocaleDateString(),
      generatedAt,
    });

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private buildHtml(data: {
    customer: { name: string; phone: string; email: string };
    loan: { principal: number; outstanding: number; dueDate: Date };
    case: { dpd: number; stage: string; assignedTo: string | null };
    lastActions: { type: string; outcome: string; notes: string | null; createdAt: Date }[];
    payBeforeDate: string;
    generatedAt: string;
  }): string {
    const actionsRows = data.lastActions
      .map(
        (a) =>
          `<tr><td>${a.type}</td><td>${a.outcome}</td><td>${a.notes ?? '-'}</td><td>${new Date(a.createdAt).toLocaleString()}</td></tr>`,
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
    .logo { font-size: 18px; font-weight: bold; color: #2563eb; }
    h2 { color: #1e40af; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
    .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
    .notice { background: #fef3c7; padding: 12px; border-radius: 4px; margin: 16px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Collections Dept. - Payment Reminder</div>
  </div>

  <h2>Customer Information</h2>
  <table>
    <tr><th>Name</th><td>${data.customer.name}</td></tr>
    <tr><th>Phone</th><td>${data.customer.phone}</td></tr>
    <tr><th>Email</th><td>${data.customer.email}</td></tr>
  </table>

  <h2>Loan Information</h2>
  <table>
    <tr><th>Principal</th><td>$${data.loan.principal.toLocaleString()}</td></tr>
    <tr><th>Outstanding</th><td>$${data.loan.outstanding.toLocaleString()}</td></tr>
    <tr><th>Due Date</th><td>${new Date(data.loan.dueDate).toLocaleDateString()}</td></tr>
  </table>

  <h2>Case Details</h2>
  <table>
    <tr><th>DPD</th><td>${data.case.dpd} days</td></tr>
    <tr><th>Stage</th><td>${data.case.stage}</td></tr>
    <tr><th>Assigned Agent</th><td>${data.case.assignedTo ?? 'Unassigned'}</td></tr>
  </table>

  <h2>Last 3 Actions</h2>
  <table>
    <thead><tr><th>Type</th><th>Outcome</th><th>Notes</th><th>Date</th></tr></thead>
    <tbody>${actionsRows || '<tr><td colspan="4">No actions recorded</td></tr>'}</tbody>
  </table>

  <div class="notice">
    Please pay before: ${data.payBeforeDate}
  </div>

  <div class="footer">
    Generated: ${data.generatedAt}
  </div>
</body>
</html>`;
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        country: 'US',
        riskScore: 45,
      },
    }),
    prisma.customer.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Jane Smith',
        phone: '+1987654321',
        email: 'jane@example.com',
        country: 'US',
        riskScore: 92,
      },
    }),
    prisma.customer.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: 'Bob Wilson',
        phone: '+1555123456',
        email: 'bob@example.com',
        country: 'US',
        riskScore: 65,
      },
    }),
  ]);

  const today = new Date();
  const dueDate1 = new Date(today);
  dueDate1.setDate(dueDate1.getDate() - 5);
  const dueDate2 = new Date(today);
  dueDate2.setDate(dueDate2.getDate() - 20);
  const dueDate3 = new Date(today);
  dueDate3.setDate(dueDate3.getDate() - 45);

  // Create loans
  const loans = await Promise.all([
    prisma.loan.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        customerId: 1,
        principal: 10000,
        outstanding: 8500,
        dueDate: dueDate1,
        status: 'DELINQUENT',
      },
    }),
    prisma.loan.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        customerId: 2,
        principal: 25000,
        outstanding: 22000,
        dueDate: dueDate2,
        status: 'DELINQUENT',
      },
    }),
    prisma.loan.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        customerId: 3,
        principal: 5000,
        outstanding: 4500,
        dueDate: dueDate3,
        status: 'DELINQUENT',
      },
    }),
  ]);

  // Create rules
  const rules = [
    {
      ruleId: 'DPD_1_7',
      priority: 1,
      enabled: true,
      condition: { type: 'between', field: 'case.dpd', min: 1, max: 7 },
      actions: [
        { field: 'stage', value: 'SOFT' },
        { field: 'assignGroup', value: 'Tier1' },
      ],
      overridePrevious: false,
    },
    {
      ruleId: 'DPD_8_30',
      priority: 2,
      enabled: true,
      condition: { type: 'between', field: 'case.dpd', min: 8, max: 30 },
      actions: [
        { field: 'stage', value: 'HARD' },
        { field: 'assignGroup', value: 'Tier2' },
      ],
      overridePrevious: false,
    },
    {
      ruleId: 'DPD_GT_30',
      priority: 3,
      enabled: true,
      condition: { type: 'gt', field: 'case.dpd', value: 30 },
      actions: [
        { field: 'stage', value: 'LEGAL' },
        { field: 'assignGroup', value: 'Legal' },
      ],
      overridePrevious: false,
    },
    {
      ruleId: 'RISK_GT_80_OVERRIDE',
      priority: 10,
      enabled: true,
      condition: { type: 'gt', field: 'customer.riskScore', value: 80 },
      actions: [{ field: 'assignedTo', value: 'SeniorAgent' }],
      overridePrevious: true,
    },
  ];

  for (const rule of rules) {
    await prisma.rule.upsert({
      where: { ruleId: rule.ruleId },
      update: rule,
      create: rule,
    });
  }

  // Create cases
  const cases = await Promise.all([
    prisma.case.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        customerId: 1,
        loanId: 1,
        dpd: 5,
        stage: 'SOFT',
        status: 'OPEN',
        assignedTo: null,
      },
    }),
    prisma.case.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        customerId: 2,
        loanId: 2,
        dpd: 20,
        stage: 'HARD',
        status: 'IN_PROGRESS',
        assignedTo: 'SeniorAgent',
      },
    }),
    prisma.case.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        customerId: 3,
        loanId: 3,
        dpd: 45,
        stage: 'LEGAL',
        status: 'OPEN',
        assignedTo: null,
      },
    }),
  ]);

  // Add some action logs
  await prisma.actionLog.createMany({
    data: [
      { caseId: 1, type: 'CALL', outcome: 'NO_ANSWER', notes: 'Left voicemail' },
      { caseId: 2, type: 'CALL', outcome: 'PROMISE_TO_PAY', notes: 'Customer promised to pay Friday' },
      { caseId: 2, type: 'SMS', outcome: 'NO_ANSWER', notes: 'Sent reminder SMS' },
    ],
    skipDuplicates: true,
  });

  // Reset sequences after explicit IDs (PostgreSQL doesn't auto-update them)
  await prisma.$executeRaw`SELECT setval('cases_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cases))`;
  await prisma.$executeRaw`SELECT setval('customers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM customers))`;
  await prisma.$executeRaw`SELECT setval('loans_id_seq', (SELECT COALESCE(MAX(id), 1) FROM loans))`;
  await prisma.$executeRaw`SELECT setval('action_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM action_logs))`;

  console.log('Seed completed:', {
    customers: customers.length,
    loans: loans.length,
    rules: rules.length,
    cases: cases.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

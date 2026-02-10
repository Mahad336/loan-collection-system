-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "risk_score" INTEGER NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "outstanding" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "dpd" INTEGER NOT NULL DEFAULT 0,
    "stage" TEXT NOT NULL DEFAULT 'SOFT',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assigned_to" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_logs" (
    "id" SERIAL NOT NULL,
    "case_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "rule_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "condition" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "override_previous" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("rule_id")
);

-- CreateTable
CREATE TABLE "rule_decisions" (
    "id" SERIAL NOT NULL,
    "case_id" INTEGER NOT NULL,
    "matched_rules" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loans_customer_id_idx" ON "loans"("customer_id");

-- CreateIndex
CREATE INDEX "cases_status_stage_dpd_idx" ON "cases"("status", "stage", "dpd");

-- CreateIndex
CREATE INDEX "cases_assigned_to_idx" ON "cases"("assigned_to");

-- CreateIndex
CREATE INDEX "action_logs_case_id_created_at_idx" ON "action_logs"("case_id", "created_at");

-- CreateIndex
CREATE INDEX "rules_enabled_priority_idx" ON "rules"("enabled", "priority");

-- CreateIndex
CREATE INDEX "rule_decisions_case_id_idx" ON "rule_decisions"("case_id");

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_decisions" ADD CONSTRAINT "rule_decisions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

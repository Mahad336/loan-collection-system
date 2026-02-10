# Collections Case Manager

A loan collections case management system with rules-based auto-assignment, action logging, and PDF notice generation.

## Environment (Monorepo)

Single root `.env` at project root. All apps load it via:
- **API:** `dotenv` in `main.ts`
- **Prisma:** `dotenv-cli` in npm scripts
- **Web:** `dotenv-cli` in npm scripts

## Tech Stack

- **Backend:** NestJS (TypeScript)
- **Frontend:** Next.js (React)
- **Database:** PostgreSQL + Prisma
- **PDF:** Puppeteer (HTML to PDF)
- **Run:** Docker Compose

## Quick Start

```bash
# Start everything (PostgreSQL, API, Web)
docker-compose up
```

- **API:** http://localhost:3001
- **Swagger:** http://localhost:3001/api/docs
- **Web:** http://localhost:3000 (port 3000; API uses 3001)

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or use Docker for Postgres only)

### Setup

```bash
# Install dependencies (Puppeteer may take a few minutes to download Chrome)
# For Docker-only usage: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
npm install

# Build shared package
npm run build:shared

# Setup database (ensure Postgres is running)
cp .env.example .env    # Single root .env for monorepo

cd apps/api
npx prisma migrate deploy
npx prisma db seed
cd ../..

# Run API (from root or apps/api)
npm run dev:api
# Or: cd apps/api && npm run start:dev

# Run Web (in another terminal)
npm run dev:web
# Or: cd apps/web && npm run dev
```

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/cases | Create a case |
| GET | /api/cases | List cases (filters, pagination) |
| GET | /api/cases/kpis | Dashboard KPIs |
| GET | /api/cases/:id | Get case details |
| POST | /api/cases/:id/actions | Add action log |
| POST | /api/cases/:id/assign | Run rules-based assignment |
| GET | /api/cases/:id/notice.pdf | Generate PDF notice |

## Rules Engine

Rules are stored in the database and evaluated by priority:

| Rule | Condition | Action |
|------|-----------|--------|
| DPD_1_7 | dpd 1-7 | stage=SOFT, assignGroup=Tier1 |
| DPD_8_30 | dpd 8-30 | stage=HARD, assignGroup=Tier2 |
| DPD_GT_30 | dpd > 30 | stage=LEGAL, assignGroup=Legal |
| RISK_GT_80_OVERRIDE | riskScore > 80 | assignedTo=SeniorAgent (override) |

## Architecture

- **packages/shared:** Types, interfaces, DTOs shared between API and Web
- **apps/api:** NestJS backend with modular structure
- **apps/web:** Next.js frontend

### SOLID Principles

- **Single Responsibility:** Each service/repository has one concern
- **Open/Closed:** Rule engine condition types are extensible
- **Dependency Inversion:** Services depend on abstractions (Prisma via DI)

### Bonus Features

- **Daily Case Creation:** Cron at 1:30 AM creates cases for delinquent loans without an open case
- **Daily DPD Recalculation:** Cron at 2 AM updates DPD and auto-escalates unassigned cases
- **Optimistic Locking:** `expectedVersion` query param on assignment for conflict detection

## Project Structure

```
├── apps/
│   ├── api/          # NestJS
│   │   ├── prisma/
│   │   └── src/
│   │       ├── cases/
│   │       ├── actions/
│   │       ├── assignments/
│   │       ├── rules/
│   │       ├── pdf/
│   │       └── scheduler/
│   └── web/          # Next.js
├── packages/
│   └── shared/       # Shared types
└── docker-compose.yml
```

## Postman / cURL Examples

```bash
# Create case
curl -X POST http://localhost:3001/api/cases \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "loanId": 1}'

# List cases
curl "http://localhost:3001/api/cases?page=1&limit=10"

# Run assignment
curl -X POST http://localhost:3001/api/cases/1/assign

# Add action
curl -X POST http://localhost:3001/api/cases/1/actions \
  -H "Content-Type: application/json" \
  -d '{"type": "CALL", "outcome": "PROMISE_TO_PAY", "notes": "Customer promised Friday"}'

# Download PDF
curl http://localhost:3001/api/cases/1/notice.pdf -o notice.pdf
```

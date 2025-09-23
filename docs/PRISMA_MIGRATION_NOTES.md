# CRM2 Prisma Migration Notes (Windows PowerShell Safe)

These notes outline how to introduce minimal CRM2 tables to Prisma while keeping current JSON fallbacks working. Commands are shown as simple, short PowerShell-safe lines (no chaining).

## 0) Prerequisites
- Ensure `DATABASE_URL` is set in `.env` and on Vercel Project Settings.
- Local Postgres is reachable, or use a managed Postgres.
- Prisma CLI installed (via devDependency).

Check versions:

```bash
npx prisma -v
```

## 1) Backup (recommended)
If you have `pg_dump` available:

```bash
pg_dump --dbname=%DATABASE_URL% --format=custom --file=backup_before_crm2.dump
```

If not, at least create a manual restore-point branch in Git:

```bash
git status
git checkout -b crm2-migration-restore-point
git status
```

## 2) Minimal models to add to `prisma/schema.prisma`
Add the following new models at the bottom of the schema to avoid touching existing models. Field names are conservative and nullable where useful to prevent breaking changes.

```prisma
model Company {
  id         String    @id @default(cuid())
  name       String
  domain     String?   @unique
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  contacts   Contact[]
  leads      Lead[]
}

model Contact {
  id         String    @id @default(cuid())
  companyId  String?
  company    Company?  @relation(fields: [companyId], references: [id])
  name       String
  email      String?
  phone      String?
  title      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

enum LeadStage {
  NEW
  QUALIFIED
  VIEWING
  APPLICATION
  SCREENING
  OFFER
  LEASE_SENT
  SIGNED
  MOVE_IN
}

model Lead {
  id         String     @id @default(cuid())
  companyId  String?
  company    Company?   @relation(fields: [companyId], references: [id])
  name       String
  email      String?
  phone      String?
  city       String?
  budgetCents Int?
  stage      LeadStage  @default(NEW)
  userId     String?    // link to existing User if/when available
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  deals      Deal[]
}

enum DealStatus {
  DRAFT
  SENT
  SIGNED
  DECLINED
}

model Deal {
  id              String    @id @default(cuid())
  leadId          String
  lead            Lead      @relation(fields: [leadId], references: [id])
  propertyId      String?   // link to Property if present in schema
  termMonths      Int?
  monthlyRateCents Int?
  depositCents    Int?
  moveInFeeCents  Int?
  startDate       DateTime?
  status          DealStatus @default(DRAFT)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}
```

Notes:
- These models align with the current `/crm2` UI and APIs, which already support JSON fallback.
- After migration, you can gradually flip APIs to Prisma-backed reads/writes.

## 3) Validate and format

```bash
npx prisma format
npx prisma validate
```

## 4) Create the migration (development)

```bash
npx prisma migrate dev --name crm2_models
npx prisma generate
```

This creates a new migration folder under `prisma/migrations` and updates the Prisma Client.

## 5) Flip APIs from JSON fallback to Prisma (incremental)
The CRM2 API routes already use a JSON fallback pattern. After the migration is applied in your environment(s):

- Update the guards in these routes to prefer Prisma when available:
  - `src/app/api/crm2/leads/route.ts`
  - `src/app/api/crm2/companies/route.ts`
  - `src/app/api/crm2/companies/[id]/route.ts`
  - `src/app/api/crm2/deals/route.ts`
  - `src/app/api/crm2/deals/[id]/route.ts`
  - `src/app/api/crm2/activities/route.ts` (optional if you add an Activity model later)

Recommended pattern:

```ts
// pseudo-code
const prismaAvailable = !!process.env.DATABASE_URL
if (prismaAvailable) {
  // use prisma.*
} else {
  // use JSON fallback
}
```

Keep the JSON fallback in place until production is fully verified.

## 6) Deploy to Vercel
Verify `package.json` contains a postinstall or build step that runs `prisma generate` (already set up). Ensure `DATABASE_URL` is configured in Vercel.

Push to GitHub and let Vercel auto-deploy.

## 7) Post-migration checks
- `npx prisma studio` (optional) to inspect tables.
- Exercise `/crm2` flows: create lead, send quote, edit quote, create booking draft.
- Open `/crm2/company/<id>` to edit company + contacts.

## 8) Rollback strategy
- Development: `git revert` the schema edit and run `npx prisma migrate reset` (dev only; this resets data).
- Production: create a new migration that drops or adjusts the new tables/columns as needed. Do not run reset in production.

## 9) Windows PowerShell safe Git flow (reference)
Use short, simple commands without chaining:

```bash
git status
git add prisma/schema.prisma
git add prisma/migrations
git commit -m crm2-prisma-models
git push origin main
```

If anything fails, run `git status` immediately and proceed with a simpler next step.

---

This document enables a safe, incremental path to migrate CRM2 to Prisma without blocking ongoing work or risking production stability.



## Repository FAQ – Auth, Data Models, Error Handling

### Overview
This project is a Next.js 14 app using Prisma (PostgreSQL) and NextAuth. Admin tools, CRM, sales analytics, and support tickets are integrated with a premium black–silver UI theme.

---

### Authentication
- **Library**: NextAuth (Credentials + Google OAuth)
- **Sessions**: Secure cookies; middleware protects `\`/admin` and related routes
- **Admin Login**:
  - Username-based credential login supported (case-insensitive)
  - Configure via environment variables (recommended):
    - `ADMIN_USERNAME`, `ADMIN_PASSWORD`
  - Admin pages rely on NextAuth session state + middleware guard
- **Tenant Auth**:
  - Email/password registration stored in PostgreSQL via Prisma
  - Auto-login after successful registration
  - Optional Google OAuth (set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- **NextAuth URLs**:
  - Ensure `NEXTAUTH_URL` is set for local and production
  - Set `NEXTAUTH_SECRET` in all environments

Common auth files of interest:
- `src/lib/authOptions.ts` – NextAuth providers and callbacks
- `src/middleware.ts` – route protection for admin surface
- `src/app/register/page.tsx`, `src/app/login/page.tsx`, `src/app/admin/login/page.tsx`

---

### Data Models (Prisma)
Key models used throughout the app (non-exhaustive):
- `User` – NextAuth users (tenants and admin)
- `Property` – listings with address, monthly price, and metadata
- `Booking` – reservation window with `status` (hold, confirmed, cancelled)
- `Payment` – linked to `Booking`; fields include `purpose` (deposit, move_in_fee, first_period, monthly_rent), `status` (scheduled, received, refunded), amounts in cents, `dueAt`/`receivedAt`
- `SupportTicket` – tenant support tickets (title, status, priority, createdBy)
- `SupportMessage` – thread messages linked to a ticket and a user
- `AdminOverride`/CMS Page data – for admin-managed content and overrides

Notes:
- Amounts use cents (integers) for precision
- Deposit logic: unpaid deposit appears in Scheduled; paid/refunded appears in Payment Received with clear theming
- Bookings/table UIs show compact pills for created date, client, dates, payment states

Prisma locations:
- Schema: `prisma/schema.prisma`
- Client usage: various `src/app/api/**` and server components

Local DB tips:
- Migrate: `npx prisma migrate dev`
- Generate: `npx prisma generate`
- Studio: `npx prisma studio`

---

### Error Handling
- **API routes**: return JSON `{ ok: boolean, data?, error? }` with appropriate HTTP status; validate inputs and coerce numbers safely
- **UI**: prefer guard clauses and render fallbacks where data may be missing; avoid deep nesting
- **Payments & Totals**: calculations are idempotent and recompute endpoints are server-only
- **Weather**: Open‑Meteo is the primary source; in-memory caching with short TTL; widget hides if API fails
- **Support chat**: optimistic UI updates with quick API confirmation; keep messages persistent via Prisma

Common runtime/build issues and fixes:
- “Cannot find module ./vendor-chunks/next-auth.js” or missing Webpack chunk errors
  - Clear `.next`, restart dev server, ensure dependencies are installed
- “Unexpected token main. Expected jsx identifier”
  - Usually caused by duplicate JSX or mismatched tags; fix component structure
- Stuck/hanging dev server after heavy edits
  - Stop all dev processes; delete `.next`; restart

---

### Local Development
- Required env (local):
  - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - For Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Optional keys: Maps etc. (feature-dependent)
- Start dev: `npm run dev` (or `pnpm dev`)
- Type safety: keep TS strict; avoid `any` in shared APIs

---

### Contributing Conventions
- Use short, ASCII-only commit messages
- Keep UI changes lint-clean and consistent with premium theme
- Prefer server-side data fetching for admin dashboards; avoid client waterfalls

---

### Where to Look (Quick Map)
- Admin dashboards: `src/app/admin/**`
- Bookings: `src/app/admin/bookings/page.tsx` + related APIs
- CRM: `src/app/crm/page.tsx` + `src/app/api/admin/**`
- Sales analytics: `src/app/sales-analytics/page.tsx`
- Support: `src/app/support-dashboard/page.tsx`, `src/app/api/support/**`
- Weather: `src/app/api/weather/route.ts`, `src/components/WeatherWidget.tsx`



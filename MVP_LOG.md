# Berlin Luxe Rentals — MVP Log

## Major accomplishments to date

- Admin bookings UI/UX
  - Scoreboard pills (Total, Hold, Confirmed, Cancelled) with filtering and accurate global counts
  - Deposit logic (held/received/refunded) with fallbacks; refund action post‑checkout
  - Mobile card layout, pagination, safer column widths; fixed Save button clipping
- Performance and stability
  - Homepage converted to Server Component; dynamic imports; reduced JS
  - Next dev startup hardened (cache clean to resolve RSC manifest issues)
  - Admin dashboard data fetched in parallel; loading guards added
- Mapping and UX polish
  - Spy Europe Map hover/zoom smoothing, debounce, larger hover area
- Authentication
  - Admin login flow stabilized (replace navigation to ensure cookie is seen by middleware)
- One‑click environment setup
  - start‑server.bat: env bootstrap, Prisma generate + migrate deploy (db push fallback), safe seed, Docker db up, cache clean, port auto‑select, reuse detection
  - start‑server‑desktop.bat: location discovery + delegation
  - Restore point tooling: backup PowerShell script, commit + tag convention
- Data/ORM
  - Prisma schema + migrations + seed in place; booking/payment models refined
- Observability & prod readiness (MVP)
  - Health endpoint: /api/health pings DB
  - Env validator: fails fast in production if DATABASE_URL missing
  - docker‑compose.prod.yml and start‑prod.bat scaffolding (prod build blockers identified)

## Feature catalog (to date)

- Homepage
  - Server Component with dynamic imports for `About`, `Locations`, `Footer` to reduce initial bundle
  - Hero video optimized (preload=metadata); spy‑theme styling, CTAs converted to `Link` for RSC compliance
  - Image domains configured in `next.config.js`
- Search & discovery
  - `SearchInterface` for destination/service/date inputs with validation and responsive layout
  - Date range selection components: `PublicCalendar` and `MiniDateRange` for consistent UX
  - Duration display and labels (e.g., 1st/2nd month rent) wired to booking logic
- Calendars
  - Admin Test Booking Bar calendar: fixed navigation by layering (`z-index`) and `pointer-events-none` on decorative blur
  - Property availability calendar for admin property pages (month navigation, availability rendering)
- Animations & visual polish
  - Admin login “gold matrix” canvas animation
  - Spy Europe Map interaction: larger hover target, 100ms debounce, smoother zoom/easing, unmount cleanup
  - Smoother transitions across admin tiles; typography/spacing pass on metrics
- Payments & billing
  - Deposit status rendering: Held / Received (green) / Refunded (blue) with fallback for legacy data
  - Scheduled payments list with larger, readable date/labels/amounts; hidden for “Hold” to avoid confusion
  - Refund deposit action enabled on/after checkout (server API wired)
  - Accurate scoreboard counts via Prisma `count()` per status, independent of current filter
- Admin dashboards
  - Bookings: interactive scoreboard pills with querystring filters and preserved pagination
  - CRM: mobile‑friendly card layout, Most Profitable Cities tile moved and resized; consistent typography
  - MVP Progress tile: comprehensive plan, progress bar, localStorage persistence with versioning
- Auth & middleware
  - Admin login API with cookie `admin_auth`; middleware guards `/admin` and redirects to `/admin/login` with `next` param
  - Immediate navigation on login to ensure middleware reads cookie
- Infrastructure & DevX
  - One‑click scripts: port selection and reuse detection; restore skips startup scripts and heavy folders
  - Dockerized Postgres with volume + healthcheck; Prisma generate/migrate on start; safe seed
  - Backup/restore PowerShell zip; Git commit/tag checkpoints
- Observability
  - `/api/health` DB ping endpoint for uptime checks; basic env validation added

## Rolling MVP task log

- 2025‑09‑14
  - Hardened one‑click scripts: reuse detection, post‑launch health probe
  - Restore flow: skip start scripts/.next/node_modules/.git/backups; safer non‑destructive copy
  - Added env validator and /api/health; verified 200 locally
  - Added docker‑compose.prod.yml and start‑prod.bat (prod build surfaced hooks/route typing issues to fix next)
  - End‑to‑end fresh‑machine simulation passed: install → prisma → docker db → dev server on 3002/3003

## How to append new entries

Add a dated bullet under "Rolling MVP task log" describing:
- What changed (1–2 lines)
- Impact/user‑facing outcome
- Any follow‑ups or known issues

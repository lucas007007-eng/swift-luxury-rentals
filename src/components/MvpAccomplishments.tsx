"use client"

import React from 'react'

export default function MvpAccomplishments() {
  const [open, setOpen] = React.useState(false)

  const frontend: { title: string; items: string[] }[] = [
    {
      title: 'Site structure and pages',
      items: [
        'Homepage (Server Component) with optimized hero video and dynamic imports',
        'City pages (/city/[cityName]) and Property pages (/property/[id])',
        'Concierge, About, Contact, Pricing, Corporate Rentals, List Your Property, Request, Login, Register, Privacy, Terms, Cookie Policy',
      ],
    },
    {
      title: 'City filters',
      items: [
        'Airbnb-style filter modal on city pages (beds, baths, amenities)',
        'Categorized amenity chips (Popular, Essentials, Features, Safety)',
        'Filter button aligned with search bar; fully mobile-friendly modal',
        'Dynamic results count in footer (real-time updates before apply)'
      ],
    },
    {
      title: 'Search & calendars',
      items: [
        'Search interface (destination, service, date range), responsive layout',
        'Public date‑range pickers (full and mini)',
        'Duration labels (1st/2nd month, day counts) linked to booking logic',
      ],
    },
    {
      title: 'Property detail UX',
      items: [
        'Image gallery with modal viewer',
        'Availability display aligned with booking logic',
      ],
    },
    {
      title: 'Performance & navigation',
      items: [
        'RSC‑safe navigation (buttons → Link)',
        'Dynamic imports to reduce initial JS; hero video preload=metadata',
        'Remote image domains configured in Next image settings',
        'Service Worker implementation with offline caching and fallback pages',
      ],
    },
  ]

  const admin: { title: string; items: string[] }[] = [
    { title: 'Visuals & UX (admin only)', items: [
      'Spy‑theme styling across admin surfaces',
      'Mobile‑first cards/grids; consistent spacing & typography on metrics/payment sections',
      'Map interaction polish (smoother hover/zoom, debounced, cleanup)',
    ]},
    { title: 'Filters & amenities', items: [
      'Master amenities derived from berlin-real-1 (overrides + base)',
      'Case-insensitive amenity matching with synonyms for reliable filtering',
      'Public property page: expanded amenity categorization and rendering',
      'Search footer shows accurate live results count',
    ]},
    { title: 'Admin auth & routing', items: [
      'Admin login API sets admin_auth; middleware guard on /admin',
      'Immediate navigation on login so auth is recognized',
      'Environment-based credentials (ADMIN_USERNAME/ADMIN_PASSWORD)',
      'Rate limiting: max 5 attempts per IP per 15 minutes',
      'Secure cookies: httpOnly, secure in production, 24-hour expiry',
      'Logout functionality with /api/admin/logout endpoint and dashboard button',
    ]},
    { title: 'Bookings operations', items: [
      'Status updates (Hold/Confirmed/Cancelled) with Save',
      'Deposit lifecycle: Held → Received (green) → Refunded (blue, post‑checkout)',
      'Tools: create booking, delete, receive next/selected, refund deposit',
      'Seed/backfill utilities; Test Booking Bar calendar fixed (navigation layering)',
      'Safer recompute totals: server-only, idempotent, comprehensive logging, dry-run mode',
      'Synthesize payments fixed: only processes confirmed bookings, never marks holds as paid',
      'Hold booking payment corruption fixed: cleanup endpoint reverted incorrect received payments',
    ]},
    { title: 'Admin bookings UI', items: [
      'Scoreboard pills (Total/Hold/Confirmed/Cancelled) with accurate global counts and filtering',
      'Pagination, preserved filters, mobile card layout',
      'Scheduled payments hidden on Hold; Save button clipping fixed',
      'Responsive table: proportional column widths (10-18%), no cropping on any screen size',
      'Refund button logic fixed: appears correctly for deposits showing "Deposit Received"',
    ]},
    { title: 'CRM & analytics', items: [
      'CRM dashboard (table + mobile cards) linking to bookings/properties',
      'Most Profitable Cities tile; sales metrics (upcoming payments, overdue)',
      'MVP Progress tracker (persisted with versioning)',
    ]},
    { title: 'Listings management (Admin)', items: [
      'Edit details: title, description, address, amenities',
      'Pricing controls: monthly rate, fees; scheduled charge preview',
      'Media management: add/remove photos, gallery ordering',
      'Per‑property availability calendar (month nav, availability set)',
      'Quick test booking creation via Admin Test Booking Bar',
    ]},
    { title: 'Data & ORM (Prisma)', items: [
      'Prisma schema, migrations, seeds; refined booking/payment models',
      'Scoreboard counts via direct DB queries (decoupled from filters)',
      'AdminOverride model added to DB with JSON fallback for backward compatibility',
      'Performance indexes added: Booking (status, checkin), Payment (bookingId, purpose, status, dueAt)',
      'Data model hardening: booking validation (dates, overlaps), soft delete with audit trail',
    ]},
    { title: 'One‑click environment & restore', items: [
      'start‑server.bat: env bootstrap, Prisma generate/migrate (db push fallback), safe seed, Docker Postgres, cache clean, port auto‑select, running‑server reuse, post‑launch health probe',
      'start‑server‑desktop.bat: project discovery + delegation',
      'Backup/restore: zip snapshots; restore skips startup scripts and heavy folders',
    ]},
    { title: 'Observability & prod readiness', items: [
      '/api/health DB‑ping endpoint',
      'Env validator (production fails fast if DATABASE_URL missing)',
      'docker‑compose.prod.yml and start‑prod.bat scaffolding',
      'Production build blockers fixed: dynamic force-dynamic for useSearchParams pages',
      'Production deployment fully working: build completes, server starts and responds',
      'Development Timer: database-backed with real-time persistence and live seconds tracking',
      'Timer persistence perfected: beforeunload auto-save with exact session continuity across refreshes',
      'Timer performance optimized: eliminated database spam, pure localStorage with exact seconds tracking',
      'Component expand/collapse independence fixed (preventDefault + stopPropagation)',
      'Accomplishments UI improved: full-width layout and checkbox-style readability',
    ]},
  ]

  // Compute balanced split for Admin sections
  const frontendWeight = frontend.reduce((sum, sec) => sum + 1 + sec.items.length, 0)
  const adminWeights = admin.map(sec => 1 + sec.items.length)
  const totalAdminWeight = adminWeights.reduce((a,b)=>a+b,0)
  let leftWeight = frontendWeight
  let rightWeight = totalAdminWeight
  const adminLeft: typeof admin = []
  const adminRight: typeof admin = []
  for (let i = 0; i < admin.length; i++) {
    const w = adminWeights[i]
    if (leftWeight < rightWeight) { adminLeft.push(admin[i]); leftWeight += w; rightWeight -= w } else { adminRight.push(admin[i]) }
  }
  if (adminRight.length === 0) { const moved = adminLeft.pop(); if (moved) adminRight.push(moved) }

  return (
    <div className="rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(v => !v)
        }}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono uppercase tracking-wider text-base md:text-lg gold-metallic-text">Accomplishments</div>
            <div className="text-white/80 text-sm">All completed MVP features (Frontend & Admin)</div>
          </div>
          <svg className={`w-5 h-5 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </button>
      {open && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column: Frontend + part of Admin */}
          <div className="space-y-4">
            <div className="rounded-xl p-4 border border-emerald-400/20 bg-gradient-to-br from-[#0b1a12] to-[#08120d]">
              <div className="font-mono uppercase tracking-wider text-base text-emerald-400 mb-3 font-bold">Frontend (Public)</div>
              <div className="space-y-3">
                {frontend.map((sec) => (
                  <div key={sec.title}>
                    <div className="text-emerald-300 font-semibold text-sm mb-2">{sec.title}</div>
                    <div className="grid grid-cols-1 gap-1">
                      {sec.items.map((it, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-white/80">
                          <input type="checkbox" checked={true} readOnly className="accent-emerald-500" />
                          <span>{it}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {adminLeft.length > 0 && (
              <div className="rounded-xl p-4 border border-emerald-400/20 bg-gradient-to-br from-[#0b1a12] to-[#08120d]">
                <div className="font-mono uppercase tracking-wider text-base text-emerald-400 mb-3 font-bold">Admin / Backend</div>
                <div className="space-y-3">
                  {adminLeft.map((sec) => (
                    <div key={sec.title}>
                      <div className="text-emerald-300 font-semibold text-sm mb-2">{sec.title}</div>
                      <div className="grid grid-cols-1 gap-1">
                        {sec.items.map((it, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm text-white/80">
                            <input type="checkbox" checked={true} readOnly className="accent-emerald-500" />
                            <span>{it}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Right column: remaining Admin */}
          <div className="rounded-xl p-4 border border-emerald-400/20 bg-gradient-to-br from-[#0b1a12] to-[#08120d]">
            <div className="font-mono uppercase tracking-wider text-base text-emerald-400 mb-3 font-bold">Admin / Backend</div>
            <div className="space-y-3">
              {(adminRight.length ? adminRight : admin).map((sec) => (
                <div key={sec.title}>
                  <div className="text-emerald-300 font-semibold text-sm mb-2">{sec.title}</div>
                  <div className="grid grid-cols-1 gap-1">
                    {sec.items.map((it, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm text-white/80">
                        <input type="checkbox" checked={true} readOnly className="accent-emerald-500" />
                        <span>{it}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

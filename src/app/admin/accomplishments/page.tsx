'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AccomplishmentsPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Complete skill tree with ALL achievements organized by category
  const skillTree = {
    'Frontend Core': {
      color: 'emerald',
      achievements: [
        { id: 'homepage', title: 'HOMEPAGE COMMANDER', xp: 500, desc: 'Homepage (Server Component) with optimized hero video and dynamic imports' },
        { id: 'pages', title: 'SITE ARCHITECT', xp: 400, desc: 'City pages (/city/[cityName]) and Property pages (/property/[id])' },
        { id: 'content', title: 'PAGE MASTER', xp: 200, desc: 'Concierge, About, Contact, Pricing, Corporate Rentals, List Your Property, Request, Login, Register, Privacy, Terms, Cookie Policy' },
        { id: 'navigation', title: 'NAV ARCHITECT', xp: 400, desc: 'RSC‑safe navigation (buttons → Link)' },
        { id: 'performance', title: 'PERFORMANCE KING', xp: 400, desc: 'Dynamic imports to reduce initial JS; hero video preload=metadata' },
        { id: 'images', title: 'IMAGE HANDLER', xp: 300, desc: 'Remote image domains configured in Next image settings' },
        { id: 'offline', title: 'OFFLINE GUARDIAN', xp: 500, desc: 'Service Worker implementation with offline caching and fallback pages' },
      ]
    },
    'UX & Filters': {
      color: 'blue',
      achievements: [
        { id: 'filters', title: 'FILTER SPECIALIST', xp: 500, desc: 'Airbnb-style filter modal on city pages (beds, baths, amenities)' },
        { id: 'amenities', title: 'UX TACTICIAN', xp: 400, desc: 'Categorized amenity chips (Popular, Essentials, Features, Safety)' },
        { id: 'mobile', title: 'MOBILE COMMANDER', xp: 300, desc: 'Filter button aligned with search bar; fully mobile-friendly modal' },
        { id: 'results', title: 'REAL-TIME GURU', xp: 300, desc: 'Dynamic results count in footer (real-time updates before apply)' },
        { id: 'gallery', title: 'GALLERY MASTER', xp: 400, desc: 'Image gallery with modal viewer' },
        { id: 'availability', title: 'BOOKING WIZARD', xp: 300, desc: 'Availability display aligned with booking logic' },
      ]
    },
    'Search & Calendar': {
      color: 'purple',
      achievements: [
        { id: 'search', title: 'SEARCH OPERATIVE', xp: 400, desc: 'Search interface (destination, service, date range), responsive layout' },
        { id: 'calendar', title: 'CALENDAR EXPERT', xp: 300, desc: 'Public date‑range pickers (full and mini)' },
        { id: 'time', title: 'TIME SPECIALIST', xp: 300, desc: 'Duration labels (1st/2nd month, day counts) linked to booking logic' },
      ]
    },
    'User Experience': {
      color: 'cyan',
      achievements: [
        { id: 'payment-ui', title: 'PAYMENT DESIGNER', xp: 500, desc: 'Luxury dark theme payment page with Pay Monthly vs Pay Full toggle' },
        { id: 'dashboard', title: 'DASHBOARD ARCHITECT', xp: 500, desc: 'Professional dashboard with tab navigation (Bookings, Lease Applications, Past)' },
        { id: 'booking-mgmt', title: 'UX STRATEGIST', xp: 400, desc: 'Smart booking categorization and payment management with 3-column layout' },
        { id: 'client-portal', title: 'CLIENT PORTAL MASTER', xp: 400, desc: 'User dashboard with Airbnb-style booking display and payment tracking' },
      ]
    },
    'Admin Security': {
      color: 'red',
      achievements: [
        { id: 'auth', title: 'AUTH COMMANDER', xp: 500, desc: 'Admin login API sets admin_auth; middleware guard on /admin' },
        { id: 'login', title: 'LOGIN SPECIALIST', xp: 300, desc: 'Immediate navigation on login so auth is recognized' },
        { id: 'config', title: 'CONFIG GUARDIAN', xp: 200, desc: 'Environment-based credentials (ADMIN_USERNAME/ADMIN_PASSWORD)' },
        { id: 'security', title: 'SECURITY SENTINEL', xp: 400, desc: 'Rate limiting: max 5 attempts per IP per 15 minutes' },
        { id: 'cookies', title: 'COOKIE DEFENDER', xp: 300, desc: 'Secure cookies: httpOnly, secure in production, 24-hour expiry' },
        { id: 'logout', title: 'SESSION TERMINATOR', xp: 200, desc: 'Logout functionality with /api/admin/logout endpoint and dashboard button' },
      ]
    },
    'Booking Operations': {
      color: 'amber',
      achievements: [
        { id: 'status', title: 'STATUS CONTROLLER', xp: 200, desc: 'Status updates (Hold/Confirmed/Cancelled) with Save' },
        { id: 'deposit', title: 'PAYMENT OVERLORD', xp: 400, desc: 'Deposit lifecycle: Held → Received (green) → Refunded (blue, post‑checkout)' },
        { id: 'tools', title: 'BOOKING ARCHITECT', xp: 300, desc: 'Tools: create booking, delete, receive next/selected, refund deposit' },
        { id: 'seed', title: 'DATA SEEDER', xp: 200, desc: 'Seed/backfill utilities; Test Booking Bar calendar fixed (navigation layering)' },
        { id: 'calc', title: 'CALC GUARDIAN', xp: 500, desc: 'Safer recompute totals: server-only, idempotent, comprehensive logging, dry-run mode' },
        { id: 'payment-fix', title: 'PAYMENT FIXER', xp: 200, desc: 'Synthesize payments fixed: only processes confirmed bookings, never marks holds as paid' },
        { id: 'corruption', title: 'CORRUPTION HUNTER', xp: 200, desc: 'Hold booking payment corruption fixed: cleanup endpoint reverted incorrect received payments' },
      ]
    },
    'Admin Interface': {
      color: 'green',
      achievements: [
        { id: 'spy-theme', title: 'STEALTH DESIGNER', xp: 300, desc: 'Spy‑theme styling across admin surfaces' },
        { id: 'mobile-ui', title: 'MOBILE TACTICIAN', xp: 300, desc: 'Mobile‑first cards/grids; consistent spacing & typography on metrics/payment sections' },
        { id: 'map', title: 'MAP SPECIALIST', xp: 300, desc: 'Map interaction polish (smoother hover/zoom, debounced, cleanup)' },
        { id: 'scoreboard', title: 'METRICS COMMANDER', xp: 300, desc: 'Scoreboard pills (Total/Hold/Confirmed/Cancelled) with accurate global counts and filtering' },
        { id: 'ui-strategy', title: 'UI STRATEGIST', xp: 300, desc: 'Pagination, preserved filters, mobile card layout' },
        { id: 'display', title: 'DISPLAY OPTIMIZER', xp: 200, desc: 'Scheduled payments hidden on Hold; Save button clipping fixed' },
        { id: 'table', title: 'TABLE MASTER', xp: 400, desc: 'Responsive table: proportional column widths (10-18%), no cropping on any screen size' },
        { id: 'refund', title: 'REFUND SPECIALIST', xp: 200, desc: 'Refund button logic fixed: appears correctly for deposits showing "Deposit Received"' },
      ]
    },
    'Data Systems': {
      color: 'indigo',
      achievements: [
        { id: 'amenity-master', title: 'AMENITY OVERLORD', xp: 200, desc: 'Master amenities derived from berlin-real-1 (overrides + base)' },
        { id: 'search-engine', title: 'SEARCH ENGINEER', xp: 200, desc: 'Case-insensitive amenity matching with synonyms for reliable filtering' },
        { id: 'category', title: 'CATEGORY CHIEF', xp: 200, desc: 'Public property page: expanded amenity categorization and rendering' },
        { id: 'results-master', title: 'RESULTS MASTER', xp: 200, desc: 'Search footer shows accurate live results count' },
        { id: 'schema', title: 'SCHEMA ARCHITECT', xp: 400, desc: 'Prisma schema, migrations, seeds; refined booking/payment models' },
        { id: 'queries', title: 'QUERY MASTER', xp: 200, desc: 'Scoreboard counts via direct DB queries (decoupled from filters)' },
        { id: 'override', title: 'OVERRIDE GUARDIAN', xp: 300, desc: 'AdminOverride model added to DB with JSON fallback for backward compatibility' },
        { id: 'indexes', title: 'INDEX COMMANDER', xp: 400, desc: 'Performance indexes added: Booking (status, checkin), Payment (bookingId, purpose, status, dueAt)' },
        { id: 'validation', title: 'VALIDATION CHIEF', xp: 300, desc: 'Data model hardening: booking validation (dates, overlaps), soft delete with audit trail' },
      ]
    },
    'DevOps & Infrastructure': {
      color: 'orange',
      achievements: [
        { id: 'deploy', title: 'DEPLOY COMMANDER', xp: 500, desc: 'start‑server.bat: env bootstrap, Prisma generate/migrate (db push fallback), safe seed, Docker Postgres, cache clean, port auto‑select, running‑server reuse, post‑launch health probe' },
        { id: 'desktop', title: 'DESKTOP SPECIALIST', xp: 200, desc: 'start‑server‑desktop.bat: project discovery + delegation' },
        { id: 'backup', title: 'BACKUP GUARDIAN', xp: 300, desc: 'Backup/restore: zip snapshots; restore skips startup scripts and heavy folders' },
        { id: 'health', title: 'HEALTH MONITOR', xp: 200, desc: '/api/health DB‑ping endpoint' },
        { id: 'env', title: 'CONFIG VALIDATOR', xp: 200, desc: 'Env validator (production fails fast if DATABASE_URL missing)' },
        { id: 'prod', title: 'PROD ARCHITECT', xp: 200, desc: 'docker‑compose.prod.yml and start‑prod.bat scaffolding' },
        { id: 'build', title: 'BUILD FIXER', xp: 200, desc: 'Production build blockers fixed: dynamic force-dynamic for useSearchParams pages' },
        { id: 'prod-deploy', title: 'DEPLOY MASTER', xp: 300, desc: 'Production deployment fully working: build completes, server starts and responds' },
      ]
    },
    'Analytics & CRM': {
      color: 'pink',
      achievements: [
        { id: 'crm', title: 'CRM OVERLORD', xp: 400, desc: 'CRM dashboard (table + mobile cards) linking to bookings/properties' },
        { id: 'profit', title: 'PROFIT TRACKER', xp: 300, desc: 'Most Profitable Cities tile; sales metrics (upcoming payments, overdue)' },
        { id: 'progress', title: 'PROGRESS KING', xp: 300, desc: 'MVP Progress tracker (persisted with versioning)' },
        { id: 'tools', title: 'TOOL COMMANDER', xp: 200, desc: 'Admin productivity toolkit pages (Operating Manual, Playbooks, Prompts, Repo Map, Week Plan)' },
        { id: 'listing', title: 'LISTING EDITOR', xp: 300, desc: 'Edit details: title, description, address, amenities' },
        { id: 'pricing', title: 'PRICE STRATEGIST', xp: 300, desc: 'Pricing controls: monthly rate, fees; scheduled charge preview' },
        { id: 'media', title: 'MEDIA OVERLORD', xp: 300, desc: 'Media management: add/remove photos, gallery ordering' },
        { id: 'calendar-admin', title: 'CALENDAR CHIEF', xp: 200, desc: 'Per‑property availability calendar (month nav, availability set)' },
        { id: 'test', title: 'TEST SPECIALIST', xp: 200, desc: 'Quick test booking creation via Admin Test Booking Bar' },
      ]
    },
    'Performance & Monitoring': {
      color: 'yellow',
      achievements: [
        { id: 'timer', title: 'TIME OVERLORD', xp: 500, desc: 'Development Timer: database-backed with real-time persistence and live seconds tracking' },
        { id: 'persistence', title: 'PERSISTENCE KING', xp: 400, desc: 'Timer persistence perfected: beforeunload auto-save with exact session continuity across refreshes' },
        { id: 'optimization', title: 'OPTIMIZATION GURU', xp: 300, desc: 'Timer performance optimized: eliminated database spam, pure localStorage with exact seconds tracking' },
        { id: 'events', title: 'EVENT SPECIALIST', xp: 200, desc: 'Component expand/collapse independence fixed (preventDefault + stopPropagation)' },
        { id: 'ui-improve', title: 'UI PERFECTIONIST', xp: 200, desc: 'Accomplishments UI improved: full-width layout and checkbox-style readability' },
      ]
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: 'border-emerald-400/60 bg-emerald-500/20 shadow-emerald-400/20',
      blue: 'border-blue-400/60 bg-blue-500/20 shadow-blue-400/20',
      purple: 'border-purple-400/60 bg-purple-500/20 shadow-purple-400/20',
      red: 'border-red-400/60 bg-red-500/20 shadow-red-400/20',
      amber: 'border-amber-400/60 bg-amber-500/20 shadow-amber-400/20',
      indigo: 'border-indigo-400/60 bg-indigo-500/20 shadow-indigo-400/20',
      cyan: 'border-cyan-400/60 bg-cyan-500/20 shadow-cyan-400/20',
      green: 'border-green-400/60 bg-green-500/20 shadow-green-400/20',
      orange: 'border-orange-400/60 bg-orange-500/20 shadow-orange-400/20',
      yellow: 'border-yellow-400/60 bg-yellow-500/20 shadow-yellow-400/20',
      pink: 'border-pink-400/60 bg-pink-500/20 shadow-pink-400/20'
    }
    return colors[color as keyof typeof colors] || colors.amber
  }

  const totalAchievements = Object.values(skillTree).reduce((sum, category) => sum + category.achievements.length, 0)
  const totalXP = Object.values(skillTree).reduce((sum, category) => 
    sum + category.achievements.reduce((catSum, achievement) => catSum + achievement.xp, 0), 0)

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <Header forceBackground={true} />
      <div className="pt-28 pb-20 relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8 flex justify-end">
            <Link 
              href="/admin" 
              className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Admin
            </Link>
          </div>

          {/* MVP Progress Integration */}
          <div className="mb-8">
            <div className="luxury-feature-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold heading-sora text-white">Current Objectives</h2>
                  <p className="text-zinc-300">Active development missions in progress</p>
                </div>
              </div>
              <MVPProgress />
            </div>
          </div>

          {/* Integrated Skill Tree Header */}
          <div className="mb-6 relative">
            <div className="luxury-feature-card p-6 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                {/* Left Stats */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white font-sora">{totalAchievements}</div>
                    <div className="text-xs text-zinc-300 uppercase tracking-widest">Nodes</div>
                  </div>
                  <div className="w-px h-12 bg-emerald-400/30"></div>
                  <div className="text-zinc-300 font-sora text-sm">Unlocked</div>
                </div>
                
                {/* Center Header */}
                <div className="text-center">
                  <h2 className="text-4xl font-bold heading-sora text-white tracking-wider mb-1">Skill Tree</h2>
                  <p className="text-zinc-300 text-sm">Completed development skills and mastered abilities</p>
                </div>
                
                {/* Right Stats */}
                <div className="flex items-center gap-4">
                  <div className="text-zinc-300 font-sora text-sm">Earned</div>
                  <div className="w-px h-12 bg-amber-400/30"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white font-sora">{totalXP.toLocaleString('en-US')}</div>
                    <div className="text-xs text-zinc-300 uppercase tracking-widest">Skill Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Tree Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[600px] relative">

            {Object.entries(skillTree).map(([categoryName, category]) => (
              <div
                key={categoryName}
                className={`relative rounded-2xl p-4 transition-all duration-300 cursor-pointer z-10 luxury-feature-card ${
                  selectedNode === categoryName ? 'ring-1 ring-emerald-400/40 scale-[1.02]' : ''
                }`}
                onClick={() => setSelectedNode(selectedNode === categoryName ? null : categoryName)}
              >
                {/* Category Header */}
                <div className="text-center mb-4">
                  <div className={`text-lg font-bold heading-sora uppercase tracking-wider ${
                    selectedNode === categoryName ? 'text-white' : 'text-zinc-300'
                  }`}>
                    {categoryName}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {category.achievements.length} NODES UNLOCKED
                  </div>
                </div>

                {/* Achievement List */}
                <div className="space-y-2">
                  {category.achievements.map((achievement, idx) => (
                    <div key={achievement.id} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-zinc-300 flex-shrink-0"></div>
                      <span className="text-zinc-300 truncate font-sora">{achievement.title}</span>
                      <span className="text-white font-sora">+{achievement.xp}</span>
                    </div>
                  ))}
                </div>

                {/* Total XP for this category */}
                <div className="mt-3 pt-2 border-t border-zinc-700/50">
                  <div className="text-center">
                    <span className="text-zinc-100 font-sora font-bold">
                      {category.achievements.reduce((sum, a) => sum + a.xp, 0)} SP
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Overlay */}
          {selectedNode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop with blur effect */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setSelectedNode(null)}
              />
              
              {/* Modal Content */}
              <div className="relative luxury-feature-card p-8 max-w-6xl w-full max-h-[80vh] overflow-hidden">
                
                {/* Modal Header */}
                <div className="relative z-10 flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-3xl font-bold heading-sora text-white">{selectedNode}</h3>
                    <p className="text-zinc-300 mt-1">Skill tree detailed breakdown</p>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="w-10 h-10 rounded-full border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] text-white hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                {/* Achievements Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  {skillTree[selectedNode as keyof typeof skillTree].achievements.map((achievement) => (
                    <div key={achievement.id} className="luxury-feature-card p-4 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[linear-gradient(145deg,#1a1a1a_0%,#2a2a2a_50%,#1a1a1a_100%)] border border-zinc-400/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                          <svg className="w-4 h-4 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm font-sora">{achievement.title}</div>
                          <div className="text-zinc-300 font-bold text-xs">+{achievement.xp} Skill Points</div>
                        </div>
                        <div className="text-emerald-300 text-lg">✓</div>
                      </div>
                      <div className="text-zinc-300 text-sm leading-relaxed mb-3">{achievement.desc}</div>
                      <div className="px-3 py-1 rounded-lg border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)]">
                        <div className="text-white font-bold text-xs text-center">Skill Mastered</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

// MVP Progress component integrated from admin page
function MVPProgress() {
  const [items, setItems] = useState<{ id: string; label: string; done: boolean }[]>([])
  const [expanded, setExpanded] = useState(false)
  
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('mvp_checklist_v2') : null
      const versionKey = 'mvp_checklist_version_v2'
      const currentVersion = '2025-09-15-accomplishments-v14'
      const savedVersion = typeof window !== 'undefined' ? localStorage.getItem(versionKey) : null
      
      const seed = [
        // ✅ COMPLETED - Frontend Foundation
        { id: 'frontend-pages', label: 'Complete site structure: Homepage, City/Property pages, all legal pages', done: true },
        { id: 'frontend-search', label: 'Search interface with date pickers and responsive layout', done: true },
        { id: 'frontend-filters', label: 'Airbnb-style filter modal (beds, baths, amenities, price range)', done: true },
        { id: 'frontend-performance', label: 'Performance optimization: dynamic imports, Service Worker, RSC-safe navigation', done: true },
        
        // 🔄 IN PROGRESS - Week 2: Payments & Pricing
        { id: 'w2-stripe', label: 'Stripe PaymentIntents + webhooks + metadata', done: false },
        { id: 'w2-coinbase', label: 'Coinbase Commerce charges + webhooks', done: false },
        { id: 'w2-escrow', label: 'Escrow flow: hold TTL, approve/capture, decline/auto-refund', done: false },
        { id: 'w2-pricing', label: 'Pricing/fees engine (nightly/monthly, pro‑ration, deposit/move-in, VAT)', done: false },
        
        // 📅 PLANNED - Week 3: KYC, owners, storage, comms
        { id: 'w3-kyc', label: 'KYC/ID verification (Stripe Identity/Persona) + store status', done: false },
        { id: 'w3-owners', label: 'Owner intake form + minimal owner dashboard', done: false },
        { id: 'w3-storage', label: 'S3 storage with signed PUT/GET; migrate uploads', done: false },
        { id: 'w3-emails', label: 'Email templates with Postmark/SES for key booking events', done: false },
        
        // 📅 PLANNED - Week 4: Hardening, tests, deploy
        { id: 'w4-observability', label: 'Observability: Sentry, PostHog, rate limits, cache headers, RBAC', done: false },
        { id: 'w4-tests', label: 'Testing suite: API tests, webhook signatures, Playwright E2E', done: false },
        { id: 'w4-compliance', label: 'Compliance + SEO: Cookie Settings, sitemap/robots, legal pages', done: false },
        { id: 'w4-deploy', label: 'Production deployment: Vercel + managed Postgres, webhooks, launch checklist', done: false },
      ]
      
      const shouldReplace = !raw || savedVersion !== currentVersion
      if (shouldReplace) {
        setItems(seed)
        if (typeof window !== 'undefined') {
          localStorage.setItem('mvp_checklist_v2', JSON.stringify(seed))
          localStorage.setItem(versionKey, currentVersion)
        }
      } else {
        try { setItems(JSON.parse(raw as string)) } catch { setItems(seed) }
      }
    } catch {}
  }, [])
  
  const completed = items.filter(i=>i.done).length
  const total = Math.max(1, items.length)
  const pct = Math.round((completed/total)*100)
  
  const toggle = (id: string) => {
    const next = items.map(i => i.id===id ? { ...i, done: !i.done } : i)
    setItems(next)
    try { if (typeof window !== 'undefined') localStorage.setItem('mvp_checklist_v2', JSON.stringify(next)) } catch {}
  }
  
  return (
    <div className="luxury-feature-card p-4">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setExpanded(v => !v)
        }}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="heading-sora uppercase tracking-wider text-lg text-white font-bold">MVP Progress</div>
            <div className="text-emerald-300 text-sm">{pct}% complete</div>
            <div className="text-zinc-300 text-sm">{completed} of {total} objectives completed</div>
          </div>
          <div className="relative">
            <div className={`w-8 h-8 rounded-full border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] text-white flex items-center justify-center transition-all ${expanded ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded bg-black/30 border border-zinc-700/40 hover:bg-black/50 transition-colors">
              <button
                onClick={() => toggle(item.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.done 
                    ? 'bg-emerald-500 border-emerald-400' 
                    : 'border-zinc-500 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] hover:border-zinc-300'
                }`}
              >
                {item.done && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
              <span className={`text-sm flex-1 font-sora ${item.done ? 'text-white/80 line-through' : 'text-white'}`}>
                {item.label}
              </span>
              <span className={`text-xs font-sora ${item.done ? 'text-emerald-300' : 'text-zinc-300'}`}>
                {item.done ? 'Done' : 'Todo'}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Footer summary removed per design: only show percentage above */}
    </div>
  )
}


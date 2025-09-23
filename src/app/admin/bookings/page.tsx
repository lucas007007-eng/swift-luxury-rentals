import React from 'react'
import prisma from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TestBookingBar from './TestBookingBar'
import DeleteButton from './DeleteButton'

export default async function AdminBookingsPage({ searchParams }: { searchParams?: { page?: string; status?: string } }) {
  const formatShortDate = (d: Date) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const dd = d.getDate()
    const j = dd % 10, k = dd % 100
    let suffix = 'th'
    if (k !== 11 && k !== 12 && k !== 13) {
      if (j === 1) suffix = 'st'
      else if (j === 2) suffix = 'nd'
      else if (j === 3) suffix = 'rd'
    }
    const yy = String(d.getFullYear()).slice(2)
    return `${months[d.getMonth()]} ${dd}${suffix}, ${yy}'`
  }
  const ordinal = (n: number) => {
    const j = n % 10, k = n % 100
    if (k === 11 || k === 12 || k === 13) return `${n}th`
    if (j === 1) return `${n}st`
    if (j === 2) return `${n}nd`
    if (j === 3) return `${n}rd`
    return `${n}th`
  }
  // Server component: fetch directly from Prisma for reliability and speed
  const pageSize = 10
  const page = Math.max(1, Number(searchParams?.page || '1'))
  const activeStatus = String(searchParams?.status || '').toLowerCase()
  const statusFilter = ['hold','confirmed','cancelled'].includes(activeStatus) ? activeStatus : null
  const where = { 
    deletedAt: null, // Exclude soft-deleted bookings
    ...(statusFilter ? { status: statusFilter as any } : {})
  }
  const skip = (page - 1) * pageSize
  const [totalCount, bookings] = await Promise.all([
    prisma.booking.count({ where } as any),
    prisma.booking.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        property: { select: { title: true, address: true, extId: true, priceMonthly: true } },
        payments: { select: { id: true, purpose: true, status: true, amountCents: true, dueAt: true, receivedAt: true, createdAt: true } as any },
      },
      skip,
      take: pageSize,
    })
  ])
  const withDeposit = await Promise.all(bookings.map(async (b: any) => {
    const deposit = (b.payments || []).filter((p: any) => p.purpose === 'deposit')
    let depositHeld = deposit.reduce((s: number, p: any) => s + ((p.status !== 'refunded') ? p.amountCents : 0), 0)
    let totalNowCents = Number(b.totalCents) || 0
    let firstPaymentCents = 0
    let receivedCents = (b.payments || [])
      .filter((p: any) => p.status === 'received' && p.purpose !== 'deposit')
      .reduce((s: number, p: any) => s + (Number(p.amountCents) || 0), 0)
    // Fallback-populate depositHeld for bookings with no deposit payment records
    if (depositHeld <= 0) {
      try {
        const monthlyBase = Number((b as any)?.property?.priceMonthly || 0)
        const s = new Date(b.checkin)
        const e = new Date(b.checkout)
        const totalDays = Math.max(0, Math.round((e.getTime() - s.getTime())/86400000))
        let depositEuros = 0
        if (totalDays < 15) depositEuros = 500
        else if (totalDays < 30) depositEuros = 750
        else if (monthlyBase > 0) {
          const endOfThirdMonth = new Date(s.getFullYear(), s.getMonth() + 3, s.getDate())
          const longerOrEqualThree = e > endOfThirdMonth || e.getTime() === endOfThirdMonth.getTime()
          depositEuros = Math.round(monthlyBase * (longerOrEqualThree ? 1 : 0.5))
        }
        if (depositEuros > 0) depositHeld = depositEuros * 100
      } catch {}
    }
    return { ...b, depositHeld, totalNowCents, firstPaymentCents, receivedCents }
  }))
  const [countAll, countHold, countConfirmed, countCancelled] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'hold' } as any }),
    prisma.booking.count({ where: { status: 'confirmed' } as any }),
    prisma.booking.count({ where: { status: 'cancelled' } as any }),
  ])
  const totalsGlobal = { all: countAll, hold: countHold, confirmed: countConfirmed, cancelled: countCancelled }
  const pageRevenue = Math.round(bookings.reduce((s: number, b: any) => s + (Number(b.totalCents || 0) / 100), 0))
  return (
    <main className="min-h-screen bg-black text-white">
      <Header forceBackground={true} />
      <div className="max-w-[2200px] mx-auto px-6 py-10 pt-28">
        {/* Header Row: Testing Suite + Operations Command */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Testing Suite Card */}
          <div className="luxury-feature-card p-8">
            <div className="mb-4">
              <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Testing Suite</div>
              <h2 className="text-2xl font-bold heading-sora text-white mb-2 text-left">Create Test Booking</h2>
            </div>
            <TestBookingBar />
          </div>
          
          {/* Operations Command Card */}
          <div className="luxury-feature-card p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Operations Command</div>
                <h1 className="text-4xl font-bold heading-sora text-white mb-2 text-left">Booking Operations</h1>
                <p className="text-zinc-300 text-lg text-left">Elite Reservation Management</p>
              </div>
              <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
                aria-label="Back to Admin"
              >
                ← Back to Admin
              </a>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="relative overflow-x-auto luxury-feature-card">
          {/* Corner accent lights */}
          <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-emerald-400/60 opacity-80 z-20" />
          <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-emerald-400/60 opacity-80 z-20" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-emerald-400/60 opacity-80 z-20" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-emerald-400/60 opacity-80 z-20" />
          
          <div className="p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <div className="flex items-baseline gap-3">
                <div className="font-mono uppercase tracking-wider text-lg text-emerald-400 font-sora">All Bookings</div>
                {statusFilter && (
                  <div className="text-sm text-zinc-300 font-sora">— {activeStatus}</div>
                )}
              </div>
              {/* Inline scoreboard (reflects current view) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <ScorePill title="Total Booking" value={`: ${totalsGlobal.all.toLocaleString('de-DE')}`} color="emerald" href={`/admin/bookings`} active={!statusFilter} />
                <ScorePill title="Bookings on Hold" value={`: ${totalsGlobal.hold.toLocaleString('de-DE')}`} color="amber" href={`/admin/bookings?status=hold`} active={statusFilter==='hold'} />
                <ScorePill title="Booking Confirmed" value={`: ${totalsGlobal.confirmed.toLocaleString('de-DE')}`} color="emerald" href={`/admin/bookings?status=confirmed`} active={statusFilter==='confirmed'} />
                <ScorePill title="Bookings Cancelled" value={`: ${totalsGlobal.cancelled.toLocaleString('de-DE')}`} color="sky" href={`/admin/bookings?status=cancelled`} active={statusFilter==='cancelled'} />
                {statusFilter && (
                  <ScorePill title="Clear Filter" value="" color="sky" href={`/admin/bookings`} active={!statusFilter} />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <form action="/api/admin/bookings/recompute?all=1&redirect=1" method="post" className="inline">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300"
                  title="Safely recompute monthly schedules and totals for all bookings (idempotent). Confirmation required."
                >
                  Recompute totals
                </button>
              </form>
              <form action="/api/admin/bookings/cleanup-holds?redirect=1" method="post" className="inline">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-orange-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-orange-400/50 transition-all duration-300"
                  title="Fix hold bookings that incorrectly show payments as received"
                >
                  Fix Hold Payments
                </button>
              </form>
              <a
                href="/api/admin/bookings/synthesize-first?all=1&redirect=1"
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-sky-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-sky-400/50 transition-all duration-300"
                title="Synthesize received payments for past-start bookings and refresh"
              >
                Synthesize received
              </a>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <span className="text-sm font-semibold text-zinc-100 font-sora">€{pageRevenue.toLocaleString('de-DE')}</span>
                <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Page Total</span>
              </div>
            </div>
          </div>
          {/* Mobile card list (sm) */}
          <div className="block md:hidden px-4 pb-4">
            <div className="space-y-3">
              {withDeposit.map((b: any) => {
                const receivedEuros = Math.round(((b.receivedCents||0)/100))
                const payments = (b.payments || [])
                const scheduled = payments.filter((p:any)=> p.purpose==='monthly_rent' && p.status==='scheduled').sort((a:any,c:any)=> new Date(a.dueAt||0).getTime() - new Date(c.dueAt||0).getTime())
                const nextDue = scheduled[0]
                const nextDueAmt = nextDue ? Math.round((Number(nextDue.amountCents)||0)/100) : 0
                const refundedCents = payments.filter((p:any)=> p.purpose==='deposit' && p.status==='refunded').reduce((s:number,p:any)=> s + (Number(p.amountCents)||0), 0)
                const hasDepositPaymentReceived = payments.some((p:any)=> p.purpose==='deposit' && p.status==='received')
                const depositReceived = hasDepositPaymentReceived || b.status === 'confirmed'
                const isRefunded = refundedCents > 0
                const depEuros = Math.round(((isRefunded ? refundedCents : Number(b.depositHeld||0)) / 100))
                const finished = new Date(b.checkout) <= new Date()
                return (
                  <div key={b.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-semibold">{b.user?.name || '—'}</div>
                        <div className="text-xs text-white/60">{b.property?.title || '—'}</div>
                      </div>
                      <div className="text-xs text-white/50 whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2 text-xs text-white/70">{new Date(b.checkin).toLocaleDateString()} → {new Date(b.checkout).toLocaleDateString()}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded border border-emerald-400/30 bg-emerald-500/10 p-2">
                        <div className="text-[11px] uppercase tracking-wider text-emerald-200">Received</div>
                        <div className="text-sm font-semibold text-emerald-300">€{receivedEuros.toLocaleString('de-DE')}</div>
                      </div>
                      <div className="rounded border border-amber-400/30 bg-amber-500/10 p-2">
                        <div className="text-[11px] uppercase tracking-wider text-amber-200">Next Due</div>
                        <div className="text-sm font-semibold text-white">{nextDue ? `€${nextDueAmt.toLocaleString('de-DE')} • ${formatShortDate(new Date(nextDue.dueAt))}` : '—'}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <form action="/api/admin/bookings" method="post" className="flex items-center gap-2">
                        <input type="hidden" name="id" value={b.id} />
                        <select name="status" defaultValue={b.status} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm">
                          <option value="hold">hold</option>
                          <option value="confirmed">confirmed</option>
                          <option value="cancelled">cancelled</option>
                          <option value="__delete__">DELETE</option>
                        </select>
                        <button className="px-2 py-1 text-xs rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold">Save</button>
                      </form>
                      {/* Hard delete action if DELETE chosen */}
                      <DeleteButton id={b.id} />
                      <div className="flex items-center gap-2">
                        {nextDue && (
                          <form action="/api/admin/bookings/receive-next" method="post">
                            <input type="hidden" name="bookingId" value={b.id} />
                            <button className="px-2 py-1 text-xs rounded bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">Receive</button>
                          </form>
                        )}
                        {depEuros>0 && !isRefunded && depositReceived && finished && (
                          <form action="/api/admin/bookings/refund" method="post">
                            <input type="hidden" name="bookingId" value={b.id} />
                            <button className="px-2 py-1 text-xs rounded bg-sky-500 hover:bg-sky-400 text-black font-semibold">Refund</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Mobile pagination */}
            {totalCount > pageSize && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                <a
                  href={`/admin/bookings?page=${Math.max(1, page-1)}${statusFilter?`&status=${activeStatus}`:''}`}
                  className={`px-3 py-1.5 rounded text-sm border ${page>1 ? 'border-emerald-400/30 text-emerald-300 hover:text-emerald-200' : 'border-white/10 text-white/30 pointer-events-none'}`}
                >Prev</a>
                <div className="text-white/60 text-sm">Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</div>
                <a
                  href={`/admin/bookings?page=${page+1}${statusFilter?`&status=${activeStatus}`:''}`}
                  className={`px-3 py-1.5 rounded text-sm border ${(skip + bookings.length) < totalCount ? 'border-emerald-400/30 text-emerald-300 hover:text-emerald-200' : 'border-white/10 text-white/30 pointer-events-none'}`}
                >Next</a>
              </div>
            )}
          </div>

          {/* Responsive table layout */}
          <div className="hidden md:block px-6 md:px-8 relative z-10">
            <div className="w-full">
          <table className="w-full divide-y divide-zinc-700/50 table-auto">
            <thead className="bg-black/30 backdrop-blur-sm">
              <tr>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Created</th>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Client</th>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Property</th>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Dates</th>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Deposit</th>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Payment Received</th>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Scheduled Payments</th>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Overdue Payments</th>
                <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white font-sora">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/30">
              {withDeposit.map((b: any) => (
                <tr key={b.id} className="hover:bg-zinc-900/20 transition-colors">
                  <td className="px-3 py-4 text-sm text-white font-semibold font-sora">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-4 text-sm">
                    <div className="inline-flex flex-col p-3 rounded-lg border border-amber-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] w-full">
                      <div className="text-white font-bold text-sm font-sora mb-1">{b.user?.name || '—'}</div>
                      <div className="text-blue-300 text-xs font-sora truncate mb-1">{b.user?.email || '—'}</div>
                      <div className="text-zinc-400 text-xs font-mono bg-zinc-900/50 px-2 py-0.5 rounded inline-block">{b.userId?.slice?.(0,6) || ''}</div>
                    </div>
                  </td>
                  
                  <td className="px-3 py-4 text-sm">
                    <a href={`/admin/property/${b.property?.extId || ''}`} className="inline-flex flex-col p-3 rounded-lg border border-zinc-600/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] w-full hover:border-zinc-400/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                      <div className="text-white font-bold text-sm leading-tight font-sora mb-1">{b.property?.title || '—'}</div>
                      <div className="text-zinc-400 text-xs leading-relaxed">{b.property?.address || ''}</div>
                    </a>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <div className="inline-flex flex-col p-3 rounded-lg border border-sky-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] w-full">
                      <div className="text-sky-300 text-xs font-sora mb-1">Check-in</div>
                      <div className="text-white font-semibold text-sm font-sora mb-2">{new Date(b.checkin).toLocaleDateString()}</div>
                      <div className="text-sky-300 text-xs font-sora mb-1">Checkout</div>
                      <div className="text-white font-semibold text-sm font-sora">{new Date(b.checkout).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(() => {
                      const depHeldCents = Number(b.depositHeld || 0)
                      const refundedCents = (b.payments || [])
                        .filter((p:any)=> p.purpose==='deposit' && p.status==='refunded')
                        .reduce((s:number,p:any)=> s + (Number(p.amountCents)||0), 0)
                      const hasAnyDeposit = depHeldCents > 0 || refundedCents > 0
                      if (!hasAnyDeposit) return <span className="text-white/40 text-xs">—</span>
                      const hasDepositPaymentReceived = (b.payments || []).some((p:any)=> p.purpose === 'deposit' && p.status === 'received')
                      // Treat confirmed bookings as having an active deposit (green), like before
                      const depositReceived = hasDepositPaymentReceived || b.status === 'confirmed'
                      const isRefunded = refundedCents > 0
                      const amountEuros = Math.round(((isRefunded ? refundedCents : depHeldCents) / 100))
                      const colorBox = isRefunded
                        ? 'border-sky-400/30 bg-sky-500/10 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                        : depositReceived ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'border-amber-400/30 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      const label = isRefunded ? 'Deposit Refunded' : (depositReceived ? 'Deposit Received' : 'Deposit')
                      const today = new Date()
                      const finished = new Date(b.checkout) <= today
                      return (
                        <div className="flex items-center gap-3">
                          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded border ${colorBox} whitespace-nowrap`} aria-label="Deposit status">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6"/>
                            </svg>
                            <span className="font-semibold">€{amountEuros.toLocaleString('de-DE')}</span>
                            <span className="uppercase tracking-wider text-[10px] opacity-80">{label}</span>
                          </div>
                          {!isRefunded && finished && depositReceived && (
                            <form action="/api/admin/bookings/refund?redirect=1" method="post">
                              <input type="hidden" name="bookingId" value={b.id} />
                              <button className="px-2.5 py-1 rounded border border-sky-400/30 bg-sky-500/10 text-sky-300 hover:text-sky-200 text-xs inline-flex items-center gap-2" title="Refund deposit">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l4-4 4 4"/><path d="M7 6v11a4 4 0 004 4h5"/></svg>
                                Refund Deposit
                              </button>
                            </form>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(() => {
                      const payments = (b.payments || [])
                      const receivedList = payments
                        .filter((p:any)=> p.status === 'received' && p.purpose !== 'deposit')
                        .sort((a:any,b:any)=> new Date(b.receivedAt||0).getTime() - new Date(a.receivedAt||0).getTime())
                      const receivedTotalEuros = Math.round(((b.receivedCents||0)/100))
                      if (receivedTotalEuros <= 0) return <span className="text-white/40 text-xs">—</span>
                      return (
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] w-full justify-between" aria-label="Payment received">
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12l2 2 4-4"/></svg>
                              <span className="uppercase tracking-wider text-[10px] text-emerald-200">Received</span>
                            </div>
                            <span className="font-semibold">€{receivedTotalEuros.toLocaleString('de-DE')}</span>
                          </div>
                          {receivedList.length > 0 && (
                            <div className="rounded-md border border-emerald-400/30 bg-emerald-500/5 p-3 shadow-[0_0_12px_rgba(16,185,129,0.12)]">
                              <div className="flex items-center gap-2 text-xs text-emerald-300 mb-2">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                <span className="uppercase tracking-wider">Paid on</span>
                              </div>
                              <div className="space-y-2 mt-1">
                                {receivedList.slice(0,4).map((p:any)=> {
                                  const dateStr = formatShortDate(new Date(p.receivedAt||p.createdAt))
                                  let label = 'Payment'
                                  let daysNote: string | null = null
                                  if (p.purpose === 'first_period') {
                                    label = '1st month rent'
                                    try {
                                      const s0 = new Date(b.checkin)
                                      const e0 = new Date(b.checkout)
                                      const endOfCurrentMonth = new Date(s0.getFullYear(), s0.getMonth() + 1, 0)
                                      const dayAfterEndOfCurrentMonth = new Date(endOfCurrentMonth.getFullYear(), endOfCurrentMonth.getMonth(), endOfCurrentMonth.getDate() + 1)
                                      const endOfNextMonth = new Date(s0.getFullYear(), s0.getMonth() + 2, 0)
                                      const dayAfterEndOfNextMonth = new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), endOfNextMonth.getDate() + 1)
                                      const crossesMonthEnd = e0 > dayAfterEndOfCurrentMonth
                                      let firstPeriodEndExclusive = e0
                                      if (s0.getDate() >= 25) {
                                        firstPeriodEndExclusive = e0 < dayAfterEndOfNextMonth ? e0 : dayAfterEndOfNextMonth
                                      } else if (crossesMonthEnd) {
                                        firstPeriodEndExclusive = dayAfterEndOfCurrentMonth
                                      }
                                      const nightsFirst = Math.max(0, Math.round((firstPeriodEndExclusive.getTime() - s0.getTime())/86400000))
                                      daysNote = `(${nightsFirst} days)`
                                    } catch {}
                                  } else if (p.purpose === 'move_in_fee') {
                                    label = 'Move-in fee'
                                  } else if (p.purpose === 'monthly_rent') {
                                    label = 'Monthly rent'
                                    try {
                                      const list = (payments || []).filter((x:any)=> x.purpose === 'monthly_rent').sort((a:any,c:any)=> new Date(a.dueAt||0).getTime() - new Date(c.dueAt||0).getTime())
                                      const idx = list.findIndex((x:any)=> x.id === p.id)
                                      const n = (idx >= 0 ? idx + 2 : 2)
                                      const j = n % 10, k = n % 100
                                      const ord = (k === 11 || k === 12 || k === 13) ? `${n}th` : (j===1?`${n}st`:(j===2?`${n}nd`:(j===3?`${n}rd`:`${n}th`)))
                                      daysNote = `(${ord} month rent)`
                                    } catch {}
                                  }
                                  return (
                                    <div key={p.id} className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-white font-semibold whitespace-nowrap font-sora">{dateStr}</span>
                                        <span className="text-sm text-zinc-300 whitespace-nowrap font-sora">{label}</span>
                                        {daysNote && <span className="text-xs text-zinc-400 whitespace-nowrap">{daysNote}</span>}
                                      </div>
                                      <span className="px-3 py-1 rounded-lg text-sm bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold font-sora">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(() => {
                      const payments = (b.payments || [])
                      const scheduled = payments
                        .filter((p:any)=> p.purpose === 'monthly_rent' && p.status === 'scheduled')
                        .sort((a:any,b:any)=> new Date(a.dueAt||0).getTime() - new Date(b.dueAt||0).getTime())
                      return (
                        <div className="space-y-3">
                          {(() => {
                            // Pay Now should mirror request page: first period (monthly/30 basis) + move-in fee, deposit excluded
                            const s = new Date(b.checkin)
                            const e = new Date(b.checkout)
                            const endOfCurrentMonth = new Date(s.getFullYear(), s.getMonth() + 1, 0)
                            const dayAfterEndOfCurrentMonth = new Date(endOfCurrentMonth.getFullYear(), endOfCurrentMonth.getMonth(), endOfCurrentMonth.getDate() + 1)
                            const endOfNextMonth = new Date(s.getFullYear(), s.getMonth() + 2, 0)
                            const dayAfterEndOfNextMonth = new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), endOfNextMonth.getDate() + 1)
                            const crossesMonthEnd = e > dayAfterEndOfCurrentMonth
                            let firstPeriodEndExclusive = e
                            if (s.getDate() >= 25) {
                              firstPeriodEndExclusive = e < dayAfterEndOfNextMonth ? e : dayAfterEndOfNextMonth
                            } else if (crossesMonthEnd) {
                              firstPeriodEndExclusive = dayAfterEndOfCurrentMonth
                            }
                            const nightsFirst = Math.max(0, Math.round((firstPeriodEndExclusive.getTime() - s.getTime())/86400000))
                            const monthlyBase = Number((b as any)?.property?.priceMonthly || 0)
                            const totalDays = Math.max(0, Math.round((e.getTime() - s.getTime())/86400000))
                            
                            // Use actual first_period payment amount from booking (this matches computeBookingTotals)
                            const firstPeriodPayment = (b.payments || []).find((p: any) => p.purpose === 'first_period')
                            const moveInFeePayment = (b.payments || []).find((p: any) => p.purpose === 'move_in_fee')
                            
                            const firstPeriodAmount = firstPeriodPayment ? Math.round((Number(firstPeriodPayment.amountCents) || 0) / 100) : 0
                            const moveInFeeAmount = moveInFeePayment ? Math.round((Number(moveInFeePayment.amountCents) || 0) / 100) : 0
                            
                            // Payment pending = actual first period + actual move-in fee (from stored payments)
                            const pendingEuros = firstPeriodAmount + moveInFeeAmount
                            if (pendingEuros > 0 && b.status !== 'confirmed') {
                              return (
                                <div className="flex items-center justify-between gap-2 rounded-md border border-amber-400/40 bg-amber-500/10 text-amber-300 px-2 py-1">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2 4 4 8-8 4 4"/></svg>
                                    <span className="uppercase tracking-wider text-[10px]">Payment Pending</span>
                                  </div>
                                  <span className="text-sm font-semibold text-white">€{pendingEuros.toLocaleString('de-DE')}</span>
                                </div>
                              )
                            }
                            return null
                          })()}
                          {scheduled.length > 0 ? (
                            <div className="rounded-md border border-amber-400/30 bg-amber-500/5 p-3 shadow-[0_0_12px_rgba(245,158,11,0.12)]">
                              <div className="flex items-center gap-2 text-sm text-amber-300 mb-2 font-sora">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                <span className="uppercase tracking-wider font-semibold">Scheduled Payments</span>
                              </div>
                              <div className="space-y-1 mt-2">
                                {scheduled.map((p:any, idx:number) => {
                                  const due = new Date(p.dueAt)
                                  const nextMonthStart = new Date(due.getFullYear(), due.getMonth()+1, 1)
                                  const checkout = new Date(b.checkout)
                                  const segEnd = checkout < nextMonthStart ? checkout : nextMonthStart
                                  const isLast = idx === scheduled.length - 1
                                  const isPartial = segEnd.getTime() !== nextMonthStart.getTime()
                                  const endLessOne = new Date(segEnd.getTime() - 86400000)
                                  const fmtShort = (d: Date) => {
                                    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                                    const dd = d.getDate(); const j = dd % 10, k = dd % 100
                                    let sfx = 'th'; if (k!==11 && k!==12 && k!==13) { if (j===1) sfx='st'; else if (j===2) sfx='nd'; else if (j===3) sfx='rd' }
                                    return `${months[d.getMonth()]} ${dd}${sfx}`
                                  }
                                  return (
                                    <label key={p.id} className="flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-900/20 p-2 rounded transition-colors">
                                      <div className="flex items-center gap-3">
                                        <input type="checkbox" name="paymentId" value={p.id} form={`receive-${b.id}`} className="w-4 h-4 rounded border-2 border-zinc-400 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] checked:bg-emerald-500 checked:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-0 accent-emerald-500" />
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-white font-semibold whitespace-nowrap font-sora">{formatShortDate(due)}</span>
                                          <span className="text-sm text-zinc-300 whitespace-nowrap font-sora">{(() => {
                                            try {
                                              const list = (payments || []).filter((x:any)=> x.purpose === 'monthly_rent').sort((a:any,c:any)=> new Date(a.dueAt||0).getTime() - new Date(c.dueAt||0).getTime())
                                              const myIdx = list.findIndex((x:any)=> x.id === p.id)
                                              const n = (myIdx >= 0 ? myIdx + 2 : 2)
                                              const j = n % 10, k = n % 100
                                              const ord = (k === 11 || k === 12 || k === 13) ? `${n}th` : (j===1?`${n}st`:(j===2?`${n}nd`:(j===3?`${n}rd`:`${n}th`)))
                                              if (isLast && isPartial) {
                                                return `Monthly rent (${fmtShort(due)} - ${fmtShort(endLessOne)})`
                                              }
                                              return `Monthly rent (${ord} month rent)`
                                            } catch { return 'Monthly rent' }
                                          })()}</span>
                                        </div>
                                      </div>
                                      <span className="px-3 py-1 rounded-lg text-sm bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold font-sora">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</span>
                                    </label>
                                  )
                                })}
                              </div>
                              {/* Payment Received tile */}
                              <form id={`receive-${b.id}`} action="/api/admin/bookings/receive-selected" method="post" className="mt-3">
                                <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-400/30 bg-emerald-500/10 p-2">
                                  <div className="flex items-center gap-2 text-emerald-300">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12l2 2 4-4"/></svg>
                                    <span className="uppercase tracking-wider text-[10px]">Payment Received</span>
                                  </div>
                                  <button className="px-2 py-1 text-xs rounded bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow">Approve</button>
                                </div>
                              </form>
                            </div>
                          ) : (
                            <span className="text-white/40 text-xs">No schedule</span>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm align-top">
                    {(() => {
                      const now = new Date()
                      const overdueList = (b.payments||[])
                        .filter((p:any)=> p.purpose === 'monthly_rent' && p.status === 'scheduled' && p.dueAt && new Date(p.dueAt) < now)
                        .sort((a:any,b:any)=> new Date(a.dueAt||0).getTime() - new Date(b.dueAt||0).getTime())
                      if (overdueList.length === 0) return <span className="text-white/40 text-xs">—</span>
                      const overdueCents = overdueList.reduce((s:number,p:any)=> s + (Number(p.amountCents)||0), 0)
                      return (
                        <div className="rounded-md border border-red-400/40 bg-red-500/10 text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.25)] p-3">
                          <div className="flex items-center gap-2 text-xs mb-2">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            <span className="uppercase tracking-wider">Overdue Payments</span>
                            <span className="ml-auto font-semibold text-white">€{Math.round(overdueCents/100).toLocaleString('de-DE')}</span>
                          </div>
                          <div className="space-y-2">
                            {overdueList.map((p:any)=> (
                              <div key={p.id} className="flex items-center justify-between gap-3">
                                <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-200 border border-red-400/30 whitespace-nowrap">{formatShortDate(new Date(p.dueAt))}</span>
                                <span className="text-sm font-semibold text-white whitespace-nowrap">€{Math.round((Number(p.amountCents)||0)/100).toLocaleString('de-DE')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-3 py-4 text-sm">
                    {b.status === 'confirmed' ? (
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 font-semibold font-sora">
                          Confirmed
                        </span>
                        <DeleteButton id={b.id} />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <form action="/api/admin/bookings" method="post" className="flex items-center gap-1">
                          <input type="hidden" name="id" value={b.id} />
                          <select name="status" defaultValue={b.status} className="bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] border border-zinc-400/30 rounded px-2 py-1 text-xs text-white font-sora">
                            <option value="hold" className="bg-black">Hold</option>
                            <option value="confirmed" className="bg-black">Confirmed</option>
                            <option value="cancelled" className="bg-black">Cancelled</option>
                            <option value="__delete__" className="bg-black">DELETE</option>
                          </select>
                          <button className="px-2 py-1 text-xs rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold font-sora">Save</button>
                        </form>
                        <DeleteButton id={b.id} />
                      </div>
                    )}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
          {totalCount > pageSize && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <a href={`/admin/bookings?page=${Math.max(1, page-1)}${statusFilter?`&status=${activeStatus}`:''}`} className={`px-3 py-1.5 rounded text-sm border ${page>1 ? 'border-emerald-400/30 text-emerald-300 hover:text-emerald-200' : 'border-white/10 text-white/30 pointer-events-none'}`}>Prev</a>
              <div className="text-white/60 text-sm">Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</div>
              <a href={`/admin/bookings?page=${page+1}${statusFilter?`&status=${activeStatus}`:''}`} className={`px-3 py-1.5 rounded text-sm border ${skip + bookings.length < totalCount ? 'border-emerald-400/30 text-emerald-300 hover:text-emerald-200' : 'border-white/10 text-white/30 pointer-events-none'}`}>Next</a>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function SummaryCard({ title, value, color }: { title: string; value: string; color: 'emerald' | 'amber' | 'sky' }) {
  const border = color === 'emerald' ? 'border-emerald-400/30' : color === 'amber' ? 'border-amber-400/30' : 'border-sky-400/30'
  const glow = color === 'emerald' ? 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' : color === 'amber' ? 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'shadow-[0_0_20px_rgba(56,189,248,0.2)]'
  const text = color === 'emerald' ? 'text-emerald-300' : color === 'amber' ? 'text-amber-300' : 'text-sky-300'
  return (
    <div className={`rounded-2xl p-4 border ${border} bg-gradient-to-br from-[#0b1a12] to-[#08120d] ${glow}`}>
      <div className="font-mono uppercase tracking-wider text-[11px] gold-metallic-text">{title}</div>
      <div className={`text-2xl font-extrabold ${text}`}>{value}</div>
    </div>
  )
}

function ScorePill({ title, value, color, href, active }: { title: string; value: string; color: 'emerald' | 'amber' | 'sky'; href: string; active?: boolean }) {
  const accentColor = color === 'emerald' ? '16,185,129' : color === 'amber' ? '245,158,11' : '56,189,248'
  const borderColor = color === 'emerald' ? 'border-emerald-400/40' : color === 'amber' ? 'border-amber-400/40' : 'border-sky-400/40'
  const textColor = color === 'emerald' ? 'text-emerald-300' : color === 'amber' ? 'text-amber-300' : 'text-sky-300'
  
  return (
    <a href={href} 
       className={`group relative rounded-xl p-4 overflow-hidden transition-all duration-300 hover:scale-[1.02] ${active ? 'ring-2 ring-emerald-400/40' : ''}`}
       style={{
         background: `
           linear-gradient(145deg, rgba(5,5,5,0.98) 0%, rgba(20,20,20,0.99) 30%, rgba(15,15,15,0.98) 70%, rgba(8,8,8,0.97) 100%),
           radial-gradient(circle at 30% 20%, rgba(${accentColor},0.08) 0%, transparent 50%)
         `,
         border: `1px solid rgba(${accentColor},0.4)`,
         backdropFilter: 'blur(25px) saturate(200%) contrast(120%)',
         boxShadow: `
           0 20px 60px rgba(0,0,0,0.9),
           0 10px 30px rgba(0,0,0,0.7),
           inset 0 2px 0 rgba(255,255,255,0.15),
           inset 0 -1px 0 rgba(255,255,255,0.1),
           0 0 40px rgba(${accentColor},0.12)
         `,
         transform: 'perspective(1000px) rotateX(1deg)',
         transformStyle: 'preserve-3d'
       }}
       aria-current={active ? 'page' : undefined}>
      
      {/* Holographic grid overlay */}
      <div className="absolute inset-0 opacity-8 z-0" 
           style={{
             backgroundImage: `
               linear-gradient(90deg, rgba(${accentColor},0.15) 1px, transparent 1px),
               linear-gradient(rgba(${accentColor},0.15) 1px, transparent 1px)
             `,
             backgroundSize: '20px 20px',
             animation: 'grid-pulse 4s ease-in-out infinite alternate'
           }} />
      
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`font-mono uppercase tracking-wider text-sm ${textColor} font-sora`}>{title}</span>
          <span className="font-semibold text-white">{value}</span>
        </div>
        <svg className={`w-4 h-4 ${textColor} opacity-70 group-hover:opacity-100 transition-opacity`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
      
      {/* Enhanced 3D hover effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}
           style={{
             background: `rgba(${accentColor},0.08)`,
             boxShadow: `inset 0 0 60px rgba(${accentColor},0.15), 0 0 80px rgba(${accentColor},0.2)`
           }} />
    </a>
  )
}

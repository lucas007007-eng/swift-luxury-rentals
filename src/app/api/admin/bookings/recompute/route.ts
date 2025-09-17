import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { computeMonthlySchedule, computeBookingTotals } from '@/lib/bookingTotals'

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === '1'
    const redirect = searchParams.get('redirect') === '1'
    const dryRun = searchParams.get('dryRun') === '1'
    
    const body = await req.json().catch(() => ({}))
    const bookingId = body?.bookingId || searchParams.get('bookingId') || ''

    console.log(`[RECOMPUTE] Starting ${all ? 'all bookings' : `booking ${bookingId}`} ${dryRun ? '(dry run)' : '(live)'} at ${new Date().toISOString()}`)

    const processBooking = async (booking: any) => {
      const extId = booking.property?.extId || booking.property?.id || booking.propertyId || undefined
      const checkIn = booking.checkin
      const checkOut = booking.checkout
      
      // Calculate new totals
      const newTotals = await computeBookingTotals({ propertyExtId: extId, checkIn, checkOut })
      const newSchedule = await computeMonthlySchedule({ propertyExtId: extId, checkIn, checkOut })
      
      // Get current payments
      const currentPayments = booking.payments || []
      const firstPeriodPayment = currentPayments.find((p: any) => p.purpose === 'first_period')
      const moveInFeePayment = currentPayments.find((p: any) => p.purpose === 'move_in_fee')
      const depositPayment = currentPayments.find((p: any) => p.purpose === 'deposit')
      const monthlyPayments = currentPayments.filter((p: any) => p.purpose === 'monthly_rent')
      
      // Check if recompute is needed (idempotent)
      const firstPeriodNeedsUpdate = firstPeriodPayment && 
        firstPeriodPayment.status !== 'received' && 
        Math.abs(firstPeriodPayment.amountCents - Math.round((newTotals.firstPeriod || 0) * 100)) > 1
        
      const moveInNeedsUpdate = moveInFeePayment && 
        moveInFeePayment.status !== 'received' && 
        Math.abs(moveInFeePayment.amountCents - Math.round((newTotals.moveInFee || 0) * 100)) > 1
        
      const depositNeedsUpdate = depositPayment && 
        depositPayment.status !== 'received' && 
        Math.abs(depositPayment.amountCents - Math.round((newTotals.deposit || 0) * 100)) > 1
        
      const scheduleNeedsUpdate = newSchedule.length !== monthlyPayments.length ||
        newSchedule.some((item, i) => {
          const existing = monthlyPayments[i]
          return !existing || Math.abs(existing.amountCents - Math.round(item.amount * 100)) > 1
        })

      const changes = {
        bookingId: booking.id,
        clientName: booking.user?.name || 'Unknown',
        property: booking.property?.title || 'Unknown',
        firstPeriodNeedsUpdate,
        moveInNeedsUpdate,
        depositNeedsUpdate,
        scheduleNeedsUpdate,
        currentFirstPeriod: firstPeriodPayment?.amountCents || 0,
        newFirstPeriod: Math.round((newTotals.firstPeriod || 0) * 100),
        currentMoveIn: moveInFeePayment?.amountCents || 0,
        newMoveIn: Math.round((newTotals.moveInFee || 0) * 100),
        currentDeposit: depositPayment?.amountCents || 0,
        newDeposit: Math.round((newTotals.deposit || 0) * 100),
        monthlyPaymentsCount: monthlyPayments.length,
        newScheduleCount: newSchedule.length
      }
      
      console.log(`[RECOMPUTE] Booking ${booking.id}:`, changes)
      
      if (!dryRun && (firstPeriodNeedsUpdate || moveInNeedsUpdate || depositNeedsUpdate || scheduleNeedsUpdate)) {
        // Update first period if needed
        if (firstPeriodNeedsUpdate) {
          await prisma.payment.update({
            where: { id: firstPeriodPayment.id },
            data: { amountCents: Math.round((newTotals.firstPeriod || 0) * 100) }
          })
        }
        
        // Update move-in fee if needed
        if (moveInNeedsUpdate) {
          await prisma.payment.update({
            where: { id: moveInFeePayment.id },
            data: { amountCents: Math.round((newTotals.moveInFee || 0) * 100) }
          })
        }
        
        // Update deposit if needed
        if (depositNeedsUpdate) {
          await prisma.payment.update({
            where: { id: depositPayment.id },
            data: { amountCents: Math.round((newTotals.deposit || 0) * 100) }
          })
        }
        
        // Update schedule if needed
        if (scheduleNeedsUpdate) {
          await prisma.payment.deleteMany({ 
            where: { bookingId: booking.id, purpose: 'monthly_rent' } 
          })
          if (newSchedule.length > 0) {
            await prisma.payment.createMany({
              data: newSchedule.map(item => ({
                bookingId: booking.id,
                provider: 'offline',
                status: 'scheduled',
                purpose: 'monthly_rent',
                amountCents: Math.round(item.amount * 100),
                currency: 'EUR',
                dueAt: new Date(item.dueAt)
              }))
            })
          }
        }
        
        // Update booking total
        const newTotalCents = Math.round((newTotals.totalNow || 0) * 100)
        if (Math.abs(booking.totalCents - newTotalCents) > 1) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { totalCents: newTotalCents }
          })
        }
      }
      
      return changes
    }

    if (all) {
      // Process all non-deleted bookings
      const bookings = await prisma.booking.findMany({
        where: { deletedAt: null },
        include: {
          property: { select: { extId: true, id: true, title: true } },
          user: { select: { name: true } },
          payments: { select: { id: true, purpose: true, status: true, amountCents: true } }
        }
      })
      
      const results = []
      for (const booking of bookings) {
        const result = await processBooking(booking)
        results.push(result)
      }
      
      const summary = {
        processed: results.length,
        needingUpdates: results.filter(r => r.firstPeriodNeedsUpdate || r.moveInNeedsUpdate || r.depositNeedsUpdate || r.scheduleNeedsUpdate).length,
        dryRun
      }
      
      console.log(`[RECOMPUTE] Summary:`, summary)
      
      if (redirect) {
        return NextResponse.redirect(new URL('/admin/bookings', req.url))
      }
      return NextResponse.json({ ok: true, summary, results: dryRun ? results : undefined })
    }

    if (!bookingId) {
      return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 })
    }

    // Process single booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: { select: { extId: true, id: true, title: true } },
        user: { select: { name: true } },
        payments: { select: { id: true, purpose: true, status: true, amountCents: true } }
      }
    })
    
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }
    
    const result = await processBooking(booking)
    
    if (redirect) {
      return NextResponse.redirect(new URL('/admin/bookings', req.url))
    }
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    console.error('[RECOMPUTE] Error:', e)
    return NextResponse.json({ message: 'Recompute failed', error: String(e?.message || e) }, { status: 500 })
  }
}

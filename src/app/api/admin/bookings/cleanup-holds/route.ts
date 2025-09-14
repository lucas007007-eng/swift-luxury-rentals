import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const redirect = searchParams.get('redirect') === '1'
    const dryRun = searchParams.get('dryRun') === '1'

    console.log(`[CLEANUP] Starting cleanup of hold bookings with incorrect payments ${dryRun ? '(dry run)' : '(live)'} at ${new Date().toISOString()}`)

    // Find hold bookings that have received payments (incorrect state)
    const holdBookingsWithPayments = await prisma.booking.findMany({
      where: {
        status: 'hold',
        deletedAt: null,
        payments: {
          some: {
            purpose: { in: ['first_period', 'move_in_fee'] },
            status: 'received'
          }
        }
      },
      include: {
        user: { select: { name: true } },
        property: { select: { title: true } },
        payments: { 
          select: { id: true, purpose: true, status: true, amountCents: true, receivedAt: true } 
        }
      }
    })

    console.log(`[CLEANUP] Found ${holdBookingsWithPayments.length} hold bookings with incorrect received payments`)

    const results = []
    
    for (const booking of holdBookingsWithPayments) {
      const incorrectPayments = booking.payments.filter(p => 
        ['first_period', 'move_in_fee'].includes(p.purpose) && p.status === 'received'
      )
      
      const result = {
        bookingId: booking.id,
        clientName: booking.user?.name || 'Unknown',
        property: booking.property?.title || 'Unknown',
        incorrectPayments: incorrectPayments.length,
        paymentIds: incorrectPayments.map(p => p.id)
      }
      
      console.log(`[CLEANUP] Booking ${booking.id} (${result.clientName}): ${incorrectPayments.length} payments to revert`)
      
      if (!dryRun) {
        // Revert received payments back to created status for hold bookings
        await prisma.payment.updateMany({
          where: {
            bookingId: booking.id,
            purpose: { in: ['first_period', 'move_in_fee'] },
            status: 'received'
          },
          data: {
            status: 'created',
            receivedAt: null
          }
        })
        
        console.log(`[CLEANUP] Reverted ${incorrectPayments.length} payments for booking ${booking.id}`)
      }
      
      results.push(result)
    }

    const summary = {
      holdBookingsFound: holdBookingsWithPayments.length,
      totalPaymentsReverted: results.reduce((sum, r) => sum + r.incorrectPayments, 0),
      dryRun
    }

    console.log(`[CLEANUP] Summary:`, summary)

    if (redirect) {
      return NextResponse.redirect(new URL('/admin/bookings', req.url))
    }

    return NextResponse.json({ 
      ok: true, 
      summary, 
      ...(dryRun ? { affectedBookings: results } : {})
    })
  } catch (e: any) {
    console.error('[CLEANUP] Error:', e)
    return NextResponse.json({ 
      message: 'Cleanup failed', 
      error: String(e?.message || e) 
    }, { status: 500 })
  }
}

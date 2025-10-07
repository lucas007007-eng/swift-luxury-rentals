import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { syncBookingOperation } from '@/lib/syncTrigger'

export async function POST(req: Request) {
  try {
    const contentType = (req.headers as any).get?.('content-type') || ''
    let id = ''
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(()=>({})) as any
      id = String(body?.id || '')
    } else {
      const form = await (req as any).formData?.()?.catch?.(()=>null)
      if (form) id = String(form.get('id') || '')
    }
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })

    // Get booking data before deletion for CRM and finance cleanup
    const bookingToDelete = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        property: { select: { title: true, extId: true } },
        payments: { select: { amountCents: true, purpose: true, status: true } }
      }
    })

    if (!bookingToDelete) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }

    // Calculate revenue that will be removed
    const bookingRevenue = bookingToDelete.payments
      .filter(p => p.status === 'received')
      .reduce((sum, p) => sum + (p.amountCents || 0), 0) / 100

    // Hard delete: remove payments and booking entirely
    await prisma.payment.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })

    console.log(`[AUDIT] Booking ${id} hard deleted at ${new Date().toISOString()}`)

    // Clean up CRM and Finance data
    try {
      // Remove or update CRM lead if it was created from this booking
      if (bookingToDelete.user?.email) {
        const lead = await prisma.lead.findFirst({
          where: { 
            email: bookingToDelete.user.email,
            stage: 'signed' // Only remove if it's in signed stage (likely from booking)
          }
        })
        
        if (lead) {
          // Check if this lead has other confirmed bookings
          const otherBookings = await prisma.booking.count({
            where: {
              userId: bookingToDelete.userId,
              status: 'confirmed',
              id: { not: id } // Exclude the deleted booking
            }
          })
          
          if (otherBookings === 0) {
            // No other bookings, safe to delete the lead
            await prisma.lead.delete({ where: { id: lead.id } })
            console.log(`[CRM] Deleted lead for ${bookingToDelete.user.name} - no other confirmed bookings`)
          } else {
            console.log(`[CRM] Kept lead for ${bookingToDelete.user.name} - has ${otherBookings} other confirmed bookings`)
          }
        }
      }

      // Update property financials by removing this booking's revenue
      if (bookingToDelete.property?.extId && bookingRevenue > 0) {
        // Remove the revenue entry for this booking
        await prisma.revenue.deleteMany({
          where: {
            propertyId: bookingToDelete.propertyId,
            description: { contains: bookingToDelete.user?.name || 'Guest' },
            amount: bookingRevenue
          }
        })

        // Recalculate total revenue for the property
        const [manualRevenue, allBookingRevenue] = await Promise.all([
          // All remaining manual revenue entries
          prisma.revenue.aggregate({
            where: { propertyId: bookingToDelete.propertyId },
            _sum: { amount: true }
          }),
          // All remaining confirmed bookings with received payments
          prisma.booking.findMany({
            where: {
              propertyId: bookingToDelete.propertyId,
              status: 'confirmed',
              payments: { some: { status: 'received' } }
            },
            include: {
              payments: { where: { status: 'received' } }
            }
          })
        ])

        // Calculate updated total revenue
        const manualRevenueTotal = manualRevenue._sum?.amount || 0
        const bookingRevenueTotal = allBookingRevenue.reduce((sum: number, booking: any) => {
          return sum + booking.payments.reduce((paySum: number, payment: any) => paySum + (payment.amountCents / 100), 0)
        }, 0)
        const updatedTotalRevenue = manualRevenueTotal + bookingRevenueTotal

        // Update PropertyFinancials
        await prisma.propertyFinancials.update({
          where: { propertyId: bookingToDelete.propertyId },
          data: { totalRevenue: Math.round(updatedTotalRevenue) }
        })

        // Trigger simplified sync across all systems
        await syncBookingOperation('deleted', {
          id: bookingToDelete.id,
          propertyTitle: bookingToDelete.property.title,
          revenueRemoved: bookingRevenue,
          newTotal: Math.round(updatedTotalRevenue)
        })
      }

    } catch (cleanupError) {
      console.error('[CLEANUP] Failed to clean up CRM/Finance data:', cleanupError)
      // Don't fail the deletion if cleanup fails
    }

    // For browser form submissions, redirect back
    if (!contentType || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      return NextResponse.redirect(new URL('/admin/bookings', req.url))
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Booking delete failed:', e)
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = String(searchParams.get('id') || '')
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })
    
    // Get booking data before deletion for cleanup
    const bookingToDelete = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        property: { select: { title: true } },
        payments: { select: { amountCents: true, status: true } }
      }
    })
    
    const bookingRevenue = bookingToDelete ? 
      bookingToDelete.payments
        .filter(p => p.status === 'received')
        .reduce((sum, p) => sum + (p.amountCents || 0), 0) / 100 : 0
    
    await prisma.payment.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })
    
    // Trigger finance cache invalidation
    if (bookingRevenue > 0) {
      ;(global as any).__financeLastUpdate = Date.now()
      console.log(`[FINANCE] Booking deletion triggered cache invalidation for €${bookingRevenue} revenue`)
    }
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}



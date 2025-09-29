import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    // Get revenues for selected month
    const revenues = await (prisma as any).revenue.findMany({
      where: {
        propertyId: params.propertyId,
        date: { gte: monthStart, lte: monthEnd }
      },
      orderBy: { date: 'desc' }
    })

    // Get confirmed bookings that had payments in this month
    const bookingRevenues = await (prisma as any).booking.findMany({
      where: {
        propertyId: params.propertyId,
        status: 'confirmed',
        payments: {
          some: {
            status: 'received',
            receivedAt: { gte: monthStart, lte: monthEnd }
          }
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        payments: {
          where: {
            status: 'received',
            receivedAt: { gte: monthStart, lte: monthEnd }
          }
        }
      }
    })

    // Convert booking payments to revenue format
    const bookingRevenueEntries = bookingRevenues.flatMap((booking: any) => 
      booking.payments.map((payment: any) => ({
        id: `booking-${payment.id}`,
        type: payment.purpose === 'deposit' ? 'deposit' : 'rental',
        amount: payment.amountCents / 100,
        description: `${payment.purpose} - ${booking.user?.name || 'Guest'}`,
        date: payment.receivedAt,
        paymentStatus: 'paid',
        paymentMethod: 'stripe',
        bookingId: booking.id,
        guestName: booking.user?.name
      }))
    )

    // Combine manual revenues and booking revenues
    const allRevenues = [
      ...revenues.map((r: any) => ({
        id: r.id,
        type: r.type,
        amount: r.amount,
        description: r.description,
        date: r.date,
        invoiceNumber: r.invoiceNumber,
        paymentStatus: r.paymentStatus,
        paymentMethod: r.paymentMethod
      })),
      ...bookingRevenueEntries
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Calculate summary metrics
    const totalRevenue = allRevenues.reduce((sum, r) => sum + r.amount, 0)
    const rentalIncome = allRevenues.filter(r => r.type === 'rental').reduce((sum, r) => sum + r.amount, 0)
    const pendingRevenues = allRevenues.filter(r => r.paymentStatus === 'pending')
    const pendingAmount = pendingRevenues.reduce((sum, r) => sum + r.amount, 0)

    // Calculate occupancy rate (simplified)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const occupiedDays = bookingRevenues.length > 0 ? Math.min(daysInMonth, bookingRevenues.length * 7) : 0 // Rough estimate
    const occupancyRate = (occupiedDays / daysInMonth) * 100

    // Revenue by type breakdown
    const revenueByType = Object.entries(
      allRevenues.reduce((acc: any, r) => {
        acc[r.type] = (acc[r.type] || 0) + r.amount
        return acc
      }, {})
    ).map(([type, amount]) => ({ type, amount }))

    // Daily revenue for chart
    const dailyRevenue = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dayRevenue = allRevenues
        .filter(r => new Date(r.date).getDate() === day)
        .reduce((sum, r) => sum + r.amount, 0)
      return { day, amount: dayRevenue }
    })

    await prisma.$disconnect()

    return NextResponse.json({
      revenues: allRevenues,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        rentalIncome: Math.round(rentalIncome),
        pendingAmount: Math.round(pendingAmount),
        pendingCount: pendingRevenues.length,
        bookingCount: bookingRevenues.length,
        occupiedDays,
        occupancyRate: Math.round(occupancyRate),
        revenueByType,
        dailyRevenue
      }
    })
  } catch (e) {
    console.error('Property revenue error:', e)
    return NextResponse.json({ revenues: [], summary: {} })
  }
}

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const body = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const revenue = await (prisma as any).revenue.create({
      data: {
        ...body,
        propertyId: params.propertyId,
        date: new Date(body.date)
      }
    })

    // Update property financials total revenue
    const total = await (prisma as any).revenue.aggregate({
      where: { propertyId: params.propertyId },
      _sum: { amount: true }
    })

    await (prisma as any).propertyFinancials.update({
      where: { propertyId: params.propertyId },
      data: { totalRevenue: total._sum?.amount || 0 }
    })

    // Set global cache invalidation timestamp
    ;(global as any).__financeLastUpdate = Date.now()
    console.log('💰 Revenue added, portfolio cache invalidated')

    await prisma.$disconnect()
    return NextResponse.json(revenue)
  } catch (e) {
    console.error('Create revenue error:', e)
    return NextResponse.json({ error: 'Failed to create revenue' }, { status: 500 })
  }
}

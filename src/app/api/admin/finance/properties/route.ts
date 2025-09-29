import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    console.log('🏠 Fetching properties for finance...')
    
    const properties = await (prisma as any).property.findMany({
      include: {
        financials: {
          select: {
            totalInvestment: true,
            totalRevenue: true,
            totalExpenses: true,
            netProfit: true
          }
        }
      }
    })

    console.log(`📊 Found ${properties.length} properties`)

    const enriched = await Promise.all(properties.map(async (p: any) => {
      const financials = p.financials || {}
      
      // Get detailed financial breakdown for each property (current month)
      const currentMonth = new Date()
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const [manualRevenue, bookingRevenue, currentMonthExpenses, recurringExpenses, fixedExpensesInMonth] = await Promise.all([
        // Manual revenue entries for current month
        (prisma as any).revenue.aggregate({
          where: {
            propertyId: p.id,
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        // Revenue from confirmed bookings with payments in current month
        (prisma as any).booking.findMany({
          where: {
            propertyId: p.id,
            status: 'confirmed',
            payments: {
              some: {
                status: 'received',
                receivedAt: { gte: monthStart, lte: monthEnd }
              }
            }
          },
          include: {
            payments: {
              where: {
                status: 'received',
                receivedAt: { gte: monthStart, lte: monthEnd }
              }
            }
          }
        }),
        (prisma as any).expense.aggregate({
          where: {
            propertyId: p.id,
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        (prisma as any).expense.aggregate({
          where: {
            propertyId: p.id,
            isRecurring: true,
            recurringType: 'monthly',
            createdAt: { lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        (prisma as any).expense.aggregate({
          where: {
            propertyId: p.id,
            isRecurring: false,
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })
      ])

      // Calculate total revenue (manual + booking payments)
      const manualRevenueAmount = manualRevenue._sum?.amount || 0
      const bookingRevenueAmount = bookingRevenue.reduce((sum: number, booking: any) => {
        return sum + booking.payments.reduce((paySum: number, payment: any) => paySum + (payment.amountCents / 100), 0)
      }, 0)
      const monthlyRevenue = manualRevenueAmount + bookingRevenueAmount

      const recurringMonthly = recurringExpenses._sum?.amount || 0
      const fixedExpensesAmount = fixedExpensesInMonth._sum?.amount || 0
      const totalMonthlyExp = fixedExpensesAmount + recurringMonthly
      const netProfit = monthlyRevenue - totalMonthlyExp
      const roi = financials.totalInvestment > 0 ? ((netProfit * 12 / financials.totalInvestment) * 100) : 0

      return {
        id: p.id,
        title: p.title,
        totalInvestment: financials.totalInvestment || 0,
        totalRevenue: financials.totalRevenue || 0,
        totalExpenses: financials.totalExpenses || 0,
        monthlyRevenue: Math.round(monthlyRevenue),
        fixedExpenses: Math.round(fixedExpensesAmount),
        recurringMonthly: Math.round(recurringMonthly),
        currentMonthExpenses: Math.round(currentMonthExpenses._sum?.amount || 0),
        totalMonthlyExpenses: Math.round(totalMonthlyExp),
        netProfit: Math.round(netProfit),
        roi: Math.round(roi * 10) / 10
      }
    }))

    await prisma.$disconnect()
    return NextResponse.json(enriched)
  } catch (e) {
    console.error('Properties finance error:', e)
    return NextResponse.json([])
  }
}

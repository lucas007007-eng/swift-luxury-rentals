import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Get or create property financials
    const financials = await (prisma as any).propertyFinancials.upsert({
      where: { propertyId: params.propertyId },
      update: {},
      create: { propertyId: params.propertyId },
      include: {
        property: { select: { title: true, address: true } },
        expenses: {
          include: { category: true },
          orderBy: { date: 'desc' },
          take: 10
        },
        revenues: {
          orderBy: { date: 'desc' },
          take: 10
        },
        investments: {
          orderBy: { purchaseDate: 'desc' },
          take: 10
        }
      }
    })

    // Calculate monthly data for charts (last 12 months)
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const [monthRevenue, monthBookingRevenue, monthExpenses] = await Promise.all([
        // Manual revenue entries
        (prisma as any).revenue.aggregate({
          where: {
            propertyId: params.propertyId,
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        // Revenue from booking payments received in this month
        (prisma as any).booking.findMany({
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
            propertyId: params.propertyId,
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })
      ])

      // Calculate total revenue including booking payments
      const manualRevenueAmount = monthRevenue._sum?.amount || 0
      const bookingRevenueAmount = monthBookingRevenue.reduce((sum: number, booking: any) => {
        return sum + booking.payments.reduce((paySum: number, payment: any) => paySum + (payment.amountCents / 100), 0)
      }, 0)
      const totalMonthRevenue = manualRevenueAmount + bookingRevenueAmount

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.round(totalMonthRevenue),
        expenses: monthExpenses._sum?.amount || 0
      })
    }

    // Investment breakdown by category
    const investmentBreakdown = await (prisma as any).investment.groupBy({
      by: ['category'],
      where: { propertyId: params.propertyId },
      _sum: { amount: true }
    })

    const breakdown = investmentBreakdown.map((item: any) => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item._sum?.amount || 0
    }))

    // Calculate for selected month
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    // Selected month's actual revenue and expenses + breakdown
    const [manualRevenue, bookingRevenue, selectedMonthExpenses, recurringExpenses, fixedExpensesInMonth] = await Promise.all([
      // Manual revenue entries for selected month
      (prisma as any).revenue.aggregate({
        where: {
          propertyId: params.propertyId,
          date: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      }),
      // Revenue from confirmed bookings with payments in selected month
      (prisma as any).booking.findMany({
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
          payments: {
            where: {
              status: 'received',
              receivedAt: { gte: monthStart, lte: monthEnd }
            }
          }
        }
      }),
      // Expenses actually incurred in selected month
      (prisma as any).expense.aggregate({
        where: {
          propertyId: params.propertyId,
          date: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      }),
      // Monthly recurring expenses (only count if viewing current/future month)
      (prisma as any).expense.aggregate({
        where: {
          propertyId: params.propertyId,
          isRecurring: true,
          recurringType: 'monthly',
          // Only include if expense was created before the selected month
          createdAt: { lte: monthEnd }
        },
        _sum: { amount: true }
      }),
      // Fixed/one-time expenses that occurred in selected month only
      (prisma as any).expense.aggregate({
        where: {
          propertyId: params.propertyId,
          isRecurring: false,
          date: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      })
    ])

    // Calculate total revenue from both manual entries and booking payments
    const manualRevenueAmount = manualRevenue._sum?.amount || 0
    const bookingRevenueAmount = bookingRevenue.reduce((sum: number, booking: any) => {
      return sum + booking.payments.reduce((paySum: number, payment: any) => paySum + (payment.amountCents / 100), 0)
    }, 0)
    const monthlyRevenue = manualRevenueAmount + bookingRevenueAmount

    console.log(`💰 Revenue breakdown: Manual €${manualRevenueAmount}, Bookings €${bookingRevenueAmount}, Total €${monthlyRevenue}`)
    const selectedMonthFixedExpenses = fixedExpensesInMonth._sum?.amount || 0
    const selectedMonthRecurring = recurringExpenses._sum?.amount || 0
    const totalMonthlyExpenses = selectedMonthFixedExpenses + selectedMonthRecurring
    const netProfit = monthlyRevenue - totalMonthlyExpenses
    const roi = financials.totalInvestment > 0 ? ((netProfit * 12) / financials.totalInvestment) * 100 : 0

    await prisma.$disconnect()

    return NextResponse.json({
      ...financials,
      monthlyRevenue: Math.round(monthlyRevenue),
      fixedExpenses: Math.round(selectedMonthFixedExpenses),
      recurringMonthly: Math.round(selectedMonthRecurring),
      currentMonthExpenses: Math.round(selectedMonthExpenses._sum?.amount || 0),
      totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
      netProfit: Math.round(netProfit),
      roi: Math.round(roi * 10) / 10,
      monthlyData,
      investmentBreakdown: breakdown,
      selectedMonth: month,
      selectedYear: year
    })
  } catch (e) {
    console.error('Property financials error:', e)
    return NextResponse.json({ error: 'Failed to load property financials' }, { status: 500 })
  }
}

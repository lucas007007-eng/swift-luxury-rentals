import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
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

      const [monthRevenue, monthExpenses] = await Promise.all([
        (prisma as any).revenue.aggregate({
          where: {
            propertyId: params.propertyId,
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        (prisma as any).expense.aggregate({
          where: {
            propertyId: params.propertyId,
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })
      ])

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue._sum?.amount || 0,
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

    // Calculate ROI
    const monthlyRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0) / 12
    const monthlyExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / 12
    const annualProfit = (monthlyRevenue - monthlyExpenses) * 12
    const roi = financials.totalInvestment > 0 ? (annualProfit / financials.totalInvestment) * 100 : 0

    await prisma.$disconnect()

    return NextResponse.json({
      ...financials,
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyExpenses: Math.round(monthlyExpenses),
      roi: Math.round(roi * 10) / 10,
      monthlyData,
      investmentBreakdown: breakdown
    })
  } catch (e) {
    console.error('Property financials error:', e)
    return NextResponse.json({ error: 'Failed to load property financials' }, { status: 500 })
  }
}

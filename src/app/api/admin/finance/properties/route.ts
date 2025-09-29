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
      
      // Get detailed financial breakdown for each property
      const currentMonth = new Date()
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const [currentMonthRevenue, currentMonthExpenses, recurringExpenses, fixedExpenses] = await Promise.all([
        (prisma as any).revenue.aggregate({
          where: {
            propertyId: p.id,
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
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
            recurringType: 'monthly'
          },
          _sum: { amount: true }
        }),
        (prisma as any).expense.aggregate({
          where: {
            propertyId: p.id,
            isRecurring: false
          },
          _sum: { amount: true }
        })
      ])

      const monthlyRevenue = currentMonthRevenue._sum?.amount || 0
      const recurringMonthly = recurringExpenses._sum?.amount || 0
      const currentMonthExp = currentMonthExpenses._sum?.amount || 0
      const totalMonthlyExp = currentMonthExp + recurringMonthly
      const netProfit = monthlyRevenue - totalMonthlyExp
      const roi = financials.totalInvestment > 0 ? ((netProfit * 12 / financials.totalInvestment) * 100) : 0

      return {
        id: p.id,
        title: p.title,
        totalInvestment: financials.totalInvestment || 0,
        totalRevenue: financials.totalRevenue || 0,
        totalExpenses: financials.totalExpenses || 0,
        monthlyRevenue: Math.round(monthlyRevenue),
        fixedExpenses: Math.round(fixedExpenses._sum?.amount || 0),
        recurringMonthly: Math.round(recurringMonthly),
        currentMonthExpenses: Math.round(currentMonthExp),
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

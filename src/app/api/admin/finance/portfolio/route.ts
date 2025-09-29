import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Aggregate portfolio-wide metrics
    const financials = await (prisma as any).propertyFinancials.findMany({
      select: {
        totalInvestment: true,
        totalRevenue: true,
        totalExpenses: true,
        netProfit: true
      }
    })

    const totalInvestment = financials.reduce((sum: number, f: any) => sum + (f.totalInvestment || 0), 0)
    const totalRevenue = financials.reduce((sum: number, f: any) => sum + (f.totalRevenue || 0), 0)
    const totalExpenses = financials.reduce((sum: number, f: any) => sum + (f.totalExpenses || 0), 0)
    const netProfit = totalRevenue - totalExpenses

    // Calculate monthly averages (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const [monthlyRevenue, monthlyExpenses] = await Promise.all([
      (prisma as any).revenue.aggregate({
        where: { date: { gte: thirtyDaysAgo } },
        _sum: { amount: true }
      }),
      (prisma as any).expense.aggregate({
        where: { date: { gte: thirtyDaysAgo } },
        _sum: { amount: true }
      })
    ])

    await prisma.$disconnect()

    return NextResponse.json({
      totalInvestment,
      totalRevenue,
      totalExpenses,
      netProfit,
      monthlyRevenue: monthlyRevenue._sum?.amount || 0,
      monthlyExpenses: monthlyExpenses._sum?.amount || 0,
      roi: totalInvestment > 0 ? ((netProfit / totalInvestment) * 100) : 0
    })
  } catch (e) {
    console.error('Portfolio finance error:', e)
    return NextResponse.json({
      totalInvestment: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      roi: 0
    })
  }
}

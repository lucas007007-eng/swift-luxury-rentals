import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const properties = await (prisma as any).property.findMany({
      include: {
        PropertyFinancials: {
          select: {
            totalInvestment: true,
            totalRevenue: true,
            totalExpenses: true,
            netProfit: true
          }
        }
      }
    })

    const enriched = properties.map((p: any) => {
      const financials = p.PropertyFinancials || {}
      const monthlyRevenue = (financials.totalRevenue || 0) / 12 // Simple average
      const monthlyExpenses = (financials.totalExpenses || 0) / 12
      const netProfit = monthlyRevenue - monthlyExpenses
      const roi = financials.totalInvestment > 0 ? ((netProfit * 12 / financials.totalInvestment) * 100) : 0

      return {
        id: p.id,
        title: p.title,
        totalInvestment: financials.totalInvestment || 0,
        totalRevenue: financials.totalRevenue || 0,
        totalExpenses: financials.totalExpenses || 0,
        monthlyRevenue: Math.round(monthlyRevenue),
        monthlyExpenses: Math.round(monthlyExpenses),
        netProfit: Math.round(netProfit),
        roi: Math.round(roi * 10) / 10
      }
    })

    await prisma.$disconnect()
    return NextResponse.json(enriched)
  } catch (e) {
    console.error('Properties finance error:', e)
    return NextResponse.json([])
  }
}

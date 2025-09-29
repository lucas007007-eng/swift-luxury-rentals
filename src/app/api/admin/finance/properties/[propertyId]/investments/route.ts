import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const investments = await (prisma as any).investment.findMany({
      where: { propertyId: params.propertyId },
      orderBy: { purchaseDate: 'desc' }
    })

    // Calculate current values with depreciation
    const enriched = investments.map((inv: any) => {
      const purchaseDate = new Date(inv.purchaseDate)
      const now = new Date()
      const yearsOwned = (now.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      const depreciationAmount = inv.amount * (inv.depreciationRate || 0.2) * yearsOwned
      const currentValue = Math.max(0, inv.amount - depreciationAmount)

      return {
        id: inv.id,
        category: inv.category,
        item: inv.item,
        amount: inv.amount,
        purchaseDate: inv.purchaseDate,
        supplier: inv.supplier,
        warrantyExpiry: inv.warrantyExpiry,
        depreciationRate: Math.round((inv.depreciationRate || 0.2) * 100),
        currentValue: Math.round(currentValue)
      }
    })

    // Calculate summary
    const totalInvestment = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0)
    const totalCurrentValue = enriched.reduce((sum: number, inv: any) => sum + inv.currentValue, 0)
    const totalDepreciation = totalInvestment - totalCurrentValue

    await prisma.$disconnect()

    return NextResponse.json({
      investments: enriched,
      summary: {
        totalInvestment: Math.round(totalInvestment),
        currentValue: Math.round(totalCurrentValue),
        totalDepreciation: Math.round(totalDepreciation)
      }
    })
  } catch (e) {
    console.error('Property investments error:', e)
    return NextResponse.json({ investments: [], summary: {} })
  }
}

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const body = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const investment = await (prisma as any).investment.create({
      data: {
        ...body,
        propertyId: params.propertyId,
        purchaseDate: new Date(body.purchaseDate),
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null
      }
    })

    // Update property financials total investment
    const total = await (prisma as any).investment.aggregate({
      where: { propertyId: params.propertyId },
      _sum: { amount: true }
    })

    await (prisma as any).propertyFinancials.update({
      where: { propertyId: params.propertyId },
      data: { totalInvestment: total._sum?.amount || 0 }
    })

    // Set global cache invalidation timestamp for portfolio refresh
    ;(global as any).__financeLastUpdate = Date.now()
    console.log('💎 Investment added, portfolio cache invalidated')

    await prisma.$disconnect()
    return NextResponse.json(investment)
  } catch (e) {
    console.error('Create investment error:', e)
    return NextResponse.json({ error: 'Failed to create investment' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { propertyId: string; investmentId: string } }) {
  try {
    const body = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const investment = await (prisma as any).investment.update({
      where: { id: params.investmentId },
      data: {
        ...body,
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

    // Set global cache invalidation timestamp
    ;(global as any).__financeLastUpdate = Date.now()
    console.log('💎 Investment updated, portfolio cache invalidated')

    await prisma.$disconnect()
    return NextResponse.json(investment)
  } catch (e) {
    console.error('Update investment error:', e)
    return NextResponse.json({ error: 'Failed to update investment' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { propertyId: string; investmentId: string } }) {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    await (prisma as any).investment.delete({
      where: { id: params.investmentId }
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

    // Set global cache invalidation timestamp
    ;(global as any).__financeLastUpdate = Date.now()
    console.log('💎 Investment deleted, portfolio cache invalidated')

    await prisma.$disconnect()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete investment error:', e)
    return NextResponse.json({ error: 'Failed to delete investment' }, { status: 500 })
  }
}

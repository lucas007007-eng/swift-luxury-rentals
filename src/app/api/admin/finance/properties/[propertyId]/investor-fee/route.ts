import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const { investorFeeRate } = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    await (prisma as any).propertyFinancials.update({
      where: { propertyId: params.propertyId },
      data: { investorFeeRate }
    })

    // Set global cache invalidation timestamp
    ;(global as any).__financeLastUpdate = Date.now()
    console.log(`💰 Investor fee updated to ${(investorFeeRate * 100).toFixed(0)}% for property ${params.propertyId}`)

    await prisma.$disconnect()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Update investor fee error:', e)
    return NextResponse.json({ error: 'Failed to update investor fee' }, { status: 500 })
  }
}

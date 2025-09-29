import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Get all email records to see what's actually in the database
    const allEmails = await (prisma as any).emailSent.findMany({
      orderBy: { sentAt: 'desc' },
      take: 10,
      select: {
        id: true,
        providerId: true,
        templateId: true,
        toEmail: true,
        subject: true,
        status: true,
        sentAt: true,
        deliveredAt: true,
        openedAt: true,
        clickedAt: true,
        provider: true
      }
    })
    
    // Count by status
    const statusCounts = await (prisma as any).emailSent.groupBy({
      by: ['status'],
      _count: { id: true }
    })
    
    // Count with timestamps
    const [totalSent, hasDelivered, hasOpened, hasClicked] = await Promise.all([
      (prisma as any).emailSent.count(),
      (prisma as any).emailSent.count({ where: { deliveredAt: { not: null } } }),
      (prisma as any).emailSent.count({ where: { openedAt: { not: null } } }),
      (prisma as any).emailSent.count({ where: { clickedAt: { not: null } } })
    ])
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      allEmails,
      statusCounts,
      timestampCounts: { totalSent, hasDelivered, hasOpened, hasClicked },
      calculatedRates: {
        deliveryRate: totalSent > 0 ? Math.round((hasDelivered / totalSent) * 100) : 0,
        openRate: totalSent > 0 ? Math.round((hasOpened / totalSent) * 100) : 0,
        clickRate: totalSent > 0 ? Math.round((hasClicked / totalSent) * 100) : 0
      }
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

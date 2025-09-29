import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    console.log('📊 Analytics API called at:', now.toISOString())
    
    // Overall stats - calculate like Resend metrics
    const [totalSent, totalDelivered, totalOpened, totalClicked, totalBounced] = await Promise.all([
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days } } }),
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days }, deliveredAt: { not: null } } }),
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days }, openedAt: { not: null } } }),
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days }, clickedAt: { not: null } } }),
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days }, OR: [{ bouncedAt: { not: null } }, { failedAt: { not: null } }] } }),
    ])
    
    // By category
    const byCategory = await (prisma as any).emailSent.groupBy({
      by: ['category'],
      where: { sentAt: { gte: last30Days } },
      _count: { id: true }
    })
    
    // By template - simple count only since _avg doesn't work on timestamps
    const byTemplate = await (prisma as any).emailSent.groupBy({
      by: ['templateId'],
      where: { sentAt: { gte: last30Days }, templateId: { not: null } },
      _count: { id: true }
    })
    
    // Daily chart data (last 7 days)
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const [sent, delivered, opened] = await Promise.all([
        (prisma as any).emailSent.count({ where: { sentAt: { gte: dayStart, lt: dayEnd } } }),
        (prisma as any).emailSent.count({ where: { sentAt: { gte: dayStart, lt: dayEnd }, deliveredAt: { not: null } } }),
        (prisma as any).emailSent.count({ where: { sentAt: { gte: dayStart, lt: dayEnd }, openedAt: { not: null } } }),
      ])
      
      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        sent,
        delivered,
        opened
      })
    }
    
    // Debug: check total emails ever sent
    const totalEverSent = await (prisma as any).emailSent.count()
    const recentEmails = await (prisma as any).emailSent.findMany({ 
      orderBy: { sentAt: 'desc' }, 
      take: 5,
      select: { id: true, toEmail: true, subject: true, status: true, sentAt: true, provider: true, providerId: true }
    })
    
    await prisma.$disconnect()
    
    // Calculate rates like Resend metrics
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0  // Opens as % of total sent
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0  // Clicks as % of total sent
    const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0
    
    return NextResponse.json({
      totals: { totalSent, totalDelivered, totalOpened, totalClicked, totalBounced },
      rates: { deliveryRate, openRate, clickRate, bounceRate },
      byCategory,
      byTemplate,
      dailyStats,
      debug: { totalEverSent, recentEmails, last30Days: last30Days.toISOString() }
    })
  } catch (e) {
    console.error('Email analytics error', e)
    return NextResponse.json({
      totals: { totalSent: 0, totalDelivered: 0, totalOpened: 0, totalClicked: 0, totalBounced: 0 },
      rates: { deliveryRate: 0, openRate: 0, clickRate: 0, bounceRate: 0 },
      byCategory: [],
      byTemplate: [],
      dailyStats: [],
      debug: { 
        error: e instanceof Error ? e.message : String(e),
        totalEverSent: 'error',
        recentEmails: [],
        last30Days: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    })
  }
}

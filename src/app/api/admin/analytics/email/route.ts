import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Overall stats
    const [totalSent, totalDelivered, totalOpened, totalClicked, totalBounced] = await Promise.all([
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days } } }),
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days }, status: { in: ['delivered','opened','clicked'] } } }),
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days }, status: { in: ['opened','clicked'] } } }),
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days }, status: 'clicked' } }),
      (prisma as any).emailSent.count({ where: { sentAt: { gte: last30Days }, status: { in: ['bounced','failed'] } } }),
    ])
    
    // By category
    const byCategory = await (prisma as any).emailSent.groupBy({
      by: ['category'],
      where: { sentAt: { gte: last30Days } },
      _count: { id: true }
    })
    
    // By template
    const byTemplate = await (prisma as any).emailSent.groupBy({
      by: ['templateId'],
      where: { sentAt: { gte: last30Days }, templateId: { not: null } },
      _count: { id: true },
      _avg: { openedAt: true, clickedAt: true }
    })
    
    // Daily chart data (last 7 days)
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const [sent, delivered, opened] = await Promise.all([
        (prisma as any).emailSent.count({ where: { sentAt: { gte: dayStart, lt: dayEnd } } }),
        (prisma as any).emailSent.count({ where: { sentAt: { gte: dayStart, lt: dayEnd }, status: { in: ['delivered','opened','clicked'] } } }),
        (prisma as any).emailSent.count({ where: { sentAt: { gte: dayStart, lt: dayEnd }, status: { in: ['opened','clicked'] } } }),
      ])
      
      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        sent,
        delivered,
        opened
      })
    }
    
    await prisma.$disconnect()
    
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0
    const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0
    const clickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0
    const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0
    
    return NextResponse.json({
      totals: { totalSent, totalDelivered, totalOpened, totalClicked, totalBounced },
      rates: { deliveryRate, openRate, clickRate, bounceRate },
      byCategory,
      byTemplate,
      dailyStats
    })
  } catch (e) {
    console.error('Email analytics error', e)
    return NextResponse.json({
      totals: { totalSent: 0, totalDelivered: 0, totalOpened: 0, totalClicked: 0, totalBounced: 0 },
      rates: { deliveryRate: 0, openRate: 0, clickRate: 0, bounceRate: 0 },
      byCategory: [],
      byTemplate: [],
      dailyStats: []
    })
  }
}

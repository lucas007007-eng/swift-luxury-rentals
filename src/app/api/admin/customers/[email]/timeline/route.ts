import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { email: string } }) {
  try {
    const email = decodeURIComponent(params.email)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Get conversations
    const conversations = await (prisma as any).conversation.findMany({
      where: { participants: { some: { email } } },
      select: { id: true, subject: true, status: true, createdAt: true, lastMessageAt: true },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get bookings
    const user = await (prisma as any).user.findUnique({ where: { email } })
    const bookings = user ? await (prisma as any).booking.findMany({
      where: { userId: user.id },
      select: { id: true, status: true, checkin: true, checkout: true, totalCents: true, createdAt: true, property: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    }) : []
    
    // Get email history
    const emails = await (prisma as any).emailSent.findMany({
      where: { toEmail: email },
      select: { id: true, subject: true, category: true, status: true, sentAt: true, openedAt: true, clickedAt: true },
      orderBy: { sentAt: 'desc' },
      take: 20
    })
    
    // Combine timeline
    const timeline = [
      ...conversations.map((c: any) => ({ type: 'conversation', date: c.createdAt, data: c })),
      ...bookings.map((b: any) => ({ type: 'booking', date: b.createdAt, data: b })),
      ...emails.map((e: any) => ({ type: 'email', date: e.sentAt, data: e }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      email,
      conversations,
      bookings,
      emails,
      timeline: timeline.slice(0, 50) // limit for performance
    })
  } catch (e) {
    console.error('Customer timeline error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

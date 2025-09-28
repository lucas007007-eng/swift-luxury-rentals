import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    // Unread = last message inbound in open conversations
    const rows = await (prisma as any).conversation.findMany({
      where: { status: { in: ['open','pending'] } },
      select: { id: true, agentLastReadAt: true },
    })
    let unread = 0
    for (const r of rows) {
      const last = await (prisma as any).message.findFirst({
        where: { conversationId: r.id },
        orderBy: { createdAt: 'desc' },
        select: { direction: true, createdAt: true }
      })
      if (last?.direction === 'inbound') {
        if (!r.agentLastReadAt || new Date(last.createdAt) > new Date(r.agentLastReadAt)) unread++
      }
    }
    await prisma.$disconnect()
    return NextResponse.json({ unread })
  } catch (e) {
    console.error('Unread count error', e)
    return NextResponse.json({ unread: 0 })
  }
}



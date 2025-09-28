import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const listOnly = searchParams.get('list')
  const conversationId = searchParams.get('conversationId')
  const filter = searchParams.get('filter') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    if (listOnly) {
      const rows = await (prisma as any).conversation.findMany({
        orderBy: { lastMessageAt: sort === 'oldest' ? 'asc' : 'desc' },
        select: {
          id: true,
          subject: true,
          status: true,
          lastMessageAt: true,
          assigneeId: true,
          messages: {
            select: { direction: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
      const mapped = rows.map((r: any) => ({
        id: r.id,
        subject: r.subject,
        status: r.status,
        lastMessageAt: r.lastMessageAt,
        assigneeId: r.assigneeId || null,
        lastMessageDirection: r.messages?.[0]?.direction || null
      }))
      const filtered = mapped.filter((r: any) => {
        if (filter === 'awaiting') {
          return (r.status === 'open' || r.status === 'pending') && r.lastMessageDirection === 'inbound'
        }
        return true
      })
      return NextResponse.json(filtered)
    }
    if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
    const msgs = await (prisma as any).message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, direction: true, fromEmail: true, fromName: true, text: true, html: true, createdAt: true, status: true, deliveredAt: true, openedAt: true, clickedAt: true }
    })
    return NextResponse.json(msgs)
  } catch (e) {
    console.error('Inbox GET error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(req: NextRequest) {
  // optional bulk ops in future
  return NextResponse.json({ ok: true })
}



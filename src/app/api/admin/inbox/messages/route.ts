import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const listOnly = searchParams.get('list')
  const conversationId = searchParams.get('conversationId')
  const filter = searchParams.get('filter') || 'all'
  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || ''
  const assignee = searchParams.get('assignee') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const tags = (searchParams.get('tags') || '').split(',').filter(Boolean)
  const sort = searchParams.get('sort') || 'newest'
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    if (listOnly) {
      const where: any = {}
      if (status) where.status = status
      if (assignee) where.assigneeId = assignee
      if (tags.length) where.tags = { hasSome: tags }
      if (from || to) where.lastMessageAt = { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined }

      const rows = await (prisma as any).conversation.findMany({
        where,
        orderBy: { lastMessageAt: sort === 'oldest' ? 'asc' : 'desc' },
        select: {
          id: true,
          subject: true,
          status: true,
          lastMessageAt: true,
          assigneeId: true,
          tags: true,
          messages: {
            select: { direction: true, createdAt: true, text: true, subject: true },
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
        tags: r.tags || [],
        lastMessageDirection: r.messages?.[0]?.direction || null,
        lastText: r.messages?.[0]?.text || r.messages?.[0]?.subject || ''
      }))
      const filtered = mapped.filter((r: any) => {
        if (q) {
          const s = q.toLowerCase()
          if (!String(r.subject||'').toLowerCase().includes(s) && !String(r.lastText||'').toLowerCase().includes(s)) return false
        }
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



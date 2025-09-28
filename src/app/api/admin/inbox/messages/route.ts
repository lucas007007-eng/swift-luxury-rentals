import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const listOnly = searchParams.get('list')
  const conversationId = searchParams.get('conversationId')
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    if (listOnly) {
      const rows = await (prisma as any).conversation.findMany({
        orderBy: { lastMessageAt: 'desc' },
        select: { id: true, subject: true, status: true, lastMessageAt: true }
      })
      return NextResponse.json(rows)
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



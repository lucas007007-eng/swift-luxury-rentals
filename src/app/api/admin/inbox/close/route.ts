import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { conversationId, open, reason } = await req.json()
    if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const data: any = open ? { status: 'open', closedAt: null, closeReason: null } : { status: 'closed', closedAt: new Date(), closeReason: reason || null }
    await (prisma as any).conversation.update({ where: { id: conversationId }, data })
    await prisma.$disconnect()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Close error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}



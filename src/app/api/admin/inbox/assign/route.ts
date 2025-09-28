import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { conversationId, assigneeId } = await req.json()
    if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    await (prisma as any).conversation.update({ where: { id: conversationId }, data: { assigneeId: assigneeId || null } })
    await prisma.$disconnect()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Assign error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}



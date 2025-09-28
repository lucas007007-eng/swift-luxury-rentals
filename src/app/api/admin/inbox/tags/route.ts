import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { conversationId, tags } = await req.json()
    if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
    const clean = Array.isArray(tags) ? tags.map((t:string)=>String(t).trim()).filter(Boolean) : []
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const row = await (prisma as any).conversation.update({ where: { id: conversationId }, data: { tags: clean } })
    await prisma.$disconnect()
    return NextResponse.json({ success: true, tags: row.tags })
  } catch (e) {
    console.error('Update tags error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}



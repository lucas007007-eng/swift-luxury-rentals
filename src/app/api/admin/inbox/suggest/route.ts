import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')
    if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const lastInbound = await (prisma as any).message.findFirst({
      where: { conversationId, direction: 'inbound' },
      orderBy: { createdAt: 'desc' },
      select: { subject: true, text: true, fromName: true }
    })
    let body = (lastInbound?.text || lastInbound?.subject || '').toLowerCase()

    // Load canned replies
    let canned = await (prisma as any).cannedReply.findMany({})
    await prisma.$disconnect()
    if (!Array.isArray(canned) || canned.length === 0) {
      canned = [
        { title: 'Thanks — we are on it', body: 'Hi {{name}},\n\nThanks for reaching out. We have received your message and will get back to you shortly.\n\nBest,\nPhantom Properties Support' },
        { title: 'Booking confirmation info', body: 'Hi {{name}},\n\nYour booking {{bookingId}} is confirmed. Check-in is {{checkIn}} at {{property}}.\n\nBest,\nTeam' },
      ]
    }

    // Simple keyword routing
    const match = (k: string[]) => k.some(w => body.includes(w))
    let choice = canned[0]
    if (match(['confirm','confirmation','check-in','check in','booking'])) {
      const found = canned.find((c:any)=>String(c.title||'').toLowerCase().includes('booking'))
      if (found) choice = found
    } else if (match(['refund','cancel'])) {
      const found = canned.find((c:any)=>String(c.title||'').toLowerCase().includes('refund'))
      if (found) choice = found
    }

    const today = new Date().toLocaleDateString()
    const name = lastInbound?.fromName || 'Customer'
    let text = String((choice as any).body || '')
    const replacements: Record<string, string> = {
      '{{name}}': name,
      '{{today}}': today,
      '{{company}}': 'Phantom Properties',
      '{{supportEmail}}': 'support@phantomproperties.co',
      '{{subject}}': lastInbound?.subject || ''
    }
    for (const [k,v] of Object.entries(replacements)) {
      text = text.split(k).join(v)
    }
    return NextResponse.json({ suggestion: text })
  } catch (e) {
    console.error('Suggest error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}



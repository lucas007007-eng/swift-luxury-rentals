import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, text } = body || {}
    if (!conversationId || !text) return NextResponse.json({ error: 'conversationId and text required' }, { status: 400 })

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const conv = await (prisma as any).conversation.findUnique({ where: { id: conversationId }, include: { participants: true } })
    if (!conv) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const customer = conv.participants.find((p: any) => p.role === 'customer') || conv.participants[0]
    const toEmail = customer?.email
    const toName = customer?.name || ''

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'updates@phantomproperties.co'
    const replyTo = process.env.RESEND_REPLY_TO_EMAIL || 'support@phantomproperties.co'

    // Find last inbound for threading
    const lastInbound = await (prisma as any).message.findFirst({
      where: { conversationId, direction: 'inbound' },
      orderBy: { createdAt: 'desc' },
      select: { messageId: true }
    })

    // Send via Resend
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const result = await resend.emails.send({
        from: `Phantom Properties <${fromEmail}>`,
        to: toEmail,
        subject: conv.subject || 'Re: your request',
        text,
        replyTo,
        headers: {
          'X-Conversation-ID': conv.id,
          ...(lastInbound?.messageId ? { 'In-Reply-To': lastInbound.messageId, 'References': lastInbound.messageId } : {}),
        }
      })
      // store outbound
      await (prisma as any).message.create({
        data: {
          conversationId,
          direction: 'outbound',
          fromEmail: fromEmail,
          fromName: 'Support',
          toEmail,
          subject: conv.subject || 'Re: your request',
          text,
          messageId: (result as any)?.id || undefined,
          provider: 'resend',
          providerId: (result as any)?.id || undefined,
          status: 'sent'
        }
      })
      await (prisma as any).conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } })
      await prisma.$disconnect()
      return NextResponse.json({ success: true })
    } catch (e) {
      console.error('Resend send error', e)
      await prisma.$disconnect()
      return NextResponse.json({ error: 'send failed' }, { status: 500 })
    }
  } catch (e) {
    console.error('Reply error', e)
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}



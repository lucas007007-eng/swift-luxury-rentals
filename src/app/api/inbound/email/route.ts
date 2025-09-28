import { NextRequest, NextResponse } from 'next/server'

// Postmark Inbound webhook handler (simplified)
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    // Basic fields from Postmark Inbound
    const fromEmail = payload.FromFull?.Email || payload.From
    const fromName = payload.FromFull?.Name || ''
    const toEmail = payload.ToFull?.[0]?.Email || payload.To
    const subject = payload.Subject || '(no subject)'
    const text = payload.TextBody || ''
    const html = payload.HtmlBody || ''
    const messageId = payload.MessageID || payload.Headers?.find((h: any)=>h.Name==='Message-ID')?.Value
    const inReplyTo = payload.Headers?.find((h: any)=>h.Name==='In-Reply-To')?.Value

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Find conversation by inReplyTo or create new
    let conversationId: string | null = null
    if (inReplyTo) {
      const replied = await (prisma as any).message.findFirst({ where: { messageId: inReplyTo }, select: { conversationId: true } })
      if (replied) conversationId = replied.conversationId
    }
    if (!conversationId) {
      const conv = await (prisma as any).conversation.create({
        data: {
          subject,
          status: 'open',
          lastMessageAt: new Date(),
          participants: {
            create: [
              { email: fromEmail, name: fromName, role: 'customer' },
              { email: toEmail || 'support@phantomproperties.co', name: 'Support', role: 'agent' }
            ]
          }
        }
      })
      conversationId = conv.id
    }

    // Store message
    await (prisma as any).message.create({
      data: {
        conversationId,
        direction: 'inbound',
        fromEmail,
        fromName,
        toEmail,
        subject,
        text,
        html,
        messageId: messageId || undefined,
        inReplyTo: inReplyTo || undefined
      }
    })

    await prisma.$disconnect()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Inbound email error', e)
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}



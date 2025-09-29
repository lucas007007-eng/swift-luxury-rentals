import { NextRequest, NextResponse } from 'next/server'

// Verifies Resend webhooks using Svix headers
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET
    if (!secret) return NextResponse.json({ error: 'missing secret' }, { status: 500 })

    // Read raw payload for signature verification
    const payload = await req.text()
    const headers = {
      'svix-id': req.headers.get('svix-id') || '',
      'svix-timestamp': req.headers.get('svix-timestamp') || '',
      'svix-signature': req.headers.get('svix-signature') || ''
    }

    const { Webhook } = await import('svix')
    const wh = new Webhook(secret)
    const event = wh.verify(payload, headers) as any
    const type = String(event?.type || '')
    const data = event?.data || {}

    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      const msgId = data?.id || data?.message?.id || data?.email?.id
      if (msgId) {
        const set: any = {}
        const now = new Date()
        if (type.endsWith('.delivered')) { set.status = 'delivered'; set.deliveredAt = now }
        else if (type.endsWith('.opened')) { set.status = 'opened'; set.openedAt = now }
        else if (type.endsWith('.clicked')) { set.status = 'clicked'; set.clickedAt = now }
        else if (type.endsWith('.bounced')) { set.status = 'bounced'; set.bouncedAt = now }
        else if (type.endsWith('.complained')) { set.status = 'complained'; set.complainedAt = now }
        else if (type.endsWith('.failed')) { set.status = 'failed'; set.failedAt = now }
        if (Object.keys(set).length > 0) {
          // Update inbox messages
          await (prisma as any).message.updateMany({ where: { provider: 'resend', providerId: msgId }, data: set })
          // Update email analytics
          await (prisma as any).emailSent.updateMany({ where: { provider: 'resend', providerId: msgId }, data: set })
        }
      }
      await prisma.$disconnect()
    } catch (e) {
      console.error('Resend webhook prisma error', e)
    }

    return NextResponse.json({ ok: true, type })
  } catch (e) {
    console.error('Resend webhook error', e)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }
}



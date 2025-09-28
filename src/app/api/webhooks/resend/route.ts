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

    // Minimal processing – extend to store analytics if needed
    const type = String(event?.type || '')
    const data = event?.data

    // Example: mark conversation message delivered/opened in future
    // TODO: integrate with Message records if we store resend message IDs

    // Acknowledge
    return NextResponse.json({ ok: true, type })
  } catch (e) {
    console.error('Resend webhook error', e)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }
}



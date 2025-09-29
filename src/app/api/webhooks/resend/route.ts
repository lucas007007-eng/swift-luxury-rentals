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

    console.log('🔔 Resend webhook received:', { type, fullData: data })

    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      // Extract email ID from Resend webhook format
      const msgId = data?.email_id || data?.id || data?.email?.id || data?.message?.id || event?.id
      if (msgId) {
        const set: any = {}
        const now = new Date()
        if (type === 'email.delivered' || type.endsWith('.delivered')) { 
          set.status = 'delivered'; set.deliveredAt = now 
          console.log('📧 Email delivered:', msgId)
        }
        else if (type === 'email.opened' || type.endsWith('.opened')) { 
          set.status = 'opened'; set.openedAt = now 
          console.log('👁️ Email opened:', msgId)
        }
        else if (type === 'email.clicked' || type.endsWith('.clicked')) { 
          set.status = 'clicked'; set.clickedAt = now 
          console.log('🔗 Email clicked:', msgId)
        }
        else if (type === 'email.bounced' || type.endsWith('.bounced')) { 
          set.status = 'bounced'; set.bouncedAt = now 
          console.log('⚠️ Email bounced:', msgId)
        }
        else if (type === 'email.complained' || type.endsWith('.complained')) { 
          set.status = 'complained'; set.complainedAt = now 
          console.log('🚫 Email complained:', msgId)
        }
        else if (type === 'email.failed' || type.endsWith('.failed')) { 
          set.status = 'failed'; set.failedAt = now 
          console.log('❌ Email failed:', msgId)
        }
        
        if (Object.keys(set).length > 0) {
          // Update inbox messages
          const msgUpdate = await (prisma as any).message.updateMany({ where: { provider: 'resend', providerId: msgId }, data: set })
          // Update email analytics
          const emailUpdate = await (prisma as any).emailSent.updateMany({ where: { provider: 'resend', providerId: msgId }, data: set })
          console.log(`✅ Updated ${msgUpdate.count} messages, ${emailUpdate.count} analytics records`)
          
          // Trigger real-time analytics update
          try {
            const controller = (global as any).__analyticsController
            if (controller) {
              const encoder = new TextEncoder()
              controller.enqueue(encoder.encode(`data: {"type":"update","event":"${type}","emailId":"${msgId}"}\n\n`))
              console.log('📡 Real-time analytics update sent')
            }
          } catch (e) {
            console.log('📡 Analytics update failed:', e)
          }
        } else {
          console.log('ℹ️ Unknown event type:', type)
        }
      } else {
        console.log('⚠️ No email ID found in webhook data')
      }
      await prisma.$disconnect()
    } catch (e) {
      console.error('❌ Resend webhook prisma error', e)
    }

    return NextResponse.json({ ok: true, type })
  } catch (e) {
    console.error('Resend webhook error', e)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }
}



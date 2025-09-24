import { NextResponse } from 'next/server'
import { publish, register, unregister, send } from '@/lib/crm2Events'

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      register(controller)
      // initial heartbeat
      send(controller, { type: 'connected', ts: Date.now() })
      const hb = setInterval(() => {
        try { send(controller, { type: 'heartbeat', ts: Date.now() }) } catch {}
      }, 25000)
      controller.signal?.addEventListener?.('abort', () => {
        clearInterval(hb as any)
        unregister(controller)
      })
    },
    cancel() {
      // no-op
    }
  })
  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  })
}


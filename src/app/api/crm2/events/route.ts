import { NextResponse } from 'next/server'

// Simple in-memory subscriber list (per server instance)
const subscribers = new Set<ReadableStreamDefaultController>()

function send(controller: ReadableStreamDefaultController, data: any) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      subscribers.add(controller)
      // initial heartbeat
      send(controller, { type: 'connected', ts: Date.now() })
      const hb = setInterval(() => {
        try { send(controller, { type: 'heartbeat', ts: Date.now() }) } catch {}
      }, 25000)
      controller.signal?.addEventListener?.('abort', () => {
        clearInterval(hb as any)
        subscribers.delete(controller)
      })
    },
    cancel() {
      subscribers.forEach(s => { try { s.close?.() } catch {} })
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

// Utility for other routes to broadcast
export function broadcast(event: any) {
  for (const sub of Array.from(subscribers)) {
    try { send(sub, event) } catch { subscribers.delete(sub) }
  }
}


